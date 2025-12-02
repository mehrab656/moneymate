<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class EnsureTwoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $dbName = DB::getDatabaseName();
        $tables = collect(DB::select(
            'SELECT TABLE_NAME as name FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME',
            [$dbName]
        ))->pluck('name');

        // Skip system / internal tables
        $skip = collect(['migrations']);

        foreach ($tables as $table) {
            if ($skip->contains($table)) {
                continue;
            }

            try {
                $count = DB::table($table)->count();
            } catch (\Throwable $e) {
                // Skip tables we cannot count
                continue;
            }

            if ($count >= 2) {
                continue;
            }

            // Introspect columns for this table
            $columns = DB::select(
                'SELECT COLUMN_NAME, IS_NULLABLE, COLUMN_DEFAULT, DATA_TYPE, COLUMN_TYPE, EXTRA '
                .'FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION',
                [$dbName, $table]
            );

            $now = Carbon::now();
            $rows = [[], []];

            foreach ($columns as $col) {
                $name = $col->COLUMN_NAME;
                $nullable = ($col->IS_NULLABLE === 'YES');
                $default = $col->COLUMN_DEFAULT; // may be null
                $type = strtolower($col->DATA_TYPE);
                $columnType = strtolower($col->COLUMN_TYPE);
                $extra = strtolower($col->EXTRA ?? '');

                // Auto-increment or generated columns should be skipped
                if (str_contains($extra, 'auto_increment') || str_contains($extra, 'generated')) {
                    continue;
                }

                // Special handling for timestamps
                if (in_array($name, ['created_at', 'updated_at'])) {
                    $rows[0][$name] = $now;
                    $rows[1][$name] = $now;
                    continue;
                }
                if ($name === 'deleted_at') {
                    $rows[0][$name] = null;
                    $rows[1][$name] = null;
                    continue;
                }

                // If column has a default and is nullable, we can omit
                // But to be safe, assign values for common types
                for ($i = 0; $i < 2; $i++) {
                    $rows[$i][$name] = $this->valueForColumn($name, $type, $columnType, $i, $now, $nullable, $default);
                }
            }

            // Attempt insert; if fails, try a more conservative insert removing nullable columns with defaults
            try {
                DB::table($table)->insert($rows);
            } catch (\Throwable $e) {
                // Fallback: remove columns with default values and try again
                foreach ($columns as $col) {
                    if ($col->COLUMN_DEFAULT !== null) {
                        unset($rows[0][$col->COLUMN_NAME], $rows[1][$col->COLUMN_NAME]);
                    }
                }
                try {
                    DB::table($table)->insert($rows);
                } catch (\Throwable $e2) {
                    // Last resort: skip this table to avoid breaking seed
                    // You can log or echo here if needed
                    continue;
                }
            }
        }
    }

    private function valueForColumn(string $name, string $type, string $columnType, int $index, Carbon $now, bool $nullable, $default)
    {
        // If foreign key-like column name
        if (str_ends_with($name, '_id')) {
            return $index + 1; // assume IDs 1 and 2 exist (users, companies, etc.)
        }

        switch ($type) {
            case 'int':
            case 'integer':
            case 'bigint':
            case 'mediumint':
            case 'smallint':
            case 'tinyint':
                return 100 + $index;

            case 'decimal':
            case 'float':
            case 'double':
                return 10.5 + $index;

            case 'date':
                return $now->toDateString();

            case 'datetime':
            case 'timestamp':
                return $now;

            case 'time':
                return '00:00:00';

            case 'year':
                return (int) $now->format('Y');

            case 'json':
                return json_encode(['demo' => $index + 1]);

            case 'enum':
                // COLUMN_TYPE looks like: enum('a','b','c')
                $options = [];
                if (str_starts_with($columnType, 'enum(')) {
                    $raw = substr($columnType, 5, -1); // remove enum( and )
                    $parts = str_getcsv($raw, ',', "'");
                    $options = array_map(fn($v) => trim($v, "'\""), $parts);
                }
                if (!empty($options)) {
                    return $options[min($index, count($options) - 1)];
                }
                return 'demo';

            case 'char':
            case 'varchar':
            case 'text':
            case 'mediumtext':
            case 'longtext':
                // Common special-name handling
                if (in_array($name, ['slug', 'uid', 'uuid'])) {
                    return (string) Str::uuid();
                }
                if ($name === 'email') {
                    return "demo{$index}@example.com";
                }
                if (str_contains($name, 'name')) {
                    return "Demo Name ".($index + 1);
                }
                return ucfirst($name)." demo ".($index + 1);

            case 'blob':
            case 'binary':
                return null; // keep empty

            default:
                // Unknown type; return null if allowed, else a generic string
                return $nullable ? null : ('demo '.($index + 1));
        }
    }
}

