<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{/**
 * @property mixed $id
 * @property mixed $description
 * @property mixed $category_id
 * @property mixed $date
 * @property mixed $startTime
 * @property mixed $endTime
 * @property mixed $type
 * @property mixed $amount
 * @property mixed $status
 * @property mixed $payment_status
 * @property mixed $workflow
 */
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $slot = date("D j, F, Y",strtotime($this->date)).'('. date("g:i a",strtotime($this->start_time)).'-'.date("g:i a",strtotime($this->end_time)).')';

        $employees = $this->employee;
        $employeeList =[];

        foreach ($employees as $employee){
            $employeeList[] = [
                'id'=>$employee->user->id,
                'employee_name'=>$employee->user->name,
            ];
        }
        return [
            'id' => $this->id,
            'employee_id' => $this->employee_id,
            'employee_list' => $employeeList,
            'category_name' => $this->category->name,
            'bank_account' => $this->category->sector->account->id,
            'description' => $this->description,
            'category_id' => $this->category_id,
            'date' => $this->date,
            'slot'=>$slot,
            'startTime' => $this->start_time,
            'endTime' => $this->end_time,
            'type' => $this->type,
            'amount' => $this->amount,
            'status' => $this->status,
            'payment_status' => $this->payment_status,
            'workflow' => array_reverse(json_decode($this->workflow)),
        ];
    }
}