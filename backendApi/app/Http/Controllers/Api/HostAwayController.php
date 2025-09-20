<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Option;
use App\Models\SettingsModel;
use Auth;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HostAwayController extends Controller
{


    public function getReservations()
    {

        $accessToken = $this->getAccessTokes();


        $curl = curl_init();
        curl_setopt_array($curl, array(
            CURLOPT_URL => "https://api.hostaway.com/v1/accessTokens",
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => "",
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => "POST",
            CURLOPT_POSTFIELDS => "grant_type=client_credentials&client_id=75818&client_secret=2e6b92e3f98430afe8acc9b75b96a6230bc7813dd5f04a231f428ade4faddf9b&scope=general",
            CURLOPT_HTTPHEADER => array(
                "Cache-control: no-cache",
                "Content-type: application/x-www-form-urlencoded"),
        ));
        $response = curl_exec($curl);
        $err = curl_error($curl);
        curl_close($curl);
        if ($err) {
            echo "cURL Error #:" . $err;
        } else {
            echo $response;
        }
    }

    public function getAccessTokes()
    {
        $curl = curl_init();
        curl_setopt_array($curl, array(
            CURLOPT_URL => "https://api.hostaway.com/v1/accessTokens",
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => "",
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => "POST",
            CURLOPT_POSTFIELDS => "grant_type=client_credentials&client_id=75818&client_secret=2e6b92e3f98430afe8acc9b75b96a6230bc7813dd5f04a231f428ade4faddf9b&scope=general",
            CURLOPT_HTTPHEADER => array(
                "Cache-control: no-cache",
                "Content-type: application/x-www-form-urlencoded"
            ),
        ));
        $response = curl_exec($curl);
        $err = curl_error($curl);
        curl_close($curl);
        if ($err) {
            echo "cURL Error #:" . $err;
        } else {
            echo $response;
        }
    }

    public function connectHostAway(Request $request)
    {

        $clientID = $request->input('host_away_client_id');
        $apiSecret = $request->input('host_away_api_key');
        $curl = curl_init();
        curl_setopt_array($curl, array(
            CURLOPT_URL => "https://api.hostaway.com/v1/accessTokens",
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => "",
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => "POST",
            CURLOPT_POSTFIELDS => "grant_type=client_credentials&client_id=$clientID&client_secret=$apiSecret&scope=general",
            CURLOPT_HTTPHEADER => array(
                "Cache-control: no-cache",
                "Content-type: application/x-www-form-urlencoded"
            ),
        ));
        $response = curl_exec($curl);
        $err = curl_error($curl);
        curl_close($curl);
        $response = json_decode($response, true);

        if (array_key_exists("error", $response)) {
            return response()->json([
                'message' => str_replace('_',' ',$response['error']),
                'description' => $response['message'],
            ],404);
        } else {

            $keys = ['token_type', 'expires_in', 'access_token'];
            foreach ($keys as $key) {
                $option = SettingsModel::firstOrCreate(['key' => 'hostaway_' . $key, 'company_id' => auth()->user()->primary_company]);
                $option->value = $response[$key];
                $option->save();
            }

            return response()->json([
                'message' => 'success',
                'description' => "Connected Successfully!",
            ]);
        }
    }

    public function disconnectHostAway(Request $request){

    }

    public function getConnectionStatus(): JsonResponse
    {
        $accessToken = SettingsModel::where(['company_id'=> Auth::user()->primary_company,'key'=>'hostaway_access_token'])->first();
        if (!$accessToken){
            return response()->json([
                'data'=>false,
                'message' => 'error',
                'description' => "Hostaway is not connected!",
            ],403);
        }
        return response()->json([
            'data'=>true,
            'message' => 'success',
            'description' => "Connected",
        ]);
    }
}
