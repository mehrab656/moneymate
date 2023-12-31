<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DebtRequest;
use App\Http\Resources\DebtHistory;
use App\Http\Resources\DebtResource;
use App\Models\BankAccount;
use App\Models\Borrow;
use App\Models\Debt;
use App\Models\DebtCollection;
use App\Models\Lend;
use App\Models\Repayment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DebtController extends Controller
{


    /**
     * Display a listing of the resource.
     */

    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        $page = $request->query('page', 1);
        $pageSize = $request->query('pageSize', 10);

        $debts = Debt::where('user_id', $user->id)
            ->skip(($page - 1) * $pageSize)
            ->take($pageSize)
            ->orderBy('id', 'desc')
            ->get();

        $totalCount = Debt::where('user_id', $user->id)->count();

        return response()->json([
            'debts' => DebtResource::collection($debts),
            'total' => $totalCount,
        ]);
    }


    /**
     * @param DebtRequest $request
     * @return JsonResponse
     */
    public function store(DebtRequest $request): JsonResponse
    {
        $selectedBankAccount = BankAccount::find($request->account_id);

        $debt = $request->validated();
        if ($debt['type'] === 'borrow') {
            $debtAmount = -$debt['amount'];
        } else {
            if ($debt['amount'] > $selectedBankAccount->balance)
            {
                return response()->json([
                    'status' => 'insufficient_balance',
                    'message' => 'Insufficient balance in the selected bank account. Please use another bank account to repay.',
                    'available_balance' => $selectedBankAccount->balance
                ]);
            }

            $debtAmount = $debt['amount'];
        }

        /** @var TYPE_NAME $debtAmount */
        $debt = Debt::firstOrCreate([
            'user_id' => auth()->user()->id,
            'amount' => $debtAmount,
            'account_id' => $debt['account_id'],
            'type' => $debt['type'],
            'person' => $debt['person'],
            'date' => $debt['date'],
            'note' => $debt['note']
        ]);

        $bankAccount = BankAccount::find($debt->account_id);

        // Means you are lending money to someone.

        if ($debt['type'] === 'lend') {
            Lend::create([
                'amount' => $debt->amount,
                'account_id' => $debt->account_id,
                'date' => $debt['date'],
                'debt_id' => $debt->id
            ]);

            // Update Associated bank account by decreasing account balance
            $bankAccount->balance -= $request->amount;
            $bankAccount->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Lend created successfully',
                'debt' => $debt,
                'bankAccountInfo' => $bankAccount
            ]);

        }


        // Means you are lending money form someone.

        if ($debt['type'] === 'borrow') {
            Borrow::create([
                'amount' => ($debt->amount * -1),
                'account_id' => $debt->account_id,
                'date' => $debt->date,
                'debt_id' => $debt->id
            ]);

            // Update Associated bank account by increasing account balance
            $bankAccount->balance += $request->amount;
            $bankAccount->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Borrow created successfully',
                'debt' => $debt,
                'bankAccountInfo' => $bankAccount
            ]);
        }



        return response()->json([
            'status' => 'fail',
            'message' => 'Something went wrong'
        ]);
    }


    /**
     * @param Debt $debt
     * @return DebtResource
     */

    public function show(Debt $debt): DebtResource
    {
        return new DebtResource($debt);
    }

    /**
     * @return JsonResponse
     */

    public function getDebtHistory($debt_id): JsonResponse
    {
        $debt = Debt::find($debt_id);
        if ($debt->type == 'borrow')
        {
            $borrows = collect(Borrow::where('debt_id', $debt_id)->get());
            $repayments = collect(Repayment::where('debt_id', $debt_id)->get());
            $borrowRepayments = $borrows->merge($repayments)->sortByDesc('created_at');
            return response()->json([
                'infos' => DebtHistory::collection($borrowRepayments)
            ]);
        } else {
            $lends = collect(Lend::where('debt_id', $debt_id)->get());
            $debtCollections = collect(DebtCollection::where('debt_id', $debt_id)->get());
            $lendsDebtCollections = $lends->merge($debtCollections)->sortByDesc('created_at');
            return response()->json([
                'infos' => DebtHistory::collection($lendsDebtCollections)
            ]);
        }

    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }


    /**
     * @param Debt $debt
     * @return JsonResponse
     */
    public function destroy($id): JsonResponse
    {
        Debt::where('id', $id)->delete();

        return response()->json([
            'message' => 'Debt removed'
        ]);
    }
}
