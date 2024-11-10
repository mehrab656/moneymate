<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ExpenseRequest;
use App\Http\Requests\UpdateExpenseRequest;
use App\Http\Resources\BankAccountResource;
use App\Http\Resources\ExpenseResource;
use App\Models\BankAccount;
use App\Models\Budget;
use App\Models\BudgetCategory;
use App\Models\BudgetExpense;
use App\Models\Category;
use App\Models\Expense;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Nette\Schema\ValidationException;
use Ramsey\Uuid\Uuid;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Throwable;

class ExpenseController extends Controller
{
    /**
     * @param Request $request
     *
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {

        $page = $request->query('page', 1);
        $pageSize = $request->query('pageSize', 10);

        $expenses = Expense::where('company_id', Auth::user()->primary_company)
            ->whereHas('category', function ($query) {
                $query->where('type', 'expense');
            })->skip(($page - 1) * $pageSize)
            ->take($pageSize)
            ->orderBy('date', 'desc')
            ->orderBy('id', 'desc')
            ->get();

        $totalCount = Expense::where('company_id', Auth::user()->primary_company)
            ->whereHas('category', function ($query) {
                $query->where('type', 'expense');
            })->count();

        return response()->json([
            'data' => ExpenseResource::collection($expenses),
            'total' => $totalCount,
        ]);
    }


    /**
     * @param ExpenseRequest $request
     *
     * @return JsonResponse
     * @throws Throwable
     */
    public function add(ExpenseRequest $request): JsonResponse
    {

        $expense = $request->validated();

        $category = Category::where('slug',$expense['category_id'])->first();
        if (!$category){
            return response()->json([
                'message' => 'Not Found!',
                'description' => "Category was not found!",
            ], 400);
        }

        //check balance amount to make a valid expense
        $bankAccount = BankAccount::where('slug',$expense['account_id'])->first();
        if (!$bankAccount){
            return response()->json([
                'message' => 'Not Found!',
                'description' => "Bank account was not found!",
            ], 400);
        }
        if ($bankAccount->balance < $request->amount) {
            return response()->json([
                'message' => 'Error!',
                'description' => 'Insufficient amount to make this expense.',
            ], 400);
        }


        // Check Budget for this expense
        $budgetCategory = BudgetCategory::where('category_id', $request->category_id)->first();

        if ($budgetCategory) {
            $budget = Budget::find($budgetCategory->budget_id);
            if ($budget && $expense['amount'] > $budget->amount) {
                return response()->json([
                    'message' => 'Error!',
                    'description' => 'There is no sufficient budget for this category',
                ]);
            }
        }


        if ($request->hasFile('attachment')) {
            $attachment = $request->file('attachment');
            $filename = time() . '.' . $attachment->getClientOriginalExtension();
            $attachment->storeAs('files', $filename);
            $expense['attachment'] = $filename; // Store only the filename
        }

        try {
            $oldAccountBalance = $bankAccount->balance;
            DB::beginTransaction();
            $expenseDate = Carbon::parse($expense['date'])->format('Y-m-d');
            $expense = Expense::create([
                'slug' => Uuid::uuid4(),
                'user_id' => Auth::user()->id,
                'company_id' => Auth::user()->primary_company,
                'account_id' => $bankAccount->id,
                'amount' => $expense['amount'],
                'refundable_amount' => $expense['refundable_amount'] ?? 0,
                'category_id' => $category->id,
                'description' => $expense['description'],
                'note' => $expense['note'],
                'reference' => array_key_exists('reference', $expense) ? $expense['reference'] : null,
                'date' => $expenseDate,
                'attachment' => array_key_exists('attachment', $expense) ? $expense['attachment'] : null
            ]);

            // Check if expense category falls within any budget's categories
            $budgets = Budget::where('start_date', '<=', Carbon::now())
                ->where('company_id', Auth::user()->primary_company)
                ->with('categories')
                ->get();

            foreach ($budgets as $budget) {
                if ($budget->categories->contains('id', $expense['category_id']) && $this->isWithinTimeRange($budget->start_date, $budget->end_date, $expenseDate)) {
                    // Add entry to the new table
                    BudgetExpense::create([
                        'user_id' => Auth::user()->id,
                        'budget_id' => $budget->id,
                        'category_id' => $expense['category_id'],
                        'amount' => $expense['amount'],
                    ]);

                    // Reduce budget amount if the date matches
                    if (Carbon::parse($expense['created_at'])->isSameDay(Carbon::now())) {
                        $budget->updated_amount -= $expense['amount'];
                        $budget->save();
                    }
                }
            }

            // Update the balance of the bank account
            $bankAccount->balance -= $request->amount;
            $bankAccount->save();

            storeActivityLog([
                'object_id' => $expense['id'],
                'log_type' => 'create',
                'module' => 'expense',
                'descriptions' => "",
                'data_records' => array_merge(json_decode(json_encode($expense), true), ['old_account_balance' => $oldAccountBalance, 'new_account_balance' => $bankAccount->balance]),
            ]);

            DB::commit();

        } catch (Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Line Number:' . __LINE__ . ', ' . $e->getMessage(),
                'error' => 'error'
            ], 400);
        }

        return response()->json([
            'message' => 'Success!',
            'description' => 'Expense added successfully!.',
            'expense' => $expense,
            'category' => $category
        ]);
    }

    /**
     * Check if a given date is within the specified time range.
     *
     * @param string $start_date
     * @param string $end_date
     * @param string $date
     *
     * @return bool
     */
    private function isWithinTimeRange(string $start_date, string $end_date, string $date): bool
    {
        $startDate = Carbon::createFromFormat('Y-m-d', trim($start_date))->startOfDay();
        $endDate = Carbon::createFromFormat('Y-m-d', trim($end_date))->endOfDay();
        $expenseDate = Carbon::createFromFormat('Y-m-d', trim($date))->startOfDay();

        return $expenseDate->between($startDate, $endDate);
    }

    /**
     * Load all expense categories.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function categories(Request $request): JsonResponse
    {

        $sectorID = abs($request->sector_id);

        $categories = DB::table('categories')->select('categories.*')
            ->join('sectors', 'categories.sector_id', '=', 'sectors.id')
            ->where('sectors.company_id', '=', Auth::user()->primary_company)
            ->where('type', '=', 'expense');

        if ($sectorID) {
            $categories = $categories->where('sectors.id', '=', $sectorID);
        }


        return response()->json(['categories' => $categories->get()]);
    }

    /**
     * @param Expense $expense
     *
     * @return JsonResponse
     * @throws Exception
     */
    public function destroy($slug): JsonResponse
    {

        /**
         * Adjust bank account
         */

        $status = (new Expense())->deleteExpense($slug);



        return response()->json([
            'message' => $status['message'],
            'description' => $status['description']
        ], $status['status_code']);
    }

    /**
     * @param Expense $expense
     *
     * @return ExpenseResource
     */

    public function show(Expense $expense): ExpenseResource
    {
        return new ExpenseResource($expense);
    }

    public function edit($id): JsonResponse
    {
        if (!$id) {
            return response()->json([
                'message' => 'Missing Id',
                'description' => 'Missing Id!'
            ], 403);
        }
        $income = Expense::where(['slug' => $id, 'company_id' => Auth::user()->primary_company])->first();
        if (!$income) {
            return response()->json([
                'message' => 'Not Found',
                'description' => 'Expense not found!'
            ], 404);
        }

        return response()->json([
            'data' => ExpenseResource::make($income),
        ]);
    }
    public function exportExpenseCsv(): BinaryFileResponse
    {

        $timestamp = now()->format('YmdHis');
        $filename = "expense_$timestamp.csv";

        $headers = [
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0'
            ,
            'Content-type' => 'text/csv'
            ,
            'Content-Disposition' => "attachment; filename=\"$filename\""
            ,
            'Expires' => '0'
            ,
            'Pragma' => 'public'
        ];

        $handle = fopen($filename, 'w');
        fputcsv($handle, [
            'ID',
            'User Name',
            'Bank Account Number',
            'Category',
            'Amount',
            'refundable_amount',
            'Description',
            'Date'
        ]);


        $expenses = Expense::where('company_id', Auth::user()->primary_company)->get();

        foreach ($expenses as $expense) {

            fputcsv($handle, [
                $expense->id,
                $expense->person ? $expense->person->name : '',
                $expense->bankAccount ? $expense->bankAccount->account_number : '',
                $expense->category ? $expense->category->name : '',
                $expense->amount,
                $expense->refundable_amount,
                $expense->description,
                $expense->date
            ]);
        }

        fclose($handle);

        return response()->download($filename, 'expense-data-' . Carbon::now()->toDateString() . '.csv', $headers);
    }

    /**
     * @return JsonResponse
     */
    public function getCategoryExpensesGraphForCurrentMonth(): JsonResponse
    {
        $currentMonth = Carbon::now()->month;

        $expenses = DB::table('expenses')
            ->join('categories', 'expenses.category_id', '=', 'categories.id')
            ->join('users', 'expenses.user_id', '=', 'users.id')
            ->select('categories.name', DB::raw('SUM(expenses.amount) as total'))
            ->where('expenses.company_id', Auth::user()->primary_company)
            ->whereMonth('expenses.date', $currentMonth)
            ->groupBy('categories.name')
            ->get();

        $categoryNames = $expenses->pluck('name');
        $expenseTotals = $expenses->pluck('total');

        $graphData = [
            'labels' => $categoryNames,
            'data' => $expenseTotals,
        ];

        return response()->json($graphData);
    }

    public function getReturns(Request $request): JsonResponse
    {

        $page = $request->query('page', 1);
        $pageSize = $request->query('pageSize', 10);

        $expenses = Expense::where('refundable_amount', '>', 0)->skip(($page - 1) * $pageSize)
            ->where('company_id', Auth::user()->primary_company)
            ->take($pageSize)
            ->orderBy('id', 'desc')
            ->get();

        $totalCount = Expense::where('refundable_amount', '>', 0)
            ->where('expenses.company_id', Auth::user()->primary_company)
            ->count();

        return response()->json([
            'data' => ExpenseResource::collection($expenses),
            'total' => $totalCount,
        ]);
    }

    /**
     * @throws Throwable
     */
    public function updateReturn(UpdateExpenseRequest $request, Expense $return): JsonResponse|RedirectResponse
    {
        $data = $request->validated();

        $refundableAmount = $return->refundable_amount; // Actual Return amount
        $refundedAmount = $return->refunded_amount; // Already refund amount
        $refundAmount = $data['return_amount']; // just now return amount
        $remainingAmount = $refundableAmount - $refundedAmount; // just now return amount

        if ($refundAmount > $remainingAmount) {
            return response()->json([
                'message' => 'Incorrect Return Amount',
                'description' => "Remaining amount is $remainingAmount. Return amount can't be exceeded!",
            ], 400);
        }

        DB::beginTransaction();
        try {
            //first update bank account to adjust the balance from return
            $bankAccount = BankAccount::find($return->account_id);
            $bankAccount->balance += $refundAmount;
            $bankAccount->save();
            // now time to update the expense field refunded amount.
            $return->update(['refunded_amount' => $refundedAmount + $refundAmount]);

            storeActivityLog([
                'object_id' => $return->id,
                'log_type' => 'edit',
                'module' => 'return',
                'descriptions' => "added returns. Amount: $refundAmount",
                'data_records' => $data,
            ]);

            $return->save();
        } catch (ValidationException $e) {
            DB::rollBack();

            return redirect()->back()->withErrors($e->getMessages())->withInput();
        }

        DB::commit();

        return response()->json([
            'message' => 'Success',
            'description' => "New return adjusted successfully!",
            'data' => $return
        ]);
    }

    /**
     * @param UpdateExpenseRequest $request
     * @param Expense $expense
     *
     * @return JsonResponse
     * @throws Exception
     */

    public function update(UpdateExpenseRequest $request,$id): JsonResponse
    {
        $data = $request->validated();
        $expense = Expense::where('slug',$id)->get()->first();
        if (!$expense){
            return response()->json([
                'message' => 'Not Found!',
                'description' => "Associative expense data was not found!",
            ], 400);
        }
        $category = Category::where('slug',$data['category_id'])->first();
        if (!$category){
            return response()->json([
                'message' => 'Not Found!',
                'description' => "Category was not found!",
            ], 400);
        }
        if ($request->hasFile('attachment')) {
            $attachmentFile = $request->file('attachment');

            if ($attachmentFile instanceof UploadedFile) {
                // Delete the old attachment file, if it exists
                $this->deleteAttachmentFile($expense);
                $filename = time() . '.' . $attachmentFile->getClientOriginalExtension(); // Specify the new filename
                $data['attachment'] = $filename;
            } else {
                // Handle the case where the attachment field is not a file
                $data['attachment'] = null;
            }
        }

        // Retrieve the original amount from the database
        $oldAmount = $expense->amount;
        $oldBankAccount = BankAccount::find($expense->account_id);

        if (!$oldBankAccount){
            return response()->json([
                'message' => 'Not Found!',
                'description' => "Associated bank account was not found",
            ], 400);
        }

        $newBankAccount = BankAccount::where('slug',$data['account_id'])->first();
        if (!$newBankAccount){
            return response()->json([
                'message' => 'Not Found!',
                'description' => "Bank account was not found!",
            ], 400);
        }

        $data['account_id'] = $newBankAccount->id;
        $data['category_id'] = $category->id;
        $data['user_id'] = Auth::user()->id;

        unset($data['account']);
        unset($data['category']);

        $expense->fill($data); // Use fill() instead of update()

        $expense->save();

        $accountBalance = 0;
        if ($oldBankAccount->id != $newBankAccount->id) {

            $oldBankAccount->balance += $oldAmount;
            $oldBankAccount->save();

            $newBankAccount->balance -= $data['amount'];
            $newBankAccount->save();
            $accountBalance = $newBankAccount->balance;

        } else {

            $bankAccount = BankAccount::where('slug',$data['account_id'])->first();
            $bankAccount->balance += $oldAmount;
            $bankAccount->balance -= $data['amount'];
            $bankAccount->save();
            $accountBalance = $bankAccount->balance;
        }
        storeActivityLog([
            'object_id' => $expense->id,
            'log_type' => 'edit',
            'module' => 'expense',
            'descriptions' => "",
            'data_records' => array_merge(json_decode(json_encode($expense), true), ['account_balance' => $accountBalance]),
        ]);

        // return new ExpenseResource( $expense );
        return response()->json([
            'message' => 'updated',
            'description' => "Expense has been updated!",
        ]);
    }

    /**
     * Delete the old attachment file associated with the income.
     *
     * @param Expense $expense
     *
     * @return void
     */
    protected function deleteAttachmentFile(Expense $expense): void
    {
        if (!empty($expense->attachment)) {
            Storage::delete($expense->attachment);
        }
    }

    public function totalExpense(): JsonResponse
    {
        $totalAccount = Expense::where('expenses.company_id', Auth::user()->primary_company)->sum('amount');

        return response()->json([
            'amount' => $totalAccount
        ]);
    }

    public function getExpenseElements(): JsonResponse
    {
        //user
        $companyID = Auth::user()->primary_company;
        $users = DB::table('users')->select(['users.username', 'users.id', 'users.email'])
            ->join('company_user', 'users.id', '=', 'company_user.user_id')
            ->where('company_id', $companyID)
            ->get();

        //bank accounts
        $bankAccounts = BankAccount::where('company_id', Auth::user()->primary_company)->get();

        //categories
        $categories = DB::table('categories')->select('categories.*')
            ->join('sectors', 'categories.sector_id', '=', 'sectors.id')
            ->where('sectors.company_id', '=', Auth::user()->primary_company)
            ->where('categories.type', 'expense')
            ->get();

        return response()->json([
            'users' => $users,
            'banks' => BankAccountResource::collection($bankAccounts),
            'categories' => $categories,
        ]);
    }

}
