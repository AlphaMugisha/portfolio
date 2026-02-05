<?php
include('db.php');
session_start();

// Simple security check (Add a login page later)
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['add_project'])) {
    $title = $_POST['title'];
    $desc = $_POST['description'];
    $tags = $_POST['tags'];
    $link = $_POST['link'];

    $sql = "INSERT INTO projects (title, description, tags, link) VALUES ('$title', '$desc', '$tags', '$link')";
    mysqli_query($conn, $sql);
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Alpha Admin</title>
    <style>
        body { background: #0a0a0a; color: white; font-family: sans-serif; padding: 50px; }
        .form-card { background: #1a1a1a; padding: 20px; border-radius: 10px; max-width: 500px; }
        input, textarea { width: 100%; margin-bottom: 10px; padding: 10px; background: #333; color: white; border: none; }
        button { background: #8b5cf6; color: white; border: none; padding: 10px 20px; cursor: pointer; }
    </style>
</head>
<body>
    <h2>Add New Project</h2>
    <div class="form-card">
        <form method="POST">
            <input type="text" name="title" placeholder="Project Title" required>
            <textarea name="description" placeholder="Project Description"></textarea>
            <input type="text" name="tags" placeholder="Tags (e.g. PHP, MySQL)">
            <input type="text" name="link" placeholder="GitHub Link">
            <button type="submit" name="add_project">Upload to Portfolio</button>
        </form>
    </div>
</body>
</html>