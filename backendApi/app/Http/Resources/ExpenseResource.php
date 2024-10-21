<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property mixed $id
 * @property mixed $person
 * @property mixed $bankAccount
 * @property mixed $category
 * @property mixed $amount
 * @property mixed $refundable_amount
 * @property mixed $refunded_amount
 * @property mixed $description
 * @property mixed $note
 * @property mixed $reference
 * @property mixed $date
 * @property mixed $user_id
 * @property mixed $attachment
 */
class ExpenseResource extends JsonResource {

	public static $wrap = false;


	/**
	 * Transform the resource into an array.
	 *
	 * @return array<string, mixed>
	 */
	public function toArray( Request $request ): array {
		return [
			'id'                => $this->id,
			'user_name'         => $this->person->username,
			'user_id'           => $this->user_id,
			'account_number'    => $this->bankAccount->account_number,
			'account_id'        => $this->bankAccount->id,
			'category_name'     => $this->category->name,
			'category_id'       => $this->category->id,
			'amount'            => $this->amount,
			'refundable_amount' => $this->refundable_amount,
			'refunded_amount'   => $this->refunded_amount,
			'attachment'        => $this->attachment,
			'description'       => $this->description,
			'bank_name'         => $this->bankAccount && $this->bankAccount->bankName ? $this->bankAccount->bankName->bank_name : '',
			'date'              => $this->date,
			'note'              => $this->note,
			'reference'         => $this->reference
		];
	}
}
