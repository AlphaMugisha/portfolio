<?php
session_start();
// --- 1. DATABASE CONNECTION ---
$conn = mysqli_connect('localhost', 'root', '', 'alpha_portfolio');

if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

if (isset($_POST['login'])) {
    $user = mysqli_real_escape_string($conn, $_POST['username']);
    $pass = $_POST['password']; // This is what you type in the box

    // --- 2. QUERY THE USER ---
    $result = mysqli_query($conn, "SELECT * FROM admin_users WHERE username='$user'");
    
    if (mysqli_num_rows($result) == 1) {
        $row = mysqli_fetch_assoc($result);
        
        // --- 3. THE "CLEAR TEXT" CHECK ---
        // We are checking if the password in the DB matches exactly what you typed
        if ($pass === $row['password']) {
            $_SESSION['admin_logged_in'] = true;
            header("Location: admin.php"); // Takes you to the dashboard
            exit();
        } else {
            $error = "❌ Password does not match our records.";
        }
    } else {
        $error = "❌ Username '$user' not found.";
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Alpha | Emergency Login</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;800&display=swap" rel="stylesheet">
    <style>
        body { background: #050505; color: white; font-family: 'Outfit'; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .login-card { background: #111; padding: 40px; border-radius: 20px; border: 1px solid #222; width: 350px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        h2 { color: #8b5cf6; margin-bottom: 10px; }
        p { color: #666; font-size: 0.9rem; margin-bottom: 25px; }
        input { width: 100%; padding: 14px; margin: 10px 0; background: #000; border: 1px solid #333; color: white; border-radius: 10px; outline: none; }
        input:focus { border-color: #8b5cf6; }
        button { background: #8b5cf6; color: white; border: none; padding: 14px; width: 100%; border-radius: 10px; cursor: pointer; font-weight: 800; margin-top: 10px; transition: 0.3s; }
        button:hover { opacity: 0.9; transform: translateY(-2px); }
        .error { color: #ef4444; font-size: 0.85rem; margin-bottom: 15px; }
    </style>
</head>
<body>
    <div class="login-card">
        <form method="POST">
            <h2>Alpha Admin</h2>
            <p>Emergency Bypass Mode (Plain Text)</p>
            
            <?php if(isset($error)) echo "<div class='error'>$error</div>"; ?>
            
            <input type="text" name="username" placeholder="Username" required>
            <input type="password" name="password" placeholder="Password" required>
            
            <button type="submit" name="login">Enter Dashboard</button>
        </form>
    </div>
</body>
</html>