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
            'sector_id' => 'required',
            'category_id' => 'required',
            'account_id' => 'required',
            'date' => 'required',
        ];
    }

    public function messages(): array
    {
        return [
            'sector_id.required' => 'Sector is required.',
            'category_id.required' => 'Category is required.',
            'account_id.required' => 'Expense account is required.',
            'date.contract_end_date' => 'Expense date is required.',
        ];
    }
}
