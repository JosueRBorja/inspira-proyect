// Actualiza la navegacion con el usuario activo.
actualizarUsuarioEnNavegacion();

// Obtiene los parametros enviados en la URL.
const parametrosDetalle = new URLSearchParams(window.location.search);

// Guarda el ID de publicacion recibido o usa la primera publicacion.
let publicacionDetalleId = Number(parametrosDetalle.get("id")) || 1;

// Guarda la publicacion que se esta mostrando.
let publicacionDetalle = null;

// Rellena la pantalla con una publicacion recibida desde la API.
function pintarDetallePublicacion(publicacion) {
    // Guarda la publicacion actual.
    publicacionDetalle = publicacion;

    // Guarda el ID actual de la publicacion.
    publicacionDetalleId = publicacion.id;

    // Busca la imagen principal.
    const imagenPrincipal = seleccionar(".imagen-destacada img");

    // Busca el texto de categoria.
    const categoria = seleccionar(".cabecera-publicacion .categoria");

    // Busca el titulo principal.
    const titulo = seleccionar("#titulo-publicacion");

    // Busca la descripcion.
    const descripcion = seleccionar(".informacion-publicacion .descripcion");

    // Busca la foto del autor.
    const fotoAutor = seleccionar(".autor img");

    // Busca el nombre del autor.
    const nombreAutor = seleccionar(".autor h2");

    // Busca la biografia del autor.
    const biografiaAutor = seleccionar(".autor p");

    // Actualiza la imagen principal.
    if (imagenPrincipal) {
        imagenPrincipal.src = convertirUrlArchivo(publicacion.image_url);
        imagenPrincipal.alt = publicacion.title;
    }

    // Actualiza la categoria visible.
    if (categoria) categoria.textContent = publicacion.category ? publicacion.category.name : "Sin categoria";

    // Actualiza el titulo visible.
    if (titulo) titulo.textContent = publicacion.title;

    // Actualiza la descripcion visible.
    if (descripcion) descripcion.textContent = publicacion.description || "Sin descripcion.";

    // Actualiza la foto del autor.
    if (fotoAutor) {
        fotoAutor.src = convertirUrlArchivo(publicacion.owner.profile_photo_url);
        fotoAutor.alt = `Foto de perfil de ${publicacion.owner.full_name}`;
    }

    // Actualiza el nombre del autor.
    if (nombreAutor) nombreAutor.textContent = publicacion.owner.full_name;

    // Actualiza la biografia del autor.
    if (biografiaAutor) biografiaAutor.textContent = publicacion.owner.biography || publicacion.owner.alias;
}

// Pinta los comentarios usando las tarjetas existentes.
function pintarComentarios(comentarios) {
    // Guarda las tarjetas de comentarios visibles.
    const tarjetasComentario = seleccionarTodos(".comentario");

    // Obtiene el perfil actualizado del usuario activo.
    const perfilActual = obtenerPerfilLocal();

    // Obtiene el ID del usuario activo.
    const usuarioActualId = obtenerUsuarioIdActual();

    // Recorre cada tarjeta para colocar comentarios reales.
    tarjetasComentario.forEach((tarjeta, indice) => {
        // Guarda el comentario correspondiente.
        const comentario = comentarios[indice];

        // Oculta la tarjeta cuando no hay comentario.
        if (!comentario) {
            tarjeta.hidden = true;
            return;
        }

        // Busca la imagen del autor del comentario.
        const imagen = tarjeta.querySelector("img");

        // Busca el nombre del autor del comentario.
        const nombre = tarjeta.querySelector("h3");

        // Busca el texto del comentario.
        const texto = tarjeta.querySelector("p");

        // Verifica si el comentario pertenece al usuario activo.
        const esComentarioPropio = comentario.author_id === usuarioActualId;

        // Define la foto que debe mostrarse en el comentario.
        const fotoComentario = esComentarioPropio ? perfilActual.foto : convertirUrlArchivo(comentario.author.profile_photo_url);

        // Define el nombre que debe mostrarse en el comentario.
        const nombreComentario = esComentarioPropio ? perfilActual.nombre : comentario.author.full_name;

        // Muestra la tarjeta.
        tarjeta.hidden = false;

        // Actualiza la foto del autor.
        if (imagen) {
            imagen.src = fotoComentario;
            imagen.alt = `Foto de perfil de ${nombreComentario}`;
        }

        // Actualiza el nombre del autor.
        if (nombre) nombre.textContent = nombreComentario;

        // Actualiza el contenido del comentario.
        if (texto) texto.textContent = comentario.content;
    });
}

