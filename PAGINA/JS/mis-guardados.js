// Actualiza la navegacion con el usuario activo.
actualizarUsuarioEnNavegacion();

// Guarda los filtros de la pagina de guardados.
const filtrosGuardados = seleccionarTodos(".filtros-guardados a");

// Guarda el contenedor de tarjetas guardadas.
const galeriaGuardados = seleccionar(".galeria-guardados");

// Guarda los guardados recibidos desde la API.
let guardadosUsuario = [];

// Guarda el filtro activo de la pagina.
let filtroGuardadoActivo = "todos";

// Guarda estilos alternados para mantener variedad visual.
const clasesTamanoGuardado = ["tarjeta-alta", "tarjeta-mediana", "tarjeta-baja", "tarjeta-extra-alta"];

// Devuelve una clase visual segun la posicion.
function obtenerClaseGuardado(indice) {
    // Devuelve una clase repetible para mantener la galeria ordenada.
    return clasesTamanoGuardado[indice % clasesTamanoGuardado.length];
}

// Crea una tarjeta guardada con datos reales.
function crearTarjetaGuardada(guardado, indice) {
    // Guarda la publicacion relacionada.
    const publicacion = guardado.post;

    // Crea el contenedor semantico de la tarjeta.
    const tarjeta = $("<article>").addClass(`tarjeta-guardada ${obtenerClaseGuardado(indice)}`);

    // Guarda el ID real del guardado.
    tarjeta.data("id", guardado.id);

    // Guarda la categoria para filtrar.
    tarjeta.data("categoria", publicacion.category ? publicacion.category.name.toLowerCase() : "");

    // Crea el enlace hacia el detalle.
    const enlace = $("<a>").attr("href", `detalle.html?id=${publicacion.id}`);

    // Crea la imagen guardada.
    const imagen = $("<img>").attr({
        src: convertirUrlArchivo(publicacion.image_url),
        alt: publicacion.title
    });

    // Crea el contenido textual.
    const contenido = $("<div>").addClass("contenido-tarjeta");

    // Crea el titulo de la publicacion.
    const titulo = $("<h2>").text(publicacion.title);

    // Crea la categoria visible.
    const categoria = $("<p>").text(`Guardado desde ${publicacion.category ? publicacion.category.name : "Sin categoria"}`);

    // Crea el boton para quitar el guardado.
    const boton = $("<button>").attr("type", "button").text("Quitar");

    // Inserta la imagen dentro del enlace.
    enlace.append(imagen);

    // Inserta la informacion dentro del contenido.
    contenido.append(titulo, categoria, boton);

    // Inserta todo dentro de la tarjeta.
    tarjeta.append(enlace, contenido);

    // Devuelve la tarjeta lista para mostrar.
    return tarjeta;
}

// Muestra un estado vacio cuando no existen guardados.
function pintarEstadoSinGuardados() {
    // Crea la tarjeta de mensaje.
    const mensaje = $("<article>").addClass("tarjeta-guardada tarjeta-mediana");

    // Crea el contenido del mensaje.
    const contenido = $("<div>").addClass("contenido-tarjeta");

    // Agrega el titulo del estado.
    contenido.append($("<h2>").text("No hay guardados"));

    // Agrega la descripcion del estado.
    contenido.append($("<p>").text("Guarda una publicacion desde el inicio para verla aqui."));

    // Inserta el contenido.
    mensaje.append(contenido);

    // Inserta el mensaje en la galeria.
    $(galeriaGuardados).append(mensaje);
}

// Devuelve los guardados que cumplen el filtro activo.
function obtenerGuardadosFiltrados() {
    // Devuelve todos cuando el filtro activo es general.
    if (filtroGuardadoActivo === "todos") return guardadosUsuario;

    // Devuelve solo los guardados que coinciden con la categoria.
    return guardadosUsuario.filter((guardado) => {
        // Guarda la categoria de la publicacion.
        const categoria = guardado.post.category ? guardado.post.category.name.toLowerCase() : "";

        // Indica si coincide con el filtro.
        return categoria === filtroGuardadoActivo;
    });
}

// Pinta los guardados visibles en pantalla.
function pintarGuardados() {
    // Limpia la galeria para evitar datos cruzados.
    $(galeriaGuardados).empty();

    // Guarda la lista filtrada.
    const guardadosFiltrados = obtenerGuardadosFiltrados();

    // Muestra un mensaje si no hay elementos.
    if (!guardadosFiltrados.length) {
        // Pinta el estado vacio.
        pintarEstadoSinGuardados();

        // Termina el pintado.
        return;
    }

    // Recorre los guardados filtrados.
    guardadosFiltrados.forEach((guardado, indice) => {
        // Inserta una tarjeta creada desde la API.
        $(galeriaGuardados).append(crearTarjetaGuardada(guardado, indice));
    });
}

// Carga guardados reales desde la API.
async function cargarGuardadosApi() {
    // Detiene la carga si no existe la galeria.
    if (!galeriaGuardados) return;

    // Intenta consultar los guardados del usuario.
    try {
        // Obtiene los guardados del usuario activo.
        guardadosUsuario = await apiJson(`/api/guardados/usuario/${obtenerUsuarioIdActual()}`);

        // Pinta las tarjetas reales.
        pintarGuardados();
    } catch (error) {
        // Limpia la galeria para no mostrar datos viejos.
        $(galeriaGuardados).empty();

        // Muestra el error si no se pudieron cargar guardados.
        mostrarMensaje(error.message);
    }
}

// Recorre cada filtro disponible.
filtrosGuardados.forEach((enlace) => {
    // Escucha el clic sobre el filtro.
    $(enlace).on("click", (evento) => {
        // Evita que el enlace recargue la pagina.
        evento.preventDefault();

        // Quita el filtro activo anterior.
        $(filtrosGuardados).removeClass("filtro-activo");

        // Marca el filtro seleccionado.
        $(enlace).addClass("filtro-activo");

        // Guarda el nombre del filtro.
        filtroGuardadoActivo = $(enlace).text().trim().toLowerCase();

        // Vuelve a pintar con el filtro nuevo.
        pintarGuardados();
    });
});

// Controla el boton quitar usando delegacion.
$(galeriaGuardados).on("click", ".tarjeta-guardada button", async (evento) => {
    // Busca la tarjeta guardada.
    const tarjeta = $(evento.currentTarget).closest(".tarjeta-guardada").get(0);

    // Obtiene el ID real del guardado.
    const guardadoId = tarjeta ? Number($(tarjeta).data("id")) : 0;

    // Detiene la accion si no hay ID.
    if (!guardadoId) return;

    // Intenta eliminar el guardado.
    try {
        // Elimina el guardado en la API.
        await apiJson(`/api/guardados/${guardadoId}`, { method: "DELETE" });

        // Quita el guardado de la lista local.
        guardadosUsuario = guardadosUsuario.filter((guardado) => guardado.id !== guardadoId);

        // Vuelve a pintar la galeria.
        pintarGuardados();
    } catch (error) {
        // Muestra el error si no se pudo quitar.
        mostrarMensaje(error.message);
    }
});

// Carga los guardados reales al abrir la pagina.
cargarGuardadosApi();
