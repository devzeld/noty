<?php
class DBHandler
{
    private static $pdo;

    private function __construct() {}

    public static function getPDO()
    {
        if (self::$pdo == null) {
            self::connect_database();
        }
        return self::$pdo;
    }

    private static function connect_database()
    {
        $user = 'root';
        $password = 'root'; 

        try {
            $connection_string = 'mysql:host=db;dbname=noty;charset=utf8';
            $connection_array = array(
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            );
            self::$pdo = new PDO($connection_string, $user, $password, $connection_array);
        } catch (PDOException $e) {
            die(json_encode([
                "success" => false, 
                "error" => "Connessione DB fallita: " . $e->getMessage()
            ]));
        }
    }
}