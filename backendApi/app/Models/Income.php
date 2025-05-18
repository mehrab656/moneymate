<?php

namespace App\Models;

use Illuminate\Support\Facades\Auth;
use DateTime;
use Exception;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;
use Ramsey\Uuid\Uuid;
use Throwable;

/**
 * @property mixed $account_id
 * @property mixed $amount
 * @method static create(array $array)
 */
class Income extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'incomes';
    protected $primaryKey = 'id';
    protected $guarded = [];


    /**
     * @return BelongsTo
     */
    public function person(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }


    /**
     * @return BelongsTo
     */
    public function bankAccount(): BelongsTo
    {
        return $this->belongsTo(BankAccount::class, 'account_id', 'id');
    }


    /**
     * @return BelongsTo
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id', 'id');
    }

    public function buildIncomeDatesetFromCSV($data,$channel)
    {

        $incomeAmount = str_replace('"', '', $data[12]);
        $incomeCurrency = trim($data[17]);
        $incomeDataSet = [
            'date' => date('Y-m-d', strtotime(str_replace("\"", '', $data[2]))), // actually booking date,
            'checkin_date' => date('Y-m-d', strtotime(str_replace("\"", '', $data[3]))),
            'checkout_date' => date('Y-m-d', strtotime(str_replace("\"", '', $data[4]))),
            'description' => str_replace("\"", '', $data[6]),
            'amount' => str_replace('"', '', $data[12]),
        ];

        if ($incomeCurrency === 'USD') {
            $req_url = 'https://v6.exchangerate-api.com/v6/34613ea34951b619f1ff2fde/latest/USD';
            $response_json = file_get_contents($req_url);
            $response = json_decode($response_json);
            $conversion_rates = $response->conversion_rates;
            $incomeDataSet['amount'] = round($conversion_rates->AED * $incomeAmount, 2); //Amount in AED
        }


        if ($channel==='airbnb'){
            $incomeDataSet += [
                'income_type'=>$data[10],
                'reference' => sprintf("Airbnb booking reservation Number: %s",$data[1]),
                'note' => sprintf("This income was imported by CSV where Listing id  is '%s' and reservation reference is '%s'", $data[0], $data[1]),
            ];
        }
        if ($channel==='booking'){
            $incomeDataSet += [
                'income_type'=>'reservation',
                'reference' => sprintf("Booking.com reservation Number: %s",$data[0]),
                'note' => sprintf("This income was imported by CSV where reservation reference id '%s' and invoice number '%s'", $data[0], $data[1]),
            ];
        }


        return $incomeDataSet;
    }

    /**
     * @throws Throwable
     */
    public function extractIncomeFromCSV(array $files, $category,$channel='booking'): array
    {
        unset($files[0]);
        $sector = DB::table('sectors')->select('*')
            ->join('categories', 'categories.sector_id', '=', 'sectors.id')
            ->where('categories.id', '=', $category->id)
            ->first();

        foreach ($files as $file) {
            $incomeData = explode(',', str_replace('"', '', $file));

            $income = $this->buildIncomeDatesetFromCSV($incomeData,$channel);
            $income += [
                'user_id' => Auth::user()->id,
                'account_id' => $sector->payment_account_id,
                'category_id' => $category->id,
                'attachment' => '',
            ];

            $isAdded = $this->incomeAdd($income, $category);

            if ($isAdded['status_code'] != 200) {
                return [
                    'status_code' => $isAdded['status_code'],
                    'message' => $isAdded['message']
                ];
            }
        }
        return [
            'status_code' => 200,
            'message' => 'CSV has been successfully imported!',
        ];

    }

    /**
     * @throws Throwable
     */
    public function incomeAdd($income, $category, $slug = ''): array
    {

        if ($income['income_type'] === 'reservation') {
            $checkinDate = new DateTime($income['checkin_date']);
            $checkoutDate = new DateTime($income['checkout_date']);

            $total_reservation_days = $checkoutDate->diff($checkinDate)->format("%a");

            $daily_rent = floatval(str_replace('"','',$income['amount'])) / $total_reservation_days;

            try {
                DB::beginTransaction();
                $account = (new BankAccount)->updateBalance($income['account_id'], $income['amount']);
                if (!$account['status']) {
                    DB::rollBack();

                    return [
                        'message' => 'Failed to update Bank Account!',
                        'status_code' => 400
                    ];
                }

                if ($checkinDate->format('Y-m') === $checkoutDate->format('Y-m')) {
                    $description = buildIncomeDescription($income['description'],
                        $total_reservation_days,
                        $checkinDate->format('Y-m-d'),
                        $checkoutDate->format('Y-m-d'));
                    $income = Income::create([
                        'slug' => $slug ?: Uuid::uuid4(),
                        'user_id' => $income['user_id'],
                        'company_id' => Auth::user()->primary_company,
                        'account_id' => $income['account_id'],
                        'amount' => $income['amount'],
                        'category_id' => $income['category_id'],
                        'description' => $description,
                        'note' => $income['note'],
                        'reference' => $income['reference'],
                        'date' => $income['date'],
                        'income_type' => $income['income_type'],
                        'checkin_date' => $checkinDate->format('Y-m-d'),
                        'checkout_date' => $checkoutDate->format('Y-m-d'),
                        'attachment' => $income['attachment']
                    ]);
                    unset($income['user_id']);
                    unset($income['company_id']);
                    unset($income['account_id']);
                    unset($income['category_id']);


                    storeActivityLog([
                        'object_id' => $income['id'],
                        'log_type' => 'create',
                        'module' => 'income',
                        'descriptions' => "added new income on " . Auth::user()->current_company->name . ".",
                        'data_records' => array_merge(json_decode(json_encode($income), true), ['Sector Name' => $category->sector->name], $account),
                    ]);
                } else {

                    $end_date = $checkinDate->format('Y-m-t'); //end date from check in date. Format: "YYYY-mm-dd"
                    $first_month_days = (int)((new DateTime($end_date))->diff($checkinDate)->format("%a")) + 1;
                    $first_month_amount = $daily_rent * $first_month_days;
                    $second_month_startingDate = $checkoutDate->format('Y-m-01'); //next month starting date;

                    $description_1 = sprintf('%s reservation of %d days from %s to %s',
                        $income['description'],
                        $first_month_days,
                        $checkinDate->format("y-m-d"),
                        $second_month_startingDate,
                    );

                    $income_first = Income::create([
                        'slug' => $slug ?: Uuid::uuid4(),
                        'user_id' => Auth::user()->id,
                        'company_id' => Auth::user()->primary_company,
                        'account_id' => $income['account_id'],
                        'amount' => $first_month_amount,
                        'category_id' => $income['category_id'],
                        'description' => $description_1,
                        'note' => $income['note'],
                        'reference' => $income['reference'],
                        'date' => $end_date,
                        'income_type' => $income['income_type'],
                        'checkin_date' => $checkinDate->format('Y-m-d'),
                        'checkout_date' => $second_month_startingDate,
                        'attachment' => $income['attachment']
                    ]);
                    unset($income_first['user_id']);
                    unset($income_first['company_id']);
                    unset($income_first['account_id']);
                    unset($income_first['category_id']);

                    storeActivityLog([
                        'object_id' => $income_first['id'],
                        'log_type' => 'create',
                        'module' => 'income',
                        'descriptions' => "added new income on " . Auth::user()->current_company->name . ".",
                        'data_records' => array_merge(json_decode(json_encode($income_first), true), ['Sector Name' => $category->sector->name], $account),
                    ]);

                    $second_month_startingDate = $checkoutDate->format('Y-m-01'); //next month starting date;

                    $second_month_days = $checkoutDate->diff(new DateTime($second_month_startingDate))->format('%a');

                    if ($second_month_days > 0) {
                        $description_2 = sprintf('%s reservation of %d days from %s to %s',
                            $income['description'],
                            $second_month_days,
                            $second_month_startingDate,
                            $checkoutDate->format('Y-m-d'),
                        );
                        $second_month_amount = $daily_rent * $second_month_days;

                        $income_sec = Income::create([
                            'slug' => $slug ?: Uuid::uuid4(),
                            'user_id' => Auth::user()->id,
                            'company_id' => Auth::user()->primary_company,
                            'account_id' => $income['account_id'],
                            'amount' => $second_month_amount,
                            'category_id' => $income['category_id'],
                            'description' => $description_2,
                            'note' => $income['note'],
                            'reference' => $income['reference'],
                            'date' => $second_month_startingDate,
                            'income_type' => $income['income_type'],
                            'checkin_date' => $second_month_startingDate,
                            'checkout_date' => $checkoutDate->format('Y-m-d'),
                            'attachment' => $income['attachment']
                        ]);
                        unset($income_sec['user_id']);
                        unset($income_sec['company_id']);
                        unset($income_sec['account_id']);
                        unset($income_sec['category_id']);
                        storeActivityLog([
                            'object_id' => $income_sec['id'],
                            'log_type' => 'create',
                            'module' => 'income',
                            'descriptions' => "added new income on " . Auth::user()->current_company->name . ".",
                            'data_records' => array_merge(json_decode(json_encode($income_sec), true), ['Sector Name' => $category->sector->name], $account),
                        ]);
                    }
                }
                DB::commit();

            } catch (Exception $e) {
                DB::rollBack();

                return [
                    'message' => 'Line Number:' . __LINE__ . ', ' . $e->getMessage(),
                    'status_code' => 400
                ];
            }
        } else {

            try {
                DB::beginTransaction();
                // Update the balance of the bank account

                $account = (new BankAccount)->updateBalance($income['account_id'], $income['amount']);

                if (!$account['status']) {
                    DB::rollBack();

                    return [
                        'message' => "Failed to update Bank Account!",
                        'status_code' => 400
                    ];
                }

                $income = Income::create([
                    'slug' => $slug ?: Uuid::uuid4(),
                    'user_id' => Auth::user()->id,
                    'company_id' => Auth::user()->primary_company,
                    'account_id' => $income['account_id'],
                    'amount' => $income['amount'],
                    'category_id' => $income['category_id'],
                    'description' => $income['description'],
                    'note' => $income['note'],
                    'reference' => $income['reference'],
                    'income_type' => $income['income_type'],
                    'date' => $income['date'],
                    'attachment' => $income['attachment']
                ]);

                storeActivityLog([
                    'object_id' => $income['id'],
                    'object' => 'income',
                    'log_type' => 'create',
                    'module' => 'income',
                    'descriptions' => "added new income.",
                    'data_records' => array_merge(json_decode(json_encode($income), true), $account),
                ]);

                DB::commit();

            } catch (Exception $e) {
                DB::rollBack();

                return [
                    'message' => 'Line Number:' . __LINE__ . ', ' . $e->getMessage(),
                    'status_code' => 400
                ];
            }
        }

        return [
            'message' => 'Income Added',
            'status_code' => 200
        ];
    }

    /**
     * @throws Exception
     */
    public function deleteIncome($slug): array
    {

        $income = Income::where('slug', $slug)->first();
        if (!$income) {
            return [
                'message' => 'Not Found',
                'description' => 'Income not found',
                'status_code' => 404
            ];
        }
        $income->delete();
        $bankAccount = BankAccount::find($income->account_id);
        if ($income->amount > 0) {
            $bankAccount->balance -= $income->amount;
            $bankAccount->save();
        }

        storeActivityLog([
            'object_id' => $income->id,
            'log_type' => 'delete',
            'module' => 'income',
            'descriptions' => "",
            'data_records' => array_merge(json_decode(json_encode($income), true), ['account_balance' => $bankAccount->balance]),
        ]);

        return [
            'message' => 'success',
            'description' => 'Income Deleted',
            'status_code' => 200
        ];
    }


}
