<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Onesignal;

class NotificationController extends Controller {

	public function sendUpcomingPaymentsNotification( $data = [] ): void {

		$minRange = date( 'Y-m-d' );
		$maxRange = date( 'Y-m-d', strtotime( date( 'Y-m-d' ) . ' +10 days' ) );

		$payments = DB::table( 'payments' )
		              ->where( 'status', '=', 'unpaid' )
		              ->whereBetween( 'date', [ $minRange, $maxRange ] )
		              ->whereNull( 'deleted_at' )
		              ->get();

		if ( $payments ) {
			$list = $this->makeList( $payments );
			OneSignal::sendNotificationToAll(
				$list,
				'http://localhost:3000/sectors',
				null,
				null,
				null,
				"Hey Heads Up! Payments are coming soon",
				"Subtitles",
			);
		}
	}

	public function makeList( $data = [] ) {
		$list = '';
		if ( count( $data ) === 0 ) {
			return $list;
		}
		foreach ( $data as $key => $item ) {
			$list .= ( $key + 1 ) . '.' . ' ' . $item->payment_number . PHP_EOL;
		}

		return $list;
	}
}
