<?php

namespace App\Services;

use App\Models\Dispositivo;
use App\Models\Empleado;
use App\Models\MarcacionAsistencia;

class ZKTecoService
{
    private $ip;
    private $port;
    private $socket;
    private $session_id = 0;
    private $reply_id = 0;

    const CMD_CONNECT       = 1000;
    const CMD_EXIT          = 1001;
    const CMD_ENABLEDEVICE  = 1002;
    const CMD_DISABLEDEVICE = 1003;
    const CMD_ACK_OK        = 2000;
    const CMD_ACK_ERROR     = 2001;
    const CMD_ACK_DATA      = 2002;
    const CMD_PREPARE_DATA  = 1500;
    const CMD_DATA          = 1501;
    const CMD_FREE_DATA     = 1502;
    const CMD_USER_TEMP_RRQ = 9;
    const CMD_ATT_LOG_RRQ   = 13;
    const USHRT_MAX         = 65535;

    public function __construct($ip, $port = 4370)
    {
        $this->ip = $ip;
        $this->port = $port;
    }

    public function connect(): bool
    {
        $this->socket = @fsockopen("udp://{$this->ip}", $this->port, $errno, $errstr, 3);
        if (!$this->socket) return false;
        stream_set_timeout($this->socket, 5);

        $buf = $this->createHeader(self::CMD_CONNECT, 0, 0);
        @fwrite($this->socket, $buf);
        $reply = @fread($this->socket, 1024);

        if ($reply && strlen($reply) >= 8) {
            $header = unpack('scommand/schksum/ssession_id/sreply_id', substr($reply, 0, 8));
            $this->session_id = $header['session_id'];
            $this->reply_id = $header['reply_id'];
            return true;
        }

        return false;
    }

    private function createHeader($command, $session_id, $reply_id, $data = '')
    {
        $buf = pack('SSSS', $command, 0, $session_id, $reply_id) . $data;
        $p = unpack('C' . strlen($buf) . 'c', $buf);
        $l = count($p);
        $chksum = 0;
        $i = $l;
        $j = 1;
        while ($i > 1) {
            $u = unpack('S', pack('C2', $p['c' . $j], $p['c' . ($j + 1)]));
            $chksum += $u[1];
            if ($chksum > self::USHRT_MAX) $chksum -= self::USHRT_MAX;
            $i -= 2;
            $j += 2;
        }
        if ($i) {
            $chksum += $p['c' . strval(count($p))];
        }
        while ($chksum > self::USHRT_MAX) $chksum -= self::USHRT_MAX;
        if ($chksum > 0) $chksum = -($chksum);
        else $chksum = abs($chksum);
        $chksum -= 1;
        while ($chksum < 0) $chksum += self::USHRT_MAX;

        $this->reply_id++;
        if ($this->reply_id >= self::USHRT_MAX) $this->reply_id -= self::USHRT_MAX;

        return pack('SSSS', $command, $chksum, $session_id, $this->reply_id) . $data;
    }

    public function disableDevice(): void
    {
        $buf = $this->createHeader(self::CMD_DISABLEDEVICE, $this->session_id, $this->reply_id);
        @fwrite($this->socket, $buf);
        @fread($this->socket, 1024);
    }

    public function enableDevice(): void
    {
        $buf = $this->createHeader(self::CMD_ENABLEDEVICE, $this->session_id, $this->reply_id);
        @fwrite($this->socket, $buf);
        @fread($this->socket, 1024);
    }

