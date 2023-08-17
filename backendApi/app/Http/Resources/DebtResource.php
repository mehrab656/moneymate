<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DebtResource extends JsonResource
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
            'amount' => $this->amount,
            'account_id' => $this->account_id,
            'account' => $this->accounts->bankName->bank_name,
            'type' => $this->type,
            'person' => $this->person,
            'date' => $this->date,
            'note' => $this->note
        ];
    }
}
