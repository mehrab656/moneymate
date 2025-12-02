<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SectorRequest extends FormRequest {
	/**
	 * Determine if the user is authorized to make this request.
	 */
	public function authorize(): bool {
		return true;
	}

	/**
	 * Get the validation rules that apply to the request.
	 *
	 * @return array<string, ValidationRule|array|string>
	 */
    public function rules(): array {
        return [
            'name'                  => 'required|string|max:255',
            'bank_account_id'       => 'required|string|exists:bank_accounts,slug',
            'contract_start_date'   => 'required|date',
            'contract_end_date'     => 'required|date|after_or_equal:contract_start_date',
            'el_premises_no'        => 'required|integer',
            'el_acc_no'             => 'required|integer',
            'el_business_acc_no'    => 'required|integer',
            'el_billing_date'       => 'required|date',
            'el_note'               => 'nullable|string',
            'internet_acc_no'       => 'required|string',
            'internet_billing_date' => 'required|date',
            'contract_period'       => 'required|integer|min:1|max:24',
            'int_note'              => 'nullable|string',

            // Payment arrays
            'payment_amount'        => 'required|array',
            'payment_amount.*'      => 'numeric|min:0',
            'payment_date'          => 'required|array',
            'payment_date.*'        => 'date',
            'payment_number'        => 'required|array',
            'payment_number.*'      => 'string',

            // Optional arrays
            'category_name'         => 'nullable|array',
            'category_name.*'       => 'string',
            'channel_name'          => 'nullable|array',
            'channel_name.*'        => 'string',
            'reference_id'          => 'nullable|array',
            'reference_id.*'        => 'string',
            'listing_date'          => 'nullable|array',
            'listing_date.*'        => 'date',
        ];
    }

	/**
	 * @return string[]
	 */
    public function messages(): array {
        return [
            'name.required'                => 'Sector name is required.',
            'bank_account_id.required'      => 'Bank account is required.',
            'bank_account_id.exists'        => 'Selected bank account is invalid.',
            'contract_start_date.required'  => 'Contract start date is required.',
            'contract_start_date.date'      => 'Contract start date must be a valid date.',
            'contract_end_date.required'    => 'Contract end date is required.',
            'contract_end_date.date'        => 'Contract end date must be a valid date.',
            'contract_end_date.after_or_equal' => 'Contract end date must be after or equal to the start date.',
            'el_premises_no.required'       => 'Electricity premises number is required.',
            'el_premises_no.integer'        => 'Electricity premises number must be an integer.',
            'el_acc_no.required'            => 'Electricity account number is required.',
            'el_acc_no.integer'             => 'Electricity account number must be an integer.',
            'el_business_acc_no.required'   => 'Electricity business account number is required.',
            'el_business_acc_no.integer'    => 'Electricity business account number must be an integer.',
            'el_billing_date.required'      => 'Electricity billing date is required.',
            'el_billing_date.date'          => 'Electricity billing date must be a valid date.',
            'internet_billing_date.required'=> 'Internet billing date is required.',
            'internet_billing_date.date'    => 'Internet billing date must be a valid date.',
            'internet_acc_no.required'      => 'Internet account number is required.',
            'contract_period.required'      => 'Contract period is required.',
            'contract_period.integer'       => 'Contract period must be an integer.',
            'payment_date.required'         => 'Minimum one payment date is required.',
            'payment_date.array'            => 'Payment dates must be an array.',
            'payment_date.*.date'           => 'Each payment date must be a valid date.',
            'payment_amount.required'       => 'Minimum one payment amount is required',
            'payment_amount.array'          => 'Payment amounts must be an array.',
            'payment_amount.*.numeric'      => 'Each payment amount must be numeric.',
            'payment_number.required'       => 'Minimum One payment number is required.',
            'payment_number.array'          => 'Payment numbers must be an array.',
            'payment_number.*.string'       => 'Each payment number must be a string.',
        ];
    }
}
