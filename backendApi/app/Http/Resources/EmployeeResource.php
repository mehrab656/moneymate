<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Storage;

class EmployeeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $user = $this->user;
        return [
            'id' => $this->id,
            'company_id' => $this->company_id,
            'avatar' => asset('avatars/'.$this->user->profile_picture),
            'user_id' => $this->user_id,
            'name' => sprintf("%s %s(%s)",$user->first_name,$user->last_name,$user->username),
            'basic_salary' => $this->basic_salary,
            'accommodation_cost' => $this->accommodation_cost,
            'joining_date' => $this->joining_date,
            'position' => $this->position,
            'attachment' => $this->attachment,
            'emergency_contact' => $this->emergency_contact,
            'extras' => $this->extras,
            'phone' => $this->phone,
        ];
    }
}
