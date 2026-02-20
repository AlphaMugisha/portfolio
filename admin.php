<?php
session_start();
if (!isset($_SESSION['admin_logged_in'])) { header("Location: login.php"); exit(); }
$conn = mysqli_connect('localhost', 'root', '', 'alpha_portfolio');

// Update Profile Settings
if(isset($_POST['update_profile'])) {
    $name = mysqli_real_escape_string($conn, $_POST['my_name']);
    $bio = mysqli_real_escape_string($conn, $_POST['bio']);
    mysqli_query($conn, "UPDATE site_settings SET my_name='$name', bio='$bio' WHERE id=1");
}

// Upload New Project
if(isset($_POST['add_project'])) {
    $title = mysqli_real_escape_string($conn, $_POST['title']);
    $desc = mysqli_real_escape_string($conn, $_POST['description']);
    $link = mysqli_real_escape_string($conn, $_POST['link']);
    
    $image = $_FILES['image']['name'];
    $target = "uploads/" . basename($image);

    if (move_uploaded_file($_FILES['image']['tmp_name'], $target)) {
        mysqli_query($conn, "INSERT INTO projects (title, description, image, link) VALUES ('$title', '$desc', '$image', '$link')");
        header("Location: admin.php#projects-list");
    }
}

$settings = mysqli_fetch_assoc(mysqli_query($conn, "SELECT * FROM site_settings WHERE id=1"));
$projects = mysqli_query($conn, "SELECT * FROM projects ORDER BY id DESC");
$messages = mysqli_query($conn, "SELECT * FROM contact_messages ORDER BY created_at DESC");
?>
<!DOCTYPE html>
<html>
<head>
    <title>Alpha Admin</title>
    <link rel="stylesheet" href="style.css">
    <style>
        .sidebar { width:260px; height:100vh; background:var(--card-bg); position:fixed; padding:40px 20px; border-right:var(--border); }
        .main { margin-left:260px; padding:60px; }
        .nav-link { display:block; padding:15px; color:#aaa; text-decoration:none; border-radius:10px; margin-bottom:5px; }
        .nav-link:hover { background:rgba(139, 92, 246, 0.1); color:white; }
        .section { display:none; }
        input, textarea { width:100%; padding:12px; margin:10px 0; background:#111; border:1px solid #333; color:white; border-radius:8px; }
        .project-item { display:flex; align-items:center; gap:15px; background:#1a1a1a; padding:10px; border-radius:10px; margin-top:10px; }
        .project-item img { width:50px; height:50px; object-fit:cover; border-radius:5px; }
    </style>
</head>
<body>
    <div class="sidebar">
        <h2 style="color:var(--primary); margin-bottom:40px;">ADMIN</h2>
        <a href="#settings" class="nav-link">Settings</a>
        <a href="#projects-list" class="nav-link">Projects</a>
        <a href="#inbox" class="nav-link">Messages</a>
        <a href="logout.php" class="nav-link" style="color:red; margin-top:40px;">Logout</a>
    </div>

    <div class="main">
        <section id="settings" class="section" style="display:block;">
            <div class="card">
                <h3>Profile Settings</h3>
                <form method="POST">
                    <input type="text" name="my_name" value="<?php echo $settings['my_name']; ?>">
                    <textarea name="bio" rows="5"><?php echo $settings['bio']; ?></textarea>
                    <button type="submit" name="update_profile" class="btn">Update Profile</button>
                </form>
            </div>
        </section>

        <section id="projects-list" class="section">
            <div class="card">
                <h3>Add New Project</h3>
                <form method="POST" enctype="multipart/form-data">
                    <input type="text" name="title" placeholder="Project Title" required>
                    <textarea name="description" placeholder="Description" required></textarea>
                    <input type="text" name="link" placeholder="Project URL (GitHub/Live)">
                    <label>Project Image:</label>
                    <input type="file" name="image" required>
                    <button type="submit" name="add_project" class="btn">Publish Project</button>
                </form>
            </div>
            <div class="card" style="margin-top:20px;">
                <h3>Existing Projects</h3>
                <?php while($p = mysqli_fetch_assoc($projects)): ?>
                    <div class="project-item">
                        <img src="uploads/<?php echo $p['image']; ?>">
                        <span><?php echo $p['title']; ?></span>
                    </div>
                <?php endwhile; ?>
            </div>
        </section>

        <section id="inbox" class="section">
            <div class="card">
                <h3>Messages</h3>
                <?php while($m = mysqli_fetch_assoc($messages)): ?>
                    <div style="border-bottom:1px solid #222; padding:15px 0;">
                        <small><?php echo $m['created_at']; ?></small><br>
                        <strong><?php echo $m['name']; ?>:</strong> <?php echo $m['message']; ?>
                    </div>
                <?php endwhile; ?>
            </div>
        </section>
    </div>

    <script>
        function route() {
            const hash = window.location.hash || '#settings';
            document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
            document.querySelector(hash).style.display = 'block';
        }
        window.onhashchange = route;
    </script>
</body>
</html>