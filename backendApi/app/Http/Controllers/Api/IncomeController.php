<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\IncomeRequest;
use App\Http\Requests\IncomeUpdateRequest;
use App\Http\Resources\IncomeResource;
use App\Models\BankAccount;
use App\Models\Category;
use App\Models\Income;
use Carbon\Carbon;
use DateTime;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Ramsey\Uuid\Uuid;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Throwable;

class IncomeController extends Controller
{

    /**
     * @param IncomeRequest $request
     *
     * @return JsonResponse
     * @throws Exception
     */

    public function index(Request $request): JsonResponse
    {
        $page = $request->query('page', 1);
        $pageSize = $request->query('pageSize', 1000);
        $sector = $request->query('sector');
        $category = $request->query('category');
        $order = $request->query('order', 'DESC');
        $orderBy = $request->query('orderBy', 'id');
        $from_date = $request->query('from_date');
        $to_date = $request->query('to_date');
        $type = $request->query('type');
        $account_id = $request->query('account_id');
        $limit = $request->query('limit');


        if ($from_date) {
            $from_date = date('Y-m-d', strtotime($from_date));
        }
        if ($to_date) {
            $to_date = date('Y-m-d', strtotime($to_date));
        }

        if ($from_date && empty($to_date)) {
            $to_date = Carbon::now()->toDateString();
        }

        if ($to_date && empty($from_date)) {
            $from_date = (new DateTime($to_date))->format('Y-m-01');
        }

        $query = Income::where('company_id', Auth::user()->primary_company);


        if ($category) {
            $query = $query->where('category_id', $category);
        }
        if ($account_id) {
            $query = $query->where('account_id', $category);
        }
        if ($type) {
            $query = $query->where('income_type', $type);
        }
        if ($orderBy && $order) {
            $query = $query->orderBy($orderBy, $order);
        }
        if ($limit) {
            $query = $query->limit($limit);
        }
//        $incomes = Income::where('company_id', Auth::user()->primary_company)
//            ->whereHas('category', function ($query) {
//                $query->where('type', 'income');
//            })->skip(($page - 1) * $pageSize)
//            ->take($pageSize)
//            ->orderBy('date', 'desc')
//            ->get();
        $query = $query->skip(($page - 1) * $pageSize)->take($pageSize)->get();
        $totalCount = Income::where('company_id', Auth::user()->primary_company)->count();

        return response()->json([
            'data' => IncomeResource::collection($query),
            'total' => $totalCount,
        ]);
    }


