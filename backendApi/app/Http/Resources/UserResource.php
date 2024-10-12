<?php

namespace App\Http\Resources;

use App\Models\Subscription;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public static $wrap = false;

    /**
     * Transform the resource into an array.
     *
     * @param Request $request
     * @return array
     */
    public function toArray($request): array
    {
//        $is_active_membership = 'no';
//        $registrationType = get_option('registration_type');
//
//        if ($registrationType === 'subscription') {
//            $subscription = Subscription::where('status', 'active')
//                ->where('current_period_end', '>', now())
//                ->first();
//            if ($subscription)
//            {
//                $is_active_membership = 'yes';
//            }
//
//    }

        return [
            'id' => $this->id,
            'primary_company' => $this->primary_company,
            'name' => $this->name,
            'email' => $this->email,
            'is_active_membership' => 'yes',
            'created_at' => $this->created_at,
        ];
    }
}
