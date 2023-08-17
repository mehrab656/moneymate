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
        return [
            'id' => $this->id,
            'user_name' => $this->person->name,
            'account_number' => $this->bankAccount->account_number,
            'account_id' => $this->bankAccount->id,
            'category_name' => $this->category->name,
            'category_id' => $this->category->id,
            'amount' => $this->amount,
            'description' => $this->description,
            'bank_name' => $this->bankAccount && $this->bankAccount->bankName ? $this->bankAccount->bankName->bank_name : '',
            'note' => $this->note,
            'reference' => $this->reference,
            'attachment' => $this->attachment,
            'income_date' => Carbon::parse($this->income_date)->format('Y-m-d'),
        ];
    }
}
