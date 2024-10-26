<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\InvestmentRequest;
use App\Http\Requests\UpdateInvestmentRequest;
use App\Http\Resources\IncomeResource;
use App\Http\Resources\InvestmentResource;
use App\Models\BankAccount;
use App\Models\Investment;
use App\Models\User;
use DateTime;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Expense;
use Carbon\Carbon;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Nette\Schema\ValidationException;
use Ramsey\Uuid\Uuid;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class InvestmentController extends Controller
{
    /**
     * Display a listing of the resource.
     * @throws Exception
     */
    public function index(Request $request): JsonResponse
    {
        $page = $request->query('page', 1); //this is current page
        $pageSize = $request->query('pageSize', 10);
        $investor_id = $request->query('investor_id');
        $orderBy = $request->query('orderBy', 'id');
        $order = $request->query('order', "DESC");
        $limit = $request->query('limit');
        $to_date = $request->query('to_date');
        $from_date = $request->query('from_date');

        if ($from_date) {
            $from_date = date('Y-m-d', strtotime($from_date));
        }
        if ($to_date) {
            $to_date = date('Y-m-d', strtotime($to_date));
        }
        if ($from_date && empty($to_date)) {
            $to_date = Carbon::now()->toDateString();
        }

        if ($to_date && empty($from_date)) {
            $from_date = (new DateTime($to_date))->format('Y-m-01');
        }

        $query = Investment::where('company_id', Auth::user()->primary_company);
        if ($from_date && $to_date) {
            $query = $query->whereBetween('investment_date', [$from_date, $to_date]);
        }

        if ($investor_id){
            $user = User::where('slug',$investor_id)->first();
            if ($user){
                $query = $query->where('investor_id',$user->id);
            }
        }

        $query = $query->skip(($page - 1) * $pageSize)->take($pageSize);
        if ($orderBy){
            $query = $query->orderBy($orderBy, $order);
        }

        if ($limit){
            $query = $query->limit($limit);
        }
        $query = $query->get();

        $totalCount = Investment::where('company_id',Auth::user()->primary_company)->count();

        return response()->json([
            'data' => InvestmentResource::collection($query),
            'total' => $totalCount,
        ]);
    }

    /**
     * IncomeShow the form for creating a new resource.
     * @throws Exception
     */
    public function add(InvestmentRequest $request): JsonResponse
    {
        $invest = $request->validated();
        $user = Auth::user()->where('slug',$invest['investor_id'])->first();

        if (!$user){
            return response()->json([
                'message' => 'error',
                'description' => "Investor Not Found",
            ],404);
        }

        $bankAccount = BankAccount::find($invest['account_id']);

        if (!$bankAccount){
            return response()->json([
                'message' => 'error',
                'description' => "Account Not Found",
            ],404);
        }


        $investDate = Carbon::parse($invest['investment_date'])->format('Y-m-d');

        $invest = Investment::create([
            'slug' => Uuid::uuid4(),
            'investor_id' => $user->id,
            'company_id' => $user->primary_company,
            'added_by' => Auth::user()->id, //current user
            'amount' => $invest['amount'],
            'note' => $invest['note'],
            'account_id' => $bankAccount->id,
            'investment_date' => $investDate,
        ]);

        // Update the balance of the bank account
        $bankAccount->balance += $request->amount;
        $bankAccount->save();

        storeActivityLog([
            'object_id' => $invest['id'],
            'log_type' => 'create',
            'module' => 'investment',
            'descriptions' => "",
            'data_records' => array_merge(json_decode(json_encode($invest), true), ['account_balance' => $bankAccount->balance]),
        ]);

        return response()->json([
            'invest' => $invest,
            'message' => 'Success!',
            'description' => 'Investment created!.',
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Investment $investment): JsonResponse
    {
        return  response()->json([
        'data' => InvestmentResource::make($investment),
    ]);
    }

    /**
     * IncomeShow the form for editing the specified resource.
     */
    public function edit(Investment $investor)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     * @throws Exception|Throwable
     */
    public function update(UpdateInvestmentRequest $request, Investment $investment): JsonResponse|RedirectResponse
    {
        $data = $request->validated();
        $user = Auth::user();

        DB::beginTransaction();
        try {
            //first handel bank
            $bankAccount = BankAccount::find($investment->account_id);
            $bankAccount->balance = $bankAccount->balance - $investment->amount;
            $bankAccount->save();

            // now update other data
            $investDate = Carbon::parse($data['investment_date'])->format('Y-m-d');
            $data['added_by'] = $user->id;
            $data['company_id'] = $user->primary_company;
            $data['investment_date'] = $investDate;

            $investment->update($data);
            $investment->save();

            //now again update bank with the new amount.
            $bankAccount = BankAccount::find($request->account_id);
            $bankAccount->balance += $request->amount;
            $bankAccount->save();

            storeActivityLog([
                'object_id' => $investment->id,
                'log_type' => 'edit',
                'module' => 'investment',
                'descriptions' => "",
                'data_records' => array_merge(json_decode(json_encode($investment), true), ['account_balance' => $bankAccount->balance]),
            ]);

        } catch (ValidationException $e) {
            DB::rollBack();

            return redirect()->back()->withErrors($e->getMessages())->withInput();
        }
        DB::commit();

        // return new InvestmentResource( $investment );
        return response()->json([
            'message' => 'Success!',
            'description' => 'Investment updated!.',
        ]);
    }

    /**
     * Remove the specified resource from storage.
     * @throws Exception
     */
    public function destroy($id): JsonResponse
    {
        $investment = Investment::find($id);
        if (!$investment){
            return response()->json([
                'message' => 'error',
                'description' => 'Investment Data was not found',
            ],404);
        }

        /**
         * Adjust bank account
         */
        $investment->delete();
        $bankAccount = BankAccount::find($investment->account_id);
        if (!$bankAccount){
            return response()->json([
                'message' => 'error',
                'description' => 'Bank account not found',
                'data'=>$investment
            ],404);
        }
        if ($investment->amount > 0) {
            $bankAccount->balance -= $investment->amount;
            $bankAccount->save();
        }
        storeActivityLog([
            'user_id' => Auth::user()->id,
            'object_id' => $investment->id,
            'log_type' => 'delete',
            'module' => 'investment',
            'descriptions' => "",
            'data_records' => array_merge(json_decode(json_encode($investment), true), ['account_balance' => $bankAccount->balance]),
        ]);

        // return response()->noContent();
        return response()->json([
            'message' => 'Deleted!',
            'description' => 'Investment deleted!.',
        ]);
    }

    public function addPlan(Request $request)
    {
        $s = $request->purposes;

        return $s;
    }
}
