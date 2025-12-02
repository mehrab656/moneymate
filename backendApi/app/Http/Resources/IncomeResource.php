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
        $category = $this->category ?? null;
        $bankAccount = $this->bankAccount ?? null;
        $bankName = $bankAccount && $bankAccount->bankName ? $bankAccount->bankName->bank_name : '';
        $accountNumber = $bankAccount ? $bankAccount->account_number : '';
        $accountSlug = $bankAccount ? $bankAccount->slug : null;

        return [
            'id' => $this->slug,
            'category_name' => $category ? $category->name : '',
            'amount' => $this->amount,
            'description' => $this->description,
            'note' => $this->note,
            'attachment' => $this->attachment,
            'date' => $this->date ? Carbon::parse($this->date)->format('Y-m-d') : null,
            'checkin_date' => $this->checkin_date ? Carbon::parse($this->checkin_date)->format('Y-m-d') : null,
            'checkout_date' => $this->checkout_date ? Carbon::parse($this->checkout_date)->format('Y-m-d') : null,
            'category' => [
                'value' => $category ? $category->slug : null,
                'label' => $category ? $category->name : ''
            ],
            'account' => [
                'label' => ($bankName && $accountNumber) ? ($bankName . '(' . $accountNumber . ')') : '',
                'value' => $accountSlug
            ],
            'reference' => [
                'value' => $this->reference,
                'label' => strtoupper((string) $this->reference)
            ],
            'income_type' => [
                'value' => $this->income_type,
                'label' => strtoupper((string) $this->income_type)
            ]
        ];
    }
}
