<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\SignupRequest;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Contracts\Routing\ResponseFactory;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Models\Role;
use Stripe\Customer;
use Stripe\Exception\ApiErrorException;
use Stripe\Stripe;
use Stripe\Subscription;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{


    /**
     * @param SignupRequest $request
     * @return Response|Application|ResponseFactory
     * @throws ApiErrorException
     */

    public function signup(SignupRequest $request): Response|Application|ResponseFactory
    {
        $data = $request->validated();
        // return $data;
        $registrationType = get_option('registration_type');


        if (User::count() > 0)
        {
            // Create the user
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
            ]);
        } else {
            // Create the user
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'role_as' => 'admin',
                'password' => Hash::make($data['password']),
            ]);
        }




        if ($registrationType === 'subscription') {
            // Charge via Stripe only if registration_type is 'subscription'
            Stripe::setApiKey(get_option('secret_key'));
            $customer = Customer::create([
                'email' => $data['email'],
                'payment_method' => $request->paymentMethodId,
                'invoice_settings' => [
                    'default_payment_method' => $request->paymentMethodId,
                ],
            ]);

            // Create a Stripe subscription
            $subscription = Subscription::create([
                'customer' => $customer->id,
                'items' => [
                    [
                        'price' => get_option('product_api_id'),
                    ],
                ],
            ]);


            $subscriptionAmount =  $subscription->plan->amount / 100;

            // Update user's subscription details in the database
            $user->subscription()->create([
                'stripe_id' => $subscription->id,
                'plan' => 'monthly_subscription_plan',
                'status' => $subscription->status,
                'current_period_start' => Carbon::createFromTimestamp($subscription->current_period_start),
                'current_period_end' => Carbon::createFromTimestamp($subscription->current_period_end),
                'amount' => $subscriptionAmount,
            ]);
        }

        // Generate a token for the user
        if ($user->role_as == 'admin') {
            $user_role = 'admin';
            $token = $user->createToken($user->email_ . 'AdminToken', ['admin'])->plainTextToken;
        } else {
            $user_role = 'user';
            $token = $user->createToken($user->email_ . 'UserToken', ['user'])->plainTextToken;
        }
        return response(compact('user', 'token', 'user_role'));
    }



    public function login(LoginRequest $request): Response|Application|ResponseFactory
    {
        $credentials = $request->validated();
        if (!Auth::attempt($credentials)) {
            return response([
                'message' => 'Provided email or password is incorrect'
            ], 422);
        }

        /** @var User $user */
        $user = Auth::user();

        $registrationType = get_option('registration_type');

        if ($registrationType === 'subscription') {
            // Check if the user has an active subscription
            $subscription = $user->subscription()
                ->where('status', 'active')
                ->where('current_period_end', '>', now())
                ->first();

            if (!$subscription && $user->subscription()->count() > 0) {
                return response([
                    'message' => 'Your subscription is not active',
                    'subscription_status' => 'renew'
                ], 403);
            }
        }



        if ($user->role_as == 'admin') {
            $token = $user->createToken($user->email_ . 'AdminToken', ['admin'])->plainTextToken;
        } else {
            $token = $user->createToken($user->email_ . 'UserToken', ['user'])->plainTextToken;
        }

        return response(compact('user', 'token'));
    }

    public function renewSubscription(LoginRequest $request)
    {
        $credentials = $request->validated();
        if (!Auth::attempt($credentials)) {
            return response([
                'message' => 'Provided email or password is incorrect'
            ], 422);
        }

        $registrationType = get_option('registration_type');

        /** @var User $user */
        $user = Auth::user();


        if ($registrationType === 'subscription') {
            // Charge via Stripe only if registration_type is 'subscription'
            Stripe::setApiKey(get_option('secret_key'));
            $customer = Customer::create([
                'email' => $user->email,
                'payment_method' => $request->paymentMethodId,
                'invoice_settings' => [
                    'default_payment_method' => $request->paymentMethodId,
                ],
            ]);

            // Create a Stripe subscription
            $subscription = Subscription::create([
                'customer' => $customer->id,
                'items' => [
                    [
                        'price' => get_option('product_api_id'),
                    ],
                ],
            ]);

            // Update user's subscription details in the database



            if ($subscription->status === 'active')
            {
                \App\Models\Subscription::where('status', 'active')->update(['status' => 'expired']);
                $localSubscription = new \App\Models\Subscription();
                $localSubscription->user_id = $user->id;
                $localSubscription->stripe_id = $subscription->id;
                $localSubscription->plan = 'monthly_subscription_plan';
                $localSubscription->status = $subscription->status;
                $localSubscription->amount = $subscription->plan->amount / 100;
                $localSubscription->current_period_start = Carbon::createFromTimestamp($subscription->current_period_start);
                $localSubscription->current_period_end = Carbon::createFromTimestamp($subscription->current_period_end);
                $localSubscription->save();

                if ($user->role_as == 'admin') {
                    $token = $user->createToken($user->email_ . 'AdminToken', ['admin'])->plainTextToken;
                } else {
                    $token = $user->createToken($user->email_ . 'UserToken', ['user'])->plainTextToken;
                }
                return response(compact('user', 'token'));
            } else {
                $payment_status = 'fail';
                return response(compact('user', 'payment_status'));
            }
        }
    }




    /**
     * @param Request $request
     * @return Application|ResponseFactory|\Illuminate\Foundation\Application|Response
     */
    public function logout(Request $request): \Illuminate\Foundation\Application|Response|Application|ResponseFactory
    {
        /** @var User $user */
        $user = $request->user();
        $user->currentAccessToken()->delete();
        return response('', 204);
    }
}
