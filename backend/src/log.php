<?php
require_once __DIR__ . "/../middleware/bootstrap.php";

$auth = Auth::getInstance();
$auth->requireAuth();
$user = $auth->user();
$userId = (int) $user["id"];

$db = DBHandler::getPDO();

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    http_response_code(405);
    exit(json_encode(["error" => "Metodo non consentito"]));
}

$docId = isset($_GET["doc_id"]) ? (int) $_GET["doc_id"] : null;
$folderId = isset($_GET["folder_id"]) ? (int) $_GET["folder_id"] : null;
$tagId = isset($_GET["tag_id"]) ? (int) $_GET["tag_id"] : null;
$limit = isset($_GET["limit"]) ? min((int) $_GET["limit"], 100) : 50;
$offset = isset($_GET["offset"]) ? (int) $_GET["offset"] : 0;

$sql = "SELECT l.*, a.username
        FROM logs l
        INNER JOIN accounts a ON a.id = l.user_id
        WHERE l.user_id = :uid";

$params = [":uid" => $userId];

if ($docId) {
    $sql .= " AND l.doc_id = :doc_id";
    $params[":doc_id"] = $docId;
}
if ($folderId) {
    $sql .= " AND l.folder_id = :folder_id";
    $params[":folder_id"] = $folderId;
}
if ($tagId) {
    $sql .= " AND l.tag_id = :tag_id";
    $params[":tag_id"] = $tagId;
}

$sql .= " ORDER BY l.created_at DESC LIMIT :limit OFFSET :offset";

$stmt = $db->prepare($sql);
foreach ($params as $key => $value) {
    $stmt->bindValue($key, $value);
}
$stmt->bindValue(":limit", $limit, PDO::PARAM_INT);
$stmt->bindValue(":offset", $offset, PDO::PARAM_INT);
$stmt->execute();

echo json_encode(["data" => $stmt->fetchAll()]);
