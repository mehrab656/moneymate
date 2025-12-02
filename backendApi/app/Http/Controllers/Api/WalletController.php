<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateWalletRequest;
use App\Http\Requests\WalletRequest;
use App\Http\Resources\WalletResource;
use App\Models\Wallet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Auth;
use Ramsey\Uuid\Uuid;

class WalletController extends Controller
{

    /**
     * @return AnonymousResourceCollection
     */
    public function index(): AnonymousResourceCollection
    {
        return WalletResource::collection(
            Wallet::where('company_id', Auth::user()->primary_company)
                ->orderBy('id', 'desc')
                ->get()
        );
    }


    /**
     * @param WalletRequest $request
     * @return JsonResponse
     */
    public function store(WalletRequest $request): JsonResponse
    {
        $wallet = $request->validated();
        $wallet = Wallet::firstOrCreate([
            'slug' => Uuid::uuid4(),
            'user_id' => auth()->user()->id,
            'company_id' => auth()->user()->primary_company,
            'name' => $wallet['name'],
            'balance' => $wallet['balance']
        ]);

        return response()->json(['wallet' => $wallet]);

    }


    /**
     * @param Wallet $wallet
     * @return WalletResource
     */
    public function show(Wallet $wallet): WalletResource
    {
        return new WalletResource($wallet);
    }


    /**
     * @param UpdateWalletRequest $request
     * @param Wallet $wallet
     * @return WalletResource
     */
    public function update(UpdateWalletRequest $request, Wallet $wallet): WalletResource
    {
        $data = $request->validated();
        $wallet->update($data);
        return new WalletResource($wallet);
    }


    /**
     * @param Wallet $wallet
     * @return JsonResponse
     */
    public function destroy(Wallet $wallet): JsonResponse
    {
        if ($wallet->user_id !== auth()->user()->id) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 401);
        }
        $wallet->delete();

        return response()->json([
            'message' => 'Wallet deleted'
        ]);
    }

	/**
	 * This is the Current Wallet/Hand cash balance
	 * @return JsonResponse
	 */

    public function totalWalletBalance(): JsonResponse {
        $totalWallet = Wallet::where('company_id', Auth::user()->primary_company)->sum('balance');

        return response()->json( [
            'balance' => fix_number_format($totalWallet)
        ] );
    }
}
