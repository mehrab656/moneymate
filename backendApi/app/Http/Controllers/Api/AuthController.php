<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\SignupRequest;
use App\Models\User;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Contracts\Routing\ResponseFactory;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Session;
use Stripe\Exception\ApiErrorException;
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
