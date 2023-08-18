<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property mixed $id
 * @property mixed $amount
 * @property mixed $investment_date
 * @property mixed $note
 * @property mixed $added
 * @property mixed $investor_id
 * @property mixed $investor
 * @property mixed $addedBy
 * @property mixed $bankAccount
 * @property mixed $account_id
 */
class InvestmentResource extends JsonResource {
	public static $wrap = false;

	/**
	 * Transform the resource into an array.
	 *
	 * @return array<string, mixed>
	 */
	public function toArray( Request $request ): array {
		return [
			'id'              => $this->id,
			'investor_id'     => $this->investor_id,
			'account_id'      => $this->account_id,
			'investor_name'   => $this->investor->name,
			'added_by_name'   => $this->added->name,
			'amount'          => $this->amount,
			'investment_date' => $this->investment_date,
			'note'            => $this->note,
		];
	}
}
