<?php
require "../../config/connect.php";
require "../../config/cors.php";
require "../../config/authentication.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    exit(json_encode(["error" => "Metodo non consentito"]));
}

$body = json_decode(file_get_contents("php://input"), true);
$login = trim($body["login"] ?? "");
$password = $body["password"] ?? "";

if (empty($login) || empty($password)) {
    http_response_code(400);
    exit(json_encode(["error" => "Login e password sono obbligatori"]));
}

$auth = Auth::getInstance();
$result = $auth->attempt($login, $password);

if ($result["success"]) {
    echo json_encode($result);
} else {
    http_response_code(401);
    echo json_encode(["error" => $result["error"]]);
}
