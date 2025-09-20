<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * @property mixed $account_id
 * @property mixed $amount
 */
class IncomeRequest extends FormRequest
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
     * @return array<string, ValidationRule|array|string>
     */
    public function rules(): array
    {
        $rules = [
//            'user_id' => 'required',
            'description' => 'required|string',
            'account' => 'required',
            'amount' => 'required|numeric',
            'category' => 'required',
            'note' => 'nullable',
            'reference' => 'required',
            'date' => 'required|date_format:Y-m-d',
            'checkin_date' => 'nullable',
            'checkout_date' => 'nullable',
            'income_type' => 'required',
            'deposit' => 'nullable',
        ];

        if ($this->hasFile('attachment')) {
            $rules['attachment'] = 'file';
        }

        return $rules;
    }

    /**
     * @return string[]
     */
    public function messages(): array
    {
        return [
            'description.required' => 'Income description is required!',
            'description.string' => 'A valid description is required!',
            'account.required' => 'Please select a bank account',
            'amount.required' => 'Please add your income amount',
            'amount.numeric' => 'Amount should be valid numeric data',
            'category.required' => 'Please select an income category',
            'date.required' => 'Please select an income date',
            'date.date_format' => 'Incorrect Income date format',
            'income_type.required' => 'Income type is required',
            'reference.required' => 'Need to select the reference!',
        ];
    }

}
