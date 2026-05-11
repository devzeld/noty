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
            $stmt = $db->prepare("SELECT theme_preference FROM settings WHERE user_id = ?");
            $stmt->execute([$userId]);
            $settings = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$settings) {
                $settings = [
                    "theme_preference" => "light"
                ];
            }

            echo json_encode(["success" => true, "data" => $settings]);
            break;

        case "PUT":
            $body = json_decode(file_get_contents("php://input"), true);

            $themePreference = isset($body['theme_preference']) ? trim($body['theme_preference']) : 'light';

            $sql = "INSERT INTO settings (user_id, theme_preference) 
                    VALUES (?, ?)
                    ON DUPLICATE KEY UPDATE 
                        theme_preference = VALUES(theme_preference)";
            $stmt = $db->prepare($sql);
            $stmt->execute([$userId, $themePreference]);

            echo json_encode(["success" => true, "message" => "Impostazioni aggiornate con successo"]);
            break;

        default:
            http_response_code(405);
            echo json_encode(["success" => false, "error" => "Metodo non consentito"]);
            break;
    }

} catch (PDOException $e) {
    error_log("Errore Settings: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Errore interno del server durante l'aggiornamento delle impostazioni"]);
}