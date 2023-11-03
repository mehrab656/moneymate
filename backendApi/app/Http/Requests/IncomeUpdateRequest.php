<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * @property mixed $account_id
 * @property mixed $category_id
 * @property mixed $bankAccount
 * @property mixed $category
 */
class IncomeUpdateRequest extends FormRequest
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
            'account_id' => 'required',
            'amount' => 'required|numeric',
            'category_id' => 'required',
            'description' => 'nullable|string',
            'note' => 'nullable|string',
            'reference' => 'nullable|string',
            'date' => 'nullable|date_format:Y-m-d',
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
            'account_id.required' => 'Please select a bank account.',
            'amount.required' => 'Please add your income amount.',
            'amount.numeric' => 'Income amount must be a numeric value.',
            'category_id.required' => 'Please select an income category.',
            'description.string' => 'Description must be a string.',
            'attachment.file' => 'Attachment must be a file.',
            'note.string' => 'Note must be a string.',
            'reference.string' => 'Income reference must be a string.',
            'date.date_format' => 'Income date must be in the format "YYYY-MM-DD".',
        ];
    }
}
