// Guarda el formulario de registro.
const formularioRegistro = seleccionar(".formulario-registro");

// Verifica que el formulario exista en la pagina.
if (formularioRegistro) {
    // Escucha el envio del registro.
    $(formularioRegistro).on("submit", async (evento) => {
        // Evita que la pagina se recargue.
        evento.preventDefault();

        // Guarda el campo del nombre.
        const nombre = seleccionar("#nombre", formularioRegistro);

        // Guarda el campo del correo.
        const correo = seleccionar("#correo", formularioRegistro);

        // Guarda el campo del alias.
        const usuario = seleccionar("#usuario", formularioRegistro);

        // Guarda el campo de la contrasena.
        const contrasena = seleccionar("#contrasena", formularioRegistro);

        // Guarda el campo para confirmar contrasena.
        const confirmar = seleccionar("#confirmar", formularioRegistro);

        // Guarda el checkbox de normas.
        const normas = seleccionar("#aceptar-normas", formularioRegistro);

        // Verifica que los campos principales esten completos.
        if (!$(nombre).val().trim() || !$(correo).val().trim() || !$(usuario).val().trim() || !$(contrasena).val().trim()) {
            // Avisa que faltan datos.
            mostrarMensaje("Completa todos los campos del registro.");

            // Detiene el registro.
            return;
        }

        // Verifica que el usuario acepte las normas.
        if (normas && !$(normas).prop("checked")) {
            // Avisa que debe aceptar las normas.
            mostrarMensaje("Debes aceptar las normas de uso para crear la cuenta.");

            // Detiene el registro.
            return;
        }

        // Verifica que las contrasenas coincidan.
        if ($(contrasena).val() !== $(confirmar).val()) {
            // Avisa que las contrasenas son diferentes.
            mostrarMensaje("Las contrasenas no coinciden.");

            // Detiene el registro.
            return;
        }

        // Valida que el nombre no incumpla las normas.
        if (!validarContenidoEtico($(nombre).val(), "nombre")) return;

        // Valida que el alias no incumpla las normas.
        if (!validarContenidoEtico($(usuario).val(), "alias")) return;

        // Intenta registrar el usuario en la API local.
        try {
            // Crea el usuario en FastAPI.
            const usuarioCreado = await apiJson("/api/usuarios", {
                method: "POST",
                body: JSON.stringify({
                    full_name: $(nombre).val().trim(),
                    alias: normalizarAlias($(usuario).val()),
                    email: $(correo).val().trim(),
                    password: $(contrasena).val(),
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