    private function requestData($command, $cmdData = ''): string
    {
        $buf = $this->createHeader($command, $this->session_id, $this->reply_id, $cmdData);
        @fwrite($this->socket, $buf);

        $reply = @fread($this->socket, 1032);
        if (!$reply || strlen($reply) < 8) return '';

        $u = unpack('H2h1/H2h2/H2h3/H2h4/H2h5/H2h6/H2h7/H2h8', substr($reply, 0, 8));
        $cmdReply = hexdec($u['h2'] . $u['h1']);

        if ($cmdReply == self::CMD_PREPARE_DATA) {
            $sizeData = unpack('H2h1/H2h2/H2h3/H2h4', substr($reply, 8, 4));
            $totalSize = hexdec($sizeData['h4'] . $sizeData['h3'] . $sizeData['h2'] . $sizeData['h1']);

            $data = '';
            $received = 0;
            $errors = 0;
            $first = true;

            while ($received < $totalSize && $errors < 20) {
                $chunk = @fread($this->socket, 1032);
                if (!$chunk) {
                    $errors++;
                    usleep(100000);
                    continue;
                }

                if ($first) {
                    $data .= $chunk;
                    $first = false;
                } else {
                    $data .= substr($chunk, 8);
                }
                $received += strlen($chunk);
            }

            $buf = $this->createHeader(self::CMD_FREE_DATA, $this->session_id, $this->reply_id);
            @fwrite($this->socket, $buf);
            @fread($this->socket, 1024);

            return $data;
        } elseif ($cmdReply == self::CMD_ACK_OK || $cmdReply == self::CMD_ACK_DATA) {
            return $reply;
        }

        return $reply;
    }

    private static function reverseHex($hex): string
    {
        $tmp = '';
        for ($i = strlen($hex); $i >= 0; $i--) {
            $tmp .= substr($hex, $i, 2);
            $i--;
        }
        return $tmp;
    }

    private static function decodeZKTime($t): string
    {
        $sec = $t % 60; $t = floor($t / 60);
        $min = $t % 60; $t = floor($t / 60);
        $hour = $t % 24; $t = floor($t / 24);
        $day = ($t % 31) + 1; $t = floor($t / 31);
        $month = ($t % 12) + 1; $t = floor($t / 12);
        $year = floor($t) + 2000;

        if ($year < 2000 || $year > 2099) {
            return date('Y-m-d H:i:s');
        }

        return sprintf('%04d-%02d-%02d %02d:%02d:%02d', $year, $month, $day, $hour, $min, $sec);
    }

    public function getUsers(): array
    {
        if (!$this->socket) return [];

        $raw = $this->requestData(self::CMD_USER_TEMP_RRQ);

        $users = [];
        if (strlen($raw) > 10) {
            $data = substr($raw, 10);
            while (strlen($data) > 72) {
                $record = substr($data, 0, 72);
                $userId = trim(str_replace(chr(0), '', substr($record, 48, 9)));
                $name = trim(str_replace(chr(0), '', substr($record, 13, 24)));
                if (!empty($userId)) {
                    $users[] = ['pin' => $userId, 'name' => $name];
                }
                $data = substr($data, 72);
            }
        }
        return $users;
    }

    public function getAttendance(): array
    {
        if (!$this->socket) return [];

        $raw = $this->requestData(self::CMD_ATT_LOG_RRQ);

        $logs = [];
        if (strlen($raw) > 10) {
            $data = substr($raw, 10);

            while (strlen($data) > 40) {
                $recordHex = bin2hex(substr($data, 0, 39));

                $u1 = hexdec(substr($recordHex, 4, 2));
                $u2 = hexdec(substr($recordHex, 6, 2));
                $uid = $u1 + ($u2 * 256);

                $badgeId = hex2bin(substr($recordHex, 8, 18));
                $badgeId = str_replace(chr(0), '', $badgeId);
                $badgeId = trim($badgeId);

                $state = hexdec(substr($recordHex, 56, 2));

                $tsHex = substr($recordHex, 58, 8);
                $tsReversed = self::reverseHex($tsHex);
                $ts = hexdec($tsReversed);
                $dateTime = self::decodeZKTime($ts);

                $type = hexdec(self::reverseHex(substr($recordHex, 66, 2)));

                if (!empty($badgeId) && preg_match('/^\d+$/', $badgeId)) {
                    $tipoMarcacion = 'Entrada';
                    if ($type == 1) $tipoMarcacion = 'Salida';
                    elseif ($type == 2) $tipoMarcacion = 'Refrigerio Inicio';
                    elseif ($type == 3) $tipoMarcacion = 'Refrigerio Fin';

                    $metodo = 'Huella';
                    if ($state == 0) $metodo = 'PIN';
                    elseif ($state == 1) $metodo = 'Huella';
                    elseif ($state == 2) $metodo = 'Tarjeta RFID';
                    elseif ($state == 15) $metodo = 'Rostro';

                    $logs[] = [
                        'pin' => $badgeId,
                        'fecha_hora' => $dateTime,
                        'tipo' => $tipoMarcacion,
                        'tipo_verificacion' => $metodo,
                    ];
                }

                $data = substr($data, 40);
            }
        }
        return $logs;
    }

