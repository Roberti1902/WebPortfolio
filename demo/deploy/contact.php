<?php
/*
 * Kontaktformular-Endpunkt für das IONOS-Webhosting. Läuft mit PHP 7.0 bis 8.x.
 * Nimmt die Anfrage per POST entgegen, prüft sie und schickt sie per mail() an deine Adresse.
 * Deine E-Mail-Adresse steht NICHT hier, sondern in contact-config.php im Ordner "/" (eine Ebene über htdocs),
 * dort ist sie nicht über das Web abrufbar. Vorlage: contact-config.example.php
 *
 * Selbsttest nach dem Upload: https://robertionescu.de/contact.php?check
 */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

function respond($code, $body)
{
    http_response_code($code);
    echo json_encode($body);
    exit;
}

function textLength($value)
{
    return function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : strlen($value);
}

/** Liest ein Formularfeld, kürzt Leerraum und prüft Pflicht/Länge. */
function field($name, $maxLength, $required = true)
{
    $value = isset($_POST[$name]) ? trim((string)$_POST[$name]) : '';
    if (($required && $value === '') || textLength($value) > $maxLength) {
        respond(422, array('ok' => false, 'error' => 'invalid', 'field' => $name));
    }
    return $value;
}

/** Zeilenumbrüche entfernen – verhindert, dass jemand zusätzliche Mail-Header einschleust. */
function oneLine($value)
{
    return preg_replace('/[\r\n]+/', ' ', $value);
}

function loadConfig()
{
    foreach (array(dirname(__DIR__) . '/contact-config.php', __DIR__ . '/contact-config.php') as $file) {
        if (@is_file($file)) {
            $config = require $file;
            if (is_array($config) && !empty($config['to']) && !empty($config['from'])) {
                return $config;
            }
        }
    }
    return null;
}

$config = loadConfig();

// Selbsttest: zeigt nur, OB alles bereit ist – keine Adressen
if (isset($_GET['check'])) {
    respond(200, array(
        'php'    => PHP_MAJOR_VERSION . '.' . PHP_MINOR_VERSION,
        'mail'   => function_exists('mail'),
        'config' => $config !== null,
    ));
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, array('ok' => false, 'error' => 'method'));
}
if ($config === null) {
    respond(500, array('ok' => false, 'error' => 'config'));
}

// Spam-Schutz 1: Honeypot – das versteckte Feld füllen nur Bots aus. Antwort "ok", damit der Bot nichts merkt.
if (!empty($_POST['website'])) {
    respond(200, array('ok' => true));
}

// Spam-Schutz 2: in weniger als 3 Sekunden ausgefüllt = Bot
$started = isset($_POST['started']) ? (float)$_POST['started'] : 0;
if ($started > 0 && microtime(true) * 1000 - $started < 3000) {
    respond(200, array('ok' => true));
}

// Spam-Schutz 3: höchstens 5 Anfragen pro IP und Stunde (die IP wird nur als Hash gespeichert)
$ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'unknown';
$rateFile = sys_get_temp_dir() . '/contact_' . hash('sha256', $ip);
$hits = json_decode((string)@file_get_contents($rateFile), true);
$recent = array();
foreach (is_array($hits) ? $hits : array() as $time) {
    if ($time > time() - 3600) {
        $recent[] = $time;
    }
}
if (count($recent) >= 5) {
    respond(429, array('ok' => false, 'error' => 'rate'));
}
$recent[] = time();
@file_put_contents($rateFile, json_encode($recent), LOCK_EX);

$topic = field('topic', 2);
if ($topic !== '3d' && $topic !== 'it') {
    respond(422, array('ok' => false, 'error' => 'invalid', 'field' => 'topic'));
}
$firstName = oneLine(field('firstName', 80));
$lastName  = oneLine(field('lastName', 80));
$email     = field('email', 200);
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(422, array('ok' => false, 'error' => 'invalid', 'field' => 'email'));
}
$company = oneLine(field('company', 120, false));
$phone   = oneLine(field('phone', 40, false));
$budget  = oneLine(field('budget', 40, false));
$message = field('message', 5000);
if (!isset($_POST['consent']) || $_POST['consent'] !== 'yes') {
    respond(422, array('ok' => false, 'error' => 'invalid', 'field' => 'consent'));
}

$area = $topic === '3d' ? '3D & Motion' : 'IT & Software';
$subject = '=?UTF-8?B?' . base64_encode("Portfolio-Anfrage [$area] von $firstName $lastName") . '?=';
$body = implode("\n", array(
    'Neue Anfrage über robertionescu.de',
    '',
    "Bereich:     $area",
    "Name:        $firstName $lastName",
    "E-Mail:      $email",
    'Unternehmen: ' . ($company !== '' ? $company : '–'),
    'Telefon:     ' . ($phone !== '' ? $phone : '–'),
    'Budget:      ' . ($budget !== '' ? $budget : 'noch offen'),
    '',
    'Nachricht:',
    $message,
    '',
    'Gesendet am ' . date('d.m.Y H:i'),
));
$headers = implode("\r\n", array(
    'From: Portfolio Kontaktformular <' . $config['from'] . '>', // Absender: Adresse deiner Domain
    'Reply-To: ' . $email,                                      // "Antworten" geht direkt an den Interessenten
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
));

// erst mit Envelope-Absender versuchen (bessere Zustellung), sonst ohne
$sent = @mail($config['to'], $subject, $body, $headers, '-f' . $config['from']);
if (!$sent) {
    $sent = @mail($config['to'], $subject, $body, $headers);
}
respond($sent ? 200 : 500, array('ok' => $sent));
