<?php

namespace App\Http\Controllers;

use App\Models\Hospitable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class HospitableController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function handleWebhook( Request $request )
    {
        Log::info('Hospitable Webhook:', $request->all());
        $data = $request->all();



        return response()->json(['status' => 'success','data'=>$data], 200);

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
    public function show(Hospitable $hospitable)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Hospitable $hospitable)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Hospitable $hospitable)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Hospitable $hospitable)
    {
        //
    }
}
