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
        $tables = [
            'users', 'companies', 'company_user', 'bank_names', 'bank_accounts',
            'sectors', 'categories', 'wallets', 'budgets', 'budget_category',
            'expenses', 'incomes', 'debts', 'lends', 'borrows', 'repayments',
            'debt_collections', 'channels', 'payments', 'subscriptions', 'roles',
            'options', 'settings', 'activity_logs',
        ];

        $this->info('Demo seeded table counts:');
        foreach ($tables as $table) {
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

