<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use App\Models\Debt;
use App\Models\DebtCollection;
use App\Models\Lend;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LendController extends Controller
{

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function addLend(Request $request): JsonResponse
    {
        $data = $request->validate([
            'amount' => 'required|numeric',
            'note' => 'required',
            'debt_id' => 'required|exists:debts,id',
            'account_id' => 'required|exists:bank_accounts,id',
            'date' => 'required|date',
        ]);

        $bankAccount = BankAccount::find($request->account_id);
        if ($request->amount > $bankAccount->balance)
        {
            return response()->json([
                'action_status' => 'insufficient_balance',
                'message' => 'Insufficient balance on account',
                'available_balance' => $bankAccount->balance
            ]);
        }


        $lend = Lend::create($data);


        // Update Data in Debt table

        $debt = Debt::find($request->debt_id);
        $debt->amount += $request->amount;
        $debt->save();

        // Update amount in Bank account table

        $bankAccount->balance -= $request->amount;
        $bankAccount->save();

	    storeActivityLog( [
		    'user_id'      => Auth::user()->id,
		    'object_id'     => $lend['id'],
		    'log_type'     => 'edit',
		    'module'       => 'lend',
		    'descriptions' => "",
		    'data_records' => array_merge( json_decode( json_encode( $lend ), true ), [ 'account_balance' => $bankAccount->balance ] ),
	    ] );
        return response()->json([
            'status' => 'success',
            'message' => 'Lend added successfully',
            'data' => $lend
        ]);

    }


    public function collectionAdd(Request $request): JsonResponse
    {
        $data = $request->validate([
            'amount' => 'required|numeric',
            'note' => 'required',
            'debt_id' => 'required|exists:debts,id',
            'account_id' => 'required|exists:bank_accounts,id',
            'date' => 'required|date',
        ]);


        $bankAccount = BankAccount::find($request->account_id);
        $debt = Debt::find($request->debt_id);

        if ($request->amount > $debt->amount)
        {
            return response()->json([
                'action_status' => 'invalid_amount',
                'message' => 'Insufficient balance in the selected bank account. Please use another bank account to repay.'
            ]);
        }

        $debtCollection = DebtCollection::create($data);


        $debt->amount -= $request->amount;
        $debt->save();

        $bankAccount->balance += $request->amount;
        $bankAccount->save();

	    storeActivityLog( [
		    'user_id'      => Auth::user()->id,
		    'object_id'     => $debtCollection['id'],
		    'log_type'     => 'edit',
		    'module'       => 'Debt',
		    'descriptions' => "",
		    'data_records' => array_merge( json_decode( json_encode( $debtCollection ), true ), [ 'account_balance' => $bankAccount->balance ] ),
	    ] );
        return response()->json([
            'status' => 'success',
            'message' => 'Debt collection added successfully',
            'debtCollection' => $debtCollection
        ]);

    }

}
