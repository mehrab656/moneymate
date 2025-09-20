<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SectorContractUpdateRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'contract_start_date' => 'required',
            'contract_end_date' => 'required',
            'electricity_bill_month' => 'required',
            'internet_bill_month' => 'required',
            'payment_amount' => 'required|array|min:1',
            'payment_date' => 'required|array|min:1',
            'payment_number' => 'required|array|min:1',
            'rent' => 'required',
        ];
    }
}
