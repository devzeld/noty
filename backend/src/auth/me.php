<?php
require "../../config/connect.php";
require "../../config/cors.php";

$token = $_COOKIE["token"] ?? null;

if (!$token) {
    http_response_code(401);
    echo json_encode(["error" => "Non autenticato"]);
    exit;
}

$db = DBHandler::getPDO();
$stmt = $db->prepare(
    "SELECT a.id, a.username, a.email
     FROM sessions s
     JOIN accounts a ON a.id = s.user_id
     WHERE s.token = ? AND s.expires_at > NOW()
     LIMIT 1"
);
$stmt->execute([$token]);
$user = $stmt->fetch();

if (!$user) {
    http_response_code(401);
    echo json_encode(["error" => "Sessione scaduta"]);
    exit;
}

echo json_encode([
    "user" => [
        "id"       => (int) $user["id"],
        "username" => $user["username"],
        "email"    => $user["email"],
    ],
    "token" => $token,
]);
