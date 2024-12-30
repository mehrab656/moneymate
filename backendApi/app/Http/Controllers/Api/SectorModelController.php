<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SectorContractUpdateRequest;
use App\Http\Requests\SectorRequest;
use App\Http\Requests\SectorUpdateRequest;
use App\Http\Resources\IncomeResource;
use App\Http\Resources\InvestmentResource;
use App\Http\Resources\SectorForFilterResource;
use App\Http\Resources\SectorResource;
use App\Models\BankAccount;
use App\Models\Category;
use App\Models\Channel;
use App\Models\Expense;
use App\Models\Investment;
use App\Models\PaymentModel;
use App\Models\SectorModel;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Mockery\Exception;
use Nette\Schema\ValidationException;
use Ramsey\Uuid\Uuid;
use Throwable;
use DateTime;

class SectorModelController extends Controller
{
    /**
     * Display a listing of the resource.
     * @throws \Exception
     */
    public function index(Request $request)
    {

        $page = $request->query('currentPage', 1);
        $pageSize = $request->query('pageSize', 10);
        $order = $request->query('order');
        $orderBy = $request->query('orderBy');
        $limit = $request->query('limit');
        $accountID = $request->query('account_id');
        $from_date = $request->query('contract_start_date');
        $to_date = $request->query('contract_end_date');




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


        $query = SectorModel::where('company_id', Auth::user()->primary_company);

        if($from_date){
            $query = $query->whereBetween('contract_start_date', [$from_date, $to_date]);
        }
        if($from_date){
            $query = $query->whereBetween('contract_end_date', [$from_date, $to_date]);
        }

        if ($accountID){
            $account =  BankAccount::where('slug',$accountID)->first();
            $query=$query->where('payment_account_id',$account->id);
        }
        if ($orderBy && $order) {
            $query = $query->orderBy($orderBy, $order);
        }
        if ($limit) {
            $query = $query->limit($limit);
        }
        $query = $query->skip(($page - 1) * $pageSize)->take($pageSize)->get();


        $sectors = SectorModel::where('company_id', Auth::user()->primary_company)
            ->skip(($page - 1) * $pageSize)
            ->take($pageSize)
            ->orderBy('id', 'DESC')
            ->get();

        $totalCount = SectorModel::count();

        return response()->json([
            'data' => SectorResource::collection($sectors),
            'total' => $totalCount,
        ]);
    }

