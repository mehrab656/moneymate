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
        $extrasArr = [];
        if ($this->extras) {
            $decoded = json_decode($this->extras, true);
            $extrasArr = is_array($decoded) ? $decoded : [];
        }
        $id = $user ? $user->slug : ($this->slug ?? $this->id);
        $avatarFile = $user && $user->profile_picture ? $user->profile_picture : 'default_employee.png';
        $firstName = $user ? $user->first_name : ($extrasArr['first_name'] ?? '');
        $lastName = $user ? $user->last_name : ($extrasArr['last_name'] ?? '');
        $username = $user ? $user->username : ($extrasArr['username'] ?? '');
        $displayName = trim(sprintf("%s %s(%s)", $firstName, $lastName, $username), " ()");
        return [
            'id' => $id,
            'company_id' => $this->company_id,
            'avatar' => asset('avatars/' . $avatarFile),
            'user_id' => $this->user_id,
            'name' => $displayName ?: ($username ?: 'Unknown'),
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
