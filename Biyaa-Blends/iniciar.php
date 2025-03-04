<?php
$dbhost = "sql307.infinityfree.com";
$dbuser = "if0_38442115";
$dbpass = "0HrQfQI88Bpkv";
$dbname = "if0_38442115_project";
$conn = mysqli_connect($dbhost, $dbuser, $dbpass, $dbname);
if (!$conn)
{
die("No hay conexión: ".mysqli_connect_error());
}
$nombre= $_POST["txtusuario"];
$pass = $_POST["txtpassword"];
$query = mysqli_query($conn, "SELECT * FROM registro WHERE usuario = '".$nombre."'  and password = '".$pass."'");
$nr= mysqli_num_rows($query);
if($nr == 1)
{
    // Almacenar el nombre de usuario y redirigir
    echo "<script>
    console.log('Usuario autenticado correctamente: " . $nombre . "');
    localStorage.setItem('currentUser', '" . $nombre . "');
    alert('Bienvenido " . $nombre . "');
    window.location = 'index.html';
    </script>";
}
else if ($nr == 0)
{
    echo "<script> alert('Usuario o contraseña incorrectos. Registrate si no tienes cuenta.'); window.location= 'registro.html' </script>";
}
?>