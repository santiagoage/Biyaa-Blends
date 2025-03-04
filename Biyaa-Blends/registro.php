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
$name = $_POST["txtnombre"];
$usuario= $_POST["txtusuario"];
$pass = $_POST["txtpassword"];
$email= $_POST["txtemail"];

$resultado = mysqli_query($conn, "SELECT * FROM registro WHERE email ='" .$email."'");
$nr= mysqli_num_rows($resultado);
if($nr > 0)
{

echo "<script> alert('ERROR correo repetido'); window.location= 'registro.html' </script>";

}else{

$insert_value = "INSERT INTO registro (name, usuario, password, email) VALUES ('$name','$usuario', '$pass','$email')";
mysqli_select_db($conn, $dbname);
$retry_value = mysqli_query($conn, $insert_value);

if(!$retry_value){
   
die('Error'.mysqli_error());
   }
echo "<script> alert('Registrado'); window.location= 'inicio.html' </script>";
}

mysqli_close($conn);

?>