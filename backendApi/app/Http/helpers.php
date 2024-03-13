<?php

use App\Libraries\Requests_IPv6;
use App\Models\ActivityLogModel;
use App\Models\User;
use Illuminate\Support\Facades\Auth;


if ( ! function_exists( 'base_url' ) ) {

	/**
	 * @param string $resource
	 *
	 * @return string
	 */

	function base_url( string $resource = '' ): string {
		return asset( $resource );
	}


}


if ( ! function_exists( 'get_option' ) ) {
	function get_option( $key ) {
		$system_settings = config( 'options' );
		if ( $key && isset( $system_settings[ $key ] ) ) {
			return $system_settings[ $key ];
		} else {
			return false;
		}
	}
}

/**
 * This functions helps to store the history/activities on Database.
 * This function takes an array parameters as an input and returns boolean.
 *
 * Log Type: create: Create; edit= Update; update=Delete
 *
 * @param array $data
 *
 * @return void
 * @throws Exception
 */
function storeActivityLog( array $data ): void {

	$userID = $data['user_id'];
	$user   = User::find( $userID );

	$logType = [
		'create' => 'Create a new Record',
		'edit'   => 'Update an existence Record',
		'delete' => 'Delete a previous record'
	];

	$data_records = $data['data_records'] ?? [];

	if ( $data_records ) {
		$data_records = json_encode( $data_records );
	}


	$description = $data['descriptions'] ? $user['name'] . ' ' . $data['descriptions'] : build_activity_log_descriptions( $user['name'], $logType[ strtolower( $data['log_type'] ) ], $data['module'] );

	$uid = random_string( 'alnum', 32 );


	( new ActivityLogModel() )->create( [
		'user_id'      => $userID,
		'object_id'    => $data['object_id'],
		'log_type'     => strtolower( $data['log_type'] ),
		'uid'          => $uid,
		'data_records' => $data_records,
		'ip_address'   => getUserIPAddress(),
		'descriptions' => $description,
	] );
}


/**
 * Build Custom Descriptions For activity logs
 *
 * @param $userName
 * @param $logType
 * @param $module
 *
 * @return string
 */
function build_activity_log_descriptions( $userName, $logType, $module ): string {

	$msz = $userName . ' ';
	$msz .= "has " . $logType . " on " . ucwords( $module ) . ".";

	return $msz;
}

function getUserIPAddress() {

	$lookup = [
		'HTTP_X_REAL_IP',
		'HTTP_CF_CONNECTING_IP', // CloudFlare
		'HTTP_TRUE_CLIENT_IP', // CloudFlare Enterprise header
		'HTTP_CLIENT_IP',
		'HTTP_X_FORWARDED_FOR',
		'HTTP_X_FORWARDED',
		'HTTP_X_CLUSTER_CLIENT_IP',
		'HTTP_FORWARDED_FOR',
		'HTTP_FORWARDED',
		'REMOTE_ADDR',
	];
	$ip     = '';
	foreach ( $lookup as $item ) {
		if ( isset( $_SERVER[ $item ] ) && ! empty( $_SERVER[ $item ] ) ) {
			$ip = $_SERVER[ $item ];

			if ( strpos( $ip, ',' ) ) {
				// @TODO needs to be tested.
				/** @noinspection PhpPregSplitWithoutRegExpInspection */
				$ip = (string) is_ip_address( trim( current( preg_split( '/,/', $ip ) ) ) );
			}
			break;
		}
	}

	return filter_var( $ip, FILTER_VALIDATE_IP );
}

/**
 * Determines if an IP address is valid.
 *
 * Handles both IPv4 and IPv6 addresses.
 *
 * @param string $ip IP address.
 *
 * @return string|false The valid IP address, otherwise false.
 *
 */
function is_ip_address( string $ip ): bool|string {
	$ipv4_pattern = '/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/';

	if ( ! preg_match( $ipv4_pattern, $ip ) && ! Requests_IPv6::check_ipv6( $ip ) ) {
		return false;
	}

	return $ip;
}

{
	/**
	 * Create a Random String
	 *
	 * Useful for generating passwords or hashes.
	 *
	 * @param string $type Type of random string.  basic, alpha, alnum, numeric, nozero, md5, sha1, and crypto
	 * @param integer $len Number of characters
	 *
	 * @return string
	 * @throws Exception
	 */
	function random_string( string $type = 'alnum', int $len = 8 ): string {
		switch ( $type ) {
			case 'alnum':
			case 'numeric':
			case 'nozero':
			case 'alpha':
				switch ( $type ) {
					case 'alpha':
						$pool = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
						break;
					case 'alnum':
						$pool = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
						break;
					case 'numeric':
						$pool = '0123456789';
						break;
					case 'nozero':
						$pool = '123456789';
						break;
				}

				// @phpstan-ignore-next-line
				return substr( str_shuffle( str_repeat( $pool, ceil( $len / strlen( $pool ) ) ) ), 0, $len );
			case 'md5':
				return md5( uniqid( (string) mt_rand(), true ) );
			case 'sha1':
				return sha1( uniqid( (string) mt_rand(), true ) );
			case 'crypto':
				return bin2hex( random_bytes( $len / 2 ) );
		}

		// 'basic' type treated as default
		return (string) mt_rand();
	}

	function fix_number_format( $val ) {
		return number_format( (float) $val, 2 );
	}

	/**
	 * Build Description for Income Entry
	 */
	function buildIncomeDescription( $description, $reservationDays, $checkInDate, $checkoutDate ): string {

		return sprintf( '%s reservation of %s days from %s to %s',
			$description,
			$reservationDays,
			$checkInDate,
			$checkoutDate,
		);
	}

}