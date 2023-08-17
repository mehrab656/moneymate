<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BudgetResource extends JsonResource
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
            'budget_name' => $this->budget_name,
            'amount' => $this->amount,
            'updated_amount' => $this->updated_amount,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'categories' => $this->categories,
        ];
    }
}
