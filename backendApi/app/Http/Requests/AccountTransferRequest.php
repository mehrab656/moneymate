<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AccountTransferRequest extends FormRequest
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
            'from_account_id' => 'required|exists:bank_accounts,id',
            'to_account_id' => 'required|exists:bank_accounts,id',
            'amount' => 'required|numeric|gt:0',
            'transfer_date' => 'required|date',
            'note' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'from_account_id.required' => 'You need to select a from account number',
            'from_account_id.exists' => 'The selected from account is invalid.',
            'to_account_id.required' => 'You need to select a to account number',
            'to_account_id.exists' => 'The selected to account is invalid.',
            'amount.required' => 'You need to put an amount to transfer',
            'amount.numeric' => 'The amount must be a numeric value',
            'amount.gt' => 'The amount must be greater than 0',
            'transfer_date.required' => 'The transfer date is required',
            'transfer_date.date' => 'The transfer date must be a valid date.',
        ];
    }
}
