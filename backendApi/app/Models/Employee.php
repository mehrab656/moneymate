<?php

namespace App\Models;

use Exception;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\DB;

class Employee extends Model
{
    use HasFactory;

    protected $table = 'employees';
    protected $primaryKey = 'id';
    protected $guarded = [];

    public function user(): HasOne
    {
        return $this->hasOne(User::class,'id','user_id');
    }

    /**
     * @throws \Throwable
     */
    public function addEmployee($data)
    {


        try {
            DB::beginTransaction();
            $employee = $this->create([
                'company_id' => $data['company_id'],
                'user_id' => $data['user_id'],
                'phone' => $data['phone'],
                'basic_salary' => $data['basic_salary'],
                'accommodation_cost' => $data['accommodation_cost'],
                'joining_date' => $data['joining_date'],
                'position' => $data['position'],
                'attachment' => $data['id_copy'],
                'emergency_contact' => $data['emergency_contact'],
                'extras' => $data['extras'],
            ]);
            storeActivityLog([
                'object_id' => $employee['id'],
                'object' => 'employee',
                'log_type' => 'create',
                'module' => 'employee',
                'descriptions' => "Added new employee",
                'data_records' => json_encode($employee),
            ]);

            DB::commit();

            return [
                'message' => 'EmployeeResource Added',
                'status_code' => 200,
                'user'=>$employee
            ];
        }catch (Exception $e){
            DB::rollBack();
            return [
                'message' => 'Line Number:' . __LINE__ . ', ' . $e->getMessage(),
                'status_code' => 400
            ];
        }

    }


}
