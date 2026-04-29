<?php
require_once ROOT . "/config/connect.php";

class Auth
{
    private static $instance = null;
    private $user = null;
    private $db;
    private $token = null;

    private function __construct()
    {
        $this->db = DBHandler::getPDO();
        $this->extractToken();
    }

    public static function getInstance()
    {
        if (self::$instance == null) {
            self::$instance = new Auth();
        }
        return self::$instance;
    }

    private function extractToken()
    {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';
        if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            $this->token = $matches[1];
            return;
        }

        if (isset($_COOKIE['token'])) {
            $this->token = $_COOKIE['token'];
        }
    }

    public function authenticate()
    {
        if (!$this->token) {
            return false;
        }

        $stmt = $this->db->prepare(
            "SELECT a.id, a.username, a.email 
             FROM sessions s
             INNER JOIN accounts a ON s.user_id = a.id
             WHERE s.token = ? AND s.expires_at > NOW()
             LIMIT 1"
        );
        $stmt->execute([$this->token]);
        $this->user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($this->user) {
            if (!defined('USER_ID')) {
                define('USER_ID', $this->user['id']);
            }
            return true;
        }

        return false;
    }

    public function user()
    {
        return $this->user;
    }

    public function getToken()
    {
        return $this->token;
    }

    public function requireAuth()
    {
        if (!$this->authenticate()) {
            http_response_code(401);
            echo json_encode(["error" => "Non autenticato o token scaduto"]);
            exit;
        }
    }

    public function register($username, $email, $password)
    {
        $stmt = $this->db->prepare("SELECT id FROM accounts WHERE username = ? OR email = ? LIMIT 1");
        $stmt->execute([$username, $email]);
        if ($stmt->fetch()) {
            return ["success" => false, "error" => "Username o email già in uso", "code" => 409];
        }

        $hash = password_hash($password, PASSWORD_BCRYPT, ["cost" => 12]);

        try {
            $stmt = $this->db->prepare("INSERT INTO accounts (username, email, password_hash) VALUES (?, ?, ?)");
            $stmt->execute([$username, $email, $hash]);
            $userId = (int)$this->db->lastInsertId();

            $stmt = $this->db->prepare("INSERT INTO profiles (user_id, avatar_url) VALUES (?, ?)");
            $stmt->execute([$userId, null]);

            $stmt = $this->db->prepare("INSERT INTO settings (user_id) VALUES (?)");
            $stmt->execute([$userId]);

            return ["success" => true, "user_id" => $userId];
        } catch (PDOException $e) {
            return ["success" => false, "error" => "Errore interno durante la registrazione", "code" => 500];
        }
    }

    public function attempt($identifier, $password)
    {
        $stmt = $this->db->prepare(
            "SELECT id, username, email, password_hash, deleted_at
        FROM accounts
        WHERE (username = ? OR email = ?)
        LIMIT 1"
        );
        $stmt->execute([$identifier, $identifier]);
        $account = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$account || $account["deleted_at"] !== null) {
            return ["success" => false, "error" => "Credenziali non valide o account disabilitato"];
        }

        if (!password_verify($password, $account["password_hash"])) {
            return ["success" => false, "error" => "Credenziali non valide"];
        }

        $token = bin2hex(random_bytes(32));
        $expiresAtTimestamp = strtotime("+7 days");
        $expiresAt = date("Y-m-d H:i:s", $expiresAtTimestamp);

        $this->db->prepare("DELETE FROM sessions WHERE user_id = ? AND expires_at < NOW()")->execute([$account["id"]]);
        $stmt = $this->db->prepare("INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)");
        $stmt->execute([$account["id"], $token, $expiresAt]);

        if (password_needs_rehash($account["password_hash"], PASSWORD_BCRYPT, ["cost" => 12])) {
            $newHash = password_hash($password, PASSWORD_BCRYPT, ["cost" => 12]);
            $this->db->prepare("UPDATE accounts SET password_hash = ? WHERE id = ?")->execute([$newHash, $account["id"]]);
        }

        setcookie("token", $token, [
            "expires"  => $expiresAtTimestamp,
            "path"     => "/",
            "secure"   => false,
            "httponly" => true,
        ]);

        return [
            "success" => true,
            "token" => $token,
            "expires_at" => $expiresAt,
            "user" => [
                "id" => (int)$account["id"],
                "username" => $account["username"],
                "email" => $account["email"]
            ]
        ];
    }

    public function logout()
    {
        if (!$this->token) return false;

        $stmt = $this->db->prepare("DELETE FROM sessions WHERE token = ?");
        $stmt->execute([$this->token]);

        setcookie("token", "", [
            "expires"  => time() - 3600,
            "path"     => "/",
            "secure"   => false,
            "httponly" => true,
        ]);

        $this->user = null;
        $this->token = null;
        return true;
    }

    public function refresh()
    {
        if (!$this->token || !$this->user) return false;

        $newToken = bin2hex(random_bytes(32));
        $expiresAtTimestamp = strtotime("+7 days");
        $expiresAt = date("Y-m-d H:i:s", $expiresAtTimestamp);

        $stmt = $this->db->prepare(
            "UPDATE sessions SET token = ?, expires_at = ? WHERE token = ?"
        );
        $stmt->execute([$newToken, $expiresAt, $this->token]);

        if ($stmt->rowCount() > 0) {
            setcookie("token", $newToken, [
                "expires"  => $expiresAtTimestamp,
                "path"     => "/",
                "secure"   => false,
                "httponly" => true,
            ]);
            if (headers_sent($file, $line)) {
                die("Errore critico: i cookie non possono essere salvati perché l'output è iniziato nel file $file alla riga $line");
            }

            $this->token = $newToken;
            return [
                "token" => $newToken,
                "expires_at" => $expiresAt
            ];
        }

        error_log("Refresh fallito: rowCount è 0. Il token vecchio era: " . $this->token);
        return false;
    }
}
