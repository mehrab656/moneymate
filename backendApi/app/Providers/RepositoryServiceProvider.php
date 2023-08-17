<?php

namespace App\Providers;

use App\Http\Controllers\Api\Interfaces\CategoryRepositoryInterface;
use App\Http\Controllers\Api\Repositories\CategoryRepository;
use Carbon\Laravel\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(CategoryRepositoryInterface::class, CategoryRepository::class);
    }

}
