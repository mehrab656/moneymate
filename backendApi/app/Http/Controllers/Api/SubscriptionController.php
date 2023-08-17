<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SubscriptionResource;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\Subscription;

class SubscriptionController extends Controller
{

    public function index(Request $request): JsonResponse
    {
        $page = $request->query('page', 1);
        $pageSize = $request->query('pageSize', 10);
        $subscriptions = Subscription::skip(($page - 1) * $pageSize)
            ->take($pageSize)
            ->orderBy('id', 'desc')
            ->get();

        $totalCount = Subscription::count();

        return response()->json([
            'data' => SubscriptionResource::collection($subscriptions),
            'total' => $totalCount,
        ]);
    }

}
