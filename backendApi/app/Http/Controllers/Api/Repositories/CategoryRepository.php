<?php

namespace App\Http\Controllers\Api\Repositories;

use App\Http\Controllers\Api\Interfaces\CategoryRepositoryInterface;
use App\Models\Category;

class CategoryRepository implements CategoryRepositoryInterface
{

    public function getByUserId(int $userId, int $page, int $pageSize)
    {
        return Category::where('user_id', $userId)
            ->skip(($page - 1) * $pageSize)
            ->take($pageSize)
            ->get();
    }

    public function create(array $data): Category
    {
        return Category::create($data);
    }

    public function getById(int $id): ?Category
    {
        return Category::find($id);
    }

    public function update(Category $category, array $data): Category
    {
        $category->update($data);
        return $category;
    }

    public function delete(Category $category): void
    {
        $category->delete();
    }

    public function getTotalCountByUserId(int $userId): int
    {
        return Category::where('user_id', $userId)->count();
    }
}
