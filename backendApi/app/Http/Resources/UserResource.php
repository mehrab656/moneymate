<?php

namespace App\Http\Resources;

use App\Models\Subscription;
use Auth;
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
    public function toArray(Request $request): array
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
            'id' => $this->slug,
            'slug' => $this->slug,
            'first_name'=>$this->first_name,
            'last_name'=>$this->last_name,
            'username' => $this->username,
            'email' => $this->email,
            'phone'=>$this->phone,
            'emergency_contract'=>$this->emergency_contract,
            'dob'=>$this->dob,
            'gender'=>$this->gender,
            'avatar' => asset('avatars/'.$this->profile_picture),
//            'primary_company' => $this->primary_company,
            'role' => $this->role,
            'is_active_membership' => 'yes',
            'created_at' => $this->created_at,
            'active'=>$this->active?'Active':'Inactive',
            'options'=>$this->options,
        ];
    }
}
