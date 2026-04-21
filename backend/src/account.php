<?php
require_once __DIR__ . "\middleware\bootstrap.php";

$auth = Auth::getInstance();
$auth->requireAuth();
$user = $auth->user();
$userId = (int) $user["id"];

$db = DBHandler::getPDO();
$method = $_SERVER["REQUEST_METHOD"];

switch ($method) {
    case "GET":
        $stmt = $db->prepare(
            "SELECT id, username, email, created_at, updated_at FROM accounts WHERE id = ?"
        );
        $stmt->execute([$userId]);
        echo json_encode(["data" => $stmt->fetch()]);
        break;

    case "PUT":
        $body = json_decode(file_get_contents("php://input"), true);
        $username = isset($body["username"]) ? trim($body["username"]) : null;
        $email = isset($body["email"])    ? trim($body["email"])    : null;

        if ($username === null && $email === null) {
            http_response_code(400);
            exit(json_encode(["error" => "Nessun campo da aggiornare"]));
        }

        if ($username !== null && strlen($username) < 3) {
            http_response_code(400);
            exit(json_encode(["error" => "Username troppo corto (minimo 3 caratteri)"]));
        }

        if ($email !== null && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            exit(json_encode(["error" => "Email non valida"]));
        }

        if ($username !== null) {
            $stmt = $db->prepare("SELECT id FROM accounts WHERE username = ? AND id != ?");
            $stmt->execute([$username, $userId]);
            if ($stmt->fetch()) {
                http_response_code(409);
                exit(json_encode(["error" => "Username già in uso"]));
            }
        }

        if ($email !== null) {
            $stmt = $db->prepare("SELECT id FROM accounts WHERE email = ? AND id != ?");
            $stmt->execute([$email, $userId]);
            if ($stmt->fetch()) {
                http_response_code(409);
                exit(json_encode(["error" => "Email già in uso"]));
            }
        }

        $fields = [];
        $params = [];

        if ($username !== null) {
            $fields[] = "username = ?";
            $params[] = $username;
        }
        if ($email !== null) {
            $fields[] = "email = ?";
            $params[] = $email;
        }
        $params[] = $userId;

        $db->prepare(
            "UPDATE accounts SET " . implode(", ", $fields) . ", updated_at = NOW() WHERE id = ?"
        )->execute($params);

        echo json_encode(["message" => "Profilo aggiornato"]);
        break;

    case "PATCH":
        $body = json_decode(file_get_contents("php://input"), true);
        $current = $body["current_password"] ?? "";
        $newPassword = $body["new_password"]     ?? "";

        if (empty($current) || empty($newPassword)) {
            http_response_code(400);
            exit(json_encode(["error" => "current_password e new_password sono obbligatori"]));
        }

        if (strlen($newPassword) < 8) {
            http_response_code(400);
            exit(json_encode(["error" => "La nuova password deve essere di almeno 8 caratteri"]));
        }

        $stmt = $db->prepare("SELECT password_hash FROM accounts WHERE id = ?");
        $stmt->execute([$userId]);
        $account = $stmt->fetch();

        if (!password_verify($current, $account["password_hash"])) {
            http_response_code(401);
            exit(json_encode(["error" => "Password attuale non corretta"]));
        }

        if (password_verify($newPassword, $account["password_hash"])) {
            http_response_code(400);
            exit(json_encode(["error" => "La nuova password deve essere diversa da quella attuale"]));
        }

        $hash = password_hash($newPassword, PASSWORD_BCRYPT, ["cost" => 12]);
        $db->prepare("UPDATE accounts SET password_hash = ?, updated_at = NOW() WHERE id = ?")
            ->execute([$hash, $userId]);

        $db->prepare(
            "DELETE FROM sessions WHERE user_id = ? AND token != ?"
        )->execute([$userId, $auth->getToken()]);

        echo json_encode(["message" => "Password aggiornata"]);
        break;

    case "DELETE":
        $body = json_decode(file_get_contents("php://input"), true);
        $password = $body["password"] ?? "";

        if (empty($password)) {
            http_response_code(400);
            exit(json_encode(["error" => "La password è obbligatoria per eliminare l'account"]));
        }

        $stmt = $db->prepare("SELECT password_hash FROM accounts WHERE id = ?");
        $stmt->execute([$userId]);
        $account = $stmt->fetch();

        if (!password_verify($password, $account["password_hash"])) {
            http_response_code(401);
            exit(json_encode(["error" => "Password non corretta"]));
        }

        $db->beginTransaction();
        try {
            $db->prepare("DELETE FROM sessions WHERE user_id = ?")->execute([$userId]);

            $db->prepare(
                "UPDATE accounts SET deleted_at = NOW(), updated_at = NOW() WHERE id = ?"
            )->execute([$userId]);

            $db->commit();
        } catch (PDOException $e) {
            $db->rollBack();
            http_response_code(500);
            exit(json_encode(["error" => "Errore durante la cancellazione"]));
        }

        setcookie("token", "", [
            "expires" => time() - 3600,
            "path" => "/",
            "secure" => true,
            "httponly" => true,
            "samesite" => "None",
        ]);

        echo json_encode(["message" => "Account eliminato"]);
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Metodo non consentito"]);
}
