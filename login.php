<?php
session_start();
$conn = mysqli_connect('localhost', 'root', '', 'alpha_portfolio');

if (isset($_POST['login'])) {
    $user = mysqli_real_escape_string($conn, $_POST['username']);
    $pass = $_POST['password'];

    $result = mysqli_query($conn, "SELECT * FROM admin_users WHERE username='$user'");
    if (mysqli_num_rows($result) == 1) {
        $row = mysqli_fetch_assoc($result);
        if (password_verify($pass, $row['password'])) {
            $_SESSION['admin_logged_in'] = true;
            header("Location: admin.php");
            exit();
        }
    }
    $error = "❌ Invalid credentials!";
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Alpha | Login</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;800&display=swap" rel="stylesheet">
    <style>
        body { background: #050505; color: white; font-family: 'Outfit'; display: flex; justify-content: center; align-items: center; height: 100vh; }
        .login-card { background: #111; padding: 40px; border-radius: 20px; border: 1px solid #222; width: 350px; text-align: center; }
        input { width: 100%; padding: 12px; margin: 10px 0; background: #000; border: 1px solid #333; color: white; border-radius: 8px; }
        button { background: #8b5cf6; color: white; border: none; padding: 12px; width: 100%; border-radius: 8px; cursor: pointer; font-weight: bold; }
    </style>
</head>
<body>
    <form class="login-card" method="POST">
        <h2>Alpha Admin</h2>
        <?php if(isset($error)) echo "<p style='color:red'>$error</p>"; ?>
        <input type="text" name="username" placeholder="Username" required>
        <input type="password" name="password" placeholder="Password" required>
        <button type="submit" name="login">Enter Dashboard</button>
    </form>
</body>
</html>