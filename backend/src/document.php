<?php
require "../config/connect.php";
require "../config/cors.php";
require "/middleware/authentication.php";

$db = DBHandler::getPDO();
$user = Auth::getInstance()->user();

$method = $_SERVER["REQUEST_METHOD"];

switch ($method) {
    case "GET":
        $stmt = $this->db->prepare(
            "SELECT d.*
             FROM documents d
             INNER JOIN accounts a ON d.user_id = a.id
             WHERE a.id = ? AND d.created_at > NOW()
             ORDER BY d.created_at DESC"
        );
        $stmt->execute([$user["id"]]);
        $docs = $stmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode(["data" => $docs]);
        break;
    case "POST":
        $data = json_decode(file_get_contents("php://input"));

        //TODO: Creazione delle versioni del documento, con un sistema di versioning che permette di tenere traccia delle modifiche e di ripristinare versioni precedenti se necessario
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
