<?php
require_once __DIR__ . "\..\middleware\bootstrap.php";

$auth = Auth::getInstance();
$auth->requireAuth();
$user = $auth->user();
$userId = (int) $user["id"];

$db = DBHandler::getPDO();
$method = $_SERVER["REQUEST_METHOD"];
$docId = isset($_GET["doc_id"]) ? (int) $_GET["doc_id"] : null;
$verId = isset($_GET["version_id"]) ? (int) $_GET["version_id"] : null;

function requireDocAccess(PDO $db, int $docId, int $userId, string $minRole = "viewer"): array
{
    $roles = ["viewer" => 0, "editor" => 1, "owner" => 2];

    $stmt = $db->prepare(
        "SELECT d.*, COALESCE(dp.role, IF(d.owner_id = ?, 'owner', NULL)) AS role
         FROM documents d
         LEFT JOIN doc_permissions dp ON dp.doc_id = d.id AND dp.user_id = ?
         WHERE d.id = ? AND d.deleted_at IS NULL"
    );
    $stmt->execute([$userId, $userId, $docId]);
    $doc = $stmt->fetch();

    if (!$doc || $doc["role"] === null) {
        http_response_code(404);
        exit(json_encode(["error" => "Documento non trovato o accesso negato"]));
    }

    if ($roles[$doc["role"]] < $roles[$minRole]) {
        http_response_code(403);
        exit(json_encode(["error" => "Permessi insufficienti"]));
    }

    return $doc;
}

switch ($method) {

    case "GET":
        if (!$docId) {
            http_response_code(400);
            exit(json_encode(["error" => "doc_id obbligatorio"]));
        }

        requireDocAccess($db, $docId, $userId);

        if ($verId) {
            $stmt = $db->prepare(
                "SELECT v.*, a.username
                 FROM versions v
                 INNER JOIN accounts a ON a.id = v.user_id
                 WHERE v.id = ? AND v.doc_id = ?"
            );
            $stmt->execute([$verId, $docId]);
            $version = $stmt->fetch();

            if (!$version) {
                http_response_code(404);
                exit(json_encode(["error" => "Versione non trovata"]));
            }

            echo json_encode(["data" => $version]);
        } else {
            $stmt = $db->prepare(
                "SELECT v.id, v.version_number, v.title, v.created_at, a.username
                 FROM versions v
                 INNER JOIN accounts a ON a.id = v.user_id
                 WHERE v.doc_id = ?
                 ORDER BY v.version_number DESC"
            );
            $stmt->execute([$docId]);
            echo json_encode(["data" => $stmt->fetchAll()]);
        }
        break;

    case "POST":
        $body = json_decode(file_get_contents("php://input"), true);
        $docId = isset($body["doc_id"]) ? (int) $body["doc_id"] : null;
        $verId = isset($body["version_id"]) ? (int) $body["version_id"] : null;

        if (!$docId || !$verId) {
            http_response_code(400);
            exit(json_encode(["error" => "doc_id e version_id sono obbligatori"]));
        }

        requireDocAccess($db, $docId, $userId, "editor");

        $stmt = $db->prepare(
            "SELECT title, content FROM versions WHERE id = ? AND doc_id = ?"
        );
        $stmt->execute([$verId, $docId]);
        $version = $stmt->fetch();

        if (!$version) {
            http_response_code(404);
            exit(json_encode(["error" => "Versione non trovata"]));
        }

        $stmt = $db->prepare("SELECT title, content FROM documents WHERE id = ?");
        $stmt->execute([$docId]);
        $current = $stmt->fetch();

        $stmt = $db->prepare(
            "SELECT COALESCE(MAX(version_number), 0) + 1 FROM versions WHERE doc_id = ?"
        );
        $stmt->execute([$docId]);
        $nextVer = (int) $stmt->fetchColumn();

        $db->prepare(
            "INSERT INTO versions (doc_id, user_id, title, content, version_number)
             VALUES (?, ?, ?, ?, ?)"
        )->execute([$docId, $userId, $current["title"], $current["content"], $nextVer]);

        $db->prepare(
            "UPDATE documents SET title = ?, content = ?, updated_at = NOW() WHERE id = ?"
        )->execute([$version["title"], $version["content"], $docId]);

        echo json_encode(["message" => "Versione ripristinata"]);
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Metodo non consentito"]);
}
