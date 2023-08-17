<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\InvestmentRequest;
use App\Http\Resources\IncomeResource;
use App\Models\BankAccount;
use App\Models\Investment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Expense;
use Carbon\Carbon;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\StreamedResponse;
class InvestmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index( Request $request)
    {
	    $page     = $request->query( 'page', 1 );
	    $pageSize = $request->query( 'pageSize', 10 );

	    $invests = Investment::skip( ( $page - 1 ) * $pageSize )
	                       ->take( $pageSize )
	                       ->orderBy( 'id', 'desc' )
	                       ->get();

	    $totalCount = Investment::count();

	    return response()->json( [
		    'data'  => IncomeResource::collection( $invests ),
		    'total' => $totalCount,
	    ] );
    }

    /**
     * Show the form for creating a new resource.
     */
	public function add( InvestmentRequest $request ): JsonResponse {
		$invest  = $request->validated();
		

		$investDate = Carbon::parse( $invest['investment_date'] )->format( 'Y-m-d' );
		$invest     = Investment::create( [
			'user_id'           => $invest['user_id'],
			'amount'            => $invest['amount'],
			'note'              => $invest['note'],
			'investment_date'      => $investDate,
		] );

		// Update the balance of the bank account
		$bankAccount          = BankAccount::find( $request->account_id );
		$bankAccount->balance += $request->amount;
		$bankAccount->save();

		return response()->json( [
			'invest'  => $invest,
		] );
	}


	/**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Investment $investor)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Investment $investor)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Investment $investor)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
	public function destroy( Investment $invest ): Response {
		$invest->delete();

		/**
		 * Adjust bank account
		 */

		$bankAccount = BankAccount::find( $invest->account_id );
		if ( $invest->amount > 0 ) {
			$bankAccount->balance -= $invest->amount;
			$bankAccount->save();
		}

		return response()->noContent();
	}

}
