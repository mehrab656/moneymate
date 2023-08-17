<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class BudgetRequest extends FormRequest
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
            'budget_name' => 'required|string',
            'amount' => 'required|numeric',
            'start_date' => 'required',
            'end_date' => 'required',
            'categories' => 'required|array',
            'categories.*' => 'exists:categories,id',
        ];
    }
}
