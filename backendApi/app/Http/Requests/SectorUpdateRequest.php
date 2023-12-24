<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SectorUpdateRequest extends FormRequest {
	/**
	 * Determine if the user is authorized to make this request.
	 */
	public function authorize(): bool {
		return true;
	}

	/**
	 * Get the validation rules that apply to the request.
	 *
	 * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
	 */
	public function rules(): array {
		return [
			'name'                  => 'required',
			'contract_start_date'   => 'required',
			'contract_end_date'     => 'required',
			'el_premises_no'        => 'required',
			'el_acc_no'             => 'required',
			'el_business_acc_no'    => 'required',
			'el_billing_date'       => 'required',
			'internet_acc_no'       => 'required',
			'internet_billing_date' => 'required',
			'int_note'              => 'nullable',

		];
	}

	/**
	 * @return string[]
	 */
	public function messages(): array {
		return [
			'sector_name.required'                => 'Sector name is required.',
			'contract_start_date.required'        => 'Contract start date is required.',
			'contract_end_date.contract_end_date' => 'Contract end date is required.',
			'el_premises_no.required'             => 'Electricity premises number is required.',
			'el_acc_no.required'                  => 'Electricity account number is required.',
			'el_business_acc_no.required'         => 'Electricity business account number is required.',
			'el_billing_date.required'            => 'Electricity billing date is required.',
			'internet_billing_date.required'      => 'Internet billing date is required.',
			'internet_acc_no.required'            => 'Internet account number is required.',
		];
	}
}
