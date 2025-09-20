<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

use OneSignal;

class NotificationController extends Controller {

	public function sendUpcomingPaymentsNotification( $data = [] ): void {

		$minRange = date( 'Y-m-d' );
		$maxRange = date( 'Y-m-d', strtotime( date( 'Y-m-d' ) . ' +10 days' ) );

		$payments = DB::table( 'payments' )
            ->join('sectors', 'sectors.id', '=', 'payments.sector_id')
            ->where( 'status', '=', 'unpaid' )
            ->where( 'company_id', Auth::user()->primary_company )
			->whereBetween( 'date', [ $minRange, $maxRange ] )
			->whereNull( ['sectors.deleted_at','payments.deleted_at'] )
			->get();

		if ( $payments ) {
			$list = $this->makeList( $payments );

            $client = new \GuzzleHttp\Client();
            $appID = env('ONESIGNAL_APP_ID');
            $apiKey = env('ONESIGNAL_API_KEY');


            $response = $client->request('POST', 'https://api.onesignal.com/notifications?c=push', [
                'body' => '{"app_id":"905b9270-0212-408e-829f-c6d15374291a","contents":{"en":"Hi mehrab Hossain."},"included_segments":["Active Subscriptions"]}',
                'headers' => [
                    'Authorization' => 'os_v2_app_sbnze4accjai5au7y3ivg5bjdkgvrpabgzsu75nlxpodyd7wna76phqp3d76q42ucu2wdtmhe5tb3zy3wfkggpqyoi6432lkhbb3yxq',
                    'accept' => 'application/json',
                    'content-type' => 'application/json',
                ],
            ]);
            dd($response);



//            $response =  OneSignal::sendNotificationToAll(
//				$list,
//				'http://localhost:3000/sectors',
//				null,
//				null,
//				null,
//				"Hey Heads Up! Payments are coming soon",
//				"Subtitles",
//			);
//            dd($response);

            $response = $client->request('POST', 'https://api.onesignal.com/notifications?c=push', [
                'body' => '{"app_id":"22f95598-910b-441b-be03-36ec61d42475","contents":{"en":"Your message body here."},"included_segments":["Test Users"]}',
                'headers' => [
                    'Authorization' => 'os_v2_app_el4vlgerbncbxpqdg3wgdvbeoweqderbhrmeb3uubn2qwf2l6fvwxenz6olvg35e4wqn75zj2flpipud42l3tyvbqjfdwpupxkqtbva',
                    'accept' => 'application/json',
                    'content-type' => 'application/json',
                ],
            ]);
		}
	}

	public function makeList( $data = [] ) {
		$list = '';
		if ( count( $data ) === 0 ) {
			return $list;
		}
		foreach ( $data as $key => $item ) {
			$list .= sprintf('%d. %s, Amount %s',$key + 1,$item->payment_number,$item->amount).PHP_EOL; // ( $key + 1 ) . '.' . ' ' . $item->payment_number . PHP_EOL;
		}

		return $list;
	}
}
