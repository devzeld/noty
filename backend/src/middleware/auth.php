<?php
require "../config/connect.php";
require "../config/cors.php";

class Auth
{
    private static $instance = null;
    private $user = null;

    private $db = DBHandler::getPDO();

    private function __construct()
    {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';

        if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            $token = $matches[1];

            $stmt = $this->db->prepare(
                "SELECT accounts.id, accounts.username 
                FROM sessions
                INNER JOIN accounts ON sessions.user_id = accounts.id
                WHERE sessions.token = ?
                AND sessions.expires_at > NOW();"
            );

            $stmt->execute([$token]);

            $this->user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($this->user) {
                define('USER_ID', $this->user['id']);
            } else {
                http_response_code(401);
                echo json_encode(["error" => "Token non valido o scaduto"]);
                exit;
            }
        } else {
            http_response_code(401);
            echo json_encode(["error" => "Token mancante"]);
            exit;
        }
    }

    public static function getInstance()
    {
        if (self::$instance == null) {
            self::$instance = new Auth();
        }
        return self::$instance;
    }

    public function user()
    {
        return $this->user;
    }

    public function check()
    {
        return $this->user !== null;
    }
}
