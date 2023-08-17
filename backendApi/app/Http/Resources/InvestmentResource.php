<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property mixed $id
 * @property mixed $user_id
 * @property mixed $amount
 * @property mixed $investment_date
 * @property mixed $note
 */
class InvestmentResource extends JsonResource
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
			'id'=>$this->id,
			'user_id'=>$this->user_id,
			'amount'=>$this->amount,
			'investment_date'=>$this->investment_date,
			'note'=>$this->note,
        ];
    }
}
