<?php
// --- 1. DATABASE CONNECTION ---
$conn = mysqli_connect('localhost', 'root', '', 'alpha_portfolio');

if (!$conn) {
    die("<p style='color:red;'>Connection failed: Check XAMPP.</p>");
}

$status_msg = "";

// --- 2. HANDLE SETTINGS UPDATE ---
if (isset($_POST['update_settings'])) {
    $name = mysqli_real_escape_string($conn, $_POST['my_name']);
    $bio = mysqli_real_escape_string($conn, $_POST['bio']);
    $phone = mysqli_real_escape_string($conn, $_POST['phone']);
    $github = mysqli_real_escape_string($conn, $_POST['github_link']);

    $sql = "UPDATE site_settings SET my_name='$name', bio='$bio', phone='$phone', github_link='$github' WHERE id=1";
    if (mysqli_query($conn, $sql)) {
        $status_msg = "✅ Site settings updated!";
    }
}

// --- 3. HANDLE NEW PROJECT SUBMISSION ---
if (isset($_POST['save_project'])) {
    $title = mysqli_real_escape_string($conn, $_POST['title']);
    $desc = mysqli_real_escape_string($conn, $_POST['desc']);
    $tags = mysqli_real_escape_string($conn, $_POST['tags']);
    $link = mysqli_real_escape_string($conn, $_POST['link']);
    $icon = mysqli_real_escape_string($conn, $_POST['icon']);

    $sql = "INSERT INTO projects (title, description, tags, link, icon_name, status) 
            VALUES ('$title', '$desc', '$tags', '$link', '$icon', 'active')";
    if (mysqli_query($conn, $sql)) {
        $status_msg = "🚀 New project added!";
    }
}

// --- 4. HANDLE STATUS TOGGLE ---
if (isset($_GET['toggle_id'])) {
    $id = (int)$_GET['toggle_id'];
    $current = $_GET['current'];
    $new_status = ($current == 'active') ? 'inactive' : 'active';
    mysqli_query($conn, "UPDATE projects SET status='$new_status' WHERE id=$id");
    header("Location: admin.php#manage");
}

// --- 5. HANDLE DELETE ---
if (isset($_GET['delete_id'])) {
    $id = (int)$_GET['delete_id'];
    mysqli_query($conn, "DELETE FROM projects WHERE id=$id");
    header("Location: admin.php#manage");
}

