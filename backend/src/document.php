<?php
require_once __DIR__ . "\..\middleware\bootstrap.php";

$auth = Auth::getInstance();
$auth->requireAuth();
$user = $auth->user();
$userId = (int) $user["id"];

$db = DBHandler::getPDO();
$method = $_SERVER["REQUEST_METHOD"];

$docId = isset($_GET["id"]) ? (int) $_GET["id"] : null;

function requireDocPermission(PDO $db, int $docId, int $userId, string $minRole = "viewer"): array
{
    $roles = ["viewer" => 0, "editor" => 1, "owner" => 2];

    $stmt = $db->prepare(
        "SELECT d.*, dp.role
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

    if ($role === null || $roles[$role] < $roles[$minRole]) {
        http_response_code(403);
        exit(json_encode(["error" => "Accesso non autorizzato"]));
    }

    $doc["_role"] = $role;
    return $doc;
}

function createVersion(PDO $db, int $docId, int $userId, string $title, string $content): void
{
    try {
        $db->beginTransaction();
        $stmt = $db->prepare(
            "SELECT COALESCE(MAX(version_number), 0) + 1 AS next
             FROM versions
             WHERE doc_id = ?
             FOR UPDATE"
        );
        $stmt->execute([$docId]);
        $nextVersion = (int) $stmt->fetchColumn();

        $stmt = $db->prepare(
            "INSERT INTO versions (doc_id, user_id, title, content, version_number)
             VALUES (?, ?, ?, ?, ?)"
        );
        $stmt->execute([$docId, $userId, $title, $content, $nextVersion]);

        $db->commit();
    } catch (Exception $e) {
        $db->rollBack();
        throw $e;
    }
}

switch ($method) {
    case "GET":
        if ($docId) {
            $doc = requireDocPermission($db, $docId, $userId, "viewer");

            $stmt = $db->prepare(
                "SELECT t.id, t.name, t.color
                 FROM tags t
                 INNER JOIN doc_tags dt ON dt.tag_id = t.id
                 WHERE dt.doc_id = ?"
            );
            $stmt->execute([$docId]);
            $doc["tags"] = $stmt->fetchAll();

            echo json_encode(["data" => $doc]);
        } else {
            $folderId = isset($_GET["folder_id"]) ? (int) $_GET["folder_id"] : null;
            $search   = isset($_GET["q"]) ? "%" . trim($_GET["q"]) . "%" : null;

            $sql = "SELECT d.id, d.owner_id, d.folder_id, d.title, d.created_at, d.updated_at,
                           COALESCE(dp.role, 'owner') AS role
                    FROM documents d
                    LEFT JOIN doc_permissions dp ON dp.doc_id = d.id AND dp.user_id = :uid
                    WHERE d.deleted_at IS NULL
                      AND (d.owner_id = :uid OR dp.user_id = :uid)";

            $params = [":uid" => $userId];

            if ($folderId !== null) {
                $sql .= " AND d.folder_id = :fid";
                $params[":fid"] = $folderId;
            }
            if ($search) {
                $sql .= " AND (d.title LIKE :q OR d.content LIKE :q)";
                $params[":q"] = $search;
            }

            $sql .= " ORDER BY d.updated_at DESC";

            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            $docs = $stmt->fetchAll();

            echo json_encode(["data" => $docs]);
        }
        break;

    case "POST":
        $body    = json_decode(file_get_contents("php://input"), true);
        $title   = trim($body["title"] ?? "Nuova documento");
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

        $db->prepare(
            "INSERT INTO doc_permissions (doc_id, user_id, role) VALUES (?, ?, 'owner')"
        )->execute([$newDocId, $userId]);

        createVersion($db, $newDocId, $userId, $title, $content);

        if (!empty($tagIds)) {
            $ins = $db->prepare("INSERT IGNORE INTO doc_tags (doc_id, tag_id) VALUES (?, ?)");
            foreach ($tagIds as $tid) {
                $ins->execute([$newDocId, (int) $tid]);
            }
        }

        Logger::write($userId, "document_created", $newDocId, $folderId);

        http_response_code(201);
        echo json_encode(["message" => "Documento creato", "id" => $newDocId]);
        break;

    case "PUT":
        if (!$docId) {
            http_response_code(400);
            exit(json_encode(["error" => "ID documento obbligatorio"]));
        }

        $doc  = requireDocPermission($db, $docId, $userId, "editor");
        $body = json_decode(file_get_contents("php://input"), true);

        $title    = isset($body["title"])   ? trim($body["title"])  : $doc["title"];
        $content  = isset($body["content"]) ? $body["content"]      : $doc["content"];
        $folderId = array_key_exists("folder_id", $body) ? ($body["folder_id"] ? (int) $body["folder_id"] : null) : $doc["folder_id"];
        $tagIds   = $body["tag_ids"] ?? null;

        if ($content !== $doc["content"] || $title !== $doc["title"]) {
            createVersion($db, $docId, $userId, $doc["title"], $doc["content"]);
        }

        $db->prepare(
            "UPDATE documents SET title = ?, content = ?, folder_id = ?, updated_at = NOW()
             WHERE id = ?"
        )->execute([$title, $content, $folderId, $docId]);

        if ($tagIds !== null) {
            $db->prepare("DELETE FROM doc_tags WHERE doc_id = ?")->execute([$docId]);
            if (!empty($tagIds)) {
                $ins = $db->prepare("INSERT IGNORE INTO doc_tags (doc_id, tag_id) VALUES (?, ?)");
                foreach ($tagIds as $tid) {
                    $ins->execute([$docId, (int) $tid]);
                }
            }
        }

        Logger::write($userId, "document_updated", $docId);

        echo json_encode(["message" => "Documento aggiornato"]);
        break;

    case "DELETE":
        if (!$docId) {
            http_response_code(400);
            exit(json_encode(["error" => "ID documento obbligatorio"]));
        }

        requireDocPermission($db, $docId, $userId, "owner");

        $db->prepare(
            "UPDATE documents SET deleted_at = NOW() WHERE id = ?"
        )->execute([$docId]);

        Logger::write($userId, "document_deleted", $docId);

        echo json_encode(["message" => "Documento eliminato"]);
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Metodo non consentito"]);
}
