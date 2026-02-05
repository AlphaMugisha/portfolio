<?php
// --- 1. DATABASE CONNECTION ---
$conn = mysqli_connect('localhost', 'root', '', 'alpha_portfolio');

if (!$conn) {
    die("Connection failed. Make sure XAMPP MySQL is started.");
}

// --- 2. FETCH SITE SETTINGS ---
$settings_res = mysqli_query($conn, "SELECT * FROM site_settings WHERE id=1");
$settings = mysqli_fetch_assoc($settings_res);
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
        /* --- 1. MODERN CSS VARIABLES --- */
        :root {
            --primary: #8b5cf6; 
            --secondary: #ec4899; 
            --accent: #06b6d4;
            --bg-dark: #0a0a0a;
            --card-bg: rgba(20, 20, 20, 0.6);
            --glass: rgba(255, 255, 255, 0.03);
            --border: 1px solid rgba(255, 255, 255, 0.08);
            --text-main: #ffffff;
            --text-muted: #a3a3a3;
        }

        /* --- 2. RESET & BASE --- */
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Outfit', sans-serif; scroll-behavior: smooth; }
        
        body { background-color: var(--bg-dark); color: var(--text-main); overflow-x: hidden; position: relative; }

        /* --- 3. ANIMATIONS & BACKGROUND --- */
        .background-fx { position: fixed; top: 0; left: 0; width: 100%; height: 100vh; z-index: -1; overflow: hidden; }
        .blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.4; animation: float 10s infinite alternate cubic-bezier(0.4, 0, 0.2, 1); }
        .blob-1 { top: -10%; left: -10%; width: 500px; height: 500px; background: var(--primary); }
        .blob-2 { bottom: 10%; right: -10%; width: 400px; height: 400px; background: var(--secondary); animation-delay: -5s; }
        
        @keyframes float { 0% { transform: translate(0, 0); } 100% { transform: translate(50px, 50px); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

        /* --- 4. NAVIGATION --- */
        nav { width: 100%; padding: 25px 8%; display: flex; justify-content: space-between; align-items: center; position: fixed; top: 0; z-index: 1000; backdrop-filter: blur(12px); border-bottom: var(--border); background: rgba(10, 10, 10, 0.7); }
        .logo { font-size: 1.8rem; font-weight: 800; letter-spacing: -1px; }
        .logo span { color: var(--primary); }
        .nav-menu { display: flex; gap: 40px; list-style: none; }
        .nav-menu a { text-decoration: none; color: var(--text-muted); font-weight: 500; font-size: 0.95rem; transition: 0.3s; }
        .nav-menu a:hover { color: var(--text-main); }
        .btn-nav { padding: 10px 24px; border-radius: 50px; background: var(--glass); border: var(--border); color: var(--text-main); text-decoration: none; font-weight: 600; font-size: 0.9rem; transition: 0.3s; }

        /* --- 5. HERO SECTION --- */
        .hero { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 120px 8%; gap: 60px; flex-wrap: wrap-reverse; }
        .hero-content { flex: 1; min-width: 300px; }
        .badge { display: inline-block; padding: 6px 16px; background: rgba(139, 92, 246, 0.1); border: 1px solid var(--primary); color: var(--primary); border-radius: 50px; font-size: 0.85rem; font-weight: 600; margin-bottom: 25px; text-transform: uppercase; letter-spacing: 1px; }
        .hero h1 { font-size: 4.5rem; line-height: 1.1; font-weight: 800; margin-bottom: 20px; letter-spacing: -2px; }
        .hero h1 span { background: linear-gradient(to right, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .typewriter { font-size: 1.5rem; color: var(--text-muted); margin-bottom: 30px; font-weight: 400; }
        .cursor { border-right: 2px solid var(--accent); animation: blink 0.8s infinite; }
        @keyframes blink { 50% { border-color: transparent; } }

        .hero-image { position: relative; width: 350px; height: 350px; flex-shrink: 0; }
        .img-wrapper { width: 100%; height: 100%; border-radius: 50%; overflow: hidden; border: 2px solid rgba(255,255,255,0.1); position: relative; z-index: 2; }
        .img-wrapper img { width: 100%; height: 100%; object-fit: cover; }
        .circle-spin { position: absolute; top: -20px; left: -20px; width: calc(100% + 40px); height: calc(100% + 40px); border-radius: 50%; border: 2px dashed var(--primary); opacity: 0.3; animation: spin 20s linear infinite; z-index: 1; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        /* --- 6. PROJECTS SECTION & SEARCH --- */
        .section { padding: 100px 8%; }
        .section-header { margin-bottom: 60px; }
        .section-header h2 { font-size: 2.5rem; font-weight: 700; margin-bottom: 10px; }
        
        #projectSearch {
            width: 100%; padding: 15px 15px 15px 45px; background: var(--glass); border: var(--border); border-radius: 50px; color: white; outline: none; transition: 0.3s;
        }
        #projectSearch:focus { border-color: var(--primary); background: rgba(255,255,255,0.05); }

        .project-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 30px; }
        .project-card { background: var(--card-bg); border: var(--border); border-radius: 20px; padding: 35px; transition: 0.4s; position: relative; overflow: hidden; }
        .project-card:hover { transform: translateY(-10px); border-color: var(--primary); background: rgba(30,30,30,0.8); }
        .p-icon { font-size: 3rem; color: var(--primary); margin-bottom: 20px; }
        .tag { font-size: 0.75rem; padding: 6px 12px; background: rgba(255,255,255,0.05); border-radius: 8px; color: var(--text-main); border: 1px solid rgba(255,255,255,0.1); margin-right: 5px; }

        /* --- 7. CONTACT SECTION --- */
        .contact-container { display: flex; gap: 60px; flex-wrap: wrap; }
        .contact-left { flex: 1; min-width: 300px; }
        .info-item { display: flex; align-items: center; gap: 20px; margin-bottom: 30px; padding: 20px; background: var(--glass); border-radius: 15px; border: var(--border); text-decoration: none; color: #fff; transition: 0.3s; }
        .info-item:hover { background: rgba(255,255,255,0.08); border-color: var(--primary); }
        .icon-box { width: 50px; height: 50px; background: rgba(139, 92, 246, 0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--primary); font-size: 1.5rem; }
        .form-box { background: var(--card-bg); padding: 40px; border-radius: 20px; border: var(--border); flex: 1.5; }
        .input-group input, .input-group textarea { width: 100%; padding: 18px; background: rgba(0,0,0,0.3); border: var(--border); border-radius: 12px; color: #fff; outline: none; margin-bottom: 20px; }
        .btn-submit { width: 100%; padding: 18px; background: linear-gradient(90deg, var(--primary), var(--secondary)); border: none; border-radius: 12px; color: #fff; font-weight: 700; cursor: pointer; transition: 0.3s; }

        @media (max-width: 768px) { .hero h1 { font-size: 3.2rem; } .nav-menu { display: none; } }
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
            <h1>I'm <?php echo $settings['my_name']; ?><br><span>I Build Future Tech.</span></h1>
            <div class="typewriter">I am a <span id="type-text"></span><span class="cursor"></span></div>
            <p style="color: var(--text-muted); line-height: 1.7; margin-bottom: 40px; max-width: 550px;">
                <?php echo $settings['bio']; ?>
            </p>
            <div class="hero-buttons">
                <a href="#projects" class="btn-nav" style="background: white; color: black; padding: 16px 36px; border-radius: 50px;">View My Work</a>
                <a href="<?php echo $settings['github_link']; ?>" target="_blank" class="btn-nav" style="padding: 16px 36px; border-radius: 50px;">GitHub Profile</a>
            </div>
        </div>

        <div class="hero-image">
            <div class="circle-spin"></div>
            <div class="img-wrapper">
                <img src="<?php echo $settings['profile_pic']; ?>" alt="Profile">
            </div>
        </div>
    </section>

    <section id="projects" class="section">
        <div class="section-header">
            <h2>Featured Projects</h2>
            <p style="color: var(--text-muted);">A selection of my recent work in Web Development & Systems.</p>
            
            <div style="margin-top: 30px; position: relative; max-width: 400px;">
                <ion-icon name="search-outline" style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: var(--primary);"></ion-icon>
                <input type="text" id="projectSearch" placeholder="Search by tech (e.g. PHP, MySQL)...">
            </div>
        </div>

        <div class="project-grid" id="projectGrid">
            <?php
            // Load only Active projects
            $proj_res = mysqli_query($conn, "SELECT * FROM projects WHERE status='active' ORDER BY id DESC");
            while($row = mysqli_fetch_assoc($proj_res)): ?>
                <div class="project-card">
                    <div class="p-icon"><ion-icon name="<?php echo $row['icon_name']; ?>"></ion-icon></div>
                    <h3><?php echo $row['title']; ?></h3>
                    <p style="color: var(--text-muted); margin: 15px 0; line-height: 1.6;"><?php echo $row['description']; ?></p>
                    <div class="tags" style="margin-bottom: 20px;">
                        <?php 
                        $tags = explode(',', $row['tags']);
                        foreach($tags as $tag) {
                            echo '<span class="tag">'.trim($tag).'</span>';
                        }
                        ?>
                    </div>
                    <a href="<?php echo $row['link']; ?>" target="_blank" style="color: var(--primary); text-decoration: none; font-weight: 600;">View Code →</a>
                </div>
            <?php endwhile; ?>
        </div>
    </section>

    <section id="contact" class="section">
        <div class="contact-container">
            <div class="contact-left">
                <h2 style="font-size: 2.5rem; margin-bottom: 30px;">Get In Touch</h2>
                <a href="tel:<?php echo $settings['phone']; ?>" class="info-item">
                    <div class="icon-box"><ion-icon name="call-outline"></ion-icon></div>
                    <div class="info-text"><h4>Phone</h4><span><?php echo $settings['phone']; ?></span></div>
                </a>
                <a href="<?php echo $settings['insta_link']; ?>" target="_blank" class="info-item">
                    <div class="icon-box"><ion-icon name="logo-instagram"></ion-icon></div>
                    <div class="info-text"><h4>Instagram</h4><span>@Tiger.alp</span></div>
                </a>
                <a href="<?php echo $settings['github_link']; ?>" target="_blank" class="info-item">
                    <div class="icon-box"><ion-icon name="logo-github"></ion-icon></div>
                    <div class="info-text"><h4>GitHub</h4><span>Check my repos</span></div>
                </a>
            </div>

            <div class="contact-right">
                <form class="form-box">
                    <div class="input-group"><input type="text" placeholder="Your Name" required></div>
                    <div class="input-group"><input type="email" placeholder="Your Email" required></div>
                    <div class="input-group"><textarea rows="5" placeholder="Tell me about your project..." required></textarea></div>
                    <button type="submit" class="btn-submit">Send Message</button>
                </form>
            </div>
        </div>
    </section>

    <script>
        // --- 1. TYPEWRITER EFFECT ---
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

        // --- 2. LIVE SEARCH FILTER ---
        const searchInput = document.getElementById('projectSearch');
        const projectCards = document.querySelectorAll('.project-card');

        searchInput.addEventListener('input', function() {
            const filter = searchInput.value.toLowerCase();
            projectCards.forEach(card => {
                const text = card.innerText.toLowerCase();
                if (text.includes(filter)) {
                    card.style.display = "block";
                    card.style.animation = "fadeIn 0.5s ease";
                } else {
                    card.style.display = "none";
                }
            });
        });
    </script>
</body>
</html>