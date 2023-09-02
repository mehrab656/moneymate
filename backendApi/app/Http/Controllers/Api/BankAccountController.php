<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\BankAccountRequest;
use App\Http\Requests\BankAccountUpdateRequest;
use App\Http\Resources\BankAccountResource;
use App\Models\BankAccount;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class BankAccountController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        $page = $request->query('page', 1);
        $pageSize = $request->query('pageSize', 10);
        $bankAccounts = BankAccount::skip(($page - 1) * $pageSize)
            ->take($pageSize)
            ->orderBy('id', 'desc')
            ->get();

        $totalCount = BankAccount::count();

        return response()->json([
            'data' => BankAccountResource::collection($bankAccounts),
            'total' => $totalCount,
        ]);

    }

    public function allBankAccount(): JsonResponse
    {
        $user = Auth::user();
        $bankAccounts = BankAccount::get();
        return response()->json([
            'data' => BankAccountResource::collection($bankAccounts)
        ]);
    }


    /**
     * @param BankAccountRequest $request
     * @return JsonResponse
     */

    public function add(BankAccountRequest $request): JsonResponse
    {
        $bankAccount = $request->validated();

        $bankAccount = BankAccount::create([
            'user_id' => Auth::user()->id,
            'account_name' => $bankAccount['account_name'],
            'account_number' => $bankAccount['account_number'],
            'bank_name_id' => $bankAccount['bank_name_id'],
            'balance' => $bankAccount['balance'],
        ]);

        return response()->json(['bank_account' => $bankAccount]);

    }


    /**
     * @param BankAccount $bankAccount
     * @return BankAccountResource
     */
    public function show(BankAccount $bankAccount): BankAccountResource
    {
        return new BankAccountResource($bankAccount);
    }


    /**
     * @param BankAccount $bankAccount
     * @return Response
     */
    public function destroy($id): Response
    {
        $bankAccount = BankAccount::find($id);
        $bankAccount->delete();
        return response()->noContent();
    }


    /**
     * @param BankAccountUpdateRequest $request
     * @param BankAccount $bankAccount
     * @return BankAccountResource
     */
    public function update(BankAccountUpdateRequest $request, BankAccount $bankAccount): BankAccountResource
    {
        $data = $request->validated();
        $bankAccount->update($data);
        return new BankAccountResource($bankAccount);
    }








}
