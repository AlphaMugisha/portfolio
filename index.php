<?php
// --- 1. DATABASE CONNECTION ---
$host = 'localhost';
$user = 'root';
$pass = '';
$dbname = 'alpha_portfolio';

$conn = mysqli_connect($host, $user, $pass, $dbname);

if (!$conn) {
    $db_connected = false;
    // Fallback data so the site doesn't look broken if DB fails
    $site = [
        'my_name' => 'Alpha Mugisha',
        'my_role' => 'Developer',
        'bio' => 'Full-Stack Developer and Aviation Enthusiast.',
        'phone' => '+250 788 000 000',
        'github_link' => '#',
        'insta_link' => '#'
    ];
} else {
    $db_connected = true;
    // Fetch Global Settings
    $settings_query = mysqli_query($conn, "SELECT * FROM site_settings WHERE id=1");
    $site = mysqli_fetch_assoc($settings_query);
}

// --- 2. CONTACT FORM LOGIC ---
$message_sent = false;
if (isset($_POST['email']) && $_POST['email'] != '') {
    if (filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)) {
        $message_sent = true;
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $site['my_name']; ?> | Portfolio</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <script type="module" src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js"></script>

    <style>
        :root {
            --primary: #8b5cf6; --secondary: #ec4899; --accent: #06b6d4;
            --bg-dark: #0a0a0a; --card-bg: rgba(20, 20, 20, 0.6);
            --glass: rgba(255, 255, 255, 0.03); --border: 1px solid rgba(255, 255, 255, 0.08);
            --text-main: #ffffff; --text-muted: #a3a3a3;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Outfit', sans-serif; scroll-behavior: smooth; }
        body { background-color: var(--bg-dark); color: var(--text-main); overflow-x: hidden; }
        
        .background-fx { position: fixed; top: 0; left: 0; width: 100%; height: 100vh; z-index: -1; overflow: hidden; }
        .blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.4; animation: float 10s infinite alternate; }
        .blob-1 { top: -10%; left: -10%; width: 500px; height: 500px; background: var(--primary); }
        .blob-2 { bottom: 10%; right: -10%; width: 400px; height: 400px; background: var(--secondary); }
        @keyframes float { 0% { transform: translate(0, 0); } 100% { transform: translate(50px, 50px); } }

        nav { width: 100%; padding: 25px 8%; display: flex; justify-content: space-between; align-items: center; position: fixed; top: 0; z-index: 1000; backdrop-filter: blur(12px); border-bottom: var(--border); background: rgba(10, 10, 10, 0.7); }
        .logo { font-size: 1.8rem; font-weight: 800; } .logo span { color: var(--primary); }
        .nav-menu { display: flex; gap: 40px; list-style: none; }
        .nav-menu a { text-decoration: none; color: var(--text-muted); transition: 0.3s; }
        .btn-nav { padding: 10px 24px; border-radius: 50px; background: var(--glass); border: var(--border); color: #fff; text-decoration: none; }

        .hero { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 120px 8%; gap: 60px; flex-wrap: wrap-reverse; }
        .badge { display: inline-block; padding: 6px 16px; background: rgba(139, 92, 246, 0.1); border: 1px solid var(--primary); color: var(--primary); border-radius: 50px; font-size: 0.85rem; margin-bottom: 25px; }
        .hero h1 { font-size: 4.5rem; line-height: 1.1; font-weight: 800; letter-spacing: -2px; }
        .hero h1 span { background: linear-gradient(to right, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .typewriter { font-size: 1.5rem; color: var(--text-muted); margin-bottom: 30px; }
        .cursor { border-right: 2px solid var(--accent); animation: blink 0.8s infinite; }
        @keyframes blink { 50% { border-color: transparent; } }

        .hero-image { position: relative; width: 350px; height: 350px; }
        .img-wrapper { width: 100%; height: 100%; border-radius: 50%; overflow: hidden; border: 2px solid rgba(255,255,255,0.1); z-index: 2; position: relative;}
        .img-wrapper img { width: 100%; height: 100%; object-fit: cover; }
        .circle-spin { position: absolute; top: -20px; left: -20px; width: calc(100% + 40px); height: calc(100% + 40px); border-radius: 50%; border: 2px dashed var(--primary); opacity: 0.3; animation: spin 20s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        .section { padding: 100px 8%; }
        .project-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 30px; }
        .project-card { background: var(--card-bg); border: var(--border); border-radius: 20px; padding: 35px; transition: 0.4s; }
        .project-card:hover { transform: translateY(-10px); border-color: var(--primary); background: rgba(30,30,30,0.8); }
        .p-icon { font-size: 3rem; color: var(--primary); margin-bottom: 20px; }
        .tag { font-size: 0.75rem; padding: 6px 12px; background: rgba(255,255,255,0.05); border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); margin-right: 5px; }
        
        .contact-container { display: flex; gap: 60px; flex-wrap: wrap; }
        .info-item { display: flex; align-items: center; gap: 20px; margin-bottom: 30px; padding: 20px; background: var(--glass); border-radius: 15px; border: var(--border); text-decoration: none; color: #fff; }
        .form-box { background: var(--card-bg); padding: 40px; border-radius: 20px; border: var(--border); flex: 1.5; }
        .input-group input, .input-group textarea { width: 100%; padding: 18px; background: rgba(0,0,0,0.3); border: var(--border); border-radius: 12px; color: #fff; margin-bottom: 20px; outline: none; }
        .btn-submit { width: 100%; padding: 18px; background: linear-gradient(90deg, var(--primary), var(--secondary)); border: none; border-radius: 12px; color: #fff; font-weight: 700; cursor: pointer; }

        @media (max-width: 768px) { .hero h1 { font-size: 3rem; } .nav-menu { display: none; } }
    </style>
</head>
<body>

    <div class="background-fx">
        <div class="blob blob-1"></div>
        <div class="blob blob-2"></div>
    </div>

    <nav>
        <div class="logo">Alpha<span>.Dev</span></div>
        <ul class="nav-menu">
            <li><a href="#home">Home</a></li>
            <li><a href="#projects">Work</a></li>
            <li><a href="#contact">Contact</a></li>
        </ul>
        <a href="#contact" class="btn-nav">Let's Talk</a>
    </nav>

    <section id="home" class="hero">
        <div class="hero-content">
            <div class="badge">Available for Hire (<?php echo date('Y'); ?>)</div>
            <h1>I'm <?php echo $site['my_name']; ?><br><span>I Build Future Tech.</span></h1>
            <div class="typewriter">I am a <span id="type-text"></span><span class="cursor"></span></div>
            <p><?php echo $site['bio']; ?></p>
            <div class="hero-buttons">
                <a href="#projects" class="btn-primary">View My Work</a>
                <a href="<?php echo $site['github_link']; ?>" target="_blank" class="btn-outline">GitHub Profile</a>
            </div>
        </div>

        <div class="hero-image">
            <div class="circle-spin"></div>
            <div class="img-wrapper">
                <img src="me.png" alt="Alpha Mugisha">
            </div>
        </div>
    </section>

    <section id="projects" class="section">
        <div class="section-header" style="margin-bottom: 60px;">
            <h2 style="font-size: 2.5rem; font-weight: 700;">Featured Projects</h2>
            <p style="color: var(--text-muted);">Dynamically loaded from your dashboard.</p>
        </div>

        <div class="project-grid">
            <?php
            if ($db_connected) {
                $p_res = mysqli_query($conn, "SELECT * FROM projects ORDER BY id DESC");
                while($row = mysqli_fetch_assoc($p_res)) {
                    ?>
                    <div class="project-card">
                        <div class="p-icon"><ion-icon name="<?php echo $row['icon_name']; ?>"></ion-icon></div>
                        <h3><?php echo htmlspecialchars($row['title']); ?></h3>
                        <p style="color: var(--text-muted); margin: 15px 0;"><?php echo htmlspecialchars($row['description']); ?></p>
                        <div class="tags" style="margin-bottom: 20px;">
                            <?php 
                            foreach(explode(',', $row['tags']) as $tag) {
                                echo '<span class="tag">'.trim($tag).'</span>';
                            }
                            ?>
                        </div>
                        <a href="<?php echo $row['link']; ?>" target="_blank" style="color: var(--primary); text-decoration: none; font-weight: 600;">View Code →</a>
                    </div>
                    <?php
                }
            }
            ?>
        </div>
    </section>

    <section id="contact" class="section">
        <div class="section-header" style="margin-bottom: 60px;">
            <h2>Get In Touch</h2>
        </div>

        <div class="contact-container">
            <div class="contact-left" style="flex: 1;">
                <a href="tel:<?php echo $site['phone']; ?>" class="info-item">
                    <div class="icon-box" style="font-size: 1.5rem; color: var(--primary);"><ion-icon name="call-outline"></ion-icon></div>
                    <div class="info-text"><h4>Phone</h4><span><?php echo $site['phone']; ?></span></div>
                </a>
                <a href="<?php echo $site['github_link']; ?>" target="_blank" class="info-item">
                    <div class="icon-box" style="font-size: 1.5rem; color: var(--primary);"><ion-icon name="logo-github"></ion-icon></div>
                    <div class="info-text"><h4>GitHub</h4><span>Check my repos</span></div>
                </a>
            </div>

            <div class="contact-right">
                <?php if($message_sent): ?><p style="color: #10b981; margin-bottom: 20px;">🚀 Message sent successfully!</p><?php endif; ?>
                <form action="index.php" method="POST" class="form-box">
                    <div class="input-group"><input type="text" name="name" placeholder="Your Name" required></div>
                    <div class="input-group"><input type="email" name="email" placeholder="Your Email" required></div>
                    <div class="input-group"><textarea name="message" rows="5" placeholder="Tell me about your project..." required></textarea></div>
                    <button type="submit" class="btn-submit">Send Message</button>
                </form>
            </div>
        </div>
    </section>

    <script>
        const textElement = document.getElementById('type-text');
        const phrases = ["Web Developer", "Class President", "Robotics Enthusiast", "Pilot in Training"];
        let phraseIndex = 0; let charIndex = 0; let isDeleting = false;

        function typeEffect() {
            const currentPhrase = phrases[phraseIndex];
            if (isDeleting) { textElement.innerText = currentPhrase.substring(0, charIndex--); }
            else { textElement.innerText = currentPhrase.substring(0, charIndex++); }

            if (!isDeleting && charIndex === currentPhrase.length + 1) { isDeleting = true; setTimeout(typeEffect, 2000); }
            else if (isDeleting && charIndex === 0) { isDeleting = false; phraseIndex = (phraseIndex + 1) % phrases.length; setTimeout(typeEffect, 500); }
            else { setTimeout(typeEffect, isDeleting ? 100 : 150); }
        }
        document.addEventListener('DOMContentLoaded', typeEffect);
    </script>
</body>
</html>