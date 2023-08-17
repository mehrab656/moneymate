<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CategoryRequest extends FormRequest
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
     * @return array<string, ValidationRule|array|string>
     */
    public function rules(): array
    {
        $category = $this->route('category');

        return [
            'name' => [
                'required',
                Rule::unique('categories')->where(function ($query) use ($category) {
                    $query->where('user_id', auth()->user()->id);

                    if ($category) {
                        $query->where('id', '!=', $category->id);
                    }
                }),
            ],
            'type' => 'required|in:income,expense',
        ];
    }

    /**
     * @return string[]
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Category name is required',
            'type.required' => 'You need to select a type',
        ];
    }
}
