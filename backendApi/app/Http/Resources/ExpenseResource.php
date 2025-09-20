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
class ExpenseResource extends JsonResource
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
            'id' => $this->slug,
            'user_name' => $this->person->username,
            'account' => ['label' => $this->bankAccount->bankName->bank_name . '(' . $this->bankAccount->account_number . ')', 'value' => $this->bankAccount->slug],
            'category' => ['value' => $this->category->slug, 'label' => $this->category->name],
            'amount' => $this->amount,
            'refundable_amount' => $this->refundable_amount,
            'refunded_amount' => $this->refunded_amount,
            'attachment' => $this->attachment,
            'description' => $this->description,
            'date' => $this->date,
            'note' => $this->note,
            'reference' => $this->reference
        ];
    }
}
