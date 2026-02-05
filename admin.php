<?php
session_start();
if (!isset($_SESSION['admin_logged_in'])) { header("Location: login.php"); exit(); }
$conn = mysqli_connect('localhost', 'root', '', 'alpha_portfolio');

// Update Settings
if(isset($_POST['update_profile'])) {
    $name = mysqli_real_escape_string($conn, $_POST['my_name']);
    $bio = mysqli_real_escape_string($conn, $_POST['bio']);
    $sql = "UPDATE site_settings SET my_name='$name', bio='$bio' WHERE id=1";
    mysqli_query($conn, $sql);
}

$settings = mysqli_fetch_assoc(mysqli_query($conn, "SELECT * FROM site_settings WHERE id=1"));
$projects = mysqli_query($conn, "SELECT * FROM projects ORDER BY id DESC");
$messages = mysqli_query($conn, "SELECT * FROM contact_messages ORDER BY created_at DESC");
?>
<!DOCTYPE html>
<html>
<head>
    <title>Alpha Admin</title>
    <link rel="stylesheet" href="style.css"> <style>
        .sidebar { width:260px; height:100vh; background:var(--card-bg); position:fixed; padding:40px 20px; border-right:var(--border); }
        .main { margin-left:260px; padding:60px; }
        .nav-link { display:block; padding:15px; color:#aaa; text-decoration:none; border-radius:10px; margin-bottom:5px; }
        .nav-link:hover { background:rgba(139, 92, 246, 0.1); color:white; }
        .section { display:none; } .section:target { display:block; } #settings { display:block; }
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
        <section id="settings" class="section">
            <div class="card">
                <h3>Edit Profile</h3>
                <form method="POST">
                    <input type="text" name="my_name" value="<?php echo $settings['my_name']; ?>">
                    <textarea name="bio" rows="5"><?php echo $settings['bio']; ?></textarea>
                    <button type="submit" name="update_profile" class="btn">Update Site</button>
                </form>
            </div>
        </section>

        <section id="inbox" class="section">
            <div class="card">
                <h3>Messages</h3>
                <?php while($m = mysqli_fetch_assoc($messages)): ?>
                    <div style="border-bottom:1px solid #222; padding:15px 0;">
                        <strong><?php echo $m['name']; ?>:</strong> <?php echo $m['message']; ?>
                    </div>
                <?php endwhile; ?>
            </div>
        </section>
    </div>

    <script>
        window.addEventListener('hashchange', () => {
            document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
            const target = window.location.hash || '#settings';
            document.querySelector(target).style.display = 'block';
        });
    </script>
</body>
</html>