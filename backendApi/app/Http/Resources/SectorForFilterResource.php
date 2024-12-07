<?php

namespace App\Http\Resources;

use App\Models\SectorModel;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SectorForFilterResource extends JsonResource
{

    function __construct(SectorModel $model)
    {
        parent::__construct($model);
    }

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'label' => $this->name,
            'value' => $this->slug,
            'internet_billing_date' => $this->internet_billing_date,
            'el_billing_date' => $this->el_billing_date
        ];
    }
}
