<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class DemoCountsCommand extends Command
{
    protected $signature = 'demo:counts';
    protected $description = 'Show row counts for key demo-seeded tables';

    public function handle(): int
    {
        $dbName = DB::getDatabaseName();
        $tables = collect(DB::select(
            'SELECT TABLE_NAME as name FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME',
            [$dbName]
        ))->pluck('name');

        $skip = collect(['migrations']);

        $this->info('All table row counts:');
        foreach ($tables as $table) {
            if ($skip->contains($table)) {
                continue;
            }
            try {
                $count = DB::table($table)->count();
                $this->line(sprintf("- %s: %d", $table, $count));
            } catch (\Throwable $e) {
                $this->line(sprintf("- %s: error (%s)", $table, $e->getMessage()));
            }
        }

        return self::SUCCESS;
    }
}
