<?php
// --- 1. DATABASE CONNECTION ---
$conn = mysqli_connect('localhost', 'root', '', 'alpha_portfolio');

if (!$conn) {
    die("<p style='color:red;'>Connection failed: Check if XAMPP MySQL is started and 'alpha_portfolio' database exists.</p>");
}

// --- 2. HANDLE FORM SUBMISSION ---
$status_msg = "";
if (isset($_POST['save_project'])) {
    $title = mysqli_real_escape_string($conn, $_POST['title']);
    $desc = mysqli_real_escape_string($conn, $_POST['desc']);
    $tags = mysqli_real_escape_string($conn, $_POST['tags']);
    $link = mysqli_real_escape_string($conn, $_POST['link']);
    $icon = mysqli_real_escape_string($conn, $_POST['icon']);

    $sql = "INSERT INTO projects (title, description, tags, link, icon_name) VALUES ('$title', '$desc', '$tags', '$link', '$icon')";
    
    if (mysqli_query($conn, $sql)) {
        $status_msg = "🚀 Project added successfully!";
    } else {
        $status_msg = "❌ Error: " . mysqli_error($conn);
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alpha | Admin Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #8b5cf6;
            --bg-dark: #0a0a0a;
            --card-bg: #111111;
            --border: 1px solid rgba(255, 255, 255, 0.08);
            --text-main: #ffffff;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Outfit', sans-serif; }

        body {
            background-color: var(--bg-dark);
            color: var(--text-main);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
        }

        .admin-container {
            background: var(--card-bg);
            border: var(--border);
            padding: 40px;
            border-radius: 20px;
            width: 100%;
            max-width: 500px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }

        h2 { font-weight: 800; margin-bottom: 10px; font-size: 1.8rem; }
        p.subtitle { color: #a3a3a3; margin-bottom: 30px; font-size: 0.9rem; }

        .status {
            padding: 12px;
            border-radius: 10px;
            background: rgba(139, 92, 246, 0.1);
            color: var(--primary);
            margin-bottom: 20px;
            font-weight: 600;
            text-align: center;
        }

        .input-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 8px; font-size: 0.85rem; color: #a3a3a3; font-weight: 600; }

        input, textarea, select {
            width: 100%;
            padding: 14px;
            background: #000;
            border: var(--border);
            border-radius: 10px;
            color: white;
            font-size: 1rem;
            outline: none;
            transition: 0.3s;
        }

        input:focus, textarea:focus { border-color: var(--primary); }

        .btn-submit {
            width: 100%;
            padding: 16px;
            background: var(--primary);
            color: white;
            border: none;
            border-radius: 10px;
            font-weight: 800;
            cursor: pointer;
            transition: 0.3s;
            margin-top: 10px;
        }

        .btn-submit:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(139, 92, 246, 0.3); }

        .back-link {
            display: block;
            text-align: center;
            margin-top: 25px;
            color: #a3a3a3;
            text-decoration: none;
            font-size: 0.9rem;
            transition: 0.3s;
        }
        .back-link:hover { color: white; }
    </style>
</head>
<body>

    <div class="admin-container">
        <h2>Alpha's Dashboard</h2>
        <p class="subtitle">Add a new project to your live portfolio.</p>

        <?php if($status_msg != ""): ?>
            <div class="status"><?php echo $status_msg; ?></div>
        <?php endif; ?>

        <form method="POST">
            <div class="input-group">
                <label>Project Title</label>
                <input type="text" name="title" placeholder="e.g. AI Chatbox" required>
            </div>

            <div class="input-group">
                <label>Description</label>
                <textarea name="desc" rows="3" placeholder="What does this project do?" required></textarea>
            </div>

            <div class="input-group">
                <label>Tags</label>
                <input type="text" name="tags" placeholder="PHP, MySQL, JavaScript">
            </div>

            <div class="input-group">
                <label>GitHub Link</label>
                <input type="url" name="link" placeholder="https://github.com/...">
            </div>

            <div class="input-group">
                <label>Card Icon</label>
                <select name="icon">
                    <option value="code-slash-outline">Code Block</option>
                    <option value="rocket-outline">Rocket (Aviation)</option>
                    <option value="desktop-outline">Desktop Monitor</option>
                    <option value="alarm-outline">Alarm Clock</option>
                    <option value="musical-notes-outline">Music Player</option>
                    <option value="hardware-chip-outline">Robotics / AI</option>
                </select>
            </div>

            <button type="submit" name="save_project" class="btn-submit">Push to Portfolio</button>
        </form>

        <a href="index.php" class="back-link">← Return to Live Site</a>
    </div>

</body>
</html>