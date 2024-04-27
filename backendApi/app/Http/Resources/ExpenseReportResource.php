<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExpenseReportResource extends JsonResource {

	public static $wrap = false;

	/**
	 * Transform the resource into an array.
	 *
	 * @return array<string, mixed>
	 */
	public function toArray( Request $request ): array {
		return [
			'id'                => $this->id,
			'user_id'           => $this->user_id,
			'account_id'        => $this->account_id,
			'category_id'       => $this->category_id,
			'amount'            => $this->amount,
			'refundable_amount' => $this->refundable_amount,
			'refunded_amount'   => $this->refunded_amount,
			'category_name'     => $this->category->name,
			'user_name'         => $this->person->name,
			'bank_name'         => $this->bankAccount->bankName->bank_name,
			'account_number'    => $this->bankAccount->account_number,
			'description'       => $this->description,
			'reference'         => $this->reference,
			'date'              => $this->date,
			'note'              => $this->note,
			'attachment'        => $this->attachment,
			'created_at'        => $this->created_at,
			'updated_at'        => $this->updated_at,
		];
	}
}
