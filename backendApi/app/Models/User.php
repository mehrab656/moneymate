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
                'name' => $data['name'],
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
                'role_as' => $data['role_as'],
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
    public function updateUser($data, $slug): array
    {
        $user = (new User())->where('slug', $slug)->first();
        if (!$user) {
            return [
                'status_code' => 404,
                'message' => 'User not found!',
                'data' => []
            ];
        }

        try {
            DB::beginTransaction();
            DB::table('company_user')
                ->where('user_id', $user['id'])
                ->where('company_id', Auth::user()->primary_company)
                ->update(['role_id' => $data['role']]);

            $updateColumnsArray = [
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'phone' => $data['phone'],
                'dob' => $data['dob'],
                'gender' => $data['gender'],
            ];

            if (isset($data['profile_picture'])) {
                $updateColumnsArray['profile_picture'] = $data['profile_picture'];
            }
            if (isset($data['emergency_contract'])) {
                $updateColumnsArray['emergency_contract'] = $data['emergency_contract'];
            }
            $user->update($updateColumnsArray);

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
}
