<?php
require "../config/connect.php";
require "../config/cors.php";

$db = DBHandler::getPDO();

$method = $_SERVER["REQUEST_METHOD"];

switch ($method) {
    case "GET":

        echo json_encode(["data" => 'get']);
        break;
    case "POST":
        $data = json_decode(file_get_contents("php://input"));
        echo json_encode(["data" => "post"]);
        break;
    case "PUT":
        $data = json_decode(file_get_contents("php://input"));
        echo json_encode(["data" => "put"]);
        break;
    case "DELETE":
        $data = json_decode(file_get_contents("php://input"));
        echo json_encode(["data" => "delete"]);
        break;
    default:
        echo json_encode(["message" => "Unsupported request method"]);
        break;
}
