<?php
$ip = '192.168.10.202';
$port = 4370;

$fp = @fsockopen($ip, $port, $errno, $errstr, 3);
if ($fp) {
    echo "SOCKET_CONNECTED_OK\n";
    fclose($fp);
} else {
    echo "SOCKET_ERROR: $errstr ($errno)\n";
}
