<?php
require_once __DIR__ . "\..\middleware\bootstrap.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    exit(json_encode(["error" => "Metodo non consentito"]));
}

$body = json_decode(file_get_contents("php://input"), true);
$identifier = trim($body["identifier"] ?? "");
$password = $body["password"] ?? "";

if (empty($identifier) || empty($password)) {
    http_response_code(400);
    exit(json_encode(["error" => "Identificatore e password sono obbligatori"]));
}

$auth = Auth::getInstance();
$result = $auth->attempt($identifier, $password);

if ($result["success"]) {
    echo json_encode($result);
} else {
    http_response_code(401);
    echo json_encode(["error" => $result["error"]]);
}
