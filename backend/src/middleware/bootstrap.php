<?php
define('ROOT', dirname(__DIR__, 2));

require_once ROOT . '\config\connect.php';
require_once ROOT . '\config\cors.php';
require_once ROOT . '\src\middleware\authentication.php';
require_once ROOT . '\src\middleware\logger.php';
