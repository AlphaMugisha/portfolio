<?php
$conn = mysqli_connect('localhost', 'root', '', 'alpha_portfolio');

// Handle Setting Updates
if (isset($_POST['update_settings'])) {
    $name = mysqli_real_escape_string($conn, $_POST['my_name']);
    $bio = mysqli_real_escape_string($conn, $_POST['bio']);
    $phone = mysqli_real_escape_string($conn, $_POST['phone']);
    $sql = "UPDATE site_settings SET my_name='$name', bio='$bio', phone='$phone' WHERE id=1";
    mysqli_query($conn, $sql);
}

// Handle Project Deletion
if (isset($_GET['delete'])) {
    $id = $_GET['delete'];
    mysqli_query($conn, "DELETE FROM projects WHERE id=$id");
}

$settings = mysqli_fetch_assoc(mysqli_query($conn, "SELECT * FROM site_settings WHERE id=1"));
$projects = mysqli_query($conn, "SELECT * FROM projects");
?>

<!DOCTYPE html>
<html>
<head>
    <title>Alpha Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;800&display=swap" rel="stylesheet">
    <style>
        :root { --p: #8b5cf6; --bg: #050505; --card: #111; }
        body { background: var(--bg); color: white; font-family: 'Outfit'; display: flex; margin: 0; }
        
        /* Sidebar Menu */
        .sidebar { width: 250px; background: var(--card); height: 100vh; padding: 30px; border-right: 1px solid #222; }
        .sidebar h2 { color: var(--p); margin-bottom: 40px; }
        .menu-item { display: block; color: #aaa; text-decoration: none; padding: 15px 0; border-bottom: 1px solid #222; }
        .menu-item:hover { color: white; }

        .main-content { flex: 1; padding: 50px; overflow-y: auto; }
        .card { background: var(--card); padding: 30px; border-radius: 15px; margin-bottom: 30px; }
        input, textarea { width: 100%; padding: 12px; margin: 10px 0; background: #000; border: 1px solid #333; color: white; border-radius: 8px; }
        .btn { background: var(--p); color: white; border: none; padding: 12px 25px; border-radius: 8px; cursor: pointer; font-weight: bold; }
        
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { text-align: left; padding: 15px; border-bottom: 1px solid #222; }
        .del-btn { color: #ff4d4d; text-decoration: none; }
    </style>
</head>
<body>

<div class="sidebar">
    <h2>Alpha Admin</h2>
    <a href="#settings" class="menu-item">⚙️ General Settings</a>
    <a href="#projects" class="menu-item">📁 Manage Projects</a>
    <a href="index.php" class="menu-item">🌐 View Site</a>
</div>

<div class="main-content">
    <section id="settings" class="card">
        <h3>Edit Site Info</h3>
        <form method="POST">
            <label>Public Name</label>
            <input type="text" name="my_name" value="<?php echo $settings['my_name']; ?>">
            <label>Bio Paragraph</label>
            <textarea name="bio" rows="4"><?php echo $settings['bio']; ?></textarea>
            <label>Phone Number</label>
            <input type="text" name="phone" value="<?php echo $settings['phone']; ?>">
            <button type="submit" name="update_settings" class="btn">Update Everything</button>
        </form>
    </section>

    <section id="projects" class="card">
        <h3>Current Projects</h3>
        <table>
            <tr><th>Title</th><th>Action</th></tr>
            <?php while($p = mysqli_fetch_assoc($projects)): ?>
            <tr>
                <td><?php echo $p['title']; ?></td>
                <td><a href="admin.php?delete=<?php echo $p['id']; ?>" class="del-btn">Delete</a></td>
            </tr>
            <?php endwhile; ?>
        </table>
    </section>
</div>

</body>
</html>