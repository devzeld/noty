<?php
require_once __DIR__ . "/../middleware/bootstrap.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    exit(json_encode(["error" => "Metodo non consentito"]));
}

$body = json_decode(file_get_contents("php://input"), true);
$username = trim($body["username"] ?? "");
$email = trim($body["email"] ?? "");
$password = $body["password"] ?? "";

if (empty($username) || empty($email) || empty($password)) {
    http_response_code(400);
    exit(json_encode(["error" => "Tutti i campi sono obbligatori"]));
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    exit(json_encode(["error" => "Email non valida"]));
}

if (strlen($username) < 3 || strlen($password) < 8) {
    http_response_code(400);
    exit(json_encode(["error" => "Requisiti minimi: Username (3), Password (8)"]));
}

$auth = Auth::getInstance();
$result = $auth->register($username, $email, $password);

if ($result["success"]) {
    http_response_code(201);
    echo json_encode(["success" => true, "message" => "Account creato con successo"]);
} else {
    http_response_code($result["code"]);
    echo json_encode(["error" => $result["error"]]);
}
