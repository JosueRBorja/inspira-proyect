// Activa la navegacion del usuario en la pagina principal.
actualizarUsuarioEnNavegacion();

// Guarda las publicaciones recibidas desde la API.
let publicaciones = [];

// Guarda el campo de busqueda de la pagina principal.
const buscador = seleccionar("#buscar");

// Guarda el contenedor donde se pintan las publicaciones.
const galeriaPublicaciones = seleccionar(".galeria");

// Guarda la categoria seleccionada por el usuario.
let categoriaSeleccionada = "todos";

// Guarda estilos alternados para que las tarjetas tengan tamanos tipo Pinterest.
const clasesTamanoTarjeta = ["tarjeta-mediana", "tarjeta-alta", "tarjeta-baja", "tarjeta-extra-alta"];

// Devuelve la clase visual que corresponde a una publicacion.
function obtenerClaseTamano(indice) {
    // Devuelve una clase reutilizando el patron por posicion.
    return clasesTamanoTarjeta[indice % clasesTamanoTarjeta.length];
}

// Construye la ruta de publicaciones con filtros para el backend.
function construirRutaPublicaciones() {
    // Guarda los parametros que se enviaran a la API.
    const parametros = new URLSearchParams();

    // Evalua si hay una categoria concreta seleccionada.
    if (categoriaSeleccionada !== "todos") {
        // Agrega la categoria a los parametros de consulta.
        parametros.set("categoria", categoriaSeleccionada);
    }

    // Evalua si existe texto en el buscador.
    if (buscador && $(buscador).val().trim()) {
        // Agrega la busqueda a los parametros de consulta.
        parametros.set("busqueda", $(buscador).val().trim());
    }

    // Guarda los parametros convertidos a texto.
    const consulta = parametros.toString();

    // Devuelve la ruta con o sin parametros.
    return consulta ? `/api/publicaciones?${consulta}` : "/api/publicaciones";
}

// Crea una tarjeta completa desde una publicacion real.
function crearTarjetaPublicacion(publicacion, indice) {
    // Crea el contenedor semantico de la tarjeta.
    const tarjeta = $("<article>").addClass(`tarjeta-publicacion ${obtenerClaseTamano(indice)}`);

    // Guarda el ID real de la publicacion.
    tarjeta.data("id", publicacion.id);

    // Guarda la categoria para controles visuales.
    tarjeta.data("categoria", publicacion.category ? publicacion.category.name.toLowerCase() : "");

    // Guarda las etiquetas para posibles busquedas locales.
    tarjeta.data("etiquetas", publicacion.tags || "");

    // Crea el enlace hacia el detalle real.
    const enlaceImagen = $("<a>").addClass("enlace-imagen").attr("href", `detalle.html?id=${publicacion.id}`);

    // Crea la imagen de la publicacion.
    const imagen = $("<img>").attr({
        src: convertirUrlArchivo(publicacion.image_url),
        alt: publicacion.title
    });

    // Crea el boton para guardar la publicacion.
    const botonGuardar = $("<a>").addClass("boton-guardar").attr("href", "mis-guardados.html").text("Guardar");

    // Crea el bloque inferior de texto.
    const contenido = $("<div>").addClass("contenido-tarjeta");

    // Crea el bloque que agrupa titulo y autor.
    const texto = $("<div>");

    // Crea el titulo visible.
    const titulo = $("<h2>").text(publicacion.title);

    // Crea el nombre del autor visible.
    const autor = $("<p>").text(`Por ${publicacion.owner.full_name}`);

    // Crea el boton de opciones sin redireccionar.
    const opciones = $("<button>").addClass("boton-opciones").attr({
        type: "button",
        "aria-label": `Mas opciones de ${publicacion.title}`,
        title: "Opciones"
    }).text("...");

    // Inserta la imagen dentro del enlace.
    enlaceImagen.append(imagen);

    // Inserta titulo y autor dentro del bloque de texto.
    texto.append(titulo, autor);

    // Inserta texto y opciones dentro del contenido.
    contenido.append(texto, opciones);

    // Inserta todos los elementos dentro de la tarjeta.
    tarjeta.append(enlaceImagen, botonGuardar, contenido);

    // Devuelve la tarjeta lista para mostrar.
    return tarjeta;
}

