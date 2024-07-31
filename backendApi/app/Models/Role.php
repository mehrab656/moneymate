<?php

namespace App\Models;

use Auth;
use DB;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use PHPUnit\Exception;

class Role extends Model
{
    use HasFactory;

    protected $table = 'roles';
    protected $primaryKey = 'id';
    protected $guarded = [];

    protected array $investorRole = [
        "company_view" => true,
        "sector_view" => true,
        "category_view" => true,
        "investment_view" => true,
        "expense_view" => true,
        "income_view" => true,
        "return_view" => true,
        "income_report_view" => true,
        "expense_report_view" => true,
        "investment_report_view" => true,
        "monthly_report_view" => true,
        "overall_report_view" => true,
        "bank_view" => true,
        "account_view" => true,
        "balance_view" => true,
        "debt_view" => true,
        "loans_view" => true,
        "budget_view" => true,
        "investment_plan_view" => true,
        "calender_view" => true,
        "activity_log_view" => true,
        "settings_view" => true,
        "user_view" => true,
        "profile_view" => true,
        "role_view" => true,
        "dashboard_monthly_income" => true,
        "dashboard_monthly_expense" => true,
        "dashboard_account_balance" => true,
        "dashboard_lend_amount" => true,
        "dashboard_borrow_amount" => true,
        "dashboard_total_bank" => true,
        "dashboard_expense_chart" => true,
        "dashboard_exp_budget" => true,
        "dashboard_active_budget" => true
    ];

    protected array $managerRole = [
        "company_create" => true,
        "company_view" => true,
        "company_edit" => true,
        "company_delete" => true,
        "sector_create" => true,
        "sector_view" => true,
        "sector_edit" => true,
        "sector_delete" => true,
        "category_create" => true,
        "category_view" => true,
        "category_edit" => true,
        "category_delete" => true,
        "investment_create" => true,
        "investment_view" => true,
        "investment_edit" => true,
        "investment_delete" => true,
        "expense_create" => true,
        "expense_view" => true,
        "expense_edit" => true,
        "expense_delete" => true,
        "income_create" => true,
        "income_view" => true,
        "income_edit" => true,
        "income_delete" => true,
        "return_create" => true,
        "return_view" => true,
        "return_edit" => true,
        "return_delete" => true,
        "income_report_create" => true,
        "income_report_view" => true,
        "income_report_edit" => true,
        "income_report_delete" => true,
        "expense_report_create" => true,
        "expense_report_view" => true,
        "expense_report_edit" => true,
        "expense_report_delete" => true,
        "investment_report_create" => true,
        "investment_report_view" => true,
        "investment_report_edit" => true,
        "investment_report_delete" => true,
        "monthly_report_create" => true,
        "monthly_report_view" => true,
        "monthly_report_edit" => true,
        "monthly_report_delete" => true,
        "overall_report_create" => true,
        "overall_report_view" => true,
        "overall_report_edit" => true,
        "overall_report_delete" => true,
        "bank_create" => true,
        "bank_view" => true,
        "bank_edit" => true,
        "bank_delete" => true,
        "account_create" => true,
        "account_view" => true,
        "account_edit" => true,
        "account_delete" => true,
        "balance_create" => true,
        "balance_view" => true,
        "balance_edit" => true,
        "balance_delete" => true,
        "debt_create" => true,
        "debt_view" => true,
        "debt_edit" => true,
        "debt_delete" => true,
        "loans_create" => true,
        "loans_view" => true,
        "loans_edit" => true,
        "loans_delete" => true,
        "budget_create" => true,
        "budget_view" => true,
        "budget_edit" => true,
        "budget_delete" => true,
        "investment_plan_create" => true,
        "investment_plan_view" => true,
        "investment_plan_edit" => true,
        "investment_plan_delete" => true,
        "calender_create" => true,
        "calender_view" => true,
        "calender_edit" => true,
        "calender_delete" => true,
        "activity_log_create" => true,
        "activity_log_view" => true,
        "activity_log_edit" => true,
        "activity_log_delete" => true,
        "settings_create" => true,
        "settings_view" => true,
        "settings_edit" => true,
        "settings_delete" => true,
        "user_create" => true,
        "user_view" => true,
        "user_edit" => true,
        "user_delete" => true,
        "profile_create" => true,
        "profile_view" => true,
        "profile_edit" => true,
        "profile_delete" => true,
        "role_create" => true,
        "role_view" => true,
        "role_edit" => true,
        "role_delete" => true,
        "dashboard_monthly_income" => true,
        "dashboard_monthly_expense" => true,
        "dashboard_account_balance" => true,
        "dashboard_lend_amount" => true,
        "dashboard_borrow_amount" => true,
        "dashboard_total_bank" => true,
        "dashboard_expense_chart" => true,
        "dashboard_exp_budget" => true,
        "dashboard_active_budget" => true
    ];

    public function createdBy(): HasOne
    {
        return $this->hasOne(User::class, 'id', 'created_by');
    }
    public function updatedBy(): HasOne
    {
        return $this->hasOne(User::class, 'id', 'updated_by');
    }

    public function defaultRoles($companyID)
    {
        try {
            DB::beginTransaction();
            //Investor Role
            $roleData = [
                'company_id' => $companyID,
                'role' => 'Investor',
                'status' => 1,
                'permissions' => json_encode($this->investorRole),
                'created_by' => Auth::user()->id,
                'updated_by' => Auth::user()->id,
            ];
            $_investorRole = Role::create($roleData);
            //Manager Role
            $roleData = [
                'company_id' => $companyID,
                'role' => 'Manager',
                'status' => 1,
                'permissions' => json_encode($this->managerRole),
                'created_by' => Auth::user()->id,
                'updated_by' => Auth::user()->id,
            ];
            $_managerRole = Role::create($roleData);
            DB::commit();
            storeActivityLog([
                'object_id' => $_investorRole['id'],
                'object' => 'role',
                'log_type' => 'create',
                'module' => 'roles',
                'descriptions' => 'Default Investor Role Was Created',
                'data_records' => $_investorRole,
            ]);

            storeActivityLog([
                'object_id' => $_managerRole['id'],
                'object' => 'role',
                'log_type' => 'create',
                'module' => 'roles',
                'descriptions' => 'Default Investor Role Was Created',
                'data_records' => $_managerRole,
            ]);
        }catch (Exception $e){
            DB::rollBack();
            updateErrorlLogs($e, 'Role Model');
            return false;
        }
        return true;
    }

}
