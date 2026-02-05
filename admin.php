<?php
header('Content-Type: application/json');
require_once '../config/database.php';

session_start();
if (!isset($_SESSION['admin_logged_in'])) {
    die(json_encode(['error' => 'Unauthorized']));
}

$pdo = getConnection();

// Handle different actions
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'get':
        $stmt = $pdo->query("SELECT * FROM projects ORDER BY display_order");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;
        
    case 'save':
        $data = json_decode(file_get_contents('php://input'), true);
        // Save logic
        break;
        
    default:
        echo json_encode(['error' => 'Invalid action']);
}
?>