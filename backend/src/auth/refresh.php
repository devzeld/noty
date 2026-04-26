<?php
require_once __DIR__ . "\..\middleware\bootstrap.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    exit(json_encode(["error" => "Metodo non consentito"]));
}

$auth = Auth::getInstance();
$auth->requireAuth();

$result = $auth->refresh();

if ($result) {
    echo json_encode($result);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Impossibile rigenerare il token"]);
}
