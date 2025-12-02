# Backend API Commands (Laravel)

This cheat sheet centralizes the most-used commands and key file paths for the backend API in this project.

## Project Paths
- Root (monorepo): `c:/xampp/htdocs/moneymate`
- Backend API root: `c:/xampp/htdocs/moneymate/backendApi`
- Public entrypoint: `backendApi/public/index.php`
- Routes: `backendApi/routes/api.php`
- Env file: `backendApi/.env` (template: `backendApi/.env_copy`)

## Prerequisites
- PHP (≥8.x), Composer
- MySQL/MariaDB running (XAMPP)
- Ensure Apache serves `backendApi/public` (if not using `artisan serve`)

## Setup
```bash
cd /c/xampp/htdocs/moneymate/backendApi
composer install
cp .env_copy .env        # Or create .env manually
php artisan key:generate
php artisan storage:link # If file uploads are used
```

## Run / Serve
```bash
# Built-in server
php artisan serve --host=127.0.0.1 --port=8000

# Apache (XAMPP)
# Point the vhost/DocumentRoot to backendApi/public
```

## Database
```bash
php artisan migrate                # Run migrations
php artisan db:seed  
php artisan demo:counts             # Seed database
php artisan migrate:rollback      # Roll back last batch
php artisan migrate:fresh --seed  # Drop & re-run all with seeding
```

## Cache & Config
```bash
php artisan cache:clear
php artisan route:clear
php artisan config:clear
php artisan config:cache
php artisan optimize
```

## Routes & Debug
```bash
php artisan route:list
php artisan tinker                 # Interactive REPL
```

## Code Generation
```bash
php artisan make:controller Api/MyController --api
php artisan make:model MyModel
php artisan make:migration create_my_table
php artisan make:resource MyResource
php artisan make:request MyRequest
```

## Testing
```bash
php artisan test
vendor/bin/phpunit
```

## Composer Utilities
```bash
composer dump-autoload
composer install
composer update
```

## Logs
```bash
# View latest Laravel logs (Git Bash)
tail -f storage/logs/laravel.log
```

## File Permissions

Ensure the web server can read/write `storage/` and `bootstrap/cache/`, and any public upload directories.

### Linux/macOS (Apache/Nginx)
```bash
cd /c/xampp/htdocs/moneymate/backendApi

# Set owner to your web user
# Linux examples: www-data (Debian/Ubuntu), apache (CentOS/RHEL), nginx
# macOS Apache default: _www
# Discover the correct user:
#   id _www   # macOS Apache
#   id www-data  # Debian/Ubuntu
#   ps aux | grep -E "(httpd|apache|nginx|php-fpm)"
sudo chown -R _www:_www storage bootstrap/cache  # macOS
# sudo chown -R www-data:www-data storage bootstrap/cache  # Debian/Ubuntu
# sudo chown -R apache:apache storage bootstrap/cache       # CentOS/RHEL

# Grant read/write/execute to owner/group (directories 775, files 664)
sudo find storage -type d -exec chmod 775 {} \;
sudo find storage -type f -exec chmod 664 {} \;
sudo chmod -R 775 bootstrap/cache

# macOS optional: grant extended ACLs so _www can write even if owner is your user
# (applies to storage and bootstrap/cache)
sudo chmod -R +a "_www allow read,write,append,file_inherit,directory_inherit" storage
sudo chmod -R +a "_www allow read,write,append,file_inherit,directory_inherit" bootstrap/cache

# If SELinux is enabled (CentOS/RHEL), allow web writes
sudo chcon -R -t httpd_sys_rw_content_t storage bootstrap/cache

# Optional: public upload dirs (if used)
sudo mkdir -p public/avatars public/passports public/ids
sudo chown -R www-data:www-data public/avatars public/passports public/ids
sudo chmod -R 775 public/avatars public/passports public/ids
```

### Windows (XAMPP, Apache)
Use `icacls` to grant Modify (M) permissions recursively to the `Users` group.
Run these in an elevated PowerShell or Command Prompt.
```powershell
cd C:\xampp\htdocs\moneymate\backendApi

# Grant Modify to Users group recursively
icacls storage /grant Users:(OI)(CI)M /T
icacls bootstrap\cache /grant Users:(OI)(CI)M /T

# Optional: public upload dirs (create + grant)
mkdir public\avatars 2>$null
mkdir public\passports 2>$null
mkdir public\ids 2>$null
icacls public\avatars /grant Users:(OI)(CI)M /T
icacls public\passports /grant Users:(OI)(CI)M /T
icacls public\ids /grant Users:(OI)(CI)M /T
```

### Verify permissions
- `php artisan config:cache` and `php artisan cache:clear` succeed.
- API writes logs to `storage/logs/laravel.log`.
- No `Permission denied` or `Unable to create directory` in logs.

Linux/macOS
- Set web server ownership:
  - sudo chown -R www-data:www-data storage/logs
- Directory and file permissions:
  - sudo find storage/logs -type d -exec chmod 775 {} \;
  - sudo find storage/logs -type f -exec chmod 664 {} \;
- Create the log file if missing:
  - sudo install -m 664 -o www-data -g www-data /dev/null storage/logs/laravel.log
- SELinux (CentOS/RHEL) context:
  - sudo chcon -R -t httpd_sys_rw_content_t storage/logs

Windows (XAMPP)
- Grant Modify permissions to the Users group:
  - icacls storage\logs /grant Users:(OI)(CI)M /T
- Create the log file if missing:
  - type NUL > storage\logs\laravel.log
  - icacls storage\logs\laravel.log /grant Users:M

## Key Files (Debts/Accounts)
- Controllers:
  - `app/Http/Controllers/Api/DebtController.php`
  - `app/Http/Controllers/Api/BorrowController.php`
  - `app/Http/Controllers/Api/LendController.php`
  - `app/Http/Controllers/Api/SectorModelController.php`
- Models:
  - `app/Models/Debt.php`
  - `app/Models/Borrow.php`
  - `app/Models/Lend.php`
  - `app/Models/Repayment.php`
  - `app/Models/BankAccount.php`
  - `app/Models/BankName.php`
- Resources:
  - `app/Http/Resources/DebtResource.php`
  - `app/Http/Resources/DebtHistory.php`
- Requests:
  - `app/Http/Requests/DebtRequest.php`

## API Endpoints (Debts)
Base (Apache/XAMPP): `http://moneymate.com/backendApi/public`
- `GET /api/debts?page=1&pageSize=10` — List debts
- `GET /api/debts/{id}` — Show one debt
- `POST /api/debts/store` — Create debt
- `POST /api/debts/{id}` — Update debt (basic fields)
- `DELETE /api/debts/delete/{id}` — Delete debt
- `GET /api/get-debt-history/{debt_id}` — Debt history

## cURL Examples (Git Bash)
```bash
# List debts
curl -X GET "http://moneymate.com/backendApi/public/api/debts?page=1&pageSize=10" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <token>"

# Create debt (borrow)
curl -X POST "http://moneymate.com/backendApi/public/api/debts/store" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <token>" \
  -F "person=John Doe" \
  -F "type=borrow" \
  -F "account_id=<account_slug>" \
  -F "amount=100" \
  -F "date=2025-11-11" \
  -F "note=Sample"
```

## Notes
- Debts index eager-loads `accounts.bankName` for performance.
- Debt API response includes `account` and `account_number` via `DebtResource`.
- Run all `php artisan` and `composer` commands inside `backendApi` directory.
