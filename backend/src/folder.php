<?php
require_once __DIR__ . "/middleware/bootstrap.php";

$auth = Auth::getInstance();
$auth->requireAuth();
$user = $auth->user();
$userId = (int) $user["id"];

$db = DBHandler::getPDO();
$method = $_SERVER["REQUEST_METHOD"];
$folderId = isset($_GET["id"]) ? (int) $_GET["id"] : null;

function requireFolder(PDO $db, int $folderId, int $userId): array
{
    $stmt = $db->prepare(
        "SELECT * FROM folders WHERE id = ? AND user_id = ? AND deleted_at IS NULL"
    );
    $stmt->execute([$folderId, $userId]);
    $folder = $stmt->fetch();

    if (!$folder) {
        http_response_code(404);
        exit(json_encode(["error" => "Cartella non trovata"]));
    }
    return $folder;
}

function wouldCreateCycle(PDO $db, int $folderId, int $newParentId): bool
{
    $current = $newParentId;
    $visited = [];
    while ($current !== null) {
        if ($current === $folderId) {
            return true;
        }
        if (in_array($current, $visited)) {
            break;
        }
        $visited[] = $current;
        $stmt = $db->prepare("SELECT parent_folder_id FROM folders WHERE id = ?");
        $stmt->execute([$current]);
        $row = $stmt->fetch();
        $current = $row ? $row["parent_folder_id"] : null;
    }
    return false;
}

switch ($method) {

    case "GET":
        if ($folderId) {
            requireFolder($db, $folderId, $userId);

            $stmt = $db->prepare(
                "SELECT * FROM folders WHERE parent_folder_id = ? AND user_id = ? AND deleted_at IS NULL
                 ORDER BY name ASC"
            );
            $stmt->execute([$folderId, $userId]);
            $subfolders = $stmt->fetchAll();

            $stmt = $db->prepare(
                "SELECT id, title, updated_at FROM documents
                 WHERE folder_id = ? AND owner_id = ? AND deleted_at IS NULL
                 ORDER BY updated_at DESC"
            );
            $stmt->execute([$folderId, $userId]);
            $docs = $stmt->fetchAll();

            echo json_encode(["data" => ["folders" => $subfolders, "documents" => $docs]]);
        } else {
            $stmt = $db->prepare(
                "SELECT * FROM folders WHERE parent_folder_id IS NULL AND user_id = ? AND deleted_at IS NULL
                 ORDER BY name ASC"
            );
            $stmt->execute([$userId]);
            echo json_encode(["data" => $stmt->fetchAll()]);
        }
        break;

    case "POST":
        $body = json_decode(file_get_contents("php://input"), true);
        $name = trim($body["name"] ?? "");
        $parentId = isset($body["parent_folder_id"]) ? (int) $body["parent_folder_id"] : null;

        if (empty($name)) {
            http_response_code(400);
            exit(json_encode(["error" => "Il nome è obbligatorio"]));
        }

        if ($parentId) {
            requireFolder($db, $parentId, $userId);
        }

        $stmt = $db->prepare(
            "INSERT INTO folders (user_id, parent_folder_id, name) VALUES (?, ?, ?)"
        );
        $stmt->execute([$userId, $parentId, $name]);
        $newId = (int) $db->lastInsertId();

        http_response_code(201);
        echo json_encode(["message" => "Cartella creata", "id" => $newId]);
        break;

    case "PUT":
        if (!$folderId) {
            http_response_code(400);
            exit(json_encode(["error" => "ID cartella obbligatorio"]));
        }

        $folder = requireFolder($db, $folderId, $userId);
        $body = json_decode(file_get_contents("php://input"), true);

        $name = isset($body["name"]) ? trim($body["name"]) : $folder["name"];
        $parentId = array_key_exists("parent_folder_id", $body)
            ? ($body["parent_folder_id"] ? (int) $body["parent_folder_id"] : null)
            : $folder["parent_folder_id"];

        if (empty($name)) {
            http_response_code(400);
            exit(json_encode(["error" => "Il nome non può essere vuoto"]));
        }

        if ($parentId && wouldCreateCycle($db, $folderId, $parentId)) {
            http_response_code(400);
            exit(json_encode(["error" => "Impossibile spostare una cartella dentro se stessa"]));
        }

        if ($parentId) {
            requireFolder($db, $parentId, $userId);
        }

        $db->prepare(
            "UPDATE folders SET name = ?, parent_folder_id = ?, updated_at = NOW() WHERE id = ?"
        )->execute([$name, $parentId, $folderId]);

        echo json_encode(["message" => "Cartella aggiornata"]);
        break;

    case "DELETE":
        if (!$folderId) {
            http_response_code(400);
            exit(json_encode(["error" => "ID cartella obbligatorio"]));
        }

        requireFolder($db, $folderId, $userId);

        $db->prepare(
            "UPDATE documents SET folder_id = NULL WHERE folder_id = ?"
        )->execute([$folderId]);

        $db->prepare(
            "UPDATE folders SET deleted_at = NOW() WHERE id = ?"
        )->execute([$folderId]);

        echo json_encode(["message" => "Cartella eliminata"]);
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Metodo non consentito"]);
}
