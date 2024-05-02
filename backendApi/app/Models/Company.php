<?php

namespace App\Models;

use Auth;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Company extends Model {
	use HasFactory;

	protected $table = 'companies';

	protected $primaryKey = 'id';
	protected $guarded = [];

	public function addNewCompany( array $data ): array {

		if ( empty( $data ) ) {
			return [
				'success' => false,
				'data'    => [],
				'message' => "empty data."
			];
		}
		$name     = $data['name'];
		$uid      = random_string( 'alnum', 32 );
		$filename = null;

		if ( array_key_exists( 'logo', $data ) && $data['logo'] ) {
			$filename = $uid;
		}

		$userID = Auth::user()->id;


		$company = Company::create( [
			'name'                => $data['name'],
			'phone'               => $data['phone'],
			'email'               => $data['email'],
			'uid'                 => $uid,
			'address'             => $data['address'],
			'activity'            => $data['activity'],
			'license_no'          => $data['license_no'],
			'issue_date'          => $data['issue_date'] ? date( 'Y-m-d', strtotime( $data['issue_date'] ) ) : null,
			'expiry_date'         => $data['expiry_date'] ? date( 'Y-m-d', strtotime( $data['expiry_date'] ) ) : null,
			'registration_number' => $data['registration_number'],
			'extra'               => $data['extra'],
			'logo'                => $filename,
			'created_by'          => $userID,
			'updated_by'          => $userID,
		] );

		storeActivityLog( [
			'user_id'      => $userID,
			'object_id'    => $company['id'],
			'log_type'     => 'create',
			'module'       => 'company',
			'descriptions' => "added new company.",
			'data_records' => json_decode( $company ),
		] );

		return [
			'success' => true,
			'data'    => $company,
			'message' => "Success."
		];

	}
}
