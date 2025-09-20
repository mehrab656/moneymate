<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EmployeeRequest extends FormRequest
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
            'first_name' => 'required',
            'last_name' => 'required',
            'user_name' => 'required',
            'email' => ['required', 'email', 'unique:users,email'],
            'phone' => 'required',
            'emergency_contact' => 'nullable',
            'dob' => 'nullable',
            'gender' => 'nullable',
            'joining_date' => 'required',
            'role_id' => 'required',
            'position' => 'required',
            'basic_salary' => 'required|numeric',
            'accommodation_cost' => 'required|numeric',
        ];
    }

    public function messages(): array
    {
        return [
            'first_name.required' => 'Employee First Name is Required',
            'last_name.required' => 'Employee Second Name is Required',
            'user_name.required' => 'Employee User Name is Required',
            'email.required' => 'Email is Required',
            'phone.required' => 'Email is Required',
            'joining_date.required' => 'Joining date is Required',
            'role_id.required' => 'EmployeeResource Role is Required',
            'position.required' => 'Designation is Required',
            'basic_salary.required' => 'Salary is Required',
            'basic_salary.numeric' => 'Salary should be numeric',
            'accommodation_cost.required' => 'Accommodation cost is required',
            'accommodation_cost.numeric' => 'Accommodation should be numeric',
        ];
    }



}
