<?php

namespace App\Http\Controllers\Api\Interfaces;

use App\Models\Category;

interface CategoryRepositoryInterface
{
    public function getByUserId(int $userId, int $page, int $pageSize);

    public function create(array $data): Category;

    public function getById(int $id): ?Category;

    public function update(Category $category, array $data): Category;

    public function delete(Category $category): void;

    public function getTotalCountByUserId(int $userId): int;

}
