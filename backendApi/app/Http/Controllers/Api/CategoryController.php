<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Interfaces\CategoryRepositoryInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\CategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use DB;
use Exception;
use Hamcrest\Description;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CategoryController extends Controller {


	private CategoryRepositoryInterface $categoryRepository;

	public function __construct( CategoryRepositoryInterface $categoryRepository ) {
		$this->categoryRepository = $categoryRepository;
	}

	public function index( Request $request ): JsonResponse {
		$page       = $request->query( 'page', 1 );
		$pageSize   = $request->query( 'pageSize', 10 );
		$categories = DB::table( 'categories' )->select( 'categories.*' )
		                ->join( 'sectors', 'categories.sector_id', '=', 'sectors.id' )
		                ->where( 'sectors.company_id', '=', Auth::user()->primary_company )
		                ->skip( ( $page - 1 ) * $pageSize )
		                ->take( $pageSize )
		                ->get();

		$totalCount = Category::count();

		return response()->json( [
			'data'  => CategoryResource::collection( $categories ),
			'total' => $totalCount,
		] );
	}

	/**
	 * @throws Exception
	 */
	public function create( CategoryRequest $request ): JsonResponse {
		$categoryData               = $request->validated();
		$categoryData['user_id']    = auth()->user()->id;
		$categoryData['company_id'] = auth()->user()->primary_company;

		$category = $this->categoryRepository->create( $categoryData );
		storeActivityLog( [
			'object_id'    => $category->id,
			'log_type'     => 'create',
			'module'       => 'Category',
			'descriptions' => "",
			'data_records' => $category,
		] );

		// return response()->json( [ 'category' => $category ] );

		return response()->json( [
			'message'     => 'Success!',
			'description' => 'Category successfully created!.',
		] );
	}

	public function show( Category $category ): CategoryResource {
		return new CategoryResource( $category );
	}

	/**
	 * @throws Exception
	 */
	public function update( UpdateCategoryRequest $request, Category $category ): JsonResponse {
		$data     = $request->validated();
		$oldData  = $category;
		$category = $this->categoryRepository->update( $category, $data );

		storeActivityLog( [
			'object_id'    => $category->id,
			'log_type'     => 'edit',
			'module'       => 'Category',
			'descriptions' => "",
			'data_records' => [
				'Old Data' => $oldData,
				'New Data' => $category
			],
		] );

		// return new CategoryResource( $category );
		return response()->json( [
			'message'     => 'Success!',
			'description' => 'Category successfully updated!.',
		] );
	}


	/**
	 * Remove the specified resource from storage.
	 *
	 * @param Category $category
	 *
	 * @return JsonResponse
	 * @throws Exception
	 */
	public function destroy( Category $category ): JsonResponse {
		$this->categoryRepository->delete( $category );
		storeActivityLog( [
			'object_id'    => $category->id,
			'log_type'     => 'delete',
			'module'       => 'Category',
			'descriptions' => "",
			'data_records' => [
				'Old Record' => $category,
			],
		] );

		// return response()->json( [ 'message' => 'Category deleted' ] );
		return response()->json( [
			'message'     => 'Success!',
			'description' => 'Category successfully deleted!.',
		] );
	}

}