// --- 6. FETCH DATA ---
$settings = mysqli_fetch_assoc(mysqli_query($conn, "SELECT * FROM site_settings WHERE id=1"));
$projects = mysqli_query($conn, "SELECT * FROM projects ORDER BY id DESC");
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Alpha | God Mode Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <script type="module" src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js"></script>
    <style>
        :root { --p: #8b5cf6; --bg: #050505; --card: #111; --border: rgba(255,255,255,0.1); }
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Outfit', sans-serif; }
        body { background: var(--bg); color: white; display: flex; min-height: 100vh; }

        /* Sidebar */
        .sidebar { width: 260px; background: var(--card); border-right: 1px solid var(--border); padding: 40px 20px; position: fixed; height: 100vh; }
        .sidebar h2 { font-weight: 800; color: var(--p); margin-bottom: 40px; text-align: center; }
        .nav-link { display: flex; align-items: center; gap: 15px; color: #aaa; text-decoration: none; padding: 15px; border-radius: 10px; transition: 0.3s; margin-bottom: 5px; }
        .nav-link:hover, .nav-link.active { background: rgba(139, 92, 246, 0.1); color: white; }

        /* Main Content */
        .main { margin-left: 260px; flex: 1; padding: 60px; }
        .section { display: none; }
        .section:target { display: block; }
        #settings { display: block; } /* Default section */

        .card { background: var(--card); border: 1px solid var(--border); padding: 30px; border-radius: 20px; margin-bottom: 30px; }
        .status-banner { background: var(--p); color: white; padding: 15px; border-radius: 10px; margin-bottom: 20px; text-align: center; font-weight: 600; }

        label { display: block; margin: 15px 0 8px; color: #888; font-size: 0.9rem; }
        input, textarea, select { width: 100%; padding: 14px; background: #000; border: 1px solid #222; border-radius: 10px; color: white; outline: none; }
        .btn { background: var(--p); color: white; border: none; padding: 15px 30px; border-radius: 10px; cursor: pointer; font-weight: 700; margin-top: 20px; width: 100%; }

        /* Table/List Styles */
        .project-item { display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid #222; }
        .badge { padding: 4px 10px; border-radius: 5px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
        .badge.active { background: #10b981; color: #000; }
        .badge.inactive { background: #ef4444; color: #fff; }
        .actions a { text-decoration: none; font-weight: 600; font-size: 0.85rem; margin-left: 15px; }
    </style>
</head>
<body>

    <div class="sidebar">
        <h2>Alpha<span>.Admin</span></h2>
        <a href="#settings" class="nav-link">⚙️ Site Settings</a>
        <a href="#add" class="nav-link">➕ Add Project</a>
        <a href="#manage" class="nav-link">📋 Manage Projects</a>
        <hr style="border: 0; border-top: 1px solid #222; margin: 20px 0;">
        <a href="index.php" class="nav-link">🌐 View Live Site</a>
    </div>

    <div class="main">
        <?php if($status_msg): ?> <div class="status-banner"><?php echo $status_msg; ?></div> <?php endif; ?>

        <div id="settings" class="section">
            <div class="card">
                <h3>General Site Info</h3>
                <form method="POST">
                    <label>Your Name</label>
                    <input type="text" name="my_name" value="<?php echo $settings['my_name']; ?>">
                    <label>Main Bio / Introduction</label>
                    <textarea name="bio" rows="4"><?php echo $settings['bio']; ?></textarea>
                    <label>Phone Number</label>
                    <input type="text" name="phone" value="<?php echo $settings['phone']; ?>">
                    <label>GitHub Link</label>
                    <input type="text" name="github_link" value="<?php echo $settings['github_link']; ?>">
                    <button type="submit" name="update_settings" class="btn">Save Changes</button>
                </form>
            </div>
        </div>

        <div id="add" class="section">
            <div class="card">
                <h3>Launch New Project</h3>
                <form method="POST">
                    <input type="text" name="title" placeholder="Project Name" required style="margin-top:20px;">
                    <textarea name="desc" rows="3" placeholder="Brief description..." required style="margin-top:20px;"></textarea>
                    <input type="text" name="tags" placeholder="Tags (e.g. PHP, MySQL, JS)" style="margin-top:20px;">
                    <input type="text" name="link" placeholder="GitHub/Live URL" style="margin-top:20px;">
                    <label>Select Icon</label>
                    <select name="icon">
                        <option value="code-slash-outline">Code Block</option>
                        <option value="rocket-outline">Aviation/Rocket</option>
                        <option value="hardware-chip-outline">AI/Robotics</option>
                        <option value="alarm-outline">Alarm/Clock</option>
                    </select>
                    <button type="submit" name="save_project" class="btn">Add to Portfolio</button>
                </form>
            </div>
        </div>

        <div id="manage" class="section">
            <div class="card">
                <h3>Existing Projects</h3>
                <p style="color:#666; margin-bottom:20px;">Toggle visibility or remove projects.</p>
                <?php while($p = mysqli_fetch_assoc($projects)): ?>
                <div class="project-item">
                    <div>
                        <span class="badge <?php echo $p['status']; ?>"><?php echo $p['status']; ?></span>
                        <strong style="margin-left:10px;"><?php echo $p['title']; ?></strong>
                    </div>
                    <div class="actions">
                        <a href="admin.php?toggle_id=<?php echo $p['id']; ?>&current=<?php echo $p['status']; ?>" style="color:var(--p);">
                            Mark as <?php echo ($p['status'] == 'active') ? 'Inactive' : 'Active'; ?>
                        </a>
                        <a href="admin.php?delete_id=<?php echo $p['id']; ?>" style="color:#666;" onclick="return confirm('Delete forever?')">Delete</a>
                    </div>
                </div>
                <?php endwhile; ?>
            </div>
        </div>

    </div>

    <script>
        // Simple script to handle showing sections based on URL hash
        window.addEventListener('hashchange', function() {
            const hash = window.location.hash || '#settings';
            document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
            document.querySelector(hash).style.display = 'block';
        });
        // Run on load
        if(window.location.hash) window.dispatchEvent(new Event('hashchange'));
    </script>
</body>
</html>