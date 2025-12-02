<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\InvestmentRequest;
use App\Http\Requests\UpdateInvestmentRequest;
use App\Http\Resources\IncomeResource;
use App\Http\Resources\InvestmentResource;
use App\Models\BankAccount;
use App\Models\Investment;
use App\Models\InvestmentPlan;
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
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
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

        // Guard against legacy schema missing company_id
        $query = Schema::hasColumn('investments', 'company_id')
            ? Investment::where('company_id', Auth::user()->primary_company)
            : Investment::query();
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

        $totalCount = Schema::hasColumn('investments', 'company_id')
            ? Investment::where('company_id', Auth::user()->primary_company)->count()
            : Investment::count();

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

        $bankAccount = BankAccount::where('slug',$invest['account_id'])->get()->first();

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
            // Resolve investor_id to numeric if a slug was provided
            if (isset($data['investor_id']) && !is_null($data['investor_id']) && !is_numeric($data['investor_id'])) {
                $investorUser = User::where('slug', $data['investor_id'])->first();
                if (!$investorUser) {
                    DB::rollBack();
                    return response()->json([
                        'message' => 'error',
                        'description' => 'Investor not found',
                    ], 404);
                }
                $data['investor_id'] = $investorUser->id;
            }

            // Resolve account_id to numeric if a slug was provided
            $newAccountId = $data['account_id'] ?? $request->account_id;
            if (!is_null($newAccountId) && !is_numeric($newAccountId)) {
                $newAccount = BankAccount::where('slug', $newAccountId)->first();
                if (!$newAccount) {
                    DB::rollBack();
                    return response()->json([
                        'message' => 'error',
                        'description' => 'Bank account not found',
                    ], 404);
                }
                $newAccountId = $newAccount->id;
            }

            // First handle bank: deduct previous amount from old account (if exists)
            $oldAccount = BankAccount::find($investment->account_id);
            if ($oldAccount && $investment->amount > 0) {
                $oldAccount->balance = $oldAccount->balance - $investment->amount;
                $oldAccount->save();
            }

            // now update other data
            $investDate = Carbon::parse($data['investment_date'])->format('Y-m-d');
            $data['added_by'] = $user->id;
            $data['company_id'] = $user->primary_company;
            $data['investment_date'] = $investDate;
            // Ensure we persist numeric account_id
            if (!is_null($newAccountId)) {
                $data['account_id'] = $newAccountId;
            }

            $investment->update($data);
            $investment->save();

            //now again update bank with the new amount.
            $updatedAccount = BankAccount::find($newAccountId);
            if ($updatedAccount) {
                $updatedAccount->balance += $request->amount;
                $updatedAccount->save();
            }

            storeActivityLog([
                'object_id' => $investment->id,
                'log_type' => 'edit',
                'module' => 'investment',
                'descriptions' => "",
                'data_records' => array_merge(json_decode(json_encode($investment), true), ['account_balance' => $updatedAccount->balance ?? null]),
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
        $user = Auth::user();

        // Prepare payload for validation, decoding purposes from JSON if present
        $payload = $request->all();
        if (isset($payload['purposes']) && is_string($payload['purposes'])) {
            try {
                $decoded = json_decode($payload['purposes'], true);
                $payload['purposes'] = is_array($decoded) ? $decoded : [];
            } catch (\Throwable $e) {
                $payload['purposes'] = [];
            }
        }

        $validator = Validator::make($payload, [
            'plan_name' => ['required', 'string', 'max:255'],
            'date' => ['nullable', 'date_format:Y-m-d'],
            'start_date' => ['nullable', 'date_format:Y-m-d'],
            'end_date' => ['nullable', 'date_format:Y-m-d'],
            'amount' => ['nullable', 'numeric', 'min:0'],
            'return_amount' => ['nullable', 'numeric', 'min:0'],
            'note' => ['nullable', 'string', 'max:1000'],
            // Require at least one purpose row
            'purposes' => ['required', 'array', 'min:1'],
            'purposes.*.purpose' => ['required', 'string', 'max:255'],
            'purposes.*.paymentTerms' => ['nullable', 'string', 'max:255'],
            'purposes.*.amount' => ['nullable', 'numeric'],
            'purposes.*.refundableAmount' => ['nullable', 'numeric'],
            'purposes.*.remarks' => ['nullable', 'string', 'max:500'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();

        // Normalize incoming payload
        $planName = $validated['plan_name'];
        $date = $validated['date'] ?? null;
        $startDate = $validated['start_date'] ?? null;
        $endDate = $validated['end_date'] ?? null;
        $purposes = $validated['purposes'] ?? [];

        // Build attributes based on existing schema (support legacy columns)
        $attrs = [
            'plan_name' => $planName,
        ];
        if (Schema::hasColumn('investment_plans', 'user_id')) {
            $attrs['user_id'] = $request->input('user_id') ?: ($user->id ?? null);
        }
        if (Schema::hasColumn('investment_plans', 'company_id')) {
            $attrs['company_id'] = $user->primary_company ?? null;
        }
        if (Schema::hasColumn('investment_plans', 'added_by')) {
            $attrs['added_by'] = $user->id ?? null;
        }

        // Date columns: support either `date` or `plan_created_date`
        if (Schema::hasColumn('investment_plans', 'date')) {
            $attrs['date'] = $date;
        } elseif (Schema::hasColumn('investment_plans', 'plan_created_date')) {
            $attrs['plan_created_date'] = $date;
        }

        if (Schema::hasColumn('investment_plans', 'start_date')) {
            $attrs['start_date'] = $startDate;
        } elseif (Schema::hasColumn('investment_plans', 'plan_start_date')) {
            $attrs['plan_start_date'] = $startDate;
        }

        if (Schema::hasColumn('investment_plans', 'end_date')) {
            $attrs['end_date'] = $endDate;
        } elseif (Schema::hasColumn('investment_plans', 'plan_end_date')) {
            $attrs['plan_end_date'] = $endDate;
        }

        // Optional fields present in some schemas
        if (Schema::hasColumn('investment_plans', 'purposes')) {
            $attrs['purposes'] = $purposes ? json_encode($purposes) : null;
        }
        if (array_key_exists('amount', $validated) && Schema::hasColumn('investment_plans', 'amount')) {
            $attrs['amount'] = $validated['amount'];
        }
        if (array_key_exists('return_amount', $validated) && Schema::hasColumn('investment_plans', 'return_amount')) {
            $attrs['return_amount'] = $validated['return_amount'];
        }
        if (array_key_exists('note', $validated) && Schema::hasColumn('investment_plans', 'note')) {
            $attrs['note'] = $validated['note'];
        }

        $plan = InvestmentPlan::create($attrs);

        return response()->json([
            'data' => $plan,
            'message' => 'Success!',
            'description' => 'Investment plan created.',
        ]);
    }

    /**
     * List investment plans
     */
    public function listPlans(Request $request): JsonResponse
    {
        $page = (int) $request->query('page', 1);
        $pageSize = (int) $request->query('pageSize', 10);
        $searchTerm = trim((string) $request->query('searchTerm', ''));

        $query = InvestmentPlan::query();
        if (Schema::hasColumn('investment_plans', 'company_id') && Auth::check()) {
            $query->where('company_id', Auth::user()->primary_company);
        }
        if ($searchTerm !== '') {
            $query->where(function($q) use ($searchTerm) {
                $q->where('plan_name', 'like', "%$searchTerm%")
                  ->orWhere('date', 'like', "%$searchTerm%")
                  ->orWhere('start_date', 'like', "%$searchTerm%")
                  ->orWhere('end_date', 'like', "%$searchTerm%");
            });
        }

        $total = $query->count();
        $items = $query->orderBy('id', 'desc')
            ->skip(($page - 1) * $pageSize)
            ->take($pageSize)
            ->get();

        return response()->json([
            'data' => $items,
            'total' => $total,
        ]);
    }

    /**
     * Show single investment plan
     */
    public function showPlan($id): JsonResponse
    {
        $plan = InvestmentPlan::find($id);
        if (!$plan) {
            return response()->json([
                'message' => 'Not Found',
                'description' => 'Investment plan not found',
            ], 404);
        }
        return response()->json(['data' => $plan]);
    }

    /**
     * Update investment plan
     */
    public function updatePlan(Request $request, $id): JsonResponse
    {
        $plan = InvestmentPlan::find($id);
        if (!$plan) {
            return response()->json([
                'message' => 'Not Found',
                'description' => 'Investment plan not found',
            ], 404);
        }

        // Prepare payload for validation, decoding purposes from JSON if present
        $payload = $request->all();
        if (isset($payload['purposes']) && is_string($payload['purposes'])) {
            try {
                $decoded = json_decode($payload['purposes'], true);
                $payload['purposes'] = is_array($decoded) ? $decoded : [];
            } catch (\Throwable $e) {
                $payload['purposes'] = [];
            }
        }

        $validator = Validator::make($payload, [
            'plan_name' => ['sometimes', 'string', 'max:255'],
            'date' => ['sometimes', 'date_format:Y-m-d'],
            'start_date' => ['sometimes', 'date_format:Y-m-d'],
            'end_date' => ['sometimes', 'date_format:Y-m-d'],
            'amount' => ['sometimes', 'numeric', 'min:0'],
            'return_amount' => ['sometimes', 'numeric', 'min:0'],
            'note' => ['sometimes', 'string', 'max:1000'],
            'purposes' => ['sometimes', 'array', 'min:1'],
            'purposes.*.purpose' => ['required_with:purposes', 'string', 'max:255'],
            'purposes.*.paymentTerms' => ['nullable', 'string', 'max:255'],
            'purposes.*.amount' => ['nullable', 'numeric'],
            'purposes.*.refundableAmount' => ['nullable', 'numeric'],
            'purposes.*.remarks' => ['nullable', 'string', 'max:500'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();

        // Accept both legacy and new field names by mapping conditionally
        if (array_key_exists('plan_name', $validated)) {
            $plan->plan_name = $validated['plan_name'];
        }

        if (array_key_exists('date', $validated)) {
            $newDate = $validated['date'];
            if (Schema::hasColumn('investment_plans', 'date')) {
                $plan->date = $newDate;
            } elseif (Schema::hasColumn('investment_plans', 'plan_created_date')) {
                $plan->plan_created_date = $newDate;
            }
        }

        if (array_key_exists('start_date', $validated)) {
            $newStart = $validated['start_date'];
            if (Schema::hasColumn('investment_plans', 'start_date')) {
                $plan->start_date = $newStart;
            } elseif (Schema::hasColumn('investment_plans', 'plan_start_date')) {
                $plan->plan_start_date = $newStart;
            }
        }

        if (array_key_exists('end_date', $validated)) {
            $newEnd = $validated['end_date'];
            if (Schema::hasColumn('investment_plans', 'end_date')) {
                $plan->end_date = $newEnd;
            } elseif (Schema::hasColumn('investment_plans', 'plan_end_date')) {
                $plan->plan_end_date = $newEnd;
            }
        }

        if (array_key_exists('purposes', $validated)) {
            $decoded = $validated['purposes'];
            if (Schema::hasColumn('investment_plans', 'purposes')) {
                $plan->purposes = is_array($decoded) ? json_encode($decoded) : null;
            }
        }

        // Optional updates if columns exist
        if (array_key_exists('amount', $validated) && Schema::hasColumn('investment_plans', 'amount')) {
            $plan->amount = $validated['amount'];
        }
        if (array_key_exists('return_amount', $validated) && Schema::hasColumn('investment_plans', 'return_amount')) {
            $plan->return_amount = $validated['return_amount'];
        }
        if (array_key_exists('note', $validated) && Schema::hasColumn('investment_plans', 'note')) {
            $plan->note = $validated['note'];
        }

        $plan->save();

        return response()->json([
            'data' => $plan,
            'message' => 'Success!',
            'description' => 'Investment plan updated.',
        ]);
    }

    /**
     * Delete investment plan
     */
    public function deletePlan($id): JsonResponse
    {
        $plan = InvestmentPlan::find($id);
        if (!$plan) {
            return response()->json([
                'message' => 'Not Found',
                'description' => 'Investment plan not found',
            ], 404);
        }
        $plan->delete();
        return response()->json([
            'message' => 'Deleted',
            'description' => 'Investment plan deleted.',
        ]);
    }
}
