<?php
require "../../config/connect.php";
require "../../config/cors.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["error" => "Metodo non consentito"]);
    exit;
}

$headers = getallheaders();
$authHeader = $headers["Authorization"] ?? $headers["authorization"] ?? "";

if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    http_response_code(401);
    echo json_encode(["error" => "Token mancante"]);
    exit;
}

$oldToken = $matches[1];
$db = DBHandler::getPDO();

$stmt = $db->prepare(
    "SELECT s.id AS session_id, s.user_id, a.deleted_at
     FROM sessions s
     INNER JOIN accounts a ON s.user_id = a.id
     WHERE s.token = ? AND s.expires_at > NOW()
     LIMIT 1"
);
$stmt->execute([$oldToken]);
$session = $stmt->fetch();

if (!$session) {
    http_response_code(401);
    echo json_encode(["error" => "Token non valido o scaduto"]);
    exit;
}

if ($session["deleted_at"] !== null) {
    http_response_code(401);
    echo json_encode(["error" => "Account disabilitato"]);
    exit;
}

$newToken  = bin2hex(random_bytes(32));
$expiresAt = date("Y-m-d H:i:s", strtotime("+7 days"));

try {
    $db->beginTransaction();

    $db->prepare(
        "DELETE FROM sessions WHERE id = ?"
    )->execute([$session["session_id"]]);

    $db->prepare(
        "INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)"
    )->execute([$session["user_id"], $newToken, $expiresAt]);

    $db->commit();
} catch (PDOException $e) {
    $db->rollBack();
    http_response_code(500);
    echo json_encode(["error" => "Errore interno durante il refresh"]);
    exit;
}

echo json_encode([
    "token" => $newToken,
    "expires_at" => $expiresAt,
]);
