<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Composer\Autoload\ClassLoader;
use Exception;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\HasApiTokens;
use mysql_xdevapi\DatabaseObject;

/**
 * @property mixed $id
 */
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'slug',
        'username',
        'primary_company',
        'profile_picture',
        'email',
        'password',
        'role_as',
        'first_name',
        'last_name',
        'phone',
        'emergency_contract',
        'dob',
        'last_ip_address',
        'ip_address',
        'activation_code',
        'forgotten_password_code',
        'forgotten_password_time',
        'remember_code',
        'active',
        'gender',
        'options',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    protected $with = [
        'subscriptions'
    ];

    /**
     * @return HasMany
     */
    public function bankAccounts(): HasMany
    {
        return $this->hasMany(BankAccount::class);
    }


    /**
     * @return HasMany
     */
    public function incomes(): HasMany
    {
        return $this->hasMany(Income::class);
    }

    /**
     * @return HasMany
     */
    public function category(): HasMany
    {
        return $this->hasMany(Category::class);
    }

    /**
     * @return HasMany
     */
    public function budgets(): HasMany
    {
        return $this->hasMany(Budget::class);
    }

    /**
     * @return HasMany
     */
    public function wallets(): HasMany
    {
        return $this->hasMany(Wallet::class);
    }


    /**
     * @return HasMany
     */
    public function debts(): HasMany
    {
        return $this->hasMany(Debt::class);
    }


    /**
     * @return HasOne
     */
    public function subscription(): HasOne
    {
        return $this->hasOne(Subscription::class)->orderBy('id', 'DESC');
    }

    /**
     * @return HasMany
     */

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class)->orderBy('id', 'DESC');
    }

    public function companies()
    {
        return $this->belongsToMany(Company::class);
    }

    public function current_company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'primary_company', 'id');
    }

    public function permissions(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'company_user', 'role_id', 'id');
    }

    /**
     * @throws \Exception
     * @throws \Throwable
     */
    public function addNewUser($data)
    {

        if (isset($data['password']) && $data['password']) {
            $password = bcrypt($data['password']);
        } else {
            $password = bcrypt('12345678');
        }

        try {
            DB::beginTransaction();

            $user = $this->create([
                'slug' => $data['slug'],
                'username' => $data['user_name'],
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'phone' => $data['phone'],
                'emergency_contact' => $data['emergency_contact'],
                'dob' => $data['dob'] ?? null,
                'gender' => $data['gender'] ?? null,
                'activation_code' => $data['slug'],
                'email' => $data['email'],
                'profile_picture' => $data['profile_picture'], //$data['role_id'],//admin role.
                'password' => $password,
                'role_as' => $data['role_as'],
                'primary_company' => $data['primary_company'],
            ]);

            storeActivityLog([
                'object_id' => $user['id'],
                'object' => 'user',
                'log_type' => 'create',
                'module' => 'user',
                'descriptions' => "",
                'data_records' => json_encode($user),
            ]);
            DB::table('company_user')->insert([
                'company_id' => $data['primary_company'],
                'user_id' => $user['id'],
                'role_id' => $data['role_id'],
//                'role_as' => $data['role_as'],
                'status' => true,
                'created_by' => Auth::user()->id,
                'updated_by' => Auth::user()->id,
                'created_at' => date('y-m-d'),
                'updated_at' => date('y-m-d'),
            ]);
            DB::commit();
            return [
                'message' => 'User Added',
                'status_code' => 200,
                'user' => $user
            ];
        } catch (Exception $e) {
            DB::rollBack();

            return [
                'message' => 'Line Number:' . __LINE__ . ', ' . $e->getMessage(),
                'status_code' => 400
            ];
        }

    }

    /**
     * @throws \Throwable
     */
    public function updateUser($data, $slug, $token='basicInfo'): array
    {
        $user = (new User())->where('slug', $slug)->first();
        if (!$user) {
            return [
                'status_code' => 404,
                'message' => 'User not found!',
                'data' => []
            ];
        }
        $updateColumnsArray = [];
        try {
            DB::beginTransaction();

            if ($token==='basicInfo'){
                $updateColumnsArray = [
                    'first_name' => $data['first_name'],
                    'last_name' => $data['last_name'],
                    'dob' => $data['dob'],
                    'gender' => $data['gender'],
                ];
                $user->update($updateColumnsArray);

            }
            else if ( $token==='contacts'){
                $updateColumnsArray['phone'] = $data['phone'];
                $updateColumnsArray['emergency_contract'] = $data['emergency_contract'];
                $updateColumnsArray['email'] = $data['email'];
                $updateColumnsArray['profile_picture'] = $data['profile_picture'];
                $user->update($updateColumnsArray);

            }
            else if ( $token==='employmentDetails'){
//                DB::table('company_user')
//                    ->where('user_id', $user['id'])
//                    ->where('company_id', Auth::user()->primary_company)
//                    ->update(['role_id' => $data['role']]);

                $updateColumnsArray['role_as'] = $data['role_as'];
                $employeeDetails = [
                    'basic_salary'=> $data['salary'],
                    'accommodation_cost'=>$data['accommodation_cost'],
                    'phone'=>$user['phone'],
                    'emergency_contact'=>$user['emergency_contract'],
                    'joining_date'=>$data['date_of_joining'],
//                    'attachment'=>,
                    'extras'=>json_encode([
                        'employee_code'=>$data['employee_code'],
                        'designation'=>$data['designation'],
                        'department'=>$data['department'],
                        'date_of_joining'=>$data['date_of_joining'],
                        'employment_type'=>$data['employment_type'],
                        'address'=>$data['address'],
                        'city'=>$data['city'],
                        'state'=>$data['state'],
                        'country'=>$data['country'],
                        'national_id'=>$data['national_id'],
                        'passport_no'=>$data['passport_no'],
                        'emirates_id'=>$data['emirates_id'],
                        'visa_status'=>$data['visa_status'],
                        'status'=>$data['status'],
                        'passport_copy'=>$data['passport_copy']??null,
                        'emirate_id_copy'=>$data['emirate_id_copy']??null,
                    ]),
                ];

                $employee = Employee::where('slug', $user->slug)->first();
                if (!$employee) {
                    $employeeDetails['slug']=$user->slug;
                    $employeeDetails['company_id']=$user->primary_company;

                    $employee = Employee::create($employeeDetails);
                    storeActivityLog([
                        'object_id' => $employee['id'],
                        'log_type' => 'create',
                        'module' => 'employee',
                        'descriptions' => __('messages.add_employee', ['name' => $user->first_name . ' ' . $user->last_name]),
                        'data_records' => json_encode($employee),
                    ]);


                }
                else{
                    $employee->update($employeeDetails);
                    storeActivityLog([
                        'object_id' => $employee['id'],
                        'log_type' => 'update',
                        'module' => 'employee',
                        'descriptions' => __('messages.update_employee', ['name' => $user->first_name . ' ' . $user->last_name]),
                        'data_records' => json_encode($employee),
                    ]);
                }
                storeActivityLog([
                    'object_id' => $user['id'],
                    'log_type' => 'update',
                    'module' => 'user',
                    'descriptions' => __('messages.update_job_profile', ['name' => $user->first_name . ' ' . $user->last_name]),
                    'data_records' => json_encode($employeeDetails),
                ]);
                $user->update($updateColumnsArray);

            }

            else{

                if (isset($data['profile_picture'])) {
                    $updateColumnsArray['profile_picture'] = $data['profile_picture'];
                }
                if (isset($data['emergency_contract'])) {
                    $updateColumnsArray['emergency_contract'] = $data['emergency_contract'];
                }
            }
            DB::commit();
        } catch (Exception $e) {
            DB::rollBack();
            return [
                'message' => 'Line Number:' . __LINE__ . ', ' . $e->getMessage(),
                'status_code' => 400
            ];
        }
        return
            [
                'status_code' => 200,
                'message' => 'User updated!',
                'data' => $data
            ];
    }

    public function employee()
    {
        return $this->hasOne(Employee::class,'slug','slug');
    }
}
