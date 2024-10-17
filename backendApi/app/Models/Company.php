<?php

namespace App\Models;

use Auth;
use DB;
use Exception;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Ramsey\Uuid\Uuid;

class Company extends Model {
	use HasFactory;

	protected $table = 'companies';

	protected $primaryKey = 'id';
	protected $guarded = [];

	/**
	 * @throws \Throwable
	 */
	public function addNewCompany( array $data ): array {

		if ( empty( $data ) ) {
			return [
				'success'     => false,
				'data'        => [],
				'message'     => "empty data.",
				'status_code' => 401,
				'description' => 'Company data is empty'
			];
		}
		$userID = Auth::user()->id;

		try {
			DB::beginTransaction();
			$company = Company::create( [
                'slug'=>Uuid::uuid4(),
				'name'                => $data['name'],
				'phone'               => $data['phone'],
				'email'               => $data['email'],
				'uid'                 => $data['uid'],
				'address'             => $data['address'],
				'activity'            => $data['activity'],
				'license_no'          => $data['license_no'],
				'issue_date'          => $data['issue_date'] ? date( 'Y-m-d', strtotime( $data['issue_date'] ) ) : null,
				'expiry_date'         => $data['expiry_date'] ? date( 'Y-m-d', strtotime( $data['expiry_date'] ) ) : null,
				'registration_number' => $data['registration_number'],
				'extra'               => $data['extra'],
				'logo'                => $data['filename'],
				'created_by'          => $userID,
				'updated_by'          => $userID,
			] );
			//now make relation between this company and user. as the user has created this company, he will be the admin by default.
			DB::table( 'company_user' )->insert( [
				'company_id' => $company['id'],
				'user_id'    => Auth::user()->id,
				'role_id'    => 1,//admin role.
				'status'     => true,
				'created_by' => Auth::user()->id,
				'updated_by' => Auth::user()->id,
				'created_at' => date( 'y-m-d' ),
				'updated_at' => date( 'y-m-d' ),
			] );
			DB::commit();
			storeActivityLog( [
				'object_id'    => $company['id'],
				'log_type'     => 'create',
				'module'       => 'company',
				'descriptions' => "added new company.",
				'data_records' => json_decode( $company ),
			] );

		} catch ( Exception $e ) {

			DB::rollBack();

			return [
				'message'     => 'Line Number:' . __LINE__ . ', ' . $e->getMessage(),
				'status_code' => 400,
				'data'        => [],
				'success'     => false,
				'description' => $e

			];
		}

		return [
			'message'     => 'Company created!',
			'status_code' => 200,
			'data'        => $company,
			'success'     => true,
			'description' => 'Company Created successfully!'
		];

	}

	public function users() {
		return $this->belongsToMany(User::class);
	}
}
