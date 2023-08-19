<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;


class InvestmentReportResource extends JsonResource {

	public static $wrap = false;

	/**
	 * Transform the resource into an array.
	 *
	 * @return array<string, mixed>
	 */
	public function toArray( Request $request ): array {
		return [
			'investor_name'           => $this->investor->name,
			'total_investment_amount' => $this->total_investment_amount,
		];
	}
}
