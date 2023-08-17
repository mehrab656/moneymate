<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BankNameRequest extends FormRequest
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
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'bank_name' => [
                'required',
                Rule::unique('bank_names')->where(function ($query) {
                    return $query->where('user_id', auth()->user()->id);
                })
            ]
        ];
    }

    public function messages(): array
    {
        return [
            'bank_name.required' => 'A bank name is required',
            'bank_name.unique' => 'The bank name already exists'
        ];
    }
}
