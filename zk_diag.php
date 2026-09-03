<?php
/**
 * Script v4: Solo asistencia en sesión limpia (sin getUsers primero)
 * + Probar con disable device antes de leer
 */

class ZKProto
{
    private $ip, $port, $socket;
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

    public function __construct($ip, $port = 4370) { $this->ip = $ip; $this->port = $port; }

    public function connect()
    {
        $this->socket = @fsockopen("udp://{$this->ip}", $this->port, $errno, $errstr, 3);
        if (!$this->socket) return false;
        stream_set_timeout($this->socket, 5);

        $buf = $this->createHeader(self::CMD_CONNECT, 0, 0);
        fwrite($this->socket, $buf);
        $reply = fread($this->socket, 1024);

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
        if ($i) $chksum += $p['c' . strval(count($p))];
        while ($chksum > self::USHRT_MAX) $chksum -= self::USHRT_MAX;
        if ($chksum > 0) $chksum = -$chksum;
        else $chksum = abs($chksum);
        $chksum -= 1;
        while ($chksum < 0) $chksum += self::USHRT_MAX;

        $this->reply_id++;
        if ($this->reply_id >= self::USHRT_MAX) $this->reply_id -= self::USHRT_MAX;

        return pack('SSSS', $command, $chksum, $session_id, $this->reply_id) . $data;
    }

    public function disableDevice()
    {
        $buf = $this->createHeader(self::CMD_DISABLEDEVICE, $this->session_id, $this->reply_id);
        @fwrite($this->socket, $buf);
        $reply = @fread($this->socket, 1024);
        $header = unpack('scommand', substr($reply, 0, 2));
        echo "  disableDevice response: " . $header['command'] . "\n";
    }

    public function enableDevice()
    {
        $buf = $this->createHeader(self::CMD_ENABLEDEVICE, $this->session_id, $this->reply_id);
        @fwrite($this->socket, $buf);
        $reply = @fread($this->socket, 1024);
    }

    public function requestData($command, $cmdData = '')
    {
        $buf = $this->createHeader($command, $this->session_id, $this->reply_id, $cmdData);
        @fwrite($this->socket, $buf);

        $reply = @fread($this->socket, 1032);
        if (!$reply || strlen($reply) < 8) {
            echo "  No response!\n";
            return '';
        }

        $u = unpack('H2h1/H2h2/H2h3/H2h4/H2h5/H2h6/H2h7/H2h8', substr($reply, 0, 8));
        $cmdReply = hexdec($u['h2'] . $u['h1']);
        echo "  Cmd response: $cmdReply\n";

        if ($cmdReply == self::CMD_PREPARE_DATA) {
            $sizeData = unpack('H2h1/H2h2/H2h3/H2h4', substr($reply, 8, 4));
            $totalSize = hexdec($sizeData['h4'] . $sizeData['h3'] . $sizeData['h2'] . $sizeData['h1']);
            echo "  PREPARE_DATA: $totalSize bytes expected\n";

            $data = '';
            $received = 0;
            $errors = 0;
            $first = true;

            while ($received < $totalSize && $errors < 20) {
                $chunk = @fread($this->socket, 1032);
                if (!$chunk) {
                    $errors++;
                    usleep(100000); // 100ms
                    continue;
                }

                if ($first) {
                    $data .= $chunk;
                    $first = false;
                } else {
                    $data .= substr($chunk, 8);
                }
                $received += strlen($chunk);
                echo "  Received chunk: " . strlen($chunk) . " bytes (total: $received)\n";
            }

            // Free data
            $buf = $this->createHeader(self::CMD_FREE_DATA, $this->session_id, $this->reply_id);
            @fwrite($this->socket, $buf);
            @fread($this->socket, 1024);

            echo "  Total data: " . strlen($data) . " bytes\n";
            return $data;
        } elseif ($cmdReply == self::CMD_ACK_OK) {
            echo "  ACK_OK with data length: " . strlen($reply) . "\n";
            return $reply;
        }

        return $reply;
    }

    public function disconnect()
    {
        if ($this->socket) {
            $buf = $this->createHeader(self::CMD_EXIT, $this->session_id, $this->reply_id);
            @fwrite($this->socket, $buf);
            @fclose($this->socket);
        }
    }
}

function decodeZKTime($t)
{
    $sec = $t % 60; $t = floor($t / 60);
    $min = $t % 60; $t = floor($t / 60);
    $hour = $t % 24; $t = floor($t / 24);
    $day = ($t % 31) + 1; $t = floor($t / 31);
    $month = ($t % 12) + 1; $t = floor($t / 12);
    $year = floor($t) + 2000;
    return sprintf('%04d-%02d-%02d %02d:%02d:%02d', $year, $month, $day, $hour, $min, $sec);
}

function reverseHex($hex)
{
    $tmp = '';
    for ($i = strlen($hex); $i >= 0; $i--) {
        $tmp .= substr($hex, $i, 2);
        $i--;
    }
    return $tmp;
}

echo "=== TEST 1: Solo asistencia (sin getUsers) ===\n";
$zk = new ZKProto('192.168.10.206', 4370);
if (!$zk->connect()) die("CONNECT FAILED\n");
echo "Connected!\n";

$zk->disableDevice();
echo "\nRequesting attendance (CMD_ATT_LOG_RRQ = 13)...\n";
$attRaw = $zk->requestData(ZKProto::CMD_ATT_LOG_RRQ);
$zk->enableDevice();
$zk->disconnect();

echo "\nAttendance raw data length: " . strlen($attRaw) . "\n";

if (strlen($attRaw) > 10) {
    // Buscar DNI en los datos
    $dniPos = strpos($attRaw, '40869749');
    if ($dniPos !== false) {
        echo "DNI '40869749' FOUND at position $dniPos!\n";

        // Parsear todos los registros con formato de 40 bytes
        // Buscar el offset correcto
        $data = $attRaw;
        // Quitar bytes de header
        // La librería hace: $attData = substr($attData, 10);
        $data = substr($data, 10);

        echo "\nParsing records (40 bytes each) after skip 10 bytes...\n";
        $recNum = 0;
        while (strlen($data) > 40) {
            $u = bin2hex(substr($data, 0, 39));

            $u1 = hexdec(substr($u, 4, 2));
            $u2 = hexdec(substr($u, 6, 2));
            $uid = $u1 + ($u2 * 256);

            $id = hex2bin(substr($u, 8, 18));
            $id = str_replace(chr(0), '', $id);

            $state = hexdec(substr($u, 56, 2));

            $tsHex = substr($u, 58, 8);
            $tsReversed = reverseHex($tsHex);
            $ts = hexdec($tsReversed);
            $dt = decodeZKTime($ts);

            $type = hexdec(reverseHex(substr($u, 66, 2)));

            // Solo mostrar registros con IDs válidos
            if (!empty(trim($id))) {
                echo "  [$recNum] uid=$uid id='$id' state=$state type=$type ts='$dt'\n";
            }

            $data = substr($data, 40);
            $recNum++;
        }
        echo "Total records parsed: $recNum\n";
    } else {
        echo "DNI '40869749' NOT FOUND in attendance data\n";
        echo "HEX dump (first 200 bytes): " . bin2hex(substr($attRaw, 0, 200)) . "\n";
    }
} else {
    echo "NO attendance data returned (may be empty on device)\n";
    echo "Response hex: " . bin2hex($attRaw) . "\n";
}
