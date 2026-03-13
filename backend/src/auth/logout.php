<?php

/**
 * POST /auth/logout
 *
 * Header: Authorization: Bearer <token>
 *
 * Responses:
 *   200 { "message": "Logout effettuato" }
 *   401 { "error": "Token mancante o non valido" }
 */

require "../../config/connect.php";
require "../../config/cors.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["error" => "Metodo non consentito"]);
    exit;
}

// ── Extract Bearer token ─────────────────────────────────────
$headers    = getallheaders();
$authHeader = $headers["Authorization"] ?? $headers["authorization"] ?? "";

if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    http_response_code(401);
    echo json_encode(["error" => "Token mancante"]);
    exit;
}

$token = $matches[1];
$db    = DBHandler::getPDO();

// Verify token exists and is not expired
$stmt = $db->prepare(
    "SELECT id FROM sessions WHERE token = ? AND expires_at > NOW() LIMIT 1"
);
$stmt->execute([$token]);

if (!$stmt->fetch()) {
    http_response_code(401);
    echo json_encode(["error" => "Token non valido o già scaduto"]);
    exit;
}

// ── Invalidate session ───────────────────────────────────────
$db->prepare("DELETE FROM sessions WHERE token = ?")->execute([$token]);

echo json_encode(["message" => "Logout effettuato con successo"]);
