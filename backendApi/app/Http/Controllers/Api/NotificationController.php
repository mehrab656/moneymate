<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Company;
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

        $company = Company::find(Auth::user()->primary_company);
        $payments = $company->payments()->whereBetween( 'date', [ $minRange, $maxRange ] )->get();


		if ( $payments ) {
			$list = $this->makeList( $payments );

            $client = new \GuzzleHttp\Client();
            $appID = config('services.onesignal.app_id');
            $appKey = config('services.onesignal.api_key');

            $content = __('messages.payment_reminder');

            $body = [
                "app_id"=>$appID,
//                "template_id"=>"1fb498d0-1441-4c4c-9c70-5cf85cb48e52",
                "name"=>"Payment Reminder",
                "headings"=>["en"=>"Payments Reminder"],
                "contents"=>["en"=>$content],
                "included_segments"=>["Active Subscriptions"],
                "buttons"=>[
                    ["id"=>'view',
                    "text"=>'View More',
                    "url"=>'https://documentation.onesignal.com/reference/push-notification',]
                ]
            ];

            $response = $client->request('POST', 'https://api.onesignal.com/notifications?c=push', [
                'body' => json_encode($body),
                'headers' => [
                    'Authorization' => $appKey,
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
