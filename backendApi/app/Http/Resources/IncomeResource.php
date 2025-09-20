<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property mixed $id
 * @property mixed $amount
 * @property mixed $description
 * @property mixed $person
 * @property mixed $bankAccount
 * @property mixed $category
 * @property string $income_type
 * @property string $date
 * @property string $checkin_date
 * @property string $checkout_date
 * @property string $attachment
 * @property string $reference
 * @property string $note
 */
class IncomeResource extends JsonResource
{

    public static $wrap = false;

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return
            ['id' => $this->slug,
            'category_name' => $this->category->name,
            'amount' => $this->amount,
            'description' => $this->description,
            'note' => $this->note,
            'attachment' => $this->attachment,
            'date' => Carbon::parse($this->date)->format('Y-m-d'),
            'checkin_date' => Carbon::parse($this->checkin_date)->format('Y-m-d'),
            'checkout_date' => Carbon::parse($this->checkout_date)->format('Y-m-d'),
            'category' => ['value' => $this->category->slug, 'label' => $this->category->name],
            'account' => ['label' => $this->bankAccount->bankName->bank_name . '(' . $this->bankAccount->account_number . ')', 'value' => $this->bankAccount->slug],
            'reference' => ['value' => $this->reference, 'label' => strtoupper($this->reference)],
            'income_type' => ['value' => $this->income_type, 'label' => strtoupper($this->income_type)]];
    }
}
