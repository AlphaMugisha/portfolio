<?php
$conn = mysqli_connect('localhost', 'root', '', 'alpha_portfolio');
$settings = mysqli_fetch_assoc(mysqli_query($conn, "SELECT * FROM site_settings WHERE id=1"));

// --- HANDLE INCOMING MESSAGES ---
$msg_status = "";
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['send_msg'])) {
    $name = mysqli_real_escape_string($conn, $_POST['name']);
    $email = mysqli_real_escape_string($conn, $_POST['email']);
    $msg = mysqli_real_escape_string($conn, $_POST['message']);
    
    $sql = "INSERT INTO contact_messages (name, email, message) VALUES ('$name', '$email', '$msg')";
    if(mysqli_query($conn, $sql)) {
        $msg_status = "🚀 Message sent! Alpha will get back to you.";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title><?php echo $settings['my_name']; ?> | Portfolio</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <script type="module" src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js"></script>
    <style>
        :root { --primary: #8b5cf6; --secondary: #ec4899; --bg: #0a0a0a; --card: rgba(20,20,20,0.6); --border: 1px solid rgba(255,255,255,0.08); --text-muted: #a3a3a3; }
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Outfit', sans-serif; scroll-behavior: smooth; }
        body { background: var(--bg); color: #fff; overflow-x: hidden; }
        .background-fx { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; }
        .blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.4; animation: float 10s infinite alternate; }
        .blob-1 { top: -10%; left: -10%; width: 500px; height: 500px; background: var(--primary); }
        .blob-2 { bottom: 10%; right: -10%; width: 400px; height: 400px; background: var(--secondary); }
        @keyframes float { 0% { transform: translate(0,0); } 100% { transform: translate(50px,50px); } }
        nav { width: 100%; padding: 25px 8%; display: flex; justify-content: space-between; align-items: center; position: fixed; top: 0; backdrop-filter: blur(12px); border-bottom: var(--border); z-index: 1000; background: rgba(10,10,10,0.7); }
        .hero { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 120px 8%; gap: 60px; flex-wrap: wrap-reverse; }
        .hero h1 { font-size: 4.5rem; font-weight: 800; line-height: 1.1; }
        .hero h1 span { background: linear-gradient(to right, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero-image { position: relative; width: 350px; height: 350px; }
        .img-wrapper { width: 100%; height: 100%; border-radius: 50%; overflow: hidden; border: 2px solid rgba(255,255,255,0.1); z-index: 2; position: relative; }
        .img-wrapper img { width: 100%; height: 100%; object-fit: cover; }
        .section { padding: 100px 8%; }
        .project-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 30px; }
        .project-card { background: var(--card); border: var(--border); border-radius: 20px; padding: 35px; transition: 0.4s; }
        .project-card:hover { transform: translateY(-10px); border-color: var(--primary); }
        .tag { font-size: 0.75rem; background: rgba(255,255,255,0.05); padding: 5px 10px; border-radius: 8px; margin-right: 5px; border: 1px solid rgba(255,255,255,0.1); }
        input, textarea { width: 100%; padding: 18px; background: rgba(0,0,0,0.3); border: var(--border); border-radius: 12px; color: #fff; margin-bottom: 20px; outline: none; }
        .btn-submit { width: 100%; padding: 18px; background: linear-gradient(90deg, var(--primary), var(--secondary)); border: none; border-radius: 12px; color: #fff; font-weight: 700; cursor: pointer; }
    </style>
</head>
<body>
    <div class="background-fx"><div class="blob blob-1"></div><div class="blob blob-2"></div></div>
    <nav><div style="font-size:1.8rem; font-weight:800;">Alpha<span>.Dev</span></div></nav>
    
    <section id="home" class="hero">
        <div style="flex:1;">
            <div style="color:var(--primary); font-weight:600; margin-bottom:20px; letter-spacing:1px;">AVAILABLE FOR HIRE</div>
            <h1>I'm <?php echo $settings['my_name']; ?><br><span>Building Future Tech.</span></h1>
            <div style="font-size: 1.5rem; color: var(--text-muted); margin: 30px 0;"><span id="type-text"></span></div>
            <p style="color:#aaa; max-width:550px;"><?php echo $settings['bio']; ?></p>
            <div style="margin-top:40px; display:flex; gap:15px;">
                <a href="#projects" style="background:#fff; color:#000; padding:16px 36px; border-radius:50px; text-decoration:none; font-weight:700;">View Work</a>
                <a href="<?php echo $settings['github_link']; ?>" target="_blank" style="border:1px solid #555; color:#fff; padding:16px 36px; border-radius:50px; text-decoration:none;">GitHub</a>
            </div>
        </div>
        <div class="hero-image"><div class="img-wrapper"><img src="<?php echo $settings['profile_pic']; ?>"></div></div>
    </section>

    <section id="projects" class="section">
        <div style="margin-bottom: 50px;">
            <h2 style="font-size:2.5rem;">Featured Projects</h2>
            <input type="text" id="projectSearch" placeholder="Search tech (PHP, JS)..." style="max-width:400px; margin-top:20px;">
        </div>
        <div class="project-grid" id="projectGrid">
            <?php
            $res = mysqli_query($conn, "SELECT * FROM projects WHERE status='active' ORDER BY id DESC");
            while($row = mysqli_fetch_assoc($res)): ?>
            <div class="project-card">
                <ion-icon name="<?php echo $row['icon_name']; ?>" style="font-size:3rem; color:var(--primary);"></ion-icon>
                <h3 style="margin-top:20px;"><?php echo $row['title']; ?></h3>
                <p style="color:#aaa; margin:15px 0;"><?php echo $row['description']; ?></p>
                <div style="margin-bottom:20px;">
                    <?php foreach(explode(',', $row['tags']) as $tag) echo "<span class='tag'>".trim($tag)."</span>"; ?>
                </div>
                <a href="<?php echo $row['link']; ?>" target="_blank" style="color:var(--primary); text-decoration:none; font-weight:600;">View Code →</a>
            </div>
            <?php endwhile; ?>
        </div>
    </section>

    <section id="contact" class="section">
        <div style="display:flex; gap:60px; flex-wrap:wrap;">
            <div style="flex:1;">
                <h2 style="font-size:2.5rem; margin-bottom:30px;">Get In Touch</h2>
                <p style="margin-bottom:20px;">Phone: <?php echo $settings['phone']; ?></p>
                <a href="<?php echo $settings['insta_link']; ?>" style="color:var(--primary);">Instagram Profile</a>
            </div>
            <div style="flex:1.5;">
                <?php if($msg_status) echo "<p style='color:var(--primary); margin-bottom:20px;'>$msg_status</p>"; ?>
                <form method="POST">
                    <input type="text" name="name" placeholder="Your Name" required>
                    <input type="email" name="email" placeholder="Your Email" required>
                    <textarea name="message" rows="5" placeholder="Your Message..." required></textarea>
                    <button type="submit" name="send_msg" class="btn-submit">Send Message</button>
                </form>
            </div>
        </div>
    </section>

    <script>
        const textElement = document.getElementById('type-text');
        const phrases = ["Web Developer", "Aviation Enthusiast", "Class President"];
        let pI = 0, cI = 0, isD = false;
        function type() {
            const cur = phrases[pI];
            textElement.innerText = isD ? cur.substring(0, cI--) : cur.substring(0, cI++);
            if(!isD && cI > cur.length) { isD = true; setTimeout(type, 2000); }
            else if(isD && cI < 0) { isD = false; pI = (pI+1)%phrases.length; setTimeout(type, 500); }
            else setTimeout(type, isD ? 100 : 150);
        }
        type();

        document.getElementById('projectSearch').addEventListener('input', function(e) {
            const val = e.target.value.toLowerCase();
            document.querySelectorAll('.project-card').forEach(card => {
                card.style.display = card.innerText.toLowerCase().includes(val) ? "block" : "none";
            });
        });
    </script>
</body>
</html>