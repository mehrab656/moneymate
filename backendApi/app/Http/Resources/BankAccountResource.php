<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property mixed $accountHolders
 * @property mixed $account_name
 * @property mixed $bank_name
 * @property mixed $account_number
 * @property mixed $balance
 * @property mixed $id
 * @property mixed $user
 */
class BankAccountResource extends JsonResource
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
            'customer_name' => $this->user->name,
            'account_name' => $this->account_name,
            'bank_name' => $this->bankName->bank_name,
            'account_number' => $this->account_number,
            'balance' => $this->balance,
            'bank_name_id' => $this->bankName->id,
        ];
    }
}
