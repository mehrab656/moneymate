<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property mixed $id
 * @property mixed $user_id
 * @property mixed $bank_name
 * @property mixed $person
 * @property mixed $created_at
 */
class BankNameResource extends JsonResource
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
            'user_id' => $this->user_id,
	        'user_name'=>$this->person->name,
            'bank_name' => $this->bank_name,
            'created_at' => $this->created_at,
        ];
    }
}
