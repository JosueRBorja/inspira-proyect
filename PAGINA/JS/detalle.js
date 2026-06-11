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
        $(imagenPrincipal).attr("src", convertirUrlArchivo(publicacion.image_url));
        $(imagenPrincipal).attr("alt", publicacion.title);
    }

    // Actualiza la categoria visible.
    if (categoria) $(categoria).text(publicacion.category ? publicacion.category.name : "Sin categoria");

    // Actualiza el titulo visible.
    if (titulo) $(titulo).text(publicacion.title);

    // Actualiza la descripcion visible.
    if (descripcion) $(descripcion).text(publicacion.description || "Sin descripcion.");

    // Actualiza la foto del autor.
    if (fotoAutor) {
        $(fotoAutor).attr("src", convertirUrlArchivo(publicacion.owner.profile_photo_url));
        $(fotoAutor).attr("alt", `Foto de perfil de ${publicacion.owner.full_name}`);
    }

    // Actualiza el nombre del autor.
    if (nombreAutor) $(nombreAutor).text(publicacion.owner.full_name);

    // Actualiza la biografia del autor.
    if (biografiaAutor) $(biografiaAutor).text(publicacion.owner.biography || publicacion.owner.alias);
}

// Pinta los comentarios usando las tarjetas existentes.
function pintarComentarios(comentarios) {
    // Guarda el contenedor desplazable de comentarios.
    const listaComentarios = seleccionar(".lista-comentarios");

    // Detiene el pintado si no existe el contenedor.
    if (!listaComentarios) return;

    // Limpia los comentarios anteriores con jQuery.
    $(listaComentarios).empty();

    // Obtiene el perfil actualizado del usuario activo.
    const perfilActual = obtenerPerfilLocal();

    // Obtiene el ID del usuario activo.
    const usuarioActualId = obtenerUsuarioIdActual();

    // Muestra un aviso cuando todavia no hay comentarios.
    if (!comentarios.length) {
        // Crea una tarjeta simple para el estado vacio.
        const tarjetaVacia = $("<article>").addClass("comentario comentario-vacio");

        // Crea el texto del estado vacio.
        const textoVacio = $("<p>").text("Todavia no hay comentarios.");

        // Agrega el texto al contenedor.
        tarjetaVacia.append(textoVacio);

        // Coloca la tarjeta dentro de la lista.
        $(listaComentarios).append(tarjetaVacia);

        // Detiene el pintado.
        return;
    }

    // Recorre cada comentario recibido por la API.
    comentarios.forEach((comentario) => {
        // Crea la tarjeta del comentario.
        const tarjeta = $("<article>").addClass("comentario");

        // Crea la imagen del autor.
        const imagen = $("<img>");

        // Crea el bloque de texto del comentario.
        const cuerpo = $("<div>");

        // Crea el nombre del autor.
        const nombre = $("<h3>");

        // Crea el texto del comentario.
        const texto = $("<p>");

        // Verifica si el comentario pertenece al usuario activo.
        const esComentarioPropio = comentario.author_id === usuarioActualId;

        // Define la foto que debe mostrarse en el comentario.
        const fotoComentario = esComentarioPropio ? perfilActual.foto : convertirUrlArchivo(comentario.author.profile_photo_url);

        // Define el nombre que debe mostrarse en el comentario.
        const nombreComentario = esComentarioPropio ? perfilActual.nombre : comentario.author.full_name;

        // Actualiza la foto del autor.
        imagen.attr("src", fotoComentario);
        imagen.attr("alt", `Foto de perfil de ${nombreComentario}`);

        // Actualiza el nombre del autor.
        nombre.text(nombreComentario);

        // Actualiza el contenido del comentario.
        texto.text(comentario.content);

        // Agrega nombre y texto dentro del cuerpo.
        cuerpo.append(nombre);
        cuerpo.append(texto);

        // Agrega la foto y el cuerpo dentro de la tarjeta.
        tarjeta.append(imagen);
        tarjeta.append(cuerpo);

        // Coloca la tarjeta dentro de la lista.
        $(listaComentarios).append(tarjeta);
    });

    // Lleva la lista al inicio para mostrar los comentarios recientes.
    $(listaComentarios).scrollTop(0);
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
    $(botonGuardarDetalle).on("click", async (evento) => {
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
    $(formularioComentario).on("submit", async (evento) => {
        // Evita que se recargue la pagina.
        evento.preventDefault();

        // Guarda el campo del comentario.
        const comentario = seleccionar("textarea", formularioComentario);

        // Verifica que el comentario tenga texto.
        if (!comentario || !$(comentario).val().trim()) {
            // Avisa que falta el comentario.
            mostrarMensaje("Escribe un comentario antes de publicar.");

            // Detiene el envio.
            return;
        }

        // Valida el comentario con las normas eticas.
        if (!validarContenidoEtico($(comentario).val(), "comentario")) return;

        // Intenta guardar el comentario en la API.
        try {
            // Envia el comentario a FastAPI.
            await apiJson("/api/comentarios", {
                method: "POST",
                body: JSON.stringify({
                    post_id: publicacionDetalleId,
                    author_id: obtenerUsuarioIdActual(),
                    content: $(comentario).val().trim()
                })
            });

            // Limpia el campo despues de publicar.
            $(comentario).val("");

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
