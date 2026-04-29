<?php
require_once __DIR__ . "/middleware/bootstrap.php";

$auth = Auth::getInstance();
$auth->requireAuth();
$user = $auth->user();
$userId = (int) $user["id"];

$db = DBHandler::getPDO();
$method = $_SERVER["REQUEST_METHOD"];

try {
    switch ($method) {
        case "GET":
            $stmt = $db->prepare("
                SELECT 
                    a.id, a.username, a.email, a.created_at,
                    p.display_name, p.avatar_url
                FROM accounts a
                LEFT JOIN profiles p ON a.id = p.user_id
                WHERE a.id = ? AND a.deleted_at IS NULL
            ");
            $stmt->execute([$userId]);
            $profile = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$profile) {
                http_response_code(404);
                exit(json_encode(["error" => "Account non trovato"]));
            }

            $profile['display_name'] = $profile['display_name'] ?? $profile['username'];

            echo json_encode(["data" => $profile]);
            break;

        case "PUT":
            $body = json_decode(file_get_contents("php://input"), true);

            $displayName = isset($body['display_name']) ? trim($body['display_name']) : null;
            $avatarUrl = isset($body['avatar_url']) ? trim($body['avatar_url']) : null;

            $sql = "INSERT INTO profiles (user_id, display_name, avatar_url) 
                    VALUES (?, ?, ?)
                    ON DUPLICATE KEY UPDATE 
                        display_name = VALUES(display_name),
                        avatar_url = VALUES(avatar_url)";

            $stmt = $db->prepare($sql);
            $stmt->execute([$userId, $displayName, $avatarUrl]);

            if (isset($body['email'])) {
                $newEmail = trim($body['email']);
                $check = $db->prepare("SELECT id FROM accounts WHERE email = ? AND id != ?");
                $check->execute([$newEmail, $userId]);
                if ($check->rowCount() === 0) {
                    $updateAcc = $db->prepare("UPDATE accounts SET email = ? WHERE id = ?");
                    $updateAcc->execute([$newEmail, $userId]);
                } else {
                    http_response_code(409);
                    exit(json_encode(["error" => "Email già in uso da un altro utente"]));
                }
            }

            echo json_encode(["message" => "Profilo aggiornato con successo"]);
            break;

        default:
            http_response_code(405);
            echo json_encode(["error" => "Metodo non consentito"]);
            break;
    }

} catch (PDOException $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(["error" => "Errore interno del server durante l'aggiornamento del profilo"]);
}