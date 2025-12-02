<?php

namespace App\Http\Resources;


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
        $employee = $this->employee;
        $extraData = [];
        if ($employee && $employee->extras) {
            $decoded = json_decode($employee->extras, true);
            $extraData = is_array($decoded) ? $decoded : [];
        }


        return [
            'slug' => $this->slug,
            'first_name'=>$this->first_name,
            'last_name'=>$this->last_name,
            'username' => $this->username,
            'email' => $this->email,
            'phone'=>$this->phone,
            'emergency_contact'=>$this->emergency_contact,
            'dob'=>$this->dob,
            'gender'=>$this->gender,
            'avatar' => asset('avatars/'.$this->profile_picture),
//            'primary_company' => $this->primary_company,
            'role' => $this->role,
            'is_active_membership' => 'yes',
            'created_at' => $this->created_at,
            'active'=>$this->active?'Active':'Inactive',
            'options'=>$this->options,
            'employeeData'=> $employee ? [
                'salary'=> $employee->basic_salary,
                'accommodation_cost'=> $employee->accommodation_cost,
                'joining_date'=> $employee->joining_date,
                'phone'=> $employee->phone,
                'emergency_contact'=> $employee->emergency_contact,
                'position'=> $employee->position,
                'extras'=> $employee->extras ? json_decode($employee->extras) : (object)[],
                'passport_file_name' => isset($extraData['passport_copy']) ? asset('passports/'.$extraData['passport_copy']) : '',
                'emirate_file_name' => isset($extraData['emirate_id_copy']) ? asset('ids/'.$extraData['emirate_id_copy']) : '',
            ] : [
                'salary'=> null,
                'accommodation_cost'=> null,
                'joining_date'=> null,
                'phone'=> null,
                'emergency_contact'=> null,
                'position'=> null,
                'extras'=> (object)[],
                'passport_file_name' => '',
                'emirate_file_name' => '',
            ],
        ];
    }
}
