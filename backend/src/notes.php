<?php
require "./backend/config/connect.php";
require "./backend/config/cors.php";

$db = DBHandler::getPDO();

$method = $_SERVER["REQUEST_METHOD"];

switch ($method) {
    // GET: fetch all notes or just one note
    case "GET":
        $id = isset($_GET['id']) ? $_GET['id'] : null;
        $tags = isset($_GET['tags']) ? explode(',', $_GET['tags']) : [];

        $sql = "SELECT * FROM notes";
        $params = [];

        if (!empty($tags)) {
            $sql .= " JOIN note_tags ON notes.id = note_tags.note_id
                      JOIN tags ON note_tags.tag_id = tags.id";
        }

        $sql .= " WHERE notes.deleted_at IS NULL";

        if ($user_id !== null) {
            $sql .= " AND notes.user_id = ?";
            $params[] = $user_id;

            if ($id !== null) {
                $sql .= " AND notes.id = ?";
                $params[] = $id;
            }

            if (!empty($tags)) {
                $placeholders = rtrim(str_repeat('?,', count($tags)), ',');
                $sql .= " AND tags.name IN ($placeholders)";
                $params = array_merge($params, $tags);
                $sql .= " GROUP BY notes.id";
            }

            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            $notes = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($notes as &$note) {
                $stmt = $pdo->prepare("
                    SELECT tags.id, tags.name
                    FROM tags
                    JOIN note_tags ON tags.id = note_tags.tag_id
                    WHERE note_tags.note_id = ?
                ");
                $stmt->execute([$note['id']]);
                $note['tags'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            }
            http_response_code(200);
            echo json_encode(['data' => $notes]);
        } else {
            http_response_code(400);
        }

        break;
    // POST: create a note
    case "POST":
        $data = json_decode(file_get_contents("php://input"));
        break;
    // PUT: update a note
    case "PUT":
        $data = json_decode(file_get_contents("php://input"));
        break;
    // DELETE: set a note to deleted
    case "DELETE":
        $data = json_decode(file_get_contents("php://input"));
        break;
    default:
        echo json_encode(["message" => "Unsupported request method"]);
        break;
}
