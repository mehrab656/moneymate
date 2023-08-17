<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DebtHistory extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $bank_name = $this->account && $this->account->bankName ? $this->account->bankName->bank_name : '';
        $account_holder_name = $this->account ? $this->account->account_name : '';
        $account_number = $this->account ? $this->account->account_number : '';

        if ($this->getTable() == 'borrows')
        {
            $type = 'Borrow';
        } elseif ($this->getTable() == 'repayments')
        {
            $type = 'Repayment';
        } elseif ($this->getTable() == 'lends')
        {
            $type = 'Lend';
        } elseif ($this->getTable() == 'debt_collections')
        {
            $type = 'Debt Collection';
        } else{
            $type = '';
        }

        return [
            'id' => $this->id,
            'amount' => $this->amount,
            'bank_name' => $bank_name,
            'account_holder_name' => $account_holder_name,
            'account_number' => $account_number,
            'date' => $this->date,
            'created_at' => $this->created_at->format("Y-m-d"),
            'type' => $type,
        ];
    }
}
