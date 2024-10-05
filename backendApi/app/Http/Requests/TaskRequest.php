<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TaskRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'description' => 'required',
            'categoryID' => 'required',
            'date' => 'required',
            'startTime' => 'required',
            'endTime' => 'required',
            'type' => 'required',
            'amount' => 'required',
            'status' => 'required',
            'payment_status' => 'required',
            'comment' => 'nullable',
            'employee_id' => 'required',
        ];
    }

    public function messages(): array
    {
        return [
            'description.required' => 'TaskModel description is required',
            'categoryID.required' => 'Please select a category',
            'date.required' => 'Date is Required',
            'startTime.required' => 'Starting time is required',
            'endTime.required' => 'End time is required',
            'type.required' => 'TaskModel Type is required',
            'amount.required' => 'Amount is required',
            'status.required' => 'Status is required',
            'payment_status.required' => 'Payment status is required',
            'employee_id.required' => 'Employee is required',
        ];
    }
}
