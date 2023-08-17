<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Illuminate\Support\Facades\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FileDownloadController extends Controller
{


    /**
     * @param $filename
     * @return JsonResponse|StreamedResponse
     */
    public function downloadFile($filename): BinaryFileResponse|JsonResponse
    {
        $filePath = 'files/' . $filename;

        if (!Storage::exists($filePath)) {
            return response()->json(['error' => 'File not found.'], 404);
        }

        $file = Storage::path($filePath);
        $mimeType = Storage::mimeType($filePath);

        return response()->file($file, [
            'Content-Type' => $mimeType,
        ]);
    }
}
