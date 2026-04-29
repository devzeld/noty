<?php
require_once __DIR__ . "/middleware/bootstrap.php";

$auth = Auth::getInstance();
$auth->requireAuth();

$user = $auth->user();

echo json_encode([
    "user" => [
        "id" => (int) $user["id"],
        "username" => $user["username"],
        "email" => $user["email"],
    ],
    "token" => $auth->getToken()
]);
