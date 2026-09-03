<?php

class ZKLib
{
    private $ip;
    private $port;
    private $socket;
    private $session_id = 0;
    private $reply_id = 0;

    const CMD_CONNECT = 1000;
    const CMD_EXIT = 1001;
    const CMD_ENABLEDEVICE = 1002;
    const CMD_DISABLEDEVICE = 1003;
    const CMD_GET_TIME = 201;
    const CMD_ATTLOG_RRQ = 13;
    const CMD_USER_TEMP_RRQ = 9;
    const CMD_ACK_OK = 2000;
    const CMD_PREPARE_DATA = 1500;
    const CMD_DATA = 1501;

    public function __construct($ip, $port = 4370)
    {
        $this->ip = $ip;
        $this->port = $port;
    }

    public function connect()
    {
        $this->socket = @fsockopen("udp://{$this->ip}", $this->port, $errno, $errstr, 3);
        if (!$this->socket) return false;
        stream_set_timeout($this->socket, 3);

        $command_string = '';
        $buf = $this->createHeader(self::CMD_CONNECT, 0, 0, $command_string);

        fwrite($this->socket, $buf);
        $reply = fread($this->socket, 1024);

        if (strlen($reply) >= 8) {
            $header = unpack('scommand/schksum/ssession_id/sreply_id', substr($reply, 0, 8));
            $this->session_id = $header['session_id'];
            return true;
        }

        return false;
    }

    private function createHeader($command, $session_id, $reply_id, $data = '')
    {
        $buf = pack('SSSS', $command, 0, $session_id, $reply_id) . $data;
        $chksum = $this->createChkSum($buf);
        return pack('SSSS', $command, $chksum, $session_id, $reply_id) . $data;
    }

    private function createChkSum($pbuf)
    {
        $l = strlen($pbuf);
        $chksum = 0;
        $i = 0;
        while ($l > 1) {
            $u = unpack('S', substr($pbuf, $i, 2));
            $chksum += $u[1];
            if ($chksum > 65535) {
                $chksum -= 65535;
            }
            $i += 2;
            $l -= 2;
        }
        if ($l) {
            $u = unpack('C', substr($pbuf, $i, 1));
            $chksum += $u[1];
            if ($chksum > 65535) {
                $chksum -= 65535;
            }
        }
        $chksum = ~$chksum;
        while ($chksum < 0) {
            $chksum += 65536;
        }
        return $chksum;
    }

    public function getUsers()
    {
        if (!$this->socket) return [];
        $buf = $this->createHeader(self::CMD_USER_TEMP_RRQ, $this->session_id, $this->reply_id, pack('C', 5));
        fwrite($this->socket, $buf);
        
        $users = [];
        $bytes = '';
        while ($chunk = @fread($this->socket, 1024)) {
            $bytes .= $chunk;
            if (strlen($chunk) < 1024) break;
        }

        if (strlen($bytes) > 8) {
            $data = substr($bytes, 8);
            // Cada usuario ocupa aproximadamente 72 o 40 bytes dependiendo de la version del firmware
            $count = floor(strlen($data) / 72);
            for ($i = 0; $i < $count; $i++) {
                $uData = substr($data, $i * 72, 72);
                if (strlen($uData) >= 72) {
                    $pin = trim(substr($uData, 48, 8));
                    $name = trim(substr($uData, 8, 24));
                    if (!empty($pin)) {
                        $users[] = ['pin' => $pin, 'name' => $name];
                    }
                }
            }
        }
        return $users;
    }

    public function getAttendance()
    {
        if (!$this->socket) return [];
        $buf = $this->createHeader(self::CMD_ATTLOG_RRQ, $this->session_id, $this->reply_id);
        fwrite($this->socket, $buf);

        $bytes = '';
        while ($chunk = @fread($this->socket, 2048)) {
            $bytes .= $chunk;
            if (strlen($chunk) < 2048) break;
        }

        $logs = [];
        if (strlen($bytes) > 8) {
            $data = substr($bytes, 8);
            // En ZKTeco la estructura de cada marcacion es de 40 bytes (o 16 bytes en dispositivos clasicos)
            $recordSize = (strlen($data) % 40 === 0) ? 40 : 16;
            $count = floor(strlen($data) / $recordSize);

            for ($i = 0; $i < $count; $i++) {
                $record = substr($data, $i * $recordSize, $recordSize);
                if ($recordSize === 40) {
                    $u = unpack('s1user_id/c1state/c1type/I1timestamp', substr($record, 0, 12));
                    $pin = trim(substr($record, 0, 24));
                    $timestamp = $u['timestamp'];
                } else {
                    $u = unpack('s1user_id/c1state/c1type/I1timestamp', $record);
                    $pin = (string)$u['user_id'];
                    $timestamp = $u['timestamp'];
                }

                $sec = $timestamp % 60;
                $t = floor($timestamp / 60);
                $min = $t % 60;
                $t = floor($t / 60);
                $hour = $t % 24;
                $t = floor($t / 24);
                $day = ($t % 31) + 1;
                $t = floor($t / 31);
                $month = ($t % 12) + 1;
                $t = floor($t / 12);
                $year = $t + 2000;

                $dtStr = sprintf('%04d-%02d-%02d %02d:%02d:%02d', $year, $month, $day, $hour, $min, $sec);

                $logs[] = [
                    'pin' => $pin,
                    'timestamp' => $dtStr,
                    'raw_ts' => $timestamp,
                    'state' => $u['state'] ?? 0,
                    'type' => $u['type'] ?? 0,
                ];
            }
        }
        return $logs;
    }

    public function disconnect()
    {
        if ($this->socket) {
            $buf = $this->createHeader(self::CMD_EXIT, $this->session_id, $this->reply_id);
            @fwrite($this->socket, $buf);
            fclose($this->socket);
        }
    }
}

$zk = new ZKLib('192.168.10.206', 4370);
if ($zk->connect()) {
    echo "ZK_CONNECTED_OK\n";
    $users = $zk->getUsers();
    echo "USERS_FOUND: " . count($users) . "\n";
    if (count($users) > 0) {
        echo "=== USUARIOS ENROLADOS EN EL DISPOSITIVO ===\n";
        print_r($users);
    }
    $logs = $zk->getAttendance();
    echo "\nATTENDANCE_LOGS_FOUND: " . count($logs) . "\n";
    echo "=== PRIMEROS 10 REGISTROS ===\n";
    print_r(array_slice($logs, 0, 10));
    $zk->disconnect();
} else {
    echo "ZK_CONNECT_FAILED\n";
}
