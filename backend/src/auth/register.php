<?php

require "../../config/connect.php";
require "../../config/cors.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["error" => "Metodo non consentito"]);
    exit;
}

$body = json_decode(file_get_contents("php://input"), true);

$username = trim($body["username"] ?? "");
$email = trim($body["email"]    ?? "");
$password = $body["password"] ?? "";

if ($username === "" || $email === "" || $password === "") {
    http_response_code(400);
    echo json_encode(["error" => "username, email e password sono obbligatori"]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["error" => "Email non valida"]);
    exit;
}

if (strlen($username) < 3 || strlen($username) > 50) {
    http_response_code(400);
    echo json_encode(["error" => "Username deve essere tra 3 e 50 caratteri"]);
    exit;
}

if (strlen($password) < 8) {
    http_response_code(400);
    echo json_encode(["error" => "La password deve essere di almeno 8 caratteri"]);
    exit;
}

$db = DBHandler::getPDO();

$stmt = $db->prepare(
    "SELECT id FROM accounts WHERE username = ? OR email = ? LIMIT 1"
);
$stmt->execute([$username, $email]);

if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(["error" => "Username o email già in uso"]);
    exit;
}

$hash = password_hash($password, PASSWORD_BCRYPT, ["cost" => 12]);

try {
    $stmt = $db->prepare(
        "INSERT INTO accounts (username, email, password_hash) VALUES (?, ?, ?)"
    );
    $stmt->execute([$username, $email, $hash]);
    $userId = (int) $db->lastInsertId();
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Errore interno durante la registrazione"]);
    exit;
}

http_response_code(201);
echo json_encode([
    "message" => "Account creato con successo",
    "user_id" => $userId,
]);
