<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class ExportDatabase extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'finance:export-database';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Export the database to database folder';


    /**
     * @return void
     * Export the database in mysql format to the database folder
     */
    public function handle(): void
    {
        $databaseName = 'laravel_finance';
        $fileName = $databaseName . '_' . date('Y-m-d') . '.sql';
        $filePath = database_path($fileName);

        $command = sprintf(
            'mysqldump --user=%s --password=%s --host=%s %s > %s',
            config('database.connections.mysql.username'),
            config('database.connections.mysql.password'),
            config('database.connections.mysql.host'),
            $databaseName,
            $filePath
        );

        exec($command);

        $this->info('Database exported successfully!');
    }
}
