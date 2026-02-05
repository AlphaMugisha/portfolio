<?php
session_start();
if (!isset($_SESSION['admin_logged_in'])) { header("Location: login.php"); exit(); }
$conn = mysqli_connect('localhost', 'root', '', 'alpha_portfolio');

// --- ACTIONS: UPDATE SETTINGS, ADD PROJECT, TOGGLE, DELETE ---
if(isset($_POST['update_profile'])) {
    $name = mysqli_real_escape_string($conn, $_POST['my_name']);
    $bio = mysqli_real_escape_string($conn, $_POST['bio']);
    $phone = mysqli_real_escape_string($conn, $_POST['phone']);
    $insta = mysqli_real_escape_string($conn, $_POST['insta_link']);
    $github = mysqli_real_escape_string($conn, $_POST['github_link']);
    
    $pic_sql = "";
    if(!empty($_FILES['profile_pic']['name'])){
        $path = "uploads/".time()."_".$_FILES['profile_pic']['name'];
        move_uploaded_file($_FILES['profile_pic']['tmp_name'], $path);
        $pic_sql = ", profile_pic='$path'";
    }
    mysqli_query($conn, "UPDATE site_settings SET my_name='$name', bio='$bio', phone='$phone', insta_link='$insta', github_link='$github' $pic_sql WHERE id=1");
}

if(isset($_POST['add_project'])) {
    $title = mysqli_real_escape_string($conn, $_POST['title']);
    $desc = mysqli_real_escape_string($conn, $_POST['desc']);
    $tags = mysqli_real_escape_string($conn, $_POST['tags']);
    $link = mysqli_real_escape_string($conn, $_POST['link']);
    $icon = $_POST['icon'];
    mysqli_query($conn, "INSERT INTO projects (title, description, tags, link, icon_name) VALUES ('$title', '$desc', '$tags', '$link', '$icon')");
}

if(isset($_GET['toggle'])) {
    $id = $_GET['toggle'];
    $s = $_GET['s'] == 'active' ? 'inactive' : 'active';
    mysqli_query($conn, "UPDATE projects SET status='$s' WHERE id=$id");
    header("Location: admin.php#manage");
}

// --- FETCH DATA ---
$settings = mysqli_fetch_assoc(mysqli_query($conn, "SELECT * FROM site_settings WHERE id=1"));
$projects = mysqli_query($conn, "SELECT * FROM projects ORDER BY id DESC");
$messages = mysqli_query($conn, "SELECT * FROM contact_messages ORDER BY created_at DESC");
?>
<!DOCTYPE html>
<html>
<head>
    <title>Alpha Admin</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;800&display=swap" rel="stylesheet">
    <style>
        :root { --p: #8b5cf6; --bg: #050505; --card: #111; }
        body { background: var(--bg); color: #fff; font-family: 'Outfit'; display: flex; margin:0; }
        .sidebar { width: 260px; background: var(--card); height: 100vh; padding: 40px 20px; position: fixed; border-right: 1px solid #222; }
        .main { margin-left: 260px; padding: 60px; flex: 1; }
        .card { background: var(--card); padding: 30px; border-radius: 20px; margin-bottom: 30px; border: 1px solid #222; }
        input, textarea, select { width: 100%; padding: 12px; margin: 10px 0; background: #000; border: 1px solid #333; color: #fff; border-radius: 8px; }
        .btn { background: var(--p); color: #fff; border:none; padding: 12px; border-radius: 8px; cursor:pointer; width: 100%; font-weight: 800; }
        .section { display: none; } .section:target { display: block; } #settings { display: block; }
        .msg-box { border-bottom: 1px solid #222; padding: 15px 0; }
    </style>
</head>
<body>
<div class="sidebar">
    <h2 style="color:var(--p)">ALPHA ADMIN</h2>
    <a href="#settings" style="display:block; color:#fff; text-decoration:none; margin:20px 0;">⚙️ Site Settings</a>
    <a href="#add" style="display:block; color:#fff; text-decoration:none; margin:20px 0;">➕ Add Project</a>
    <a href="#manage" style="display:block; color:#fff; text-decoration:none; margin:20px 0;">📋 Manage Projects</a>
    <a href="#inbox" style="display:block; color:#fff; text-decoration:none; margin:20px 0;">📩 Messages</a>
    <a href="logout.php" style="color:red; text-decoration:none; margin-top:50px; display:block;">🚪 Logout</a>
</div>
<div class="main">
    <section id="settings" class="section">
        <div class="card">
            <h3>Update Profile</h3>
            <form method="POST" enctype="multipart/form-data">
                <input type="file" name="profile_pic">
                <input type="text" name="my_name" value="<?php echo $settings['my_name']; ?>">
                <textarea name="bio" rows="4"><?php echo $settings['bio']; ?></textarea>
                <input type="text" name="phone" value="<?php echo $settings['phone']; ?>">
                <input type="text" name="insta_link" value="<?php echo $settings['insta_link']; ?>">
                <input type="text" name="github_link" value="<?php echo $settings['github_link']; ?>">
                <button type="submit" name="update_profile" class="btn">Save Changes</button>
            </form>
        </div>
    </section>

    <section id="add" class="section">
        <div class="card">
            <h3>Add New Project</h3>
            <form method="POST">
                <input type="text" name="title" placeholder="Project Title" required>
                <textarea name="desc" placeholder="Description" required></textarea>
                <input type="text" name="tags" placeholder="Tags (PHP, JS, SQL)">
                <input type="text" name="link" placeholder="GitHub Link">
                <select name="icon">
                    <option value="code-slash-outline">Code</option>
                    <option value="rocket-outline">Rocket</option>
                    <option value="alarm-outline">Alarm</option>
                </select>
                <button type="submit" name="add_project" class="btn">Post Project</button>
            </form>
        </div>
    </section>

    <section id="manage" class="section">
        <div class="card">
            <h3>Projects</h3>
            <?php while($p = mysqli_fetch_assoc($projects)): ?>
                <div style="display:flex; justify-content:space-between; margin-bottom:10px; border-bottom:1px solid #222; padding:10px 0;">
                    <span><?php echo $p['title']; ?> (<?php echo $p['status']; ?>)</span>
                    <a href="admin.php?toggle=<?php echo $p['id']; ?>&s=<?php echo $p['status']; ?>" style="color:var(--p)">Toggle Visibility</a>
                </div>
            <?php endwhile; ?>
        </div>
    </section>

    <section id="inbox" class="section">
        <div class="card">
            <h3>Messages</h3>
            <?php while($m = mysqli_fetch_assoc($messages)): ?>
                <div class="msg-box">
                    <strong>From: <?php echo $m['name']; ?></strong> (<?php echo $m['email']; ?>)<br>
                    <p><?php echo $m['message']; ?></p>
                    <small><?php echo $m['created_at']; ?></small>
                </div>
            <?php endwhile; ?>
        </div>
    </section>
</div>
<script>
    window.addEventListener('hashchange', () => {
        document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
        const active = window.location.hash || '#settings';
        document.querySelector(active).style.display = 'block';
    });
</script>
</body>
</html>