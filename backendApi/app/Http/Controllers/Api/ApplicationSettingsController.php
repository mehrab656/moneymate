<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ApplicationSettingsResource;
use App\Models\Option;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Stripe\StripeClient;

class ApplicationSettingsController extends Controller
{
    public function storeApplicationSetting(Request $request): JsonResponse
    {

	    $inputs = $request->except('_token');

        foreach ($inputs as $key => $value) {
            $option = Option::firstOrCreate(['key' => $key]);
			$old = [$option->key=>$option->value];

            $option->value = $value;
            $option->save();

	        storeActivityLog( [
		        'user_id'      => Auth::user()->id,
		        'log_type'     => 'edit',
		        'module'       => 'settings',
		        'descriptions' => '',
		        'data_records' => ['oldData'=>$old,'newData'=>[$key=>$value]]
	        ] );
        }

        return response()->json(['application_settings' => ApplicationSettingsResource::collection(Option::all())]);
    }


    /**
     * @return JsonResponse
     */
    public function getApplicationSettings(): JsonResponse
    {
        $keys = [
            'company_name',
            'web_site',
            'default_currency',
            'phone',
            'address',
            'num_data_per_page',
            'public_key',
            'secret_key',
            'registration_type',
            'subscription_price',
            'product_api_id',
            'target_price_api_id', // Specify the API ID of the target price
	        'last_expense_account_id',
	        'last_expense_cat_id',
	        'last_expense_date',
	        'last_income_account_id',
	        'last_income_date',
	        'last_income_cat_id',
	        'last_income_cat_id',
	        'associative_categories',

        ];

        $applicationSettings = Option::whereIn('key', $keys)->pluck('value', 'key');

        // Retrieve the specific Stripe product price by API ID
        $targetPriceApiId = get_option('product_api_id');
        if ($targetPriceApiId) {
            $stripe = new StripeClient(get_option('secret_key'));
            $price = $stripe->prices->retrieve($targetPriceApiId);

            $applicationSettings['product_price'] = $price->unit_amount / 100;
        }

        return response()->json([
            'application_settings' => $applicationSettings
        ]);
    }
}
