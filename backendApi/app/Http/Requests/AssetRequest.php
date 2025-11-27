<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AssetRequest extends FormRequest
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
            'id' => 'nullable',
            'sector_id' => 'required|exists:sectors,id',
            'category_id' => 'required|exists:categories,id',
            'account_id' => 'required|exists:bank_accounts,id',
            'date' => 'required',
        ];
    }

    public function messages(): array
    {
        return [
            'sector_id.required' => 'Sector is required.',
            'sector_id.exists' => 'Selected sector does not exist.',
            'category_id.required' => 'Category is required.',
            'category_id.exists' => 'Selected category does not exist.',
            'account_id.required' => 'Expense account is required.',
            'account_id.exists' => 'Selected bank account does not exist.',
            'date.contract_end_date' => 'Expense date is required.',
        ];
    }
}
