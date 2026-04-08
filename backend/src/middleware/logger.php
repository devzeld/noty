<?php
class Logger
{
    private static $db = null;

    private static function db()
    {
        if (self::$db === null) {
            self::$db = DBHandler::getPDO();
        }
        return self::$db;
    }

    public static function write(int $userId, string $action, ?int $docId = null, ?int $folderId = null, ?int $tagId = null): void
    {
        try {
            $stmt = self::db()->prepare(
                "INSERT INTO logs (user_id, doc_id, folder_id, tag_id, action)
                 VALUES (?, ?, ?, ?, ?)"
            );
            $stmt->execute([$userId, $docId, $folderId, $tagId, $action]);
        } catch (PDOException $e) {
            // Il log non deve mai bloccare l'operazione principale
        }
    }
}
