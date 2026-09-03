<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;
use Illuminate\Support\Facades\File;

class ImagenController extends Controller
{
    public function serve(string $directory, string $filename): Response
    {
        $path = public_path($directory . '/' . $filename);

        if (!File::exists($path)) {
            abort(404);
        }

        $mime = File::mimeType($path);
        $content = File::get($path);

        return response($content, 200, [
            'Content-Type' => $mime,
            'Access-Control-Allow-Origin' => '*',
            'Access-Control-Allow-Methods' => 'GET, OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Type, Authorization',
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }
}
