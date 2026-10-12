<?php
/*
 * Kontaktformular-Endpunkt für das IONOS-Webhosting (PHP).
 * Nimmt die Anfrage per POST entgegen, prüft sie und schickt sie per mail() an deine Adresse.
 * Deine E-Mail-Adresse steht NICHT hier, sondern in contact-config.php eine Ebene über htdocs
 * (dort ist sie nicht über das Web abrufbar) – Vorlage: contact-config.example.php
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

function respond(int $code, array $body): void
{
    http_response_code($code);
    echo json_encode($body);
    exit;
}

/** Liest ein Formularfeld, kürzt Leerraum und prüft Pflicht/Länge. */
function field(string $name, int $maxLength, bool $required = true): string
{
    $value = trim((string)($_POST[$name] ?? ''));
    if (($required && $value === '') || mb_strlen($value) > $maxLength) {
        respond(422, ['ok' => false, 'error' => 'invalid', 'field' => $name]);
    }
    return $value;
}

/** Zeilenumbrüche entfernen – verhindert, dass jemand zusätzliche Mail-Header einschleust. */
function oneLine(string $value): string
{
    return preg_replace('/[\r\n]+/', ' ', $value);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, ['ok' => false, 'error' => 'method']);
}

$configFile = dirname(__DIR__) . '/contact-config.php';
if (!is_file($configFile)) {
    $configFile = __DIR__ . '/contact-config.php'; // Notlösung, falls "/" nicht beschreibbar ist
}
if (!is_file($configFile)) {
    respond(500, ['ok' => false, 'error' => 'config']);
}
$config = require $configFile;

// Spam-Schutz 1: Honeypot – das versteckte Feld füllen nur Bots aus. Antwort "ok", damit der Bot nichts merkt.
if (($_POST['website'] ?? '') !== '') {
    respond(200, ['ok' => true]);
}

// Spam-Schutz 2: in weniger als 3 Sekunden ausgefüllt = Bot
$started = (int)($_POST['started'] ?? 0);
if ($started > 0 && (int)(microtime(true) * 1000) - $started < 3000) {
    respond(200, ['ok' => true]);
}

// Spam-Schutz 3: höchstens 5 Anfragen pro IP und Stunde (IP wird nur gehasht gespeichert)
$rateFile = sys_get_temp_dir() . '/contact_' . hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown');
$hits = json_decode((string)@file_get_contents($rateFile), true);
$hits = array_values(array_filter(is_array($hits) ? $hits : [], fn($t) => $t > time() - 3600));
if (count($hits) >= 5) {
    respond(429, ['ok' => false, 'error' => 'rate']);
}
$hits[] = time();
@file_put_contents($rateFile, json_encode($hits), LOCK_EX);

$topic = field('topic', 2);
if (!in_array($topic, ['3d', 'it'], true)) {
    respond(422, ['ok' => false, 'error' => 'invalid', 'field' => 'topic']);
}
$firstName = oneLine(field('firstName', 80));
$lastName  = oneLine(field('lastName', 80));
$email     = field('email', 200);
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(422, ['ok' => false, 'error' => 'invalid', 'field' => 'email']);
}
$company = oneLine(field('company', 120, false));
$phone   = oneLine(field('phone', 40, false));
$need    = oneLine(field('need', 120));
$budget  = oneLine(field('budget', 40, false));
$message = field('message', 5000);
if (($_POST['consent'] ?? '') !== 'yes') {
    respond(422, ['ok' => false, 'error' => 'invalid', 'field' => 'consent']);
}

$area = $topic === '3d' ? '3D & Motion' : 'IT & Software';
$subject = "Portfolio-Anfrage [$area] von $firstName $lastName";
$body = implode("\n", [
    "Neue Anfrage über robertionescu.de",
    "",
    "Bereich:     $area",
    "Thema:       $need",
    "Name:        $firstName $lastName",
    "E-Mail:      $email",
    "Unternehmen: " . ($company ?: '–'),
    "Telefon:     " . ($phone ?: '–'),
    "Budget:      " . ($budget ?: 'noch offen'),
    "",
    "Nachricht:",
    $message,
    "",
    "Gesendet am " . date('d.m.Y H:i'),
]);
$headers = [
    'From'         => $config['from'],  // Absender muss eine Adresse deiner IONOS-Domain sein
    'Reply-To'     => $email,           // "Antworten" geht direkt an den Interessenten
    'Content-Type' => 'text/plain; charset=UTF-8',
];

$sent = mail($config['to'], '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headers, '-f' . $config['from']);
respond($sent ? 200 : 500, ['ok' => $sent]);
