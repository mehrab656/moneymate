<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\BudgetRequest;
use App\Http\Requests\UpdateBudgetRequest;
use App\Http\Resources\BudgetResource;
use App\Models\Budget;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Validate;

class BudgetController extends Controller {

	/**
	 * @param Request $request
	 *
	 * @return JsonResponse
	 */

	public function index( Request $request ): JsonResponse {
		$user     = Auth::user();
		$page     = $request->query( 'page', 1 );
		$pageSize = $request->query( 'pageSize', 10 );

		$budgets = Budget::where( 'company_id', Auth::user()->primary_company )->skip( ( $page - 1 ) * $pageSize )
		                 ->take( $pageSize )
		                 ->orderBy( 'id', 'desc' )
		                 ->get();

		$totalCount = Budget::where( 'company_id', Auth::user()->primary_company )->count();

		return response()->json( [
			'data'  => BudgetResource::collection( $budgets ),
			'total' => $totalCount,
		] );
	}


	/**
	 * @param BudgetRequest $request
	 *
	 * @return JsonResponse
	 */
	public function store( BudgetRequest $request ): JsonResponse {
		// Validate the request data
		$validatedData = $request->validated();

		$newStartDate = Carbon::parse( $validatedData['start_date'] );
		$newEndDate   = Carbon::parse( $validatedData['end_date'] );

		// Check if the new budget overlaps with any existing budgets
		$existingBudgets = Auth::user()->budgets()->get();
		foreach ( $existingBudgets as $existingBudget ) {
			$existingStartDate = Carbon::parse( $existingBudget->start_date );
			$existingEndDate   = Carbon::parse( $existingBudget->end_date );

			if (
				( $newStartDate >= $existingStartDate && $newStartDate <= $existingEndDate ) ||
				( $newEndDate >= $existingStartDate && $newEndDate <= $existingEndDate ) ||
				( $newStartDate <= $existingStartDate && $newEndDate >= $existingEndDate )
			) {
				return response()->json( [
					'message' => 'The new budget overlaps with an existing budget.'
				], 400 );
			}
		}

		// Create the budget
		$budget = Auth::user()->budgets()->create( [
			'budget_name'    => $validatedData['budget_name'],
			'company_id'     => Auth::user()->primary_company,
			'amount'         => $validatedData['amount'],
			'updated_amount' => $validatedData['amount'],
			'start_date'     => $validatedData['start_date'],
			'end_date'       => $validatedData['end_date'],
		] );

		// Attach categories to the budget
		$budget->categories()->attach( $validatedData['categories'] );

		// return response()->json($budget, 201);
		return response()->json( [
			'message'     => 'Success!',
			'description' => 'Budget successfully Created!',
		] );
	}


	/**
	 * @param Budget $budget
	 *
	 * @return BudgetResource
	 */
	public function show( Budget $budget ): BudgetResource {
		return new BudgetResource( $budget );
	}


	/**
	 * @param UpdateBudgetRequest $request
	 * @param Budget $budget
	 *
	 * @return JsonResponse
	 */
	public function update( UpdateBudgetRequest $request, Budget $budget ): JsonResponse {
		// Validate the request data
		$validatedData = $request->validated();

		// Update the budget
		$budget->update( [
			'budget_name' => $validatedData['budget_name'],
			'amount'      => $validatedData['amount'],
			'start_date'  => Carbon::parse( $validatedData['start_date'] )->toDateString(),
			'end_date'    => Carbon::parse( $validatedData['end_date'] )->toDateString(),
			'user_id'     => Auth::id(),
		] );

		// Sync categories for the budget
		$budget->categories()->sync( $validatedData['categories'] );

		// return response()->json($budget);

		return response()->json( [
			'message'     => 'Success!',
			'description' => 'Budget successfully updated',
		] );
	}


	/**
	 * @param Budget $budget
	 *
	 * @return JsonResponse
	 */
	public function destroy( Budget $budget ): JsonResponse {
		$budget->delete();

		return response()->json( [ 'message' => 'Budget deleted' ] );
	}

	/**
	 * @param $id
	 *
	 * @return JsonResponse
	 */
	public function getBudgetCategories( $id ): JsonResponse {
		$budget     = Budget::findOrFail( $id );
		$categories = $budget->categories()->select( 'id', 'name' )->get();

		return response()->json( [ 'categories' => $categories ] );
	}

	/**
	 * @return JsonResponse
	 */
	public function getCategoryExpenses(): JsonResponse {
		$currentMonth = date( 'm' );
		$currentYear  = date( 'Y' );

		$currentBudget = DB::table( 'budgets' )
		                   ->where( 'company_id', Auth::user()->primary_company )
		                   ->whereMonth( 'start_date', $currentMonth )
		                   ->whereYear( 'start_date', $currentYear )
		                   ->value( 'id' );

		if ( ! $currentBudget ) {
			return response()->json( [ 'error' => 'No budget found for the current month.' ] );
		}

		$categoryExpenses = DB::table( 'categories' )
		                      ->select( 'categories.id', 'categories.name', DB::raw( 'SUM(budget_expenses.amount) as spent_amount' ) )
		                      ->join( 'budget_category', 'categories.id', '=', 'budget_category.category_id' )
		                      ->leftJoin( 'budget_expenses', function ( $join ) use ( $currentBudget ) {
			                      $join->on( 'categories.id', '=', 'budget_expenses.category_id' )
			                           ->where( 'budget_expenses.budget_id', '=', $currentBudget );
		                      } )
		                      ->groupBy( 'categories.id', 'categories.name' )
		                      ->havingRaw( 'spent_amount IS NOT NULL' )
		                      ->get();

		return response()->json( $categoryExpenses );
	}
}
