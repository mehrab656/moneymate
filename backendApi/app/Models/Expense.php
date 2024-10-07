<?php

namespace App\Models;

use Carbon\Carbon;
use Exception;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Throwable;

/**
 * @property mixed $account_id
 * @property mixed $amount
 */
class Expense extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'expenses';
    protected $primaryKey = 'id';
    protected $guarded = [];


    /**
     * @return BelongsTo
     */
    public function person(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }


    /**
     * @return BelongsTo
     */
    public function bankAccount(): BelongsTo
    {
        return $this->belongsTo(BankAccount::class, 'account_id', 'id');
    }


    /**
     * @return BelongsTo
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id', 'id');
    }

    /**
     * @return BelongsTo
     */
    public function budget(): BelongsTo
    {
        return $this->belongsTo(Budget::class);
    }

    /**
     * @throws \Exception
     * @throws Throwable
     */
    public function addExpense($expense)
    {
        $bankAccount = BankAccount::find($expense['account_id']);

        if ($bankAccount->balance < $expense['amount']) {
            return [
                'status_code' => 400,
                'message' => 'Insufficient amount to make this expense.',
            ];
        }
// Check Budget for this expense
        $budgetCategory = BudgetCategory::where('category_id', $expense['category_id'])->first();
        if ($budgetCategory) {
            $budget = Budget::find($budgetCategory->budget_id);
            if ($budget && $expense['amount'] > $budget->amount) {
                return response()->json([
                    'status_code' => 400,
                    'message' => sprintf('There is no sufficient budget for this category %s', $expense['category_name']),
                ]);
            }
        }

        //now add expense
        $oldAccountBalance = $bankAccount->balance;
        $expenseDate = Carbon::parse($expense['date'])->format('Y-m-d');

        try {
            DB::beginTransaction();
            $expense = $this->create([
                'user_id' => Auth::user()->id,
                'company_id' => Auth::user()->primary_company,
                'account_id' => $expense['account_id'],
                'amount' => $expense['amount'],
                'refundable_amount' => $expense['refundable_amount'] ?? 0,
                'category_id' => $expense['category_id'],
                'description' => $expense['description'],
                'note' => $expense['note'],
                'reference' => array_key_exists('reference', $expense) ? $expense['reference'] : null,
                'date' => $expenseDate,
                'attachment' => array_key_exists('attachment', $expense) ? $expense['attachment'] : null
            ]);

            // Update the balance of the bank account
            $bankAccount->balance -= $expense['amount'];
            $bankAccount->save();
            storeActivityLog([
                'object_id' => $expense['id'],
                'object' => 'expense',
                'log_type' => 'create',
                'module' => 'expense',
                'descriptions' => "",
                'data_records' => array_merge(json_decode(json_encode($expense), true), ['old_account_balance' => $oldAccountBalance, 'new_account_balance' => $bankAccount->balance]),
            ]);

            DB::commit();

        } catch (Exception $e) {
            DB::rollBack();

            return [
                'message' => 'Line Number:' . __LINE__ . ', ' . $e->getMessage(),
                'status_code' => 400
            ];

        }

        return [
            'message' => 'Expense Added',
            'status_code' => 200
        ];

    }

}