    /**
     * @param IncomeRequest $request
     *
     * @return JsonResponse
     * @throws Exception
     * @throws Throwable
     */
    public function add(IncomeRequest $request): JsonResponse
    {
        $income = $request->validated();


        $accountSlug = $income['account'];
        $categorySlug = $income['category'];

        $account = BankAccount::where('slug', $accountSlug)->get()->first();

        if (!$account) {
            return response()->json([
                'message' => 'Not Found!',
                'description' => "Bank account was not found!",
            ], 400);
        }
        $category = Category::where('slug', $categorySlug)->where('type', '=', 'income')->get()->first();
        if (!$category) {
            return response()->json([
                'message' => 'Not Found!',
                'description' => "Category was not Found!",
            ], 400);
        }

        // Handle file upload
        if ($request->hasFile('attachment')) {
            $attachment = $request->file('attachment');
            $filename = time() . '.' . $attachment->getClientOriginalExtension();
            $attachment->storeAs('files', $filename);
            $income['attachment'] = $filename; // Store only the filename
        }

        $incomeDate = $income['date'];
        $incomeType = $income['income_type'];
        $incomeReference = $income['reference'];

        if (strtolower($incomeType) === 'reservation') {
            $checkinDate = new DateTime($income['checkin_date']);
            $checkoutDate = new DateTime($income['checkout_date']);

            $total_reservation_days = $checkoutDate->diff($checkinDate)->format("%a");

            $daily_rent = $income['amount'] / $total_reservation_days;

            try {
                DB::beginTransaction();
                $updateBalance = (new BankAccount)->updateBalance($account->id, $income['amount']);
                if (!$updateBalance['status']) {
                    DB::rollBack();
                    return response()->json([
                        'message' => 'Failed!',
                        'description' => "Failed to update Bank Account!",
                    ], 400);
                }


                if ($checkinDate->format('Y-m') === $checkoutDate->format('Y-m')) {
                    $description = buildIncomeDescription($income['description'],
                        $total_reservation_days,
                        $checkinDate->format('Y-m-d'),
                        $checkoutDate->format('Y-m-d'));

                    $income = Income::create([
                        'slug' => Uuid::uuid4(),
                        'user_id' => Auth::user()->id,
                        'company_id' => Auth::user()->primary_company,
                        'account_id' => $account->id,
                        'amount' => $income['amount'],
                        'category_id' => $category->id,
                        'description' => $description,
                        'note' => $income['note'],
                        'reference' => strtolower($incomeReference),
                        'date' => $incomeDate,
                        'income_type' => strtolower($incomeType),
                        'checkin_date' => $checkinDate->format('Y-m-d'),
                        'checkout_date' => $checkoutDate->format('Y-m-d'),
                        'attachment' => $income['attachment']??""
                    ]);

                    storeActivityLog([
                        'object_id' => $income['id'],
                        'log_type' => 'create',
                        'module' => 'income',
                        'descriptions' => "added income.",
                        'data_records' => json_encode(array_merge(['income' => $income], ['Sector Name' => $category->sector->name], ['account' => $account])),
                    ]);
                }
                else {

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
                        'slug' => Uuid::uuid4(),
                        'user_id' => Auth::user()->id,
                        'company_id' => Auth::user()->primary_company,
                        'account_id' => $account->id,
                        'amount' => $first_month_amount,
                        'category_id' => $category->id,
                        'description' => $description_1,
                        'note' => $income['note'],
                        'reference' => $incomeReference,
                        'date' => $end_date,
                        'income_type' => $incomeType,
                        'checkin_date' => $checkinDate->format('Y-m-d'),
                        'checkout_date' => $second_month_startingDate,
                        'attachment' => $income['attachment']??""
                    ]);
                    storeActivityLog([
                        'object_id' => $income_first['id'],
                        'log_type' => 'create',
                        'module' => 'income',
                        'descriptions' => "  added income.",
                        'data_records' => json_encode(array_merge(['income' => $income_first], ['Sector Name' => $category->sector->name], ['account' => $account])),
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
                            'slug' => Uuid::uuid4(),
                            'user_id' => Auth::user()->id,
                            'company_id' => Auth::user()->primary_company,
                            'account_id' => $account->id,
                            'amount' => $second_month_amount,
                            'category_id' => $category->id,
                            'description' => $description_2,
                            'note' => $income['note'],
                            'reference' => $incomeReference,
                            'date' => $second_month_startingDate,
                            'income_type' => $incomeType,
                            'checkin_date' => $second_month_startingDate,
                            'checkout_date' => $checkoutDate->format('Y-m-d'),
                            'attachment' => $income['attachment']??""
                        ]);
                        storeActivityLog([
                            'object_id' => $income_sec['id'],
                            'log_type' => 'create',
                            'module' => 'income',
                            'descriptions' => "added new income.",
                            'data_records' => json_encode(array_merge(['income' => $income_sec], ['Sector Name' => $category->sector->name], ['account' => $account])),
                        ]);
                    }
                }
                DB::commit();

            } catch (Exception $e) {
                DB::rollBack();

                return response()->json([
                    'message' => 'Line Number:' . __LINE__ . ', ' . $e->getMessage(),
                    'error' => 'error'
                ], 400);
            }
        }
        else {
            try {
                DB::beginTransaction();
                // Update the balance of the bank account

                $accountInfo = [
                    'Previous Balance'=>$account->balance,
                    'Account Name'=>sprintf("%s- %s (%s)",$account->bankName->bank_name,$account->account_name,$account->account_number)
                ];


                $account->balance += $income['amount'];
                $isUpdated = $account->save();

                $accountInfo['New Account Balance'] = $account->balance;

                if (!$isUpdated) {
                    DB::rollBack();
                    return response()->json([
                        'message' => 'Failed!',
                        'description' => "Failed to update Bank Account!",
                    ], 400);
                }

                $income = Income::create([
                    'slug' => Uuid::uuid4(),
                    'user_id' => Auth::user()->id,
                    'company_id' => Auth::user()->primary_company,
                    'account_id' => $account->id,
                    'amount' => $income['amount'],
                    'category_id' => $category->id,
                    'description' => $income['description'],
                    'note' => $income['note'],
                    'reference' => $incomeReference,
                    'income_type' => $incomeType,
                    'date' => date('Y-m-d',strtotime($income['date'])),
                    'attachment' => $income['attachment']??"",
                ]);

                storeActivityLog([
                    'object_id' => $income['id'],
                    'log_type' => 'create',
                    'module' => 'income',
                    'descriptions' => "added income.",
                    'data_records' => array_merge(json_decode(json_encode($income), true) ,$accountInfo),
                ]);

                DB::commit();

            } catch (Exception $e) {
                DB::rollBack();

                return response()->json([
                    'message' => 'Cannot add Income.',
                    'description' => $e,
                ], 400);
            }
        }

        return response()->json([
            'income' => $income,
            'message' => 'Success!',
            'description' => 'Income has been added.',
        ]);
    }


    /**
     * @param IncomeUpdateRequest $request
     * @param Income $income
     *
     * @return JsonResponse
     * @throws Exception
     */

    public function update(IncomeRequest $request, $id): JsonResponse
    {
        $newIncomeData = $request->validated();

        $oldIncomeData = Income::where('slug',$id)->get()->first();
        if (!$oldIncomeData){
            return response()->json([
                'message' => 'Not Found!',
                'description' => "Associative income data was not found!",
            ], 400);
        }
        $oldBankAccount = BankAccount::find($oldIncomeData->account_id);
        if (!$oldBankAccount){
            return response()->json([
                'message' => 'Not Found!',
                'description' => "Associated bank account was not found",
            ], 400);
        }
        $newBankAccount = BankAccount::where('slug',$newIncomeData['account'])->first();
        if (!$newBankAccount){
            return response()->json([
                'message' => 'Not Found!',
                'description' => "Bank account was not found!",
            ], 400);
        }
        $category = Category::where('slug',$newIncomeData['category'])->first();
        if (!$category){
            return response()->json([
                'message' => 'Not Found!',
                'description' => "Category was not found!",
            ], 400);
        }

        if ($request->hasFile('attachment')) {
            $attachmentFile = $request->file('attachment');
            $this->deleteAttachmentFile($oldIncomeData);
            $filename = time() . '.' . $attachmentFile->getClientOriginalExtension(); // Specify the new filename
            $attachmentFile->storeAs('files', $filename); // Upload the file with the new filename
            $newIncomeData['attachment'] = $filename;
        }

        // Retrieve the original amount from the database
        $previousAmount = $oldIncomeData->amount; //100
        $previousBankAccountNo = $oldIncomeData->account_id;
        $newIncomeData['account_id'] = $newBankAccount->id;
        $newIncomeData['category_id'] = $category->id;
        $newIncomeData['user_id'] = Auth::user()->id;


        unset($newIncomeData['account']);
        unset($newIncomeData['category']);

        $oldIncomeData->fill($newIncomeData);
        $oldIncomeData->save(); //now this is new incomeData
        if ($newBankAccount->id != $previousBankAccountNo) {

            $oldBankAccount->balance -= $previousAmount;
            $oldBankAccount->save();
            $newBankAccount->balance += $newIncomeData['amount'];
            $newBankAccount->save();
            $accountBalance = $newBankAccount->balance;
        } else {
            $newBankAccount->balance -= $previousAmount;
            $newBankAccount->balance += $newIncomeData['amount'];
            $newBankAccount->save();
            $accountBalance = $newBankAccount->balance;
        }

        storeActivityLog([
            'object_id' => $oldIncomeData->id,
            'log_type' => 'edit',
            'module' => 'income',
            'descriptions' => "",
            'data_records' => array_merge(json_decode(json_encode($newIncomeData), true), ['account_balance' => $accountBalance]),
        ]);

        return response()->json([
            'message' => 'updated',
            'description' => "Income has been updated!",
        ]);
    }

    /**
     * Delete the old attachment file associated with the income.
     *
     * @param Income $income
     *
     * @return void
     */
    protected function deleteAttachmentFile(Income $income): void
    {
        if (!empty($income->attachment)) {
            Storage::delete($income->attachment);
        }
    }

    /**
     * @param Request $request
     *
     * @return JsonResponse
     */

    public function uploadAttachment(Request $request): JsonResponse
    {
        $request->validate([
            'attachment' => 'required|file',
        ]);

        if ($request->hasFile('attachment')) {
            $attachmentFile = $request->file('attachment');

            if ($attachmentFile->isValid()) {
                $attachmentPath = $attachmentFile->store('files');

                // You may want to store the attachment path or perform any necessary operations here

                return response()->json([
                    'attachment' => $attachmentPath,
                ]);
            }
        }

        return response()->json([
            'error' => 'Failed to upload attachment.',
        ], 400);
    }

    /**
     * @param $id
     * @return JsonResponse
     */

    public function edit($id): JsonResponse
    {
        if (!$id) {
            return response()->json([
                'message' => 'Missing Id',
                'description' => 'Missing Id!'
            ], 403);
        }
        $income = Income::where(['slug' => $id, 'company_id' => Auth::user()->primary_company])->first();
        if (!$income) {
            return response()->json([
                'message' => 'Not Found',
                'description' => 'Income not found!'
            ], 404);
        }

        return response()->json([
            'data' => IncomeResource::make($income),
        ]);
    }


    /**
     * Load all income categories.
     *
     * @return JsonResponse
     */
    public function categories(): JsonResponse
    {

        $categories = DB::table('categories')->select('categories.*')
            ->join('sectors', 'categories.sector_id', '=', 'sectors.id')
            ->where('sectors.company_id', '=', Auth::user()->primary_company)
            ->where('type', 'income')->get();

        return response()->json(['categories' => $categories]);
    }


    /**
     * @param Income $income
     *
     * @return JsonResponse
     * @throws Exception
     */
    public function destroy($id): JsonResponse
    {
//        $income = Income::where('slug',$id)->get()->first();
        $status = (new Income())->deleteIncome($id);
        return response()->json([
            'message' => $status['message'],
            'description' => $status['description'],
        ], $status['status_code']);
    }


    public function exportIncomeCsv(): BinaryFileResponse
    {
        $timestamp = now()->format('YmdHis');
        $filename = "incomes_$timestamp.csv";

        $headers = [
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0'
            ,
            'Content-type' => 'text/csv'
            ,
            'Content-Disposition' => "attachment; filename=\"$filename\""
            ,
            'Expires' => '0'
            ,
            'Pragma' => 'public'
        ];


        $handle = fopen($filename, 'w');
        fputcsv($handle, [
            'ID',
            'User Name',
            'Bank Account Number',
            'Category',
            'Amount',
            'Description',
            'Date'
        ]);

        $incomes = Income::where('company_id', Auth::user()->primary_company)->get();

        foreach ($incomes as $income) {

            fputcsv($handle, [
                $income->id,
                $income->person ? $income->person->name : '',
                $income->bankAccount ? $income->bankAccount->account_number : '',
                $income->category ? $income->category->name : '',
                $income->amount,
                $income->description,
                $income->date
            ]);
        }

        fclose($handle);

        return response()->download($filename, 'income-data-' . Carbon::now()->toDateString() . '.csv', $headers);
    }


    public function totalIncome(): JsonResponse
    {
        $totalAccount = Income::where('company_id', Auth::user()->primary_company)->sum('amount');

        return response()->json([
            'amount' => $totalAccount
        ]);
    }

    /**
     * @param Request $request
     *
     * @return JsonResponse
     * @throws Throwable
     */
    public function addIncomeFromCSV(Request $request): JsonResponse
    {
        $files = $request->file('csvFile');
        if (!$files) {
            return response()->json([
                'message' => 'Missing file!',
                'description' => "Please upload a csv file.",
            ], 400);
        }
        $file = $files['file'];


        //Fixme Sometimes it becomes confused and shows a csv file as a text file.
//		if ( $file['file']->extension() !== 'csv' ) {
//			return response()->json( [
//				'message'     => 'Wrong File Extension!',
//				'description' => "Please upload a valid csv file.",
//			], 400 );
//		}


        $channel = $request->channel;
        if (!$channel) {
            return response()->json([
                'message' => 'Specify Channel',
                'description' => "Please select Channel.",
            ], 400);
        }

        $fileContents = file($file->getPathname());
        if ($channel === 'airbnb') {
            return response()->json([
                'message' => "Under Maintenance",
                'description' => "This channel is under maintenance.",
            ], 400);
//			$incomes = ( new Income() )->mapCSVWithAirbnb( $fileContents );
        }
        $status = [];
        if ($channel === 'booking') {
            $category_id = $request->category_id;
            if (!$category_id) {
                return response()->json([
                    'message' => 'Missing Sector',
                    'description' => "Please select Income Sector.",
                ], 400);
            }

            $category = Category::where('slug', $category_id)->where('type', '=', 'income')->get()->first();
            if (!$category) {
                DB::rollBack();
                return response()->json([
                    'message' => 'Not Found!',
                    'description' => "Category was not Found!",
                ], 400);
            }

            $status = (new Income())->mapCSVWithBooking($fileContents, $category);
        }
        if ($status['status_code'] != 200) {
            return response()->json([
                'success' => $status['status_code'],
                'message' => $status['message'],
            ], $status['status_code']);
        }
        $filename = date("F j, Y", strtotime($status['payment_date'])) . ' ' . $channel . '.' . 'csv';
        $file->storeAs('files', $filename);
        return response()->json([
            'message' => "Imported!",
            'description' => "CSV has been Imported Successfully",
        ]);
    }

    public function incomeTypes()
    {

        $query = Income::select('income_type')
//            ->where('company_id',Auth::user()->primary_company)
            ->GroupBy('income_type')->get();
        return response()->json([
            'data' => $query,
        ]);
    }

}
