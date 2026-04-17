<?php
require_once __DIR__ . "\..\middleware\bootstrap.php";

$auth = Auth::getInstance();
$auth->requireAuth();
$user = $auth->user();
$userId = (int) $user["id"];

$db = DBHandler::getPDO();
$method = $_SERVER["REQUEST_METHOD"];
$docId  = isset($_GET["doc_id"]) ? (int) $_GET["doc_id"] : null;

function requireOwner(PDO $db, int $docId, int $userId): void
{
    $stmt = $db->prepare(
        "SELECT id FROM documents WHERE id = ? AND owner_id = ? AND deleted_at IS NULL"
    );
    $stmt->execute([$docId, $userId]);
    if (!$stmt->fetch()) {
        http_response_code(403);
        exit(json_encode(["error" => "Solo il proprietario può gestire i permessi"]));
    }
}

switch ($method) {

    case "GET":
        if (!$docId) {
            http_response_code(400);
            exit(json_encode(["error" => "doc_id obbligatorio"]));
        }

        requireOwner($db, $docId, $userId);

        $stmt = $db->prepare(
            "SELECT dp.id, dp.user_id, dp.role, dp.created_at,
                    a.username, a.email
             FROM doc_permissions dp
             INNER JOIN accounts a ON a.id = dp.user_id
             WHERE dp.doc_id = ?
             ORDER BY dp.role DESC, a.username ASC"
        );
        $stmt->execute([$docId]);
        echo json_encode(["data" => $stmt->fetchAll()]);
        break;

    case "POST":
        $body = json_decode(file_get_contents("php://input"), true);
        $docId = isset($body["doc_id"]) ? (int) $body["doc_id"] : null;
        $role = $body["role"] ?? "viewer";
        $login = trim($body["login"] ?? "");

        if (!$docId || empty($login)) {
            http_response_code(400);
            exit(json_encode(["error" => "doc_id e login sono obbligatori"]));
        }

        if (!in_array($role, ["editor", "viewer"])) {
            http_response_code(400);
            exit(json_encode(["error" => "Ruolo non valido (editor o viewer)"]));
        }

        requireOwner($db, $docId, $userId);

        $stmt = $db->prepare(
            "SELECT id FROM accounts WHERE (username = ? OR email = ?) AND deleted_at IS NULL LIMIT 1"
        );
        $stmt->execute([$login, $login]);
        $target = $stmt->fetch();

        if (!$target) {
            http_response_code(404);
            exit(json_encode(["error" => "Utente non trovato"]));
        }

        $targetId = (int) $target["id"];

        if ($targetId === $userId) {
            http_response_code(400);
            exit(json_encode(["error" => "Non puoi condividere il documento con te stesso"]));
        }

        $stmt = $db->prepare(
            "INSERT INTO doc_permissions (doc_id, user_id, role)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE role = VALUES(role), updated_at = NOW()"
        );
        $stmt->execute([$docId, $targetId, $role]);

        Logger::write($userId, "permission_granted", $docId);

        http_response_code(201);
        echo json_encode(["message" => "Permesso assegnato"]);
        break;

    case "PUT":
        if (!$docId) {
            http_response_code(400);
            exit(json_encode(["error" => "doc_id obbligatorio"]));
        }

        requireOwner($db, $docId, $userId);

        $body = json_decode(file_get_contents("php://input"), true);
        $targetId = isset($body["user_id"]) ? (int) $body["user_id"] : null;
        $role = $body["role"] ?? null;

        if (!$targetId || !$role) {
            http_response_code(400);
            exit(json_encode(["error" => "user_id e role sono obbligatori"]));
        }

        if (!in_array($role, ["editor", "viewer"])) {
            http_response_code(400);
            exit(json_encode(["error" => "Ruolo non valido"]));
        }

        $stmt = $db->prepare(
            "UPDATE doc_permissions SET role = ?, updated_at = NOW()
             WHERE doc_id = ? AND user_id = ?"
        );
        $stmt->execute([$role, $docId, $targetId]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            exit(json_encode(["error" => "Permesso non trovato"]));
        }

        echo json_encode(["message" => "Ruolo aggiornato"]);
        break;

    case "DELETE":
        if (!$docId) {
            http_response_code(400);
            exit(json_encode(["error" => "doc_id obbligatorio"]));
        }

        requireOwner($db, $docId, $userId);

        $body = json_decode(file_get_contents("php://input"), true);
        $targetId = isset($body["user_id"]) ? (int) $body["user_id"] : null;

        if (!$targetId) {
            http_response_code(400);
            exit(json_encode(["error" => "user_id obbligatorio"]));
        }

        $db->prepare(
            "DELETE FROM doc_permissions WHERE doc_id = ? AND user_id = ?"
        )->execute([$docId, $targetId]);

        Logger::write($userId, "permission_revoked", $docId);

        echo json_encode(["message" => "Accesso revocato"]);
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Metodo non consentito"]);
}
