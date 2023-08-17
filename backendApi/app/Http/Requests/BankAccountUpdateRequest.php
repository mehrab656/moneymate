<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class BankAccountUpdateRequest extends FormRequest
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
            //'user_id' => 'required',
            'account_name' => 'required|string',
            'account_number' => 'required|string',
            'balance' => 'required|numeric',
            'bank_name_id' => 'required|integer',
        ];
    }

    /**
     * @return string[]
     */
    public function messages(): array
    {
        return [
            'account_name.required' => 'Add account holders name',
            'bank_name.required' => 'Add a bank name',
            'account_number.required' => 'Add account number',
            'balance.required' => 'Put an initial balance'
        ];
    }
}
