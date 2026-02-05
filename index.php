<?php
$conn = mysqli_connect('localhost', 'root', '', 'alpha_portfolio');
$settings = mysqli_fetch_assoc(mysqli_query($conn, "SELECT * FROM site_settings WHERE id=1"));

if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['send_msg'])) {
    $name = mysqli_real_escape_string($conn, $_POST['name']);
    $email = mysqli_real_escape_string($conn, $_POST['email']);
    $msg = mysqli_real_escape_string($conn, $_POST['message']);
    mysqli_query($conn, "INSERT INTO contact_messages (name, email, message) VALUES ('$name', '$email', '$msg')");
    $sent = true;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title><?php echo $settings['my_name']; ?> | Portfolio</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <script type="module" src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js"></script>
    <link rel="stylesheet" href="style.css"> </head>
<body>
    <div class="background-fx"><div class="blob blob-1"></div><div class="blob blob-2"></div></div>
    
    <nav style="width:100%; padding:25px 8%; display:flex; justify-content:space-between; position:fixed; top:0; z-index:1000; backdrop-filter:blur(12px); border-bottom:var(--border);">
        <div style="font-size:1.8rem; font-weight:800;">Alpha<span>.Dev</span></div>
    </nav>

    <section id="home" style="min-height:100vh; display:flex; align-items:center; padding:120px 8%; gap:60px;">
        <div style="flex:1;">
            <h1>I'm <?php echo $settings['my_name']; ?><br><span style="background:linear-gradient(to right, var(--primary), var(--secondary)); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">Building Future Tech.</span></h1>
            <p style="color:var(--text-muted); margin:30px 0;"><?php echo $settings['bio']; ?></p>
            <div style="display:flex; gap:15px;">
                <a href="#projects" class="btn" style="text-decoration:none; text-align:center; width:auto; padding:16px 36px; border-radius:50px;">View Work</a>
            </div>
        </div>
        <div style="width:350px; height:350px; border-radius:50%; overflow:hidden; border:2px solid #222;">
            <img src="<?php echo $settings['profile_pic']; ?>" style="width:100%; height:100%; object-fit:cover;">
        </div>
    </section>

    <section id="projects" style="padding:100px 8%;">
        <h2 style="font-size:2.5rem; margin-bottom:40px;">Projects</h2>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:30px;">
            <?php
            $res = mysqli_query($conn, "SELECT * FROM projects WHERE status='active' ORDER BY id DESC");
            while($row = mysqli_fetch_assoc($res)): ?>
                <div class="project-card">
                    <ion-icon name="<?php echo $row['icon_name']; ?>" style="font-size:3rem; color:var(--primary);"></ion-icon>
                    <h3 style="margin:20px 0;"><?php echo $row['title']; ?></h3>
                    <p style="color:var(--text-muted); margin-bottom:20px;"><?php echo $row['description']; ?></p>
                    <a href="<?php echo $row['link']; ?>" style="color:var(--primary); text-decoration:none; font-weight:800;">View Source →</a>
                </div>
            <?php endwhile; ?>
        </div>
    </section>

    <script>
        const cards = document.querySelectorAll('.project-card');
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                card.style.transform = `perspective(1000px) rotateY(${x * 20}deg) rotateX(${-y * 20}deg) translateY(-10px)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = `perspective(1000px) rotateY(0) rotateX(0) translateY(0)`;
            });
        });
    </script>
</body>
</html>