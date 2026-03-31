<?php
require "../../config/connect.php";
require "../../config/cors.php";
require "../../config/Auth.php";

$auth = Auth::getInstance();
$auth->requireAuth();

$result = $auth->refresh();

if ($result) {
    echo json_encode($result);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Impossibile rigenerare il token"]);
}
