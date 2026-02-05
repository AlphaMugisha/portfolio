<?php
session_start();
// 1. SECURITY CHECK: If not logged in, kick back to login
if (!isset($_SESSION['admin_logged_in'])) {
    header("Location: login.php");
    exit();
}

// 2. DATABASE CONNECTION
$conn = mysqli_connect('localhost', 'root', '', 'alpha_portfolio');
if (!$conn) { die("DB Connection Failed"); }

$status_msg = "";

// --- ACTION: UPDATE SITE SETTINGS (Bio, Socials, Phone) ---
if (isset($_POST['update_profile'])) {
    $name = mysqli_real_escape_string($conn, $_POST['my_name']);
    $bio = mysqli_real_escape_string($conn, $_POST['bio']);
    $phone = mysqli_real_escape_string($conn, $_POST['phone']);
    $github = mysqli_real_escape_string($conn, $_POST['github_link']);
    $insta = mysqli_real_escape_string($conn, $_POST['insta_link']);

    // Handle Image Upload
    $pic_sql = "";
    if (!empty($_FILES['profile_pic']['name'])) {
        $path = "uploads/" . time() . "_" . $_FILES['profile_pic']['name'];
        if(move_uploaded_file($_FILES['profile_pic']['tmp_name'], $path)) {
            $pic_sql = ", profile_pic='$path'";
        }
    }

    $sql = "UPDATE site_settings SET my_name='$name', bio='$bio', phone='$phone', github_link='$github', insta_link='$insta' $pic_sql WHERE id=1";
    mysqli_query($conn, $sql);
    $status_msg = "✅ Profile Updated!";
}

// --- ACTION: ADD NEW PROJECT ---
if (isset($_POST['save_project'])) {
    $title = mysqli_real_escape_string($conn, $_POST['title']);
    $desc = mysqli_real_escape_string($conn, $_POST['desc']);
    $tags = mysqli_real_escape_string($conn, $_POST['tags']);
    $link = mysqli_real_escape_string($conn, $_POST['link']);
    $icon = $_POST['icon'];
    mysqli_query($conn, "INSERT INTO projects (title, description, tags, link, icon_name, status) VALUES ('$title', '$desc', '$tags', '$link', '$icon', 'active')");
    $status_msg = "🚀 Project Added!";
}

// --- ACTION: TOGGLE STATUS (Active/Inactive) ---
if (isset($_GET['toggle_id'])) {
    $id = (int)$_GET['toggle_id'];
    $curr = $_GET['current'];
    $new_s = ($curr == 'active') ? 'inactive' : 'active';
    mysqli_query($conn, "UPDATE projects SET status='$new_s' WHERE id=$id");
    header("Location: admin.php#manage");
}

// --- ACTION: DELETE PROJECT ---
if (isset($_GET['delete_id'])) {
    $id = (int)$_GET['delete_id'];
    mysqli_query($conn, "DELETE FROM projects WHERE id=$id");
    header("Location: admin.php#manage");
}

