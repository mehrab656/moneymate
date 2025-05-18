<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ApplicationSettingsResource;
use App\Models\Option;
use App\Models\Setting;
use App\Models\SettingsModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SettingsController extends Controller
{
    public function storeSettings(Request $request){
        $inputs = $request->except( '_token' );
        foreach ( $inputs as $key => $value ) {
            $option = SettingsModel::firstOrCreate( [ 'key' => $key,'company_id'=>auth()->user()->primary_company ] );
            $old    = [ $option->key => $option->value ];

            $option->value = $value;
            $option->save();

            storeActivityLog( [
                'object_id'     => $option->id,
                'log_type'     => 'edit',
                'module'       => 'settings',
                'descriptions' => '',
                'data_records' => [ 'oldData' => $old, 'newData' => [ $key => $value ] ]
            ] );
        }

        return response()->json( [
            'application_settings' => ApplicationSettingsResource::collection( SettingsModel::all() ) ,
            'message'     => 'Success!',
            'description' => 'Application settings have been updated',
        ] );
    }
}
