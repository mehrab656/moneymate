<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class DebtRequest extends FormRequest
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
            'amount' => 'required|numeric',
            'account_id' => 'required|exists:bank_accounts,slug',
            'type' => 'required|in:lend,repayment,borrow,debt-collection',
            'person' => 'required|string',
            'date' => 'required|date',
            'note' => 'nullable|string',
        ];
    }
}
