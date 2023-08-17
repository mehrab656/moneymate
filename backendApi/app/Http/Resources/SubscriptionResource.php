<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubscriptionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'current_period_start' => $this->current_period_start,
            'current_period_end' => $this->current_period_end,
            'status' => ucfirst($this->status),
            'amount' => $this->amount,
            'user_name' => $this->user->name
        ];
    }
}
