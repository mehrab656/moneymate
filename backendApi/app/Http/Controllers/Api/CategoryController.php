<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Interfaces\CategoryRepositoryInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\CategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Hamcrest\Description;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CategoryController extends Controller
{


    private CategoryRepositoryInterface $categoryRepository;

    public function __construct(CategoryRepositoryInterface $categoryRepository)
    {
        $this->categoryRepository = $categoryRepository;
    }

    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        $page = $request->query('page', 1);
        $pageSize = $request->query('pageSize', 10);
        $categories = $this->categoryRepository->getByUserId($user->id, $page, $pageSize);
        $totalCount = $this->categoryRepository->getTotalCountByUserId($user->id);

        return response()->json([
            'data' => CategoryResource::collection($categories),
            'total' => $totalCount,
        ]);
    }

    public function create(CategoryRequest $request): JsonResponse
    {
        $categoryData = $request->validated();
        $categoryData['user_id'] = auth()->user()->id;

        $category = $this->categoryRepository->create($categoryData);

        return response()->json(['category' => $category]);
    }

    public function show(Category $category): CategoryResource
    {
        return new CategoryResource($category);
    }

    public function update(UpdateCategoryRequest $request, Category $category): CategoryResource
    {
        $data = $request->validated();
        $category = $this->categoryRepository->update($category, $data);
        return new CategoryResource($category);
    }


    /**
     * Remove the specified resource from storage.
     *
     * @param Category $category
     * @return JsonResponse
     */
    public function destroy(Category $category): JsonResponse
    {
        $this->categoryRepository->delete($category);
        return response()->json(['message' => 'Category deleted']);
    }

}
