<?php
require "./backend/config/connect.php";
require "./backend/config/cors.php";

$db = DBHandler::getPDO();

$method = $_SERVER["REQUEST_METHOD"];

switch ($method) {
    // GET: fetch all notes or just one note by its id or assigned tags
    case "GET":
        echo json_encode(["data" => "get"]);
        break;
    // POST: create a note
    case "POST":
        $data = json_decode(file_get_contents("php://input"));
        echo json_encode(["data" => "post"]);
        break;
    // PUT: update a note
    case "PUT":
        $data = json_decode(file_get_contents("php://input"));
        echo json_encode(["data" => "put"]);
        break;
    // DELETE: set a note to deleted
    case "DELETE":
        $data = json_decode(file_get_contents("php://input"));
        echo json_encode(["data" => "delete"]);
        break;
    default:
        echo json_encode(["message" => "Unsupported request method"]);
        break;
}
