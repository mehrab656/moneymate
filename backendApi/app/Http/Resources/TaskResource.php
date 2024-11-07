<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    /**
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

        $slot = date("D j, F, Y", strtotime($this->date)) . '(' . date("g:i a", strtotime($this->start_time)) . '-' . date("g:i a", strtotime($this->end_time)) . ')';

        $employees = $this->employee;
        $employeeList = [];

        foreach ($employees as $employee) {
            $employeeList[] = [
                'value' => $employee->user->slug,
                'label' => $employee->user->username,
            ];
        }
        return [
            'id' => $this->slug,
            'category' => ['value' => $this->category->slug, 'label' => strtoupper($this->category->name)],
            'employee_list' => $employeeList,
            'category_name' => $this->category->name,
            'bank_account' => $this->category->sector->account->id,
            'description' => $this->description,
            'category_id' => $this->category_id,
            'date' => $this->date,
            'slot' => $slot,
            'startTime' => $this->start_time, // date("g:i a",strtotime($this->start_time)),
            'started_at' => $this->started_at,//when the task was started by someone
            'endTime' => $this->end_time, // date("g:i a",strtotime($this->end_time)),
            'ended_at' => $this->ended_at,
            'amount' => $this->amount,
            'type' => ['value' => $this->type, 'label' => strtoupper($this->type)],
            'status' => ['value' => $this->status, 'label' => strtoupper($this->status)],
            'payment_status' => ['value' => $this->payment_status, 'label' => strtoupper(str_replace('_',' ',$this->payment_status))],
            'workflow' => array_reverse(json_decode($this->workflow)),
        ];
    }
}
