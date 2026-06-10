// Guarda el formulario de registro.
const formularioRegistro = seleccionar(".formulario-registro");

// Verifica que el formulario exista en la pagina.
if (formularioRegistro) {
    // Escucha el envio del registro.
    formularioRegistro.addEventListener("submit", async (evento) => {
        // Evita que la pagina se recargue.
        evento.preventDefault();

        // Guarda el campo del nombre.
        const nombre = formularioRegistro.querySelector("#nombre");

        // Guarda el campo del correo.
        const correo = formularioRegistro.querySelector("#correo");

        // Guarda el campo del alias.
        const usuario = formularioRegistro.querySelector("#usuario");

        // Guarda el campo de la contrasena.
        const contrasena = formularioRegistro.querySelector("#contrasena");

        // Guarda el campo para confirmar contrasena.
        const confirmar = formularioRegistro.querySelector("#confirmar");

        // Guarda el checkbox de normas.
        const normas = formularioRegistro.querySelector("#aceptar-normas");

        // Verifica que los campos principales esten completos.
        if (!nombre.value.trim() || !correo.value.trim() || !usuario.value.trim() || !contrasena.value.trim()) {
            // Avisa que faltan datos.
            mostrarMensaje("Completa todos los campos del registro.");

            // Detiene el registro.
            return;
        }

        // Verifica que el usuario acepte las normas.
        if (normas && !normas.checked) {
            // Avisa que debe aceptar las normas.
            mostrarMensaje("Debes aceptar las normas de uso para crear la cuenta.");

            // Detiene el registro.
            return;
        }

        // Verifica que las contrasenas coincidan.
        if (contrasena.value !== confirmar.value) {
            // Avisa que las contrasenas son diferentes.
            mostrarMensaje("Las contrasenas no coinciden.");

            // Detiene el registro.
            return;
        }

        // Valida que el nombre no incumpla las normas.
        if (!validarContenidoEtico(nombre.value, "nombre")) return;

        // Valida que el alias no incumpla las normas.
        if (!validarContenidoEtico(usuario.value, "alias")) return;

        // Intenta registrar el usuario en la API local.
        try {
            // Crea el usuario en FastAPI.
            const usuarioCreado = await apiJson("/api/usuarios", {
                method: "POST",
                body: JSON.stringify({
                    full_name: nombre.value.trim(),
                    alias: normalizarAlias(usuario.value),
                    email: correo.value.trim(),
                    password: contrasena.value,
                    profile_photo_url: null,
                    biography: ""
                })
            });

            // Guarda la sesion con el usuario creado.
            guardarSesionUsuario(usuarioCreado);

            // Envia al usuario a la pagina principal.
            irA("index.html");
        } catch (error) {
            // Muestra el error devuelto por la API.
            mostrarMensaje(error.message);
        }
    });
}