// Muestra un estado vacio cuando no hay publicaciones.
function pintarEstadoSinPublicaciones() {
    // Crea el mensaje para el usuario.
    const mensaje = $("<article>").addClass("tarjeta-publicacion tarjeta-mediana");

    // Crea el bloque visual del estado vacio.
    const contenido = $("<div>").addClass("contenido-tarjeta");

    // Agrega el titulo del estado.
    contenido.append($("<h2>").text("No hay publicaciones"));

    // Agrega una descripcion breve.
    contenido.append($("<p>").text("Cambia el filtro o sube una nueva foto."));

    // Inserta el contenido en el mensaje.
    mensaje.append(contenido);

    // Inserta el mensaje en la galeria.
    $(galeriaPublicaciones).append(mensaje);
}

// Pinta todas las publicaciones recibidas desde el backend.
function pintarPublicaciones() {
    // Limpia tarjetas anteriores para evitar IDs cruzados.
    $(galeriaPublicaciones).empty();

    // Muestra un mensaje si la API no devolvio publicaciones.
    if (!publicaciones.length) {
        // Pinta el estado vacio.
        pintarEstadoSinPublicaciones();

        // Termina el pintado.
        return;
    }

    // Recorre publicaciones reales.
    publicaciones.forEach((publicacion, indice) => {
        // Inserta una tarjeta creada desde la publicacion.
        $(galeriaPublicaciones).append(crearTarjetaPublicacion(publicacion, indice));
    });
}

// Carga publicaciones desde la API local.
async function cargarPublicaciones() {
    // Detiene la carga si no existe la galeria.
    if (!galeriaPublicaciones) return;

    // Intenta consultar las publicaciones guardadas en SQLite.
    try {
        // Obtiene publicaciones filtradas desde FastAPI.
        publicaciones = await apiJson(construirRutaPublicaciones());

        // Pinta la galeria con datos reales.
        pintarPublicaciones();
    } catch (error) {
        // Limpia la galeria para evitar botones con datos viejos.
        $(galeriaPublicaciones).empty();

        // Muestra un aviso si la API no esta levantada.
        mostrarMensaje(`No se pudieron cargar publicaciones: ${error.message}`);
    }
}

// Verifica que exista el buscador antes de usarlo.
if (buscador) {
    // Escucha cada cambio que el usuario escribe en la busqueda.
    $(buscador).on("input", () => {
        // Solicita al backend las publicaciones que coinciden con la busqueda.
        cargarPublicaciones();
    });
}

// Recorre los enlaces de categorias.
seleccionarTodos(".categorias a").forEach((enlace) => {
    // Escucha el clic sobre cada categoria.
    $(enlace).on("click", (evento) => {
        // Evita que el enlace recargue la pagina.
        evento.preventDefault();

        // Quita la categoria activa anterior.
        $(".categorias a").removeClass("categoria-activa");

        // Marca la categoria seleccionada.
        $(enlace).addClass("categoria-activa");

        // Guarda la categoria seleccionada.
        categoriaSeleccionada = $(enlace).text().trim().toLowerCase();

        // Solicita al backend las publicaciones de esa categoria.
        cargarPublicaciones();
    });
});

// Controla el guardado usando delegacion sobre tarjetas creadas dinamicamente.
$(galeriaPublicaciones).on("click", ".boton-guardar", async (evento) => {
    // Evita la navegacion automatica del enlace.
    evento.preventDefault();

    // Busca la tarjeta donde esta el boton.
    const tarjeta = $(evento.currentTarget).closest("article").get(0);

    // Obtiene el ID real de la publicacion.
    const postId = tarjeta ? Number($(tarjeta).data("id")) : 0;

    // Verifica que exista una publicacion real.
    if (!postId) return;

    // Intenta guardar la publicacion en la API.
    try {
        // Envia el guardado a FastAPI.
        await apiJson("/api/guardados", {
            method: "POST",
            body: JSON.stringify({
                user_id: obtenerUsuarioIdActual(),
                post_id: postId
            })
        });

        // Envia al usuario a la pantalla de guardados.
        irA("mis-guardados.html");
    } catch (error) {
        // Muestra el error si no se pudo guardar.
        mostrarMensaje(error.message);
    }
});

// Controla los botones de opciones sin redireccionar a otra pagina.
$(galeriaPublicaciones).on("click", ".boton-opciones", (evento) => {
    // Evita que el boton navegue a otra pagina.
    evento.preventDefault();

    // Evita que el clic afecte otros controles.
    evento.stopPropagation();

    // Muestra una pista corta del boton.
    mostrarMensaje("Opciones de publicacion: en esta maqueta el boton solo muestra acciones futuras.");
});

// Carga las publicaciones cuando abre la pagina.
cargarPublicaciones();
