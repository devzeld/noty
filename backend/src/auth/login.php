<?php
require "../../config/connect.php";
require "../../config/cors.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["error" => "Metodo non consentito"]);
    exit;
}

$body = json_decode(file_get_contents("php://input"), true);
$login = trim($body["login"]    ?? "");
$password = $body["password"] ?? "";

if ($login === "" || $password === "") {
    http_response_code(400);
    echo json_encode(["error" => "login e password sono obbligatori"]);
    exit;
}

$db = DBHandler::getPDO();

$stmt = $db->prepare(
    "SELECT id, username, email, password_hash, deleted_at
    FROM accounts
    WHERE (username = ? OR email = ?)
    LIMIT 1"
);
$stmt->execute([$login, $login]);
$account = $stmt->fetch();

if ($account && $account["deleted_at"] !== null) {
    http_response_code(401);
    echo json_encode(["error" => "Account disabilitato"]);
    exit;
}

if (!$account || !password_verify($password, $account["password_hash"])) {
    http_response_code(401);
    echo json_encode(["error" => "Credenziali non valide"]);
    exit;
}

$token = bin2hex(random_bytes(32));
$expiresAt = date("Y-m-d H:i:s", strtotime("+7 days"));

try {
    $db->prepare(
        "DELETE FROM sessions WHERE user_id = ? AND expires_at < NOW()"
    )->execute([$account["id"]]);

    $stmt = $db->prepare(
        "INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)"
    );

    $stmt->execute([$account["id"], $token, $expiresAt]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Errore interno durante il login"]);
    exit;
}

if (password_needs_rehash($account["password_hash"], PASSWORD_BCRYPT, ["cost" => 12])) {
    $newHash = password_hash($password, PASSWORD_BCRYPT, ["cost" => 12]);
    $db->prepare(
        "UPDATE accounts SET password_hash = ? WHERE id = ?"
    )->execute([$newHash, $account["id"]]);
}

echo json_encode([
    "token" => $token,
    "expires_at" => $expiresAt,
    "user" => [
        "id" => (int) $account["id"],
        "username" => $account["username"],
        "email" => $account["email"],
    ],
]);
