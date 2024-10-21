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
            'id'=>$this->slug,
            'role'=>$this->role,
            'status'=>$this->status,
            'permissions'=>json_decode($this->permissions,true),
            'updated_by'=>$this->updated_by,
            'options'=>$this->options,
            'date'=>$this->created_at,
        ];
    }
}
