<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * @property mixed $amount
 * @property mixed $account_id
 * @property mixed $category_id
 */
class ExpenseRequest extends FormRequest
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
        return [
            'user_id' => 'required',
            'account_id' => 'required',
            'amount' => 'required|numeric',
            'refundable_amount' => '>:return_amount',
            'category_id' => 'required',
            'description' => 'nullable|string',
            'attachment' => 'nullable|file',
            'note' => 'nullable',
            'reference' => 'nullable',
            'date' => 'nullable',
        ];
    }


    /**
     * @return string[]
     */
    public function messages(): array
    {
        return [
            'user_id.required' => 'Please select an expense by user',
            'account_id.required' => 'Please select a bank account',
            'amount.required' => 'Please add the expense amount',
            'category_id.required' => 'Please select an expense category',
        ];
    }
}
