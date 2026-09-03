<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    /**
     * Envía un mensaje de texto a través de Evolution API
     *
     * @param string|null $telefono El número de teléfono con código de país (ej. 51999888777)
     * @param string $mensaje El texto a enviar
     * @return bool
     */
    public static function enviarMensaje(?string $telefono, string $mensaje): bool
    {
        if (empty($telefono)) {
            Log::info("WhatsAppService: No se envió mensaje porque el teléfono está vacío.");
            return false;
        }

        // Limpiar el teléfono de cualquier caracter que no sea numérico
        $telefonoLimpio = preg_replace('/[^0-9]/', '', $telefono);

        // Si el número tiene exactamente 9 dígitos (asumimos Perú) y no empieza con 51, agregarlo
        if (strlen($telefonoLimpio) === 9) {
            $telefonoLimpio = '51' . $telefonoLimpio;
        }

        // Validar que tengamos configuración para Evolution API
        $apiUrl = env('EVOLUTION_API_URL', 'http://localhost:8085');
        $instanceName = env('EVOLUTION_INSTANCE_NAME', 'seguridad');
        $apiKey = env('EVOLUTION_API_KEY', 'tu_api_key_aqui');

        $endpoint = "{$apiUrl}/message/sendText/{$instanceName}";

        try {
            $response = Http::withHeaders([
                'apikey' => $apiKey,
                'Content-Type' => 'application/json',
            ])->post($endpoint, [
                'number' => $telefonoLimpio,
                'options' => [
                    'delay' => 1200,
                    'presence' => 'composing',
                ],
                'text' => $mensaje,
            ]);

            if ($response->successful()) {
                Log::info("WhatsApp enviado a {$telefonoLimpio} exitosamente.");
                return true;
            } else {
                Log::error("Error enviando WhatsApp a {$telefonoLimpio}: " . $response->body());
                return false;
            }
        } catch (\Exception $e) {
            Log::error("Excepción enviando WhatsApp a {$telefonoLimpio}: " . $e->getMessage());
            return false;
        }
    }
}
