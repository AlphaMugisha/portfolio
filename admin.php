<?php
$conn = mysqli_connect('localhost', 'root', '', 'alpha_portfolio');
$status_msg = "";

// --- UPDATE HERO & CONTACT INFO ---
if (isset($_POST['update_profile'])) {
    $name = mysqli_real_escape_string($conn, $_POST['my_name']);
    $bio = mysqli_real_escape_string($conn, $_POST['bio']);
    $phone = mysqli_real_escape_string($conn, $_POST['phone']);
    $insta = mysqli_real_escape_string($conn, $_POST['insta_link']);
    $github = mysqli_real_escape_string($conn, $_POST['github_link']);

    // Handle Profile Picture Upload
    $pic_query = "";
    if (!empty($_FILES['profile_pic']['name'])) {
        $target_file = "uploads/" . time() . "_" . basename($_FILES["profile_pic"]["name"]);
        if (move_uploaded_file($_FILES["profile_pic"]["tmp_name"], $target_file)) {
            $pic_query = ", profile_pic='$target_file'";
        }
    }

    $sql = "UPDATE site_settings SET my_name='$name', bio='$bio', phone='$phone', insta_link='$insta', github_link='$github' $pic_query WHERE id=1";
    mysqli_query($conn, $sql);
    $status_msg = "✅ Portfolio Updated!";
}

// --- PROJECT ACTIONS ---
if (isset($_POST['add_project'])) {
    $title = mysqli_real_escape_string($conn, $_POST['title']);
    $desc = mysqli_real_escape_string($conn, $_POST['desc']);
    mysqli_query($conn, "INSERT INTO projects (title, description, status) VALUES ('$title', '$desc', 'active')");
}

$settings = mysqli_fetch_assoc(mysqli_query($conn, "SELECT * FROM site_settings WHERE id=1"));
$projects = mysqli_query($conn, "SELECT * FROM projects ORDER BY id DESC");
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <title>Alpha | Admin Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;800&display=swap" rel="stylesheet">
    <style>
        :root { --p: #8b5cf6; --bg: #050505; --card: #111; }
        body { background: var(--bg); color: white; font-family: 'Outfit'; display: flex; margin: 0; }
        .sidebar { width: 260px; background: var(--card); height: 100vh; padding: 40px 20px; position: fixed; border-right: 1px solid #222; }
        .main { margin-left: 260px; padding: 60px; flex: 1; }
        .card { background: var(--card); padding: 30px; border-radius: 20px; border: 1px solid #222; margin-bottom: 30px; }
        input, textarea { width: 100%; padding: 12px; margin: 10px 0; background: #000; border: 1px solid #333; color: white; border-radius: 8px; }
        .btn { background: var(--p); color: white; border: none; padding: 12px 25px; border-radius: 8px; cursor: pointer; font-weight: bold; width: 100%; }
        .section { display: none; } .section:target { display: block; } #home-admin { display: block; }
    </style>
</head>
<body>

<div class="sidebar">
    <h2 style="color: var(--p); margin-bottom: 40px;">ALPHA ADMIN</h2>
    <a href="#home-admin" style="display:block; color:white; text-decoration:none; margin-bottom:20px;">👤 Hero & Contact</a>
    <a href="#projects-admin" style="display:block; color:white; text-decoration:none; margin-bottom:20px;">📁 Projects</a>
    <a href="index.php" style="color: #666; text-decoration: none;">View Live Site</a>
</div>

<div class="main">
    <?php if($status_msg) echo "<p style='color:var(--p)'>$status_msg</p>"; ?>

    <section id="home-admin" class="section">
        <div class="card">
            <h3>Edit Hero & Contact Info</h3>
            <form method="POST" enctype="multipart/form-data">
                <label>Profile Image</label>
                <input type="file" name="profile_pic">
                <label>Name</label>
                <input type="text" name="my_name" value="<?php echo $settings['my_name']; ?>">
                <label>Hero Bio</label>
                <textarea name="bio" rows="4"><?php echo $settings['bio']; ?></textarea>
                <label>Phone</label>
                <input type="text" name="phone" value="<?php echo $settings['phone']; ?>">
                <label>Instagram Link</label>
                <input type="text" name="insta_link" value="<?php echo $settings['insta_link']; ?>">
                <label>GitHub Link</label>
                <input type="text" name="github_link" value="<?php echo $settings['github_link']; ?>">
                <button type="submit" name="update_profile" class="btn">Update Portfolio</button>
            </form>
        </div>
    </section>

    <section id="projects-admin" class="section">
        <div class="card">
            <h3>Add New Project</h3>
            <form method="POST">
                <input type="text" name="title" placeholder="Project Title">
                <textarea name="desc" placeholder="Description"></textarea>
                <button type="submit" name="add_project" class="btn">Add Project</button>
            </form>
        </div>
    </section>
</div>

<script>
    window.addEventListener('hashchange', () => {
        document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
        const active = window.location.hash || '#home-admin';
        document.querySelector(active).style.display = 'block';
    });
</script>
</body>
</html>