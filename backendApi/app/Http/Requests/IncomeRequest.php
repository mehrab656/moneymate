<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * @property mixed $account_id
 * @property mixed $amount
 */
class IncomeRequest extends FormRequest {
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
//            'user_id' => 'required',
			'account_id'    => 'required',
			'amount'        => 'required|numeric',
			'category_id'   => 'required',
			'description'   => 'nullable|string',
			'attachment'    => 'nullable|file',
			'note'          => 'nullable',
			'reference'     => 'nullable',
			'date'          => 'nullable',
			'checkin_date'  => 'nullable',
			'checkout_date' => 'nullable',
			'income_type'   => 'required',
		];
	}

	/**
	 * @return string[]
	 */
	public function messages(): array {
		return [
			'account_id.required'  => 'Please select a bank account',
			'amount.required'      => 'Please add your income amount',
			'category_id.required' => 'Please select an income category',
		];
	}

}