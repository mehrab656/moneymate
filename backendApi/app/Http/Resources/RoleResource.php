<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoleResource extends JsonResource
{
    public static $wrap = false;

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'role' => $this->role,
            'status' => $this->status,
            'permission' => json_decode($this->permissions,true),
            'options' => $this->options,
            'added_by' => $this->createdBy->name,
            'added_date' => $this->created_at,
            'modified_date' => $this->updated_at,
            'modified_by' => $this->updatedBy->name,
        ];
    }
}
