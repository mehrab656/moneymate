<?php

namespace App\Http\Requests;

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
	 * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
	 */
	public function rules(): array {
		return [
			'name'                  => 'required',
			'payment_account_id'    => 'required',
			'contract_start_date'   => 'required',
			'contract_end_date'     => 'required',
			'el_premises_no'        => 'required',
			'el_acc_no'             => 'required',
			'el_business_acc_no'    => 'required',
			'el_billing_date'       => 'required',
			'internet_acc_no'       => 'required',
			'internet_billing_date' => 'required',
			'contract_period'       => 'required',
			'int_note'              => 'nullable',
			'payment_amount'        => 'required',
			'payment_date'          => 'required',
			'payment_number'        => 'required',
			'category_name'         => 'nullable',
			'channel_name'          => 'nullable',
			'reference_id'          => 'nullable',
			'listing_date'          => 'nullable'
		];
	}

	/**
	 * @return string[]
	 */
	public function messages(): array {
		return [
			'sector_name.required'                => 'Sector name is required.',
			'payment_account_id.required'         => 'Payment account is required.',
			'contract_start_date.required'        => 'Contract start date is required.',
			'contract_end_date.contract_end_date' => 'Contract end date is required.',
			'el_premises_no.required'             => 'Electricity premises number is required.',
			'el_acc_no.required'                  => 'Electricity account number is required.',
			'el_business_acc_no.required'         => 'Electricity business account number is required.',
			'el_billing_date.required'            => 'Electricity billing date is required.',
			'internet_billing_date.required'      => 'Internet billing date is required.',
			'internet_acc_no.required'            => 'Internet account number is required.',
			'payment_date.required'               => 'Minimum one payment date is required.',
			'payment_amount.required'             => 'Minimum one payment amount is required',
			'payment_number.required'             => 'Minimum One payment number is required.',
		];
	}
}
