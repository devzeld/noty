<?php
require_once __DIR__ . "/../middleware/bootstrap.php";

$auth = Auth::getInstance();
$auth->requireAuth();
$user = $auth->user();
$userId = (int) $user["id"];

$db = DBHandler::getPDO();
$method = $_SERVER["REQUEST_METHOD"];
$tagId  = isset($_GET["id"]) ? (int) $_GET["id"] : null;

function requireTag(PDO $db, int $tagId, int $userId): array
{
    $stmt = $db->prepare("SELECT * FROM tags WHERE id = ? AND user_id = ? AND deleted_at IS NULL");
    $stmt->execute([$tagId, $userId]);
    $tag = $stmt->fetch();

    if (!$tag) {
        http_response_code(404);
        exit(json_encode(["error" => "Tag non trovato"]));
    }
    return $tag;
}

switch ($method) {

    // ── GET /tag.php          → tutti i tag dell'utente
    // ── GET /tag.php?id=N     → tag singolo con documenti associati
    case "GET":
        if ($tagId) {
            $tag = requireTag($db, $tagId, $userId);

            $stmt = $db->prepare(
                "SELECT d.id, d.title, d.updated_at
                 FROM documents d
                 INNER JOIN doc_tags dt ON dt.doc_id = d.id
                 WHERE dt.tag_id = ? AND d.deleted_at IS NULL
                 ORDER BY d.updated_at DESC"
            );
            $stmt->execute([$tagId]);
            $tag["documents"] = $stmt->fetchAll();

            echo json_encode(["data" => $tag]);
        } else {
            $stmt = $db->prepare(
                "SELECT t.*, COUNT(dt.doc_id) AS doc_count
                 FROM tags t
                 LEFT JOIN doc_tags dt ON dt.tag_id = t.id
                 WHERE t.user_id = ?
                 GROUP BY t.id
                 ORDER BY t.name ASC"
            );
            $stmt->execute([$userId]);
            echo json_encode(["data" => $stmt->fetchAll()]);
        }
        break;

    // ── POST /tag.php  → crea tag
    case "POST":
        $body  = json_decode(file_get_contents("php://input"), true);
        $name  = trim($body["name"] ?? "");
        $color = trim($body["color"] ?? "#6b8fa8");

        if (empty($name)) {
            http_response_code(400);
            exit(json_encode(["error" => "Il nome è obbligatorio"]));
        }

        if (!preg_match('/^#[0-9a-fA-F]{6}$/', $color)) {
            http_response_code(400);
            exit(json_encode(["error" => "Colore non valido (formato: #rrggbb)"]));
        }

        // Nome univoco per utente
        $stmt = $db->prepare("SELECT id FROM tags WHERE user_id = ? AND name = ?");
        $stmt->execute([$userId, $name]);
        if ($stmt->fetch()) {
            http_response_code(409);
            exit(json_encode(["error" => "Tag già esistente"]));
        }

        $stmt = $db->prepare("INSERT INTO tags (user_id, name, color) VALUES (?, ?, ?)");
        $stmt->execute([$userId, $name, $color]);
        $newId = (int) $db->lastInsertId();

        Logger::write($userId, "tag_created", null, null, $newId);

        http_response_code(201);
        echo json_encode(["message" => "Tag creato", "id" => $newId]);
        break;

    // ── PUT /tag.php?id=N  → modifica tag
    case "PUT":
        if (!$tagId) {
            http_response_code(400);
            exit(json_encode(["error" => "ID tag obbligatorio"]));
        }

        $tag   = requireTag($db, $tagId, $userId);
        $body  = json_decode(file_get_contents("php://input"), true);
        $name  = isset($body["name"])  ? trim($body["name"])  : $tag["name"];
        $color = isset($body["color"]) ? trim($body["color"]) : $tag["color"];

        if (empty($name)) {
            http_response_code(400);
            exit(json_encode(["error" => "Il nome non può essere vuoto"]));
        }

        if (!preg_match('/^#[0-9a-fA-F]{6}$/', $color)) {
            http_response_code(400);
            exit(json_encode(["error" => "Colore non valido (formato: #rrggbb)"]));
        }

        $db->prepare(
            "UPDATE tags SET name = ?, color = ?, updated_at = NOW() WHERE id = ?"
        )->execute([$name, $color, $tagId]);

        Logger::write($userId, "tag_updated", null, null, $tagId);

        echo json_encode(["message" => "Tag aggiornato"]);
        break;

    // ── DELETE /tag.php?id=N  → elimina tag (la cascade rimuove i doc_tags)
    case "DELETE":
        if (!$tagId) {
            http_response_code(400);
            exit(json_encode(["error" => "ID tag obbligatorio"]));
        }

        requireTag($db, $tagId, $userId);

        $db->prepare("UPDATE tags SET deleted_at = NOW() WHERE id = ?")->execute([$tagId]);

        Logger::write($userId, "tag_deleted", null, null, $tagId);

        echo json_encode(["message" => "Tag eliminato"]);
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Metodo non consentito"]);
}