    /**
     * IncomeShow the form for creating a new resource.
     * @throws Throwable
     */
    public function add(SectorRequest $request): JsonResponse|RedirectResponse
    {

        $sector = $request->validated();
        $payment['numbers'] = $sector['payment_number'];
        $payment['amount'] = $sector['payment_amount'];
        $payment['date'] = $sector['payment_date'];


        $channel = [
            'channel_name' => $sector['channel_name'],
            'reference_id' => $sector['reference_id'],
            'listing_date' => $sector['listing_date'],
        ];

        if (isset($sector['category_name'])) {
            $associativeCategories = $sector['category_name'];
        }

        $sectorData = [
            'slug'=>Uuid::uuid4(),
            'company_id' => Auth::user()->primary_company,
            'name' => $sector['name'],
            'payment_account_id' => $sector['payment_account_id'],
            'contract_start_date' => Carbon::parse($sector['contract_start_date'])->format('Y-m-d'),
            'contract_end_date' => Carbon::parse($sector['contract_end_date'])->format('Y-m-d'),
            'el_premises_no' => $sector['el_premises_no'],
            'el_acc_no' => $sector['el_acc_no'],
            'el_business_acc_no' => $sector['el_business_acc_no'],
            'el_billing_date' => Carbon::parse($sector['el_billing_date'])->format('Y-m-d'),
            'internet_acc_no' => $sector['internet_acc_no'],
            'internet_billing_date' => Carbon::parse($sector['internet_billing_date'])->format('Y-m-d'),
            'int_note' => $sector['int_note']
        ];

        $internet_contract_period = $sector['contract_period'];
        if ($internet_contract_period > 24) {
            $internet_contract_period = 24;
        }

        DB::beginTransaction();
        try {
            //first insert the sector data.
            $sector = SectorModel::create($sectorData);

            //now  insert the internet billing dates on payment table
            for ($i = 1; $i <= $internet_contract_period; $i++) {
                PaymentModel::create([
                    'sector_id' => $sector['id'],
                    'payment_number' => $sector['name'] . ' internet bill for ' . date('Y-m-d', strtotime("+$i month", strtotime($sectorData['internet_billing_date']))),
                    'date' => date('Y-m-d', strtotime("+$i month", strtotime($sectorData['internet_billing_date']))),
                    'amount' => 0,
                    'type' => 'internet',
                    'note' => null,
                ]);
            }

            //now insert electricity billing date on payment table
            for ($i = 1; $i <= 12; $i++) {
                PaymentModel::create([
                    'sector_id' => $sector['id'],
                    'payment_number' => $sector['name'] . ' electricity bill for ' . date('Y-m-d', strtotime("+$i month", strtotime($sectorData['el_billing_date']))),
                    'date' => date('Y-m-d', strtotime("+$i month", strtotime($sectorData['el_billing_date']))),
                    'amount' => 0,
                    'type' => 'electricity',
                    'note' => null,
                ]);
            }

            //now insert the payment plans for the sectors cheque.
            if (!empty($payment['numbers'])) {
                $totalPayment = count($payment['numbers']);
                for ($i = 0; $i < $totalPayment; $i++) {
                    PaymentModel::create([
                        'sector_id' => $sector['id'],
                        'payment_number' => $payment['numbers'][$i],
                        'date' => Carbon::parse($payment['date'][$i])->format('Y-m-d'),
                        'amount' => $payment['amount'][$i],
                        'type' => 'cheque',
                        'note' => null,
                    ]);
                }
            }
            //Now enter the channel ids
            if (!empty($channel['channel_name'])) {
                for ($i = 0; $i < count($channel['channel_name']); $i++) {
                    Channel::create([
                        'sector_id' => $sector['id'],
                        'channel_name' => $channel['channel_name'][$i],
                        'reference_id' => $channel['reference_id'][$i],
                        'listing_date' => $channel['listing_date'][$i],
                    ]);
                }
            }

            //now update the category
            //first add a default category according the sector for income
            {
                Category::create([
                    'slug'=>Uuid::uuid4(),
                    'sector_id' => $sector['id'],
                    'user_id' => auth()->user()->id,
                    'name' => $sector['name'],
                    'type' => 'income',
                ]);
            }

            //now check if there is any associative category.
            if (!empty($associativeCategories)) {
                foreach ($associativeCategories as $category) {
                    Category::create([
                        'slug'=>Uuid::uuid4(),
                        'sector_id' => $sector['id'],
                        'user_id' => auth()->user()->id,
                        'name' => $sector['name'] . '-' . $category,
                        'type' => 'expense',
                    ]);
                }
            }

            //Add activity Log
            storeActivityLog([
                'user_id' => Auth::user()->id,
                'object_id' => $sector['id'],
                'log_type' => 'create',
                'module' => 'sectors',
                'descriptions' => 'Added new Sector',
                'data_records' => $sectorData,
            ]);
        } catch (ValidationException $e) {
            DB::rollBack();

            return redirect()->back()->withErrors($e->getMessages())->withInput();

        }
        DB::commit();

        return response()->json([
            'data' => $sector
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(SectorModel $sector): SectorResource
    {
        return new SectorResource($sector);
    }

    /**
     * IncomeShow the form for editing the specified resource.
     */
    public function edit(SectorModel $sectorModel)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     * @throws \Exception
     */
    public function update(SectorUpdateRequest $request, SectorModel $sector)
    {
        $data = $request->validated();

        $sector->fill($data);
        $sector->save();
        storeActivityLog([
            'user_id' => Auth::user()->id,
            'object_id' => $sector->id,
            'log_type' => 'edit',
            'module' => 'Sector',
            'descriptions' => "",
            'data_records' => json_decode(json_encode($sector), true),
        ]);

     }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SectorModel $sectorModel)
    {
        //
    }

    public function getTotalExpenseAndIncomeBySectorID($sectorID)
    {

        if (!$sectorID) {
            return [
                'message' => 'No sector id provided.',
                'totalIncome' => 0,
                'totalExpense' => 0
            ];
        }

        $expense = DB::table('sectors')
            ->join('categories', 'sectors.id', '=', 'categories.sector_id')
            ->join('expenses', 'categories.id', '=', 'expenses.category_id')
            ->where('sectors.slug', $sectorID)
            ->sum('expenses.amount');

        $income = DB::table('sectors')
            ->join('categories', 'sectors.id', '=', 'categories.sector_id')
            ->join('incomes', 'categories.id', '=', 'incomes.category_id')
            ->where('sectors.slug', $sectorID)
            ->sum('incomes.amount');

        return response()->json([
            'data'=>[
                'income' => $income,
                'expense' => $expense
            ]
        ]);
    }

    /**
     * @throws Throwable
     */
    public function changePaymentStatus($id)
    {
        $id = abs($id);
        if (!$id) {
            return [
                'message' => 'Payment id is not provided',
                'status' => 400,
            ];
        }
        $paymentDetails = DB::table('payments')->find($id);

        if (!$paymentDetails) {
            storeActivityLog([
                'user_id' => Auth::user()->id,
                'object_id' => $id,
                'object' => 'Payment',
                'log_type' => 'Rent Payment',
                'module' => 'Payment',
                'descriptions' => __('sectors.rent_payment_payment_not_found', ['name' => auth()->user()->name]),
                'data_records' => ['Records' => 'no records'],
            ]);
            return response()->json([
                'message' => 'Not Found!',
                'description' => __('messages.not_found', ['name' => 'Payment Details']),
            ], 404);
        }


        $sector = DB::table('sectors')->find($paymentDetails->sector_id);

        if (!$sector) {
            storeActivityLog([
                'user_id' => Auth::user()->id,
                'object_id' => $id,
                'object' => 'Payment',
                'log_type' => 'Rent Payment',
                'module' => 'Payment',
                'descriptions' => __('sectors.rent_payment_sector_not_found', ['name' => auth()->user()->name]),
                'data_records' => ['Records' => 'no records'],
            ]);
            return response()->json([
                'message' => 'Not Found!',
                'description' => __('messages.not_found', ['name' => 'Sector']),
            ], 404);
        }

        $bankAccount = BankAccount::find($sector->payment_account_id);
        if (!$bankAccount) {
            storeActivityLog([
                'user_id' => Auth::user()->id,
                'object_id' => $id,
                'object' => 'Payment',
                'log_type' => 'Rent Payment',
                'module' => 'Payment',
                'descriptions' => __('sectors.rent_payment_sector_not_found', ['name' => auth()->user()->name]),
                'data_records' => ['Records' => 'no records'],
            ]);
            return response()->json([
                'message' => 'Not Found!',
                'description' => __('messages.not_found', ['name' => 'Bank Account']),
            ], 404);
        }

        if ($paymentDetails->amount > $bankAccount->balance) {
            storeActivityLog([
                'user_id' => Auth::user()->id,
                'object_id' => $id,
                'object' => 'Payment',
                'log_type' => 'Rent Payment',
                'module' => 'Payment',
                'descriptions' => __('messages.rent_payment_insufficient_balance', ['name' => auth()->user()->name]),
                'data_records' => ['Records' => 'no records'],
            ]);
            return response()->json([
                'message' => __('messages.insufficient_balance'),
                'description' => __('messages.insufficient_balance'),
            ], 404);
        }

        $category = Category::where('sector_id', $sector->id)
            ->where(function ($query) {
                $query->where('name', 'LIKE', '%cheque%')
                    ->orWhere('name', 'LIKE', '%rent%');
            })->first();

        if (!$category) {
            storeActivityLog([
                'user_id' => Auth::user()->id,
                'object_id' => $id,
                'object' => 'Payment',
                'log_type' => 'failed',
                'module' => 'Payment',
                'descriptions' => __('sectors.rent_payment_category_not_found', ['name' => auth()->user()->name]),
                'data_records' => ['Records' => 'no records'],
            ]);
            return response()->json([
                'message' => 'Not Found!',
                'description' => __('messages.not_found', ['name' => 'Category']),
            ], 404);
        }

        $expense = [
            'slug'=>Uuid::uuid4(),
            'user_id' => Auth::user()->id,
            'account_id' => $sector->payment_account_id,
            'amount' => $paymentDetails->amount,
            'refundable_amount' => 0,
            'category_id' => $category->id,
            'description' => __('rent_payment_des', ['payment_number' => $paymentDetails->payment_number, 'sector' => $sector->name]), //$paymentDetails->payment_number . ' ' . 'payment of ' . $sector->name,
            'note' => __('sectors.rent_payment_note'),
            'reference' => __('rent_payment_ref', ['name' => $sector->name]),
            'date' => Carbon::now()->format('Y-m-d')
        ];
        // Create and response for this expense.

        DB::beginTransaction();
        try {
            $oldAccountBalance = $bankAccount->balance;
            Expense::create($expense);
            $isUpdated = DB::table('payments')->where('id', $id)->update(['status' => 'paid']);
            $bankAccount->balance -= $paymentDetails->amount;
            $bankAccount->save();

        } catch (ValidationException $e) {
            DB::rollBack();
            $message = $e->getMessages();
            //Add activity Log
            storeActivityLog([
                'user_id' => Auth::user()->id,
                'object_id' => $id,
                'object' => 'Rent Payment',
                'log_type' => 'failed',
                'module' => 'sectors',
                'descriptions' => __('failed_rent_payment', ['sector' => $category->sector->name]),
                'data_records' => ['Error' => $message],
            ]);
            return redirect()->back()->withErrors($message)->withInput();
        }

        //Add activity Log
        storeActivityLog([
            'user_id' => Auth::user()->id,
            'object_id' => $id,
            'log_type' => 'success',
            'module' => 'sectors',
            'descriptions' => __('update_payment_details'),
            'data_records' => array_merge(json_decode(json_encode($expense), true), ['old_account_balance' => $oldAccountBalance, 'new_account_balance' => $bankAccount->balance]),
        ]);

        DB::commit();

        return response()->json([
            'message' => 'Success!',
            'description' => __('update_payment_details'),
        ]);
    }

    /**
     * @throws Throwable
     */
    public function payBills($paymentID, Request $request)
    {
        $id = abs($paymentID);
        if (!$id) {
            return [
                'message' => 'Payment id is not provided',
                'status' => 400,
            ];
        }
        $isUpdated = false;
        $type = $request->type;
        $date = $request->date;

        $search_criteria = $type === 'internet' ? 'internet' : ($type === 'cheque' ? 'rent cost' : 'electricity');
        $sector = DB::table('sectors')->find($request->sector_id);
        $category = Category::where('sector_id', '=', $sector->id)
            ->where(function ($query) use ($search_criteria) {
                $query->where('name', 'LIKE', '%electricity%')
                    ->orWhere('name', 'LIKE', "%$search_criteria%");
            })->get()->first();

            if (!$category) {
                storeActivityLog([
                    'user_id' => Auth::user()->id,
                    'object_id' => $id,
                    'object' => 'expense',
                    'log_type' => 'failed',
                    'module' => "expenses",
                    'descriptions' => __('sectors.bill_payment_category_not_found', ['name' => auth()->user()->name]),
                    'data_records' => ['Records' => 'no records'],
                ]);
                return response()->json([
                    'message' => 'Not Found!',
                    'description' => __('messages.not_found', ['name' => 'Category']),
                ], 404);
            }


        $bankAccount = BankAccount::find($sector->payment_account_id);
        if ($bankAccount->balance < $request->amount) {
            storeActivityLog([
                'user_id' => Auth::user()->id,
                'object_id' => $id,
                'object' => 'Payment',
                'log_type' => 'Rent Payment',
                'module' => 'Payment',
                'descriptions' => __('messages.bill_payment_insufficient_balance', ['name' => auth()->user()->name]),
                'data_records' => ['Records' => 'no records'],
            ]);
            return response()->json([
                'message' => __('messages.insufficient_balance'),
                'description' => __('messages.insufficient_balance'),
            ], 404);
        }

        try {
            DB::beginTransaction();

            $expense = Expense::create([
                'slug'=>Uuid::uuid4(),
                'company_id' => Auth::user()->primary_company,
                'user_id' => Auth::user()->id,
                'account_id' => $sector->payment_account_id,
                'amount' => $request->amount,
                'refundable_amount' => 0,
                'category_id' => $category->id,
                'description' => $request->payment_number,
                'note' => __('bill_pay_note'),
                'reference' => 'Automated Payment for : ' . $sector->name . ' ' . strtoupper($request->type),
                'date' => $date
            ]);
            DB::table('payments')
                ->where('id', $id)
                ->update([
                    'status' => 'paid',
                    'amount' => $request->amount,
                    'updated_at' => Carbon::now()->format('Y-m-d H:i:s')
                ]);

            $bankAccount->balance -= $request->amount;
            $bankAccount->save();

            $objectID = $expense['id'];
            unset($expense['id']);
            unset($expense['user_id']);
            unset($expense['account_id']);
            unset($expense['category_id']);

            //Add activity Log
            storeActivityLog([
                'user_id' => Auth::user()->id,
                'object_id' => $objectID,
                'object' => "expenses",
                'log_type' => 'updated',
                'module' => "expenses",
                'descriptions' => "made $type bill payment on " . $request->payment_number . ' ' . $request->amount,
                'data_records' => $expense,
            ]);
            DB::commit();

        } catch (Exception $e) {
            DB::rollBack();

            return response()->json([
                'description' => $e->getMessages(),
                'message' => '$isUpdated ? 200 : 400'
            ],404);
        }

        return response()->json([
            'description' => 'Bill paid successfully!',
            'message' => 'success'
        ]);
    }

    public function sectorList(): JsonResponse
    {
        $sectors = SectorModel::where('company_id', Auth::user()->primary_company)->get();
        return response()->json(['data' => SectorForFilterResource::collection($sectors)]);
    }

    /**
     * @throws Throwable
     */
    public function updateContract($slug, SectorContractUpdateRequest $request): JsonResponse
    {
        $data = $request->validated();

        if (!$slug){
            return response()->json([
                'message' => 'error',
                'description'=>'Id is Missing'
            ],404);

        }

        $sector = SectorModel::where('slug',$slug)->get()->first();
        if (!$sector){
            return response()->json([
                'message' => 'error',
                'description'=>'Sector not found'
            ],404);
        }
        $payment['numbers'] = $data['payment_number'];
        $payment['amount'] = $data['payment_amount'];
        $payment['date'] = $data['payment_date'];

        try {
            DB::beginTransaction();
            //first handel the billing dates
            //for internets:
            for ($i = 1; $i <= $data['internet_bill_month']; $i++) {
                PaymentModel::create([
                    'sector_id' => $sector->id,
                    'payment_number' => sprintf("%s internet bill for %s ",$sector->name,date('Y-m-d', strtotime("+$i month", strtotime($sector->internet_billing_date)))),
                    'date' => date('Y-m-d', strtotime("+$i month", strtotime($sector->internet_billing_date))),
                    'amount' => 0,
                    'type' => 'internet',
                    'note' => sprintf("After Contract has updated from %s to %s",$data['contract_start_date'],$data['contract_end_date']),
                ]);
            }
            //now handel the electricity
            for ($i = 1; $i <= $data['electricity_bill_month']; $i++) {
                PaymentModel::create([
                    'sector_id' => $sector['id'],
                    'payment_number' => sprintf("%s electricity bill for %s ",$sector->name,date('Y-m-d', strtotime("+$i month", strtotime($sector->el_billing_date)))),
                    'date' => date('Y-m-d', strtotime("+$i month", strtotime($sector->el_billing_date))),
                    'amount' => 0,
                    'type' => 'electricity',
                    'note' => sprintf("After Contract has updated from %s to %s",$data['contract_start_date'],$data['contract_end_date']),
                ]);
            }
            //now handel the cheques
            if (!empty($payment['numbers'])) {
                $totalPayment = count($payment['numbers']);
                for ($i = 0; $i < $totalPayment; $i++) {
                    PaymentModel::create([
                        'sector_id' => $sector['id'],
                        'payment_number' => $payment['numbers'][$i],
                        'date' => Carbon::parse($payment['date'][$i])->format('Y-m-d'),
                        'amount' => $payment['amount'][$i],
                        'type' => 'cheque',
                        'note' => sprintf("After Contract has updated from %s to %s",$data['contract_start_date'],$data['contract_end_date']),
                    ]);
                }
            }

            //now update sector for new contract data's
            $sector->contract_start_date = $data['contract_start_date'];
            $sector->contract_end_date = $data['contract_end_date'];
            $sector->rent = $data['rent'];
            $sector->save();
            storeActivityLog([
                'user_id' => Auth::user()->id,
                'object_id' => $sector->id,
                'log_type' => 'update',
                'module' => 'sectors',
                'descriptions' => sprintf('Update Contract for %s',$sector->name),
                'data_records' => $sector,
            ]);
            DB::commit();
        }catch (Exception $e){
            DB::rollBack();

            return response()->json([
                'message' => 'Line Number:' . __LINE__ . ', ' . $e->getMessage(),
                'error' => 'error'
            ], 400);
        }

        return response()->json([
            'message' => 'updated',
            'description'=>"Contract has been updated"
        ]);
    }
}

