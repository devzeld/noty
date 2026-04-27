<?php
require_once __DIR__ . "\middleware\bootstrap.php";

$auth = Auth::getInstance();
$auth->requireAuth();
$user = $auth->user();
$userId = (int) $user["id"];

$db = DBHandler::getPDO();
$method = $_SERVER["REQUEST_METHOD"];

$docId = isset($_GET["id"]) ? (int) $_GET["id"] : null;

switch ($method) {
    case "GET":
        if ($docId) {
            $stmt = $db->prepare(
                "SELECT * FROM documents 
                 WHERE id = ? AND owner_id = ? AND deleted_at IS NULL"
            );
            $stmt->execute([$docId, $userId]);
            $doc = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$doc) {
                http_response_code(404);
                exit(json_encode(["error" => "Documento non trovato o non autorizzato"]));
            }

            $stmt = $db->prepare(
                "SELECT t.id, t.name, t.color
                 FROM tags t
                 INNER JOIN doc_tags dt ON dt.tag_id = t.id
                 WHERE dt.doc_id = ?"
            );
            $stmt->execute([$docId]);
            $doc["tags"] = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(["data" => $doc]);
        } else {
            $folderId = $_GET["folder_id"] ?? null;
            $search = isset($_GET["q"]) ? "%" . trim($_GET["q"]) . "%" : null;
            $areFavorite = isset($_GET["fav"]) ? (bool) $_GET["fav"] : null;
            $areDeleted = isset($_GET["trashed"]) ? (bool) $_GET["trashed"] : null;

            $sql = "SELECT d.id, d.folder_id, d.title, d.created_at, d.updated_at, d.favorite
                    FROM documents d
                    WHERE d.deleted_at IS NULL
                      AND d.owner_id = :uid";

            $params = [":uid" => $userId];

            if ($folderId === "null") {
                $sql .= " AND d.folder_id IS NULL";
            } elseif ($folderId !== null) {
                $sql .= " AND d.folder_id = :fid";
                $params[":fid"] = (int) $folderId;
            }
            if ($search) {
                $sql .= " AND (d.title LIKE :q OR d.content LIKE :q)";
                $params[":q"] = $search;
            }
            if ($areFavorite !== null) {
                $sql .= " AND d.favorite = :fav";
                $params[":fav"] = $areFavorite;
            }

            if ($areDeleted !== null) {
                $sql .= " AND d.deleted_at IS " . ($areDeleted ? "NOT NULL" : "NULL");
            }

            $sql .= " ORDER BY d.updated_at DESC";

            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            $docs = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(["data" => $docs]);
        }
        break;

    case "POST":
        $body = json_decode(file_get_contents("php://input"), true);
        $title = trim($body["title"] ?? "Nuova documento");
        $content = $body["content"] ?? "";
        $folderId = isset($body["folder_id"]) ? (int) $body["folder_id"] : null;
        $tagIds  = $body["tag_ids"] ?? [];

        if ($folderId) {
            $stmt = $db->prepare("SELECT id FROM folders WHERE id = ? AND user_id = ? AND deleted_at IS NULL");
            $stmt->execute([$folderId, $userId]);
            if (!$stmt->fetch()) {
                http_response_code(400);
                exit(json_encode(["error" => "Cartella non valida"]));
            }
        }

        $stmt = $db->prepare(
            "INSERT INTO documents (owner_id, folder_id, title, content) VALUES (?, ?, ?, ?)"
        );
        $stmt->execute([$userId, $folderId, $title, $content]);
        $newDocId = (int) $db->lastInsertId();

        if (!empty($tagIds)) {
            $ins = $db->prepare("INSERT IGNORE INTO doc_tags (doc_id, tag_id) VALUES (?, ?)");
            foreach ($tagIds as $tid) {
                $ins->execute([$newDocId, (int) $tid]);
            }
        }

        http_response_code(201);
        echo json_encode(["message" => "Documento creato", "id" => $newDocId]);
        break;

    case "PUT":
        if (!$docId) {
            http_response_code(400);
            exit(json_encode(["error" => "ID documento obbligatorio"]));
        }

        $stmt = $db->prepare("SELECT * FROM documents WHERE id = ? AND owner_id = ? AND deleted_at IS NULL");
        $stmt->execute([$docId, $userId]);
        $doc = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$doc) {
            http_response_code(404);
            exit(json_encode(["error" => "Documento non trovato o non autorizzato"]));
        }

        $body = json_decode(file_get_contents("php://input"), true);

        $title = isset($body["title"])   ? trim($body["title"])  : $doc["title"];
        $content = isset($body["content"]) ? $body["content"]      : $doc["content"];
        $folderId = array_key_exists("folder_id", $body) ? ($body["folder_id"] ? (int) $body["folder_id"] : null) : $doc["folder_id"];
        $tagIds = $body["tag_ids"] ?? null;

        $db->prepare(
            "UPDATE documents SET title = ?, content = ?, folder_id = ?, updated_at = NOW()
             WHERE id = ? AND owner_id = ?"
        )->execute([$title, $content, $folderId, $docId, $userId]);

        if ($tagIds !== null) {
            $db->prepare("DELETE FROM doc_tags WHERE doc_id = ?")->execute([$docId]);
            if (!empty($tagIds)) {
                $ins = $db->prepare("INSERT IGNORE INTO doc_tags (doc_id, tag_id) VALUES (?, ?)");
                foreach ($tagIds as $tid) {
                    $ins->execute([$docId, (int) $tid]);
                }
            }
        }

        echo json_encode(["message" => "Documento aggiornato"]);
        break;

    case "DELETE":
        if (!$docId) {
            http_response_code(400);
            exit(json_encode(["error" => "ID documento obbligatorio"]));
        }

        $db->prepare(
            "UPDATE documents SET deleted_at = NOW() WHERE id = ? AND owner_id = ?"
        )->execute([$docId, $userId]);

        echo json_encode(["message" => "Documento eliminato"]);
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Metodo non consentito"]);
}
