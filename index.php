<?php
$conn = mysqli_connect('localhost', 'root', '', 'alpha_portfolio');
$settings = mysqli_fetch_assoc(mysqli_query($conn, "SELECT * FROM site_settings WHERE id=1"));
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $settings['my_name']; ?> | Portfolio</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <script type="module" src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js"></script>
    <style>
        :root { --primary: #8b5cf6; --secondary: #ec4899; --bg: #0a0a0a; --card: rgba(20,20,20,0.6); --border: 1px solid rgba(255,255,255,0.08); }
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Outfit', sans-serif; scroll-behavior: smooth; }
        body { background: var(--bg); color: #fff; overflow-x: hidden; }
        .background-fx { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; }
        .blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.4; animation: float 10s infinite alternate; }
        .blob-1 { top: -10%; left: -10%; width: 500px; height: 500px; background: var(--primary); }
        .blob-2 { bottom: 10%; right: -10%; width: 400px; height: 400px; background: var(--secondary); }
        @keyframes float { 0% { transform: translate(0,0); } 100% { transform: translate(50px,50px); } }
        nav { width: 100%; padding: 25px 8%; display: flex; justify-content: space-between; align-items: center; position: fixed; top: 0; backdrop-filter: blur(12px); border-bottom: var(--border); z-index: 1000; }
        .hero { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 120px 8%; gap: 60px; flex-wrap: wrap-reverse; }
        .hero h1 { font-size: 4.5rem; line-height: 1.1; font-weight: 800; }
        .hero h1 span { background: linear-gradient(to right, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero-image { position: relative; width: 350px; height: 350px; }
        .img-wrapper { width: 100%; height: 100%; border-radius: 50%; overflow: hidden; border: 2px solid rgba(255,255,255,0.1); z-index: 2; position: relative; }
        .img-wrapper img { width: 100%; height: 100%; object-fit: cover; }
        .section { padding: 100px 8%; }
        .project-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 30px; }
        .project-card { background: var(--card); border: var(--border); border-radius: 20px; padding: 35px; transition: 0.4s; }
        .project-card:hover { transform: translateY(-10px); border-color: var(--primary); }
    </style>
</head>
<body>
    <div class="background-fx"><div class="blob blob-1"></div><div class="blob blob-2"></div></div>
    <nav><div style="font-size:1.8rem; font-weight:800;">Alpha<span>.Dev</span></div></nav>
    <section id="home" class="hero">
        <div style="flex:1;">
            <div style="color:var(--primary); font-weight:600; margin-bottom:20px;">READY FOR NEW CHALLENGES</div>
            <h1>I'm <?php echo $settings['my_name']; ?><br><span>Building Future Tech.</span></h1>
            <p style="color:#aaa; margin-top:30px; max-width:550px;"><?php echo $settings['bio']; ?></p>
            <div style="margin-top:40px; display:flex; gap:15px;">
                <a href="#projects" style="background:#fff; color:#000; padding:16px 36px; border-radius:50px; text-decoration:none; font-weight:700;">View Work</a>
                <a href="<?php echo $settings['github_link']; ?>" target="_blank" style="border:1px solid #555; color:#fff; padding:16px 36px; border-radius:50px; text-decoration:none;">GitHub</a>
            </div>
        </div>
        <div class="hero-image">
            <div class="img-wrapper"><img src="<?php echo $settings['profile_pic']; ?>"></div>
        </div>
    </section>
    <section id="projects" class="section">
        <h2 style="font-size:2.5rem; margin-bottom:50px;">Featured Projects</h2>
        <div class="project-grid">
            <?php
            $res = mysqli_query($conn, "SELECT * FROM projects WHERE status='active' ORDER BY id DESC");
            while($row = mysqli_fetch_assoc($res)): ?>
            <div class="project-card">
                <ion-icon name="<?php echo $row['icon_name']; ?>" style="font-size:3rem; color:var(--primary);"></ion-icon>
                <h3 style="margin-top:20px;"><?php echo $row['title']; ?></h3>
                <p style="color:#aaa; margin:15px 0;"><?php echo $row['description']; ?></p>
                <div style="display:flex; gap:10px; margin-bottom:20px;">
                    <?php foreach(explode(',', $row['tags']) as $tag): ?>
                    <span style="font-size:0.75rem; background:rgba(255,255,255,0.05); padding:5px 10px; border-radius:5px;"><?php echo trim($tag); ?></span>
                    <?php endforeach; ?>
                </div>
                <a href="<?php echo $row['link']; ?>" target="_blank" style="color:var(--primary); text-decoration:none; font-weight:600;">View Code →</a>
            </div>
            <?php endwhile; ?>
        </div>
    </section>
</body>
</html>