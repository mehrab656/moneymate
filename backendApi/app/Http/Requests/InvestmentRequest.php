<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InvestmentRequest extends FormRequest {
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
			'investor_id'     => 'required',
			'account_id'      => 'required',
			'amount'          => 'required|numeric',
			'note'            => 'nullable',
			'investment_date' => 'nullable'
		];
	}

	/**
	 * @return string[]
	 */
	public function messages(): array {
		return [
			'investor_id.required' => 'Please select an Investor',
			'account_id.required'  => 'Please select an adjustment account',
			'amount.required'      => 'Please add the investment amount',
		];
	}
}
