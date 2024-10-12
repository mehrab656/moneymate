<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RoleRequest extends FormRequest
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
            'id' => 'nullable',
            'name' => 'required',
            'status' => 'nullable',
            'roles' => 'array'
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Role name is required.',
            'roles.array' => 'Role fields can not be empty',
        ];
    }
}
