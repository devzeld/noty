<?php
// Genera una stringa casuale sicura
$token = bin2hex(random_bytes(32));
$expires = date('Y-m-d H:i:s', strtotime('+1 day'));

// Esegui l'UPDATE sul database per l'utente che ha appena fatto il login
$sql = "UPDATE users SET api_token = ?, token_expires_at = ? WHERE id = ?";
// ... esegui la query ...

// Rispondi al frontend
echo json_encode(["token" => $token, "message" => "Login effettuato"]);
