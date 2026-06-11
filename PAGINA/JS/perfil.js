// Actualiza la navegacion con el usuario activo.
actualizarUsuarioEnNavegacion();

// Guarda el formulario de perfil.
const formularioPerfil = seleccionar(".formulario-perfil");

// Verifica que el formulario exista.
if (formularioPerfil) {
    // Obtiene el perfil guardado.
    let perfil = obtenerPerfilLocal();

    // Guarda el campo del nombre.
    const nombre = seleccionar("#nombre", formularioPerfil);

    // Guarda el campo del alias.
    const alias = seleccionar("#alias", formularioPerfil);

    // Guarda el campo de biografia.
    const biografia = seleccionar("#biografia", formularioPerfil);

    // Guarda el campo de foto.
    const foto = seleccionar("#foto", formularioPerfil);

    // Guarda el nombre visible en la vista previa.
    const vistaNombre = seleccionar(".tarjeta-usuario h4");

    // Guarda el alias visible en la vista previa.
    const vistaAlias = seleccionar(".tarjeta-usuario p");

    // Carga el nombre guardado.
    $(nombre).val(perfil.nombre);

    // Carga el alias guardado.
    $(alias).val(perfil.alias);

    // Carga la biografia guardada.
    $(biografia).val(perfil.biografia);

    // Actualiza el nombre de la vista previa.
    if (vistaNombre) $(vistaNombre).text(perfil.nombre);

    // Actualiza el alias de la vista previa.
    if (vistaAlias) $(vistaAlias).text(perfil.alias);

    // Recorre las imagenes que deben mostrar la foto del perfil.
    seleccionarTodos(".vista-previa img, .tarjeta-usuario img").forEach((imagen) => {
        // Coloca la foto guardada.
        $(imagen).attr("src", perfil.foto);

        // Describe la imagen con el nombre del usuario.
        $(imagen).attr("alt", `Foto de perfil de ${perfil.nombre}`);
    });

    // Carga el perfil real desde la API.
    async function cargarPerfilApi() {
        // Intenta consultar el usuario actual.
        try {
            // Obtiene el usuario desde FastAPI.
            const usuario = await cargarUsuarioActualDesdeApi();

            // Actualiza la copia local del perfil.
            perfil = obtenerPerfilLocal();

            // Coloca el nombre recibido en el campo.
            $(nombre).val(usuario.full_name);

            // Coloca el alias recibido en el campo.
            $(alias).val(usuario.alias);

            // Coloca la biografia recibida en el campo.
            $(biografia).val(usuario.biography || "");

            // Actualiza el nombre en la vista previa.
            if (vistaNombre) $(vistaNombre).text(usuario.full_name);

            // Actualiza el alias en la vista previa.
            if (vistaAlias) $(vistaAlias).text(usuario.alias);

            // Actualiza las imagenes con la foto recibida.
            seleccionarTodos(".vista-previa img, .tarjeta-usuario img, .usuario-activo img").forEach((imagen) => {
                // Coloca la foto del usuario.
                $(imagen).attr("src", convertirUrlArchivo(usuario.profile_photo_url));

                // Actualiza el texto alternativo.
                $(imagen).attr("alt", `Foto de perfil de ${usuario.full_name}`);
            });
        } catch (error) {
            // Muestra el error si la API no responde.
            mostrarMensaje(error.message);
        }
    }

    // Escucha cuando el usuario selecciona una nueva foto.
    $(foto).on("change", () => {
        // Guarda el archivo seleccionado.
        const archivo = foto.files[0];

        // Detiene la vista previa si no hay archivo.
        if (!archivo) return;

        // Crea una ruta temporal para mostrar la imagen.
        const urlTemporal = URL.createObjectURL(archivo);

        // Recorre las imagenes que deben mostrar la nueva foto.
        seleccionarTodos(".vista-previa img, .tarjeta-usuario img, .usuario-activo img").forEach((imagen) => {
            // Actualiza la imagen de vista previa.
            $(imagen).attr("src", urlTemporal);
        });

        // Guarda la imagen temporal hasta enviar el formulario.
        localStorage.setItem("perfilFotoTemporal", urlTemporal);
    });

    // Escucha los cambios del nombre.
    $(nombre).on("input", () => {
        // Actualiza el nombre de vista previa.
        if (vistaNombre) $(vistaNombre).text($(nombre).val() || "Nombre del usuario");
    });

    // Escucha los cambios del alias.
    $(alias).on("input", () => {
        // Actualiza el alias de vista previa con arroba.
        if (vistaAlias) $(vistaAlias).text(normalizarAlias($(alias).val() || "@usuario"));
    });

    // Escucha el envio del formulario.
    $(formularioPerfil).on("submit", async (evento) => {
        // Evita que se recargue la pagina.
        evento.preventDefault();

        // Verifica que el nombre y alias existan.
        if (!$(nombre).val().trim() || !$(alias).val().trim()) {
            // Avisa que faltan campos obligatorios.
            mostrarMensaje("El nombre y el alias son obligatorios.");

            // Detiene el guardado.
            return;
        }

        // Valida el nombre con las normas eticas.
        if (!validarContenidoEtico($(nombre).val(), "nombre")) return;

        // Valida el alias con las normas eticas.
        if (!validarContenidoEtico($(alias).val(), "alias")) return;

        // Valida la biografia con las normas eticas.
        if (!validarContenidoEtico($(biografia).val(), "biografia")) return;

        // Intenta actualizar el perfil en la API.
        try {
            // Guarda el usuario actualizado por texto.
            let usuarioActualizado = await apiJson(`/api/usuarios/${obtenerUsuarioIdActual()}`, {
                method: "PATCH",
                body: JSON.stringify({
                    full_name: $(nombre).val().trim(),
                    alias: normalizarAlias($(alias).val()),
                    biography: $(biografia).val().trim()
                })
            });

            // Verifica si el usuario selecciono foto nueva.
            if (foto.files.length) {
                // Prepara el formulario de imagen.
                const datosFoto = new FormData();

                // Agrega la imagen al formulario con el nombre que espera la API.
                datosFoto.append("image", foto.files[0]);

                // Sube la foto y guarda el usuario devuelto.
                usuarioActualizado = await apiFormulario(`/api/usuarios/${obtenerUsuarioIdActual()}/foto`, datosFoto, { method: "POST" });
            }

            // Guarda los datos nuevos en localStorage.
            guardarSesionUsuario(usuarioActualizado);

            // Borra la foto temporal despues de guardar.
            localStorage.removeItem("perfilFotoTemporal");

            // Envia al usuario a su cuenta.
            irA("mi-cuenta.html");
        } catch (error) {
            // Muestra el error si la API no pudo actualizar.
            mostrarMensaje(error.message);
        }
    });

    // Carga el perfil real al abrir la pagina.
    cargarPerfilApi();
}
