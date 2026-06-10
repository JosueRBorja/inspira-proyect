// Guarda el formulario de inicio de sesion.
const formularioLogin = seleccionar(".formulario-login");

// Verifica que el formulario exista en la pagina.
if (formularioLogin) {
    // Escucha el envio del formulario.
    formularioLogin.addEventListener("submit", async (evento) => {
        // Evita que la pagina se recargue.
        evento.preventDefault();

        // Guarda el campo del correo.
        const correo = formularioLogin.querySelector("#correo");

        // Guarda el campo de la contrasena.
        const contrasena = formularioLogin.querySelector("#contrasena");

        // Verifica que el usuario escriba ambos campos.
        if (!correo.value.trim() || !contrasena.value.trim()) {
            // Avisa que faltan datos.
            mostrarMensaje("Completa el correo y la contrasena.");

            // Detiene el inicio de sesion.
            return;
        }

        // Intenta iniciar sesion contra la API local.
        try {
            // Envia correo y contrasena a FastAPI.
            const respuesta = await apiJson("/api/autenticacion/login", {
                method: "POST",
                body: JSON.stringify({
                    email: correo.value.trim(),
                    password: contrasena.value
                })
            });

            // Guarda el usuario recibido por la API.
            guardarSesionUsuario(respuesta.usuario);

            // Envia al usuario a la pagina principal.
            irA("index.html");
        } catch (error) {
            // Muestra el error devuelto por la API.
            mostrarMensaje(error.message);
        }
    });
}
