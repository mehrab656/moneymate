<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
/**
 * @property mixed $name
 * @property mixed $phone
 */
class CompanyRequest extends FormRequest {
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
	public function rules(): array {
		$rules = [
			'name'                => 'required',
			'phone'               => 'required',
			'email'               => 'required',
			'address'             => 'nullable',
			'activity'            => 'nullable',
			'license_no'          => 'nullable',
			'issue_date'          => 'nullable',
			'expiry_date'         => 'nullable',
			'registration_number' => 'nullable',
			'extra'               => 'nullable',
			'logo'                => 'nullable',
		];
		if ($this->hasFile('logo')) {
			$rules['logo'] = 'file';
		}
		return $rules;

	}

	public function messages(): array {

		return [
			'name.required'  => 'Company name is required.',
			'phone.required' => 'A valid company number is required.',
			'email.required' => 'Valid company email is required',
		];

	}

}
