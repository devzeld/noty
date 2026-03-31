<?php
require "../../config/connect.php";
require "../../config/cors.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["error" => "Metodo non consentito"]);
    exit;
}

$headers    = getallheaders();
$authHeader = $headers["Authorization"] ?? $headers["authorization"] ?? "";

if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    http_response_code(401);
    echo json_encode(["error" => "Token mancante"]);
    exit;
}

$token = $matches[1];
$db    = DBHandler::getPDO();

$stmt = $db->prepare(
    "SELECT id FROM sessions WHERE token = ? AND expires_at > NOW() LIMIT 1"
);
$stmt->execute([$token]);

if (!$stmt->fetch()) {
    http_response_code(401);
    echo json_encode(["error" => "Token non valido o già scaduto"]);
    exit;
}

$db->prepare(
    "DELETE FROM sessions WHERE token = ?"
)->execute([$token]);

setcookie(
    "token",
    "",
    [
        "expires" => time() - 3600,
        "path" => "/",
        "secure" => true,
        "httponly" => true,
        "samesite" => "None",
    ]
);

echo json_encode(["message" => "Logout effettuato con successo"]);