// 3. FETCH ALL DATA
$settings = mysqli_fetch_assoc(mysqli_query($conn, "SELECT * FROM site_settings WHERE id=1"));
$projects = mysqli_query($conn, "SELECT * FROM projects ORDER BY id DESC");
$messages = mysqli_query($conn, "SELECT * FROM contact_messages ORDER BY created_at DESC");
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Alpha Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;800&display=swap" rel="stylesheet">
    <script type="module" src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js"></script>
    <style>
        :root { --p: #8b5cf6; --bg: #050505; --card: #111; --border: rgba(255,255,255,0.1); }
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Outfit', sans-serif; }
        body { background: var(--bg); color: white; display: flex; min-height: 100vh; }
        .sidebar { width: 260px; background: var(--card); border-right: 1px solid var(--border); padding: 40px 20px; position: fixed; height: 100vh; }
        .sidebar h2 { color: var(--p); margin-bottom: 40px; text-align: center; }
        .nav-link { display: block; color: #aaa; text-decoration: none; padding: 15px; border-radius: 10px; margin-bottom: 5px; transition: 0.3s; }
        .nav-link:hover { background: rgba(139, 92, 246, 0.1); color: white; }
        .main { margin-left: 260px; flex: 1; padding: 60px; }
        .section { display: none; } .section:target { display: block; } #settings { display: block; }
        .card { background: var(--card); border: 1px solid var(--border); padding: 30px; border-radius: 20px; margin-bottom: 30px; }
        input, textarea, select { width: 100%; padding: 14px; background: #000; border: 1px solid #222; border-radius: 10px; color: white; margin-bottom: 15px; outline: none; }
        .btn { background: var(--p); color: white; border: none; padding: 15px; border-radius: 10px; cursor: pointer; font-weight: 700; width: 100%; }
        .project-item { display: flex; justify-content: space-between; align-items: center; padding: 15px; border-bottom: 1px solid #222; }
        .badge { padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 800; }
        .active { background: #10b981; color: #000; } .inactive { background: #ef4444; color: #fff; }
    </style>
</head>
<body>
    <div class="sidebar">
        <h2>Alpha<span>.Admin</span></h2>
        <a href="#settings" class="nav-link">⚙️ Site Settings</a>
        <a href="#add" class="nav-link">➕ Add Project</a>
        <a href="#manage" class="nav-link">📋 Manage Projects</a>
        <a href="#inbox" class="nav-link">📩 Messages</a>
        <a href="logout.php" class="nav-link" style="color:red; margin-top:30px;">🚪 Logout</a>
    </div>

    <div class="main">
        <?php if($status_msg) echo "<div style='background:var(--p); padding:15px; border-radius:10px; margin-bottom:20px; text-align:center;'>$status_msg</div>"; ?>

        <div id="settings" class="section">
            <div class="card">
                <h3>Global Site Settings</h3>
                <form method="POST" enctype="multipart/form-data">
                    <label>Profile Pic</label><input type="file" name="profile_pic">
                    <input type="text" name="my_name" value="<?php echo $settings['my_name']; ?>" placeholder="Name">
                    <textarea name="bio" rows="4"><?php echo $settings['bio']; ?></textarea>
                    <input type="text" name="phone" value="<?php echo $settings['phone']; ?>" placeholder="Phone">
                    <input type="text" name="github_link" value="<?php echo $settings['github_link']; ?>" placeholder="GitHub URL">
                    <input type="text" name="insta_link" value="<?php echo $settings['insta_link']; ?>" placeholder="Instagram URL">
                    <button type="submit" name="update_profile" class="btn">Update Portfolio</button>
                </form>
            </div>
        </div>

        <div id="add" class="section">
            <div class="card">
                <h3>Add New Project</h3>
                <form method="POST">
                    <input type="text" name="title" placeholder="Project Title" required>
                    <textarea name="desc" placeholder="Project Description" required></textarea>
                    <input type="text" name="tags" placeholder="Tags (PHP, JS, SQL)">
                    <input type="text" name="link" placeholder="GitHub URL">
                    <select name="icon">
                        <option value="code-slash-outline">Code</option>
                        <option value="rocket-outline">Aviation</option>
                        <option value="hardware-chip-outline">Robotics</option>
                    </select>
                    <button type="submit" name="save_project" class="btn">Launch Project</button>
                </form>
            </div>
        </div>

        <div id="manage" class="section">
            <div class="card">
                <h3>Manage Projects</h3>
                <?php while($p = mysqli_fetch_assoc($projects)): ?>
                <div class="project-item">
                    <span><b class="badge <?php echo $p['status']; ?>"><?php echo $p['status']; ?></b> <?php echo $p['title']; ?></span>
                    <div>
                        <a href="admin.php?toggle_id=<?php echo $p['id']; ?>&current=<?php echo $p['status']; ?>" style="color:var(--p); text-decoration:none; margin-right:15px;">Toggle</a>
                        <a href="admin.php?delete_id=<?php echo $p['id']; ?>" style="color:#555; text-decoration:none;" onclick="return confirm('Delete?')">Delete</a>
                    </div>
                </div>
                <?php endwhile; ?>
            </div>
        </div>

        <div id="inbox" class="section">
            <div class="card">
                <h3>Incoming Messages</h3>
                <?php while($m = mysqli_fetch_assoc($messages)): ?>
                <div style="border-bottom:1px solid #222; padding:15px 0;">
                    <strong><?php echo $m['name']; ?></strong> (<?php echo $m['email']; ?>)<br>
                    <p style="color:#aaa; margin-top:5px;"><?php echo $m['message']; ?></p>
                </div>
            <?php endwhile; ?>
            </div>
        </div>
    </div>

    <script>
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash || '#settings';
            document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
            document.querySelector(hash).style.display = 'block';
        });
    </script>
</body>
</html>