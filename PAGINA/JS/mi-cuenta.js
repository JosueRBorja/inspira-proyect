// Actualiza la navegacion con el usuario activo.
actualizarUsuarioEnNavegacion();

// Guarda el titulo con el nombre del usuario.
const nombreCuenta = seleccionar("#titulo-cuenta");

// Guarda el texto del alias.
const aliasCuenta = seleccionar(".datos-usuario .alias");

// Guarda el texto de descripcion.
const descripcionCuenta = seleccionar(".datos-usuario .descripcion");

// Guarda la foto del usuario.
const fotoCuenta = seleccionar(".foto-usuario img");

// Guarda el contenedor de publicaciones del usuario.
const listaPublicacionesCuenta = seleccionar(".lista-publicaciones");

// Guarda las publicaciones del usuario actual.
let publicacionesCuenta = [];

// Crea una publicacion dentro de mi cuenta.
function crearPublicacionCuenta(publicacion) {
    // Crea el contenedor semantico de la publicacion.
    const tarjeta = $("<article>").addClass("tarjeta-publicacion");

    // Guarda el ID real de la publicacion.
    tarjeta.data("id", publicacion.id);

    // Crea la imagen de la publicacion.
    const imagen = $("<img>").attr({
        src: convertirUrlArchivo(publicacion.image_url),
        alt: publicacion.title
    });

    // Crea el bloque textual.
    const contenido = $("<div>").addClass("contenido-publicacion");

    // Crea el titulo.
    const titulo = $("<h3>").text(publicacion.title);

    // Crea la categoria.
    const categoria = $("<p>").text(publicacion.category ? publicacion.category.name : "Sin categoria");

    // Crea el texto de referencia de guardados.
    const guardados = $("<span>").text("Guardados por usuarios");

    // Crea el bloque de acciones.
    const acciones = $("<div>").addClass("acciones-publicacion");

    // Crea el enlace para ver la publicacion.
    const enlaceVer = $("<a>").attr("href", `detalle.html?id=${publicacion.id}`).text("Ver");

    // Crea el enlace para editar la publicacion.
    const enlaceEditar = $("<a>").attr("href", `editar-publicacion.html?id=${publicacion.id}`).text("Editar");

    // Crea el boton para eliminar.
    const botonEliminar = $("<button>").addClass("boton-eliminar").attr("type", "button").text("Eliminar");

    // Inserta titulo, categoria y texto de guardados.
    contenido.append(titulo, categoria, guardados);

    // Inserta las acciones disponibles.
    acciones.append(enlaceVer, enlaceEditar, botonEliminar);

    // Inserta todos los elementos dentro de la tarjeta.
    tarjeta.append(imagen, contenido, acciones);

    // Devuelve la tarjeta lista para mostrar.
    return tarjeta;
}

// Muestra un estado vacio si el usuario no tiene publicaciones.
function pintarEstadoCuentaVacia() {
    // Crea la tarjeta de estado.
    const tarjeta = $("<article>").addClass("tarjeta-publicacion");

    // Crea el bloque textual.
    const contenido = $("<div>").addClass("contenido-publicacion");

    // Agrega el titulo del estado.
    contenido.append($("<h3>").text("Todavia no tienes publicaciones"));

    // Agrega la descripcion del estado.
    contenido.append($("<p>").text("Sube una foto para verla en tu perfil."));

    // Crea las acciones del estado.
    const acciones = $("<div>").addClass("acciones-publicacion");

    // Crea el enlace para subir contenido.
    acciones.append($("<a>").attr("href", "subir.html").text("Crear nueva"));

    // Inserta los elementos dentro de la tarjeta.
    tarjeta.append(contenido, acciones);

    // Inserta la tarjeta en la lista.
    $(listaPublicacionesCuenta).append(tarjeta);
}