// Carga el detalle de la publicacion desde la API.
async function cargarDetalle() {
    // Intenta obtener la publicacion y sus comentarios.
    try {
        // Obtiene la publicacion actual.
        const publicacion = await apiJson(`/api/publicaciones/${publicacionDetalleId}`);

        // Pinta la publicacion en pantalla.
        pintarDetallePublicacion(publicacion);

        // Obtiene los comentarios de esta publicacion.
        const comentarios = await apiJson(`/api/comentarios/publicacion/${publicacion.id}`);

        // Pinta los comentarios disponibles.
        pintarComentarios(comentarios);
    } catch (error) {
        // Avisa si no se pudo cargar la publicacion.
        mostrarMensaje(error.message);
    }
}

// Guarda el boton para guardar la publicacion.
const botonGuardarDetalle = seleccionar(".boton-guardar");

// Verifica que el boton exista.
if (botonGuardarDetalle) {
    // Escucha el clic sobre guardar.
    botonGuardarDetalle.addEventListener("click", async (evento) => {
        // Evita la navegacion automatica.
        evento.preventDefault();

        // Intenta guardar la publicacion actual.
        try {
            // Envia el guardado a la API.
            await apiJson("/api/guardados", {
                method: "POST",
                body: JSON.stringify({
                    user_id: obtenerUsuarioIdActual(),
                    post_id: publicacionDetalleId
                })
            });

            // Envia al usuario a sus guardados.
            irA("mis-guardados.html");
        } catch (error) {
            // Muestra el error devuelto por la API.
            mostrarMensaje(error.message);
        }
    });
}

// Guarda el formulario de comentarios.
const formularioComentario = seleccionar(".formulario-comentario");

// Verifica que el formulario exista.
if (formularioComentario) {
    // Escucha el envio del comentario.
    formularioComentario.addEventListener("submit", async (evento) => {
        // Evita que se recargue la pagina.
        evento.preventDefault();

        // Guarda el campo del comentario.
        const comentario = formularioComentario.querySelector("textarea");

        // Verifica que el comentario tenga texto.
        if (!comentario || !comentario.value.trim()) {
            // Avisa que falta el comentario.
            mostrarMensaje("Escribe un comentario antes de publicar.");

            // Detiene el envio.
            return;
        }

        // Valida el comentario con las normas eticas.
        if (!validarContenidoEtico(comentario.value, "comentario")) return;

        // Intenta guardar el comentario en la API.
        try {
            // Envia el comentario a FastAPI.
            await apiJson("/api/comentarios", {
                method: "POST",
                body: JSON.stringify({
                    post_id: publicacionDetalleId,
                    author_id: obtenerUsuarioIdActual(),
                    content: comentario.value.trim()
                })
            });

            // Limpia el campo despues de publicar.
            comentario.value = "";

            // Recarga comentarios reales desde la API.
            const comentarios = await apiJson(`/api/comentarios/publicacion/${publicacionDetalleId}`);

            // Actualiza las tarjetas de comentarios.
            pintarComentarios(comentarios);

            // Avisa que el comentario fue registrado.
            mostrarMensaje("Comentario registrado.");
        } catch (error) {
            // Muestra el error si no se pudo comentar.
            mostrarMensaje(error.message);
        }
    });
}

// Carga los datos reales al abrir la pagina.
cargarDetalle();
