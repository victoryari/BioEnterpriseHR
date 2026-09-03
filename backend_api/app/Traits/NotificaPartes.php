<?php

namespace App\Traits;

use App\Models\Notificacion;
use App\Models\Usuario;

trait NotificaPartes
{
    protected function notificarUsuarios(array $userIds, string $titulo, string $mensaje, string $tipo, ?int $referenciaId = null): void
    {
        foreach (array_unique($userIds) as $userId) {
            Notificacion::create([
                'usuario_id' => $userId,
                'titulo' => $titulo,
                'mensaje' => $mensaje,
                'tipo' => $tipo,
                'referencia_tipo' => 'pedido',
                'referencia_id' => $referenciaId,
                'created_at' => now(),
            ]);

            // Intentar enviar WhatsApp si el usuario tiene teléfono
            $usuario = Usuario::find($userId);
            if ($usuario && !empty($usuario->telefono)) {
                $mensajeWhatsapp = "*{$titulo}*\n\n{$mensaje}";
                \App\Services\WhatsAppService::enviarMensaje($usuario->telefono, $mensajeWhatsapp);
            }
        }
    }

    protected function usuariosConRoles(array $roles): array
    {
        return Usuario::whereIn('rol', $roles)->pluck('id')->toArray();
    }
}