    public function disconnect()
    {
        if ($this->socket) {
            $buf = $this->createHeader(self::CMD_EXIT, $this->session_id, $this->reply_id);
            @fwrite($this->socket, $buf);
            @fclose($this->socket);
        }
    }

    public static function syncDeviceHardware(Dispositivo $device): array
    {
        $zk = new self($device->direccion_ip, $device->puerto);
        $isConnected = $zk->connect();

        if (!$isConnected) {
            $device->update([
                'estado' => 'offline',
                'ultimo_pulso' => now(),
            ]);
            return [
                'success' => false,
                'message' => "No se pudo conectar al terminal biometrico en {$device->direccion_ip}:{$device->puerto}",
                'logs_synced' => 0,
            ];
        }

        $zk->disableDevice();
        $logs = $zk->getAttendance();
        $users = $zk->getUsers();
        $zk->enableDevice();
        $zk->disconnect();

        $newLogsCount = 0;
        foreach ($logs as $logData) {
            $empleado = Empleado::where('pin', $logData['pin'])
                ->orWhere('numero_documento', $logData['pin'])
                ->first();

            $fechaPartes = explode(' ', $logData['fecha_hora']);
            $fechaStr = $fechaPartes[0] ?? date('Y-m-d');
            $horaStr = $fechaPartes[1] ?? date('H:i:s');
            $fechaHoraFull = "{$fechaStr} {$horaStr}";

            $idMarcacion = 'zk-' . md5($device->id . '_' . $logData['pin'] . '_' . $logData['fecha_hora']);

            $exists = MarcacionAsistencia::where('id', $idMarcacion)->exists();
            if (!$exists) {
                MarcacionAsistencia::create([
                    'id' => $idMarcacion,
                    'fecha' => $fechaStr,
                    'hora' => $horaStr,
                    'fecha_hora' => $fechaHoraFull,
                    'empleado_id' => $empleado ? $empleado->id : null,
                    'nombre_empleado' => $empleado ? $empleado->nombre_completo : "Usuario PIN {$logData['pin']}",
                    'pin' => $logData['pin'],
                    'dispositivo_id' => $device->id,
                    'nombre_dispositivo' => $device->nombre,
                    'tipo' => $logData['tipo'],
                    'estado' => 'Escaneo exitoso',
                    'metodo_verificacion' => $logData['tipo_verificacion'],
                    'es_error' => false,
                    'trama_cruda' => json_encode($logData),
                ]);
                $newLogsCount++;
            }
        }

        $totalRegistros = count($logs);
        $totalUsuarios = count($users) > 0 ? count($users) : Empleado::count();

        $device->update([
            'estado' => 'online',
            'ultimo_pulso' => now(),
            'conteo_registros' => $totalRegistros > 0 ? $totalRegistros : $device->conteo_registros,
            'conteo_usuarios' => $totalUsuarios > 0 ? $totalUsuarios : $device->conteo_usuarios,
        ]);

        return [
            'success' => true,
            'message' => "Sincronizacion exitosa con {$device->nombre} ({$device->direccion_ip})",
            'logs_synced' => $newLogsCount,
            'total_logs' => $totalRegistros,
            'device' => $device->fresh(),
        ];
    }
}