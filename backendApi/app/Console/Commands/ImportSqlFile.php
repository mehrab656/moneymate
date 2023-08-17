<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ImportSqlFile extends Command
{
    protected $signature = 'finance:import-database {filename}';

    protected $description = 'Import an SQL file from the database folder';

    /**
     * @return void
     */

    public function handle(): void
    {
        $filename = $this->argument('filename');
        $path = database_path("{$filename}.sql");

        if (!file_exists($path)) {
            $this->error("The file {$filename}.sql does not exist in the database folder.");
            return;
        }

        $sql = file_get_contents($path);

        DB::unprepared($sql);

        $this->info("The SQL file {$filename}.sql has been imported successfully.");
    }
}
