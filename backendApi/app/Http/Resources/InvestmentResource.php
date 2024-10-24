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
        $investor = [
            'value'=>$this->investor->slug,
            'label'=>sprintf("%s %s (%s)", strtoupper($this->investor->first_name), strtoupper($this->investor->last_name), $this->investor->username),
        ];

		return [
			'id'              => $this->id,
			'investor'     => $investor,
			'account_id'      => $this->account_id,
			'investor_name'   => $this->investor->username,
			'added_by_name'   => $this->added->username,
			'amount'          => $this->amount,
			'investment_date' => $this->investment_date,
			'note'            => $this->note,
			"company"         => $this->companies
		];
	}
}
