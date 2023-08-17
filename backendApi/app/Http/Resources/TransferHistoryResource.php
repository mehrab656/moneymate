<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransferHistoryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */

    public static $wrap = false;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'from_account' => $this->fromAccount->account_number . ' - ' . $this->fromAccount->bankName->bank_name,
            'to_account' => $this->toAccount->account_number . ' - ' . $this->toAccount->bankName->bank_name,
            'amount' => $this->amount,
            'transfer_date' => $this->transfer_date,
            'note' => $this->note,
        ];
    }
}
