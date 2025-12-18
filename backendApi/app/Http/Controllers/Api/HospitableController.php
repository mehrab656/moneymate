<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Hospitable;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class HospitableController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function handleWebhook( Request $request )
    {
//        $data = $request->all();
//
//        return response()->json(['status' => 'success','data'=>$data], 200);

        $client = new Client();


        $response = $client->request('GET', 'https://public.api.hospitable.com/v2/reservations', [
            'headers' => [
                'Accept' => 'application/json',
                'Authorization' => 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5YTYyNGRmMC0xMmYxLTQ0OGUtYjg4NC00MzY3ODBhNWQzY2QiLCJqdGkiOiIyNTFkYzg3MTVjYzVlYjVjMWEwNWVmOTBjODk1N2I2MGU3NzdkODY5OWNlYmJjYWUxM2UwYzczOTNlMGI3ZGYwYWUwZWZkOGYxY2FhYmM5MyIsImlhdCI6MTc2NjA2NzI0NC42NDkxNzUsIm5iZiI6MTc2NjA2NzI0NC42NDkxNzgsImV4cCI6MTc5NzYwMzI0NC42NDM0ODksInN1YiI6IjM4NTIyMCIsInNjb3BlcyI6WyJwYXQ6cmVhZCIsInBhdDp3cml0ZSJdfQ.Pgmso250Lp8rY-QLCqi0BwtqstsuwREzq9f_Xu7DUvO-iNvWTBt4cxjraf0onZq-dz5EkESc60VncR_UyqVVdPVUknw_LfFo8QVSKTJkFNUJr3lF-p5OqIJ1KVkVXwS0dM-CLMAmUsIaV2bjTDjdfcSZpBR_eYclzfPpyU6bTcAz9LIgtJKj7ZyHgl_i0uj-nYV6NlK5m0wQW7LGRQpPupl_pPeY5W_qlnhZkPwfFY0cdTxpNOnt-NdGpQ7E-mQ6oELMOz8bVxGcG25zoKJugy0C-oNiplDG2xhEmlaDtn-W9xGM4E-fz_j4CIiP7WDjv-uYpzt2Z-HiysdEs2z7CDbR_leiqTt1tSrDdp1zX6pho-S3ElSj2EzJWp6Arsjum-DY2GZS6620yWYu3sZB5B5KcNKVGX7Ni-TeKXLKSR28xo-Jpq2LN2vHgm8kOrZcceRcyl9lCJzbnVEB4yDuFcfLZQ5YghwRzQW1_B0sRbCdEuwmeIgQL43DuBAknMBOUKsMyXsh3cPVgs2izh3o88HDD5cgf63oSBlPlr_0zfD2sfmpDHRH5Lz-Gy_AWT6JvWtMzsKDjEdf31fAu91wvf6kONSAtDtUWdSkfgsvUY3sHkMwiIh80nSrCK_cOOuzrFn4dYVjmkiaGvTCVt9GMLxtCBDb92ac1yNL5P0eTC8',
                'Content-Type' => '',
            ],
        ]);

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
