<?php
require_once __DIR__ . "/../middleware/bootstrap.php";

$auth = Auth::getInstance();
$auth->requireAuth();
$user = $auth->user();
$userId = (int) $user["id"];

$db = DBHandler::getPDO();
$method = $_SERVER["REQUEST_METHOD"];
$commentId = isset($_GET["id"]) ? (int) $_GET["id"] : null;
$docId = isset($_GET["doc_id"]) ? (int) $_GET["doc_id"] : null;

function requireDocAccess(PDO $db, int $docId, int $userId, string $minRole = "viewer"): void
{
    $roles = ["viewer" => 0, "editor" => 1, "owner" => 2];

    $stmt = $db->prepare(
        "SELECT d.owner_id, dp.role
         FROM documents d
         LEFT JOIN doc_permissions dp ON dp.doc_id = d.id AND dp.user_id = ?
         WHERE d.id = ? AND d.deleted_at IS NULL"
    );
    $stmt->execute([$userId, $docId]);
    $doc = $stmt->fetch();

    if (!$doc) {
        http_response_code(404);
        exit(json_encode(["error" => "Documento non trovato"]));
    }

    $role = $doc["owner_id"] === $userId ? "owner" : ($doc["role"] ?? null);

    if (!isset($roles[$role]) || $roles[$role] < $roles[$minRole])
        http_response_code(403);
        exit(json_encode(["error" => "Accesso non autorizzato"]));
    }
}

function requireComment(PDO $db, int $commentId, int $userId): array
{
    $stmt = $db->prepare(
        "SELECT * FROM comments WHERE id = ? AND deleted_at IS NULL"
    );
    $stmt->execute([$commentId]);
    $comment = $stmt->fetch();

    if (!$comment) {
        http_response_code(404);
        exit(json_encode(["error" => "Commento non trovato"]));
    }

    if ((int) $comment["user_id"] !== $userId) {
        http_response_code(403);
        exit(json_encode(["error" => "Non sei l'autore di questo commento"]));
    }

    return $comment;
}

switch ($method) {

    case "GET":
        if (!$docId) {
            http_response_code(400);
            exit(json_encode(["error" => "doc_id obbligatorio"]));
        }

        requireDocAccess($db, $docId, $userId);

        $stmt = $db->prepare(
            "SELECT c.*, a.username
             FROM comments c
             INNER JOIN accounts a ON c.user_id = a.id
             WHERE c.doc_id = ? AND c.deleted_at IS NULL
             ORDER BY c.parent_comment_id ASC, c.created_at ASC"
        );
        $stmt->execute([$docId]);
        $rows = $stmt->fetchAll();

        $map  = [];
        $tree = [];
        foreach ($rows as $row) {
            $row["replies"] = [];
            $map[$row["id"]] = $row;
        }
        foreach ($map as &$row) {
            if ($row["parent_comment_id"]) {
                $map[$row["parent_comment_id"]]["replies"][] = &$row;
            } else {
                $tree[] = &$row;
            }
        }

        echo json_encode(["data" => $tree]);
        break;

    case "POST":
        $body    = json_decode(file_get_contents("php://input"), true);
        $docId   = isset($body["doc_id"]) ? (int) $body["doc_id"] : null;
        $content = trim($body["content"] ?? "");
        $parentId = isset($body["parent_comment_id"]) ? (int) $body["parent_comment_id"] : null;
        $anchor  = $body["anchor_position"] ?? null;

        if (!$docId || empty($content)) {
            http_response_code(400);
            exit(json_encode(["error" => "doc_id e content sono obbligatori"]));
        }

        requireDocAccess($db, $docId, $userId);

        if ($parentId) {
            $stmt = $db->prepare(
                "SELECT id FROM comments WHERE id = ? AND doc_id = ? AND deleted_at IS NULL"
            );
            $stmt->execute([$parentId, $docId]);
            if (!$stmt->fetch()) {
                http_response_code(400);
                exit(json_encode(["error" => "Commento padre non valido"]));
            }
        }

        $stmt = $db->prepare(
            "INSERT INTO comments (doc_id, user_id, parent_comment_id, content, anchor_position)
             VALUES (?, ?, ?, ?, ?)"
        );
        $stmt->execute([$docId, $userId, $parentId, $content, $anchor]);
        $newId = (int) $db->lastInsertId();

        Logger::write($userId, "comment_created", $docId);

        http_response_code(201);
        echo json_encode(["message" => "Commento aggiunto", "id" => $newId]);
        break;

    case "PUT":
        if (!$commentId) {
            http_response_code(400);
            exit(json_encode(["error" => "ID commento obbligatorio"]));
        }

        $comment = requireComment($db, $commentId, $userId);
        $body    = json_decode(file_get_contents("php://input"), true);
        $content = trim($body["content"] ?? "");

        if (empty($content)) {
            http_response_code(400);
            exit(json_encode(["error" => "Il contenuto non può essere vuoto"]));
        }

        $db->prepare(
            "UPDATE comments SET content = ?, updated_at = NOW() WHERE id = ?"
        )->execute([$content, $commentId]);

        echo json_encode(["message" => "Commento aggiornato"]);
        break;

    case "DELETE":
        if (!$commentId) {
            http_response_code(400);
            exit(json_encode(["error" => "ID commento obbligatorio"]));
        }

        $stmt = $db->prepare(
            "SELECT c.*, d.owner_id AS doc_owner
             FROM comments c
             INNER JOIN documents d ON d.id = c.doc_id
             WHERE c.id = ? AND c.deleted_at IS NULL"
        );
        $stmt->execute([$commentId]);
        $comment = $stmt->fetch();

        if (!$comment) {
            http_response_code(404);
            exit(json_encode(["error" => "Commento non trovato"]));
        }

        if ((int) $comment["user_id"] !== $userId && (int) $comment["doc_owner"] !== $userId) {
            http_response_code(403);
            exit(json_encode(["error" => "Non autorizzato"]));
        }

        $db->prepare(
            "UPDATE comments SET deleted_at = NOW() WHERE id = ?"
        )->execute([$commentId]);

        echo json_encode(["message" => "Commento eliminato"]);
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Metodo non consentito"]);
}
