<?php
require "../../config/connect.php";
require "../../config/cors.php";
require "../../config/authentication.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["error" => "Metodo non consentito"]);
    exit;
}

$auth = Auth::getInstance();
$auth->requireAuth();

if ($auth->logout()) {
    echo json_encode(["message" => "Logout effettuato con successo"]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Errore durante il logout"]);
}
