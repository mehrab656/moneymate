<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BankNameUpdateRequest extends FormRequest
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
        $bankNameId = $this->route('bank_name') ? $this->route('bank_name')->id : null;

        return [
            'bank_name' => [
                'required',
                Rule::unique('bank_names')
                    ->where(function ($query) {
                        return $query->where('user_id', auth()->user()->id);
                    })
                    ->ignore($bankNameId)
            ]
        ];
    }

    /**
     * @return string[]
     */
    public function messages(): array
    {
        return [
            'bank_name.required' => 'You forgot to put a bank name'
        ];
    }
}
