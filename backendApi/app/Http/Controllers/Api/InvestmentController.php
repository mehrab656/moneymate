<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\IncomeResource;
use App\Models\Investment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class InvestmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index( Request $request)
    {
	    $page     = $request->query( 'page', 1 );
	    $pageSize = $request->query( 'pageSize', 10 );

	    $expenses = Investment::skip( ( $page - 1 ) * $pageSize )
	                       ->take( $pageSize )
	                       ->orderBy( 'id', 'desc' )
	                       ->get();

	    $totalCount = Investment::count();

	    return response()->json( [
		    'data'  => IncomeResource::collection( $expenses ),
		    'total' => $totalCount,
	    ] );
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
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
    public function destroy(Investment $investor)
    {
        //
    }
}