// Pinta las publicaciones reales del usuario.
function pintarPublicacionesCuenta() {
    // Limpia tarjetas anteriores para evitar IDs viejos.
    $(listaPublicacionesCuenta).empty();

    // Muestra un estado vacio si no hay publicaciones.
    if (!publicacionesCuenta.length) {
        // Pinta la tarjeta vacia.
        pintarEstadoCuentaVacia();

        // Termina la funcion.
        return;
    }

    // Recorre las publicaciones del usuario.
    publicacionesCuenta.forEach((publicacion) => {
        // Inserta una tarjeta creada desde la API.
        $(listaPublicacionesCuenta).append(crearPublicacionCuenta(publicacion));
    });
}

// Actualiza los contadores visibles del perfil.
function actualizarResumenCuenta() {
    // Recorre los numeros visibles.
    seleccionarTodos(".resumen-cuenta article strong").forEach((numero, indice) => {
        // Muestra publicaciones reales en el primer contador.
        if (indice === 0) $(numero).text(publicacionesCuenta.length);
    });
}

// Carga la cuenta real desde la API.
async function cargarCuentaApi() {
    // Intenta consultar usuario y publicaciones.
    try {
        // Obtiene el usuario actual.
        const usuario = await cargarUsuarioActualDesdeApi();

        // Obtiene desde el backend solo las publicaciones del usuario actual.
        publicacionesCuenta = await apiJson(`/api/publicaciones?owner_id=${usuario.id}`);

        // Coloca el nombre del usuario.
        if (nombreCuenta) $(nombreCuenta).text(usuario.full_name);

        // Coloca el alias del usuario.
        if (aliasCuenta) $(aliasCuenta).text(usuario.alias);

        // Coloca la biografia del usuario.
        if (descripcionCuenta) $(descripcionCuenta).text(usuario.biography || "Sin biografia registrada.");

        // Actualiza la foto cuando existe el elemento.
        if (fotoCuenta) {
            // Coloca la foto del usuario.
            $(fotoCuenta).attr("src", convertirUrlArchivo(usuario.profile_photo_url));

            // Describe la imagen con el nombre del usuario.
            $(fotoCuenta).attr("alt", `Foto de perfil de ${usuario.full_name}`);
        }

        // Actualiza los numeros de resumen.
        actualizarResumenCuenta();

        // Pinta publicaciones reales del usuario.
        pintarPublicacionesCuenta();
    } catch (error) {
        // Limpia la lista si falla la API.
        $(listaPublicacionesCuenta).empty();

        // Muestra el error si la cuenta no pudo cargar.
        mostrarMensaje(error.message);
    }
}

// Controla los botones para eliminar publicaciones creadas dinamicamente.
$(listaPublicacionesCuenta).on("click", ".boton-eliminar", async (evento) => {
    // Pide confirmacion antes de ocultar la publicacion.
    if (!confirm("Seguro que quieres eliminar esta publicacion?")) return;

    // Busca la tarjeta de la publicacion.
    const tarjeta = $(evento.currentTarget).closest(".tarjeta-publicacion").get(0);

    // Obtiene el ID real de la publicacion.
    const postId = tarjeta ? Number($(tarjeta).data("id")) : 0;

    // Detiene la accion si no hay ID.
    if (!postId) return;

    // Intenta eliminar en la API.
    try {
        // Elimina la publicacion en FastAPI.
        await apiJson(`/api/publicaciones/${postId}`, { method: "DELETE" });

        // Quita la publicacion de la lista local.
        publicacionesCuenta = publicacionesCuenta.filter((publicacion) => publicacion.id !== postId);

        // Actualiza contadores.
        actualizarResumenCuenta();

        // Vuelve a pintar la lista.
        pintarPublicacionesCuenta();
    } catch (error) {
        // Muestra el error si no se pudo eliminar.
        mostrarMensaje(error.message);
    }
});

// Carga la informacion real de la cuenta al abrir.
cargarCuentaApi();
