<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
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
            'role' => 'required',
        ];
    }

    public function messages(): array
    {
        return [
            'first_name.required' => 'User First Name is Required',
            'last_name.required' => 'User Last Name is Required',
            'user_name.required' => 'User User Name is Required',
            'email.required' => 'Email is Required',
            'phone.required' => 'Phone is Required',
            'role.required' => 'Role is Required',
        ];
    }}
