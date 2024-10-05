<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AssetRequest;
use App\Http\Resources\AssetResource;
use App\Models\Asset;
use App\Models\BankAccount;
use App\Models\Budget;
use App\Models\BudgetCategory;
use App\Models\BudgetExpense;
use App\Models\Category;
use App\Models\Expense;
use App\Models\SectorModel;
use Carbon\Carbon;
use DB;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use PHPUnit\Exception;
use Throwable;

class AssetController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $page = $request->query('page', 1);
        $pageSize = $request->query('pageSize', 1000);

        $assets = Asset::where('company_id', Auth::user()->primary_company)->select(['assets.*', 'sectors.name'])
            ->join('sectors', 'assets.sector_id', '=', 'sectors.id')
            ->skip(($page - 1) * $pageSize)
            ->take($pageSize)
            ->orderBy('assets.id', 'desc')
            ->get();


        $totalCount = Asset::where('company_id', Auth::user()->primary_company)
            ->join('sectors', 'assets.sector_id', '=', 'sectors.id')
            ->count();

        return response()->json([
            'data' => AssetResource::collection($assets),
            'total' => $totalCount,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     * @throws Throwable
     */
    public function add(AssetRequest $request): JsonResponse
    {
        $data = $request->input();
        $category = Category::findOrFail($data['category_id']);
        $sector = SectorModel::findOrFail($data['sector_id']);

        //check balance amount to make a valid expense
        $bankAccount = BankAccount::find($data['account_id']);
        $totalPrice = 0;

        $assets = json_decode($data['assets'], true);

        if ($assets[0]['qty'] === 0) {
            return response()->json([
                'message' => 'Error!',
                'description' => "Asset is required.",
            ], 400);
        }
        foreach ($assets as $asset) {
            $totalPrice += $asset['total_price'];
        }

        if ($bankAccount->balance < $totalPrice) {
            return response()->json([
                'message' => 'Error!',
                'description' => 'Insufficient amount to make this expense.',
            ], 400);
        }

        $budgetCategory = BudgetCategory::where('category_id', $data['category_id'])->first();

        if ($budgetCategory) {
            $budget = Budget::find($budgetCategory->budget_id);
            if ($budget && $totalPrice > $budget->amount) {
                return response()->json([
                    'message' => 'Error!',
                    'description' => 'There is no sufficient budget for this category',
                ]);
            }
        }

        try {
            DB::beginTransaction();
            //get the total price of this expense
            $oldAccountBalance = $bankAccount->balance;
            $expenseDate = Carbon::parse($data['date'])->format('Y-m-d');
            $expense = Expense::create([
                'user_id' => Auth::user()->id,
                'company_id' => Auth::user()->primary_company,
                'account_id' => $data['account_id'],
                'amount' => $totalPrice,
                'refundable_amount' => 0,
                'category_id' => $data['category_id'],
                'description' => "Bought Asset",
                'note' => $data['assets'],
                'reference' => Auth::user()->name,
                'date' => $expenseDate,
                'attachment' => null
            ]);

            // Check if expense category falls within any budget's categories
            $budgets = Budget::where('start_date', '<=', Carbon::now())
                ->where('company_id', Auth::user()->primary_company)
                ->with('categories')
                ->get();

            foreach ($budgets as $budget) {
                if ($budget->categories->contains('id', $data['category_id']) && $this->isWithinTimeRange($budget->start_date, $budget->end_date, $expenseDate)) {
                    // Add entry to the new table
                    BudgetExpense::create([
                        'user_id' => Auth::user()->id,
                        'budget_id' => $budget->id,
                        'category_id' => $data['category_id'],
                        'amount' => $totalPrice,
                    ]);

                    // Reduce budget amount if the date matches
                    if (Carbon::parse($expense['created_at'])->isSameDay(Carbon::now())) {
                        $budget->updated_amount -= $totalPrice;
                        $budget->save();
                    }
                }
            }

            // Update the balance of the bank account
            $bankAccount->balance -= $totalPrice;
            $bankAccount->save();

            storeActivityLog([
                'object_id' => $expense['id'],
                'log_type' => 'create',
                'module' => 'expense',
                'descriptions' => "Added assets",
                'data_records' => array_merge(json_decode(json_encode($expense), true), ['old_account_balance' => $oldAccountBalance, 'new_account_balance' => $bankAccount->balance]),
            ]);

            $assets = Asset::create([
                'sector_id' => $data['sector_id'],
                'expense_id' => $expense['id'],
                'date' => $data['date'],
                'assets' => $data['assets'],
                'status'=>1
            ]);
            storeActivityLog([
                'object_id' => $assets->id,
                'log_type' => 'create',
                'module' => 'Asset',
                'descriptions' => 'Added assets for ' . $sector->name,
                'data_records' => json_encode($assets),
            ]);
            DB::commit();
        } catch (Throwable $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create Asset.' . $e->getMessage(),
            ], 500);
        }

        return response()->json([
            'message' => 'Success!',
            'description' => 'New Asset was added!.',
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id): JsonResponse
    {
        $asset = Asset::where('sectors.company_id', Auth::user()->primary_company)
            ->join('sectors', 'assets.sector_id', '=', 'sectors.id')
            ->join('expenses', 'assets.expense_id', '=', 'expenses.id')
            ->find($id);
        $categories = [];
        if ($asset) {
            $categories = DB::table('categories')->select('categories.*')
                ->where(['sector_id' => $asset->sector_id, 'type' => 'expense'])->get();
        }

        return response()->json([
            'data' => $asset,
            'categories' => $categories
        ]);
    }

    /**
     * Update the specified resource in storage.
     * @throws Throwable
     */
    public function update(AssetRequest $request)
    {
        $data = $request->input();
        $prevAssetData = Asset::find($data['id']);
        if (!$prevAssetData) {
            return response()->json([
                'message' => 'Not Found',
                'description' => 'Asset record was not found'
            ],404);
        }

        $prevExpenseData = Expense::find($prevAssetData['expense_id']);
        if (!$prevExpenseData) {
            return response()->json([
                'message' => 'Not Found',
                'description' => 'Associative Expense record was not found'
            ],404);
        }
        if (Auth::user()->primary_company !== $prevExpenseData['company_id']){
            return response()->json([
                'message' => 'Access Denied',
                'description' => 'You have no permission to edit this resource'
            ],403);
        }

        //check balance amount to make a valid expense
        $bankAccount = BankAccount::find($data['account_id']);
        //adjust the previous expense mount for the new expense first

        $bankAccount->balance += $prevExpenseData['amount'];
        $bankAccount->save();

        $totalPrice = 0;

        $assets = json_decode($data['assets'], true);
        if ($assets[0]['qty'] === 0) {
            return response()->json([
                'message' => 'Error!',
                'description' => "Asset is required.",
            ], 400);
        }
        foreach ($assets as $asset) {
            $totalPrice += $asset['total_price'];
        }
        if ($bankAccount->balance < $totalPrice) {
            return response()->json([
                'message' => 'Error!',
                'description' => 'Insufficient amount to make this expense.',
            ], 400);
        }

        //adjust previous budget amount
        $budgetCategory = BudgetCategory::where('category_id', $prevExpenseData['category_id'])->first();

        if ($budgetCategory) {
            $budget = Budget::find($budgetCategory->budget_id);
            $budget->updated_amount += $prevExpenseData['amount'];
            $budget->save();
        }

        //now check the new budget
        $budgetCategory = BudgetCategory::where('category_id', $data['category_id'])->first();
        if ($budgetCategory) {
            $budget = Budget::find($budgetCategory->budget_id);
            if ($budget && $totalPrice > $budget->amount) {
                return response()->json([
                    'message' => 'Error!',
                    'description' => 'There is no sufficient budget for this category',
                ]);
            }
        }
        try{
            DB::beginTransaction();
            $oldAccountBalance = $bankAccount->balance;
            $expenseDate = Carbon::parse($data['date'])->format('Y-m-d');
            $prevExpenseData->update([
                'account_id' => $data['account_id'],
                'amount' => $totalPrice,
                'category_id' => $data['category_id'],
                'note' => $assets,
                'description' => $prevExpenseData['description'],
                'reference' => Auth::user()->name,
                'user_id' => Auth::user()->id,
                'date' => $expenseDate,
            ]);

            $bankAccount->balance -= $totalPrice;
            $bankAccount->save();

            storeActivityLog([
                'object_id' => $prevExpenseData['id'],
                'log_type' => 'update',
                'module' => 'expense',
                'descriptions' => "Modified assets",
                'data_records' => array_merge(json_decode(json_encode($prevExpenseData), true), ['old_account_balance' => $oldAccountBalance, 'new_account_balance' => $bankAccount->balance]),
            ]);


            $prevAssetData->update([
                'sector_id' => $data['sector_id'],
                'expense_id' => $prevExpenseData['id'],
                'date' => $data['date'],
                'assets' => $data['assets'],
            ]);

            DB::commit();
        }catch (Exception $e){
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to update Asset.' . $e->getMessage(),
            ], 500);
        }
        return response()->json([
            'message' => 'Success!',
            'description' => 'Assets Updated!.',
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Asset $asset)
    {
        //
    }
}
