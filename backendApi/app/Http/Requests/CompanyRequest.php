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
            'name'                => 'required|string|max:64',
            'phone'               => 'required|string|max:16',
            'email'               => 'required|email|max:32',
            'address'             => 'nullable|string',
            'activity'            => 'nullable|string',
            'license_no'          => 'nullable|string',
            'issue_date'          => 'required|date',
            'expiry_date'         => 'required|date|different:issue_date',
            'registration_number' => 'nullable|string',
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
            'phone.required' => 'A company phone number is required.',
            'phone.max'      => 'Phone number may not be greater than 16 characters.',
            'email.required' => 'Valid company email is required',
            'email.email'    => 'Email must be a valid email address.',
            'email.max'      => 'Email may not be greater than 32 characters.',
            'name.max'       => 'Company name may not be greater than 64 characters.',
            'issue_date.required' => 'Issue date is required.',
            'issue_date.date'     => 'Issue date must be a valid date.',
            'expiry_date.required' => 'Expiry date is required.',
            'expiry_date.date'     => 'Expiry date must be a valid date.',
            'expiry_date.different' => 'Expiry date must be different from issue date.',
        ];

    }

}
