<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property mixed $id
 * @property mixed $company_id
 * @property mixed $name
 * @property mixed $rent
 * @property mixed $contract_start_date
 * @property mixed $contract_end_date
 * @property mixed $el_premises_no
 * @property mixed $el_business_acc_no
 * @property mixed $el_acc_no
 * @property mixed $el_note
 * @property mixed $el_billing_date
 * @property mixed $internet_acc_no
 * @property mixed $internet_billing_date
 * @property mixed $int_note
 */
class SectorResource extends JsonResource {

	/**
	 * Transform the resource into an array.
	 *
	 * @return array<string, mixed>
	 */
	public function toArray( Request $request ): array {
		return [
			'id'                    => $this->slug,
			'name'                  => $this->name,
			'rent'                  => $this->rent,
//			'payment_account_id'    => $this->payment_account_id,
			'contract_start_date'   => $this->contract_start_date,
			'contract_end_date'     => $this->contract_end_date,
			'el_premises_no'        => $this->el_premises_no,
			'el_business_acc_no'    => $this->el_business_acc_no,
			'el_acc_no'             => $this->el_acc_no,
			'el_note'               => $this->el_note,
			'el_billing_date'       => $this->el_billing_date,
			'internet_acc_no'       => $this->internet_acc_no,
			'internet_billing_date' => $this->internet_billing_date,
			'int_note'              => $this->int_note,
			'payments'              => $this->payments,
			'channels'              => $this->channels,
		];
	}
}
