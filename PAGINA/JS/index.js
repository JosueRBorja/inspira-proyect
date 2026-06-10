// Activa la navegacion del usuario en la pagina principal.
actualizarUsuarioEnNavegacion();

// Guarda las publicaciones recibidas desde la API.
let publicaciones = [];

// Guarda el campo de busqueda de la pagina principal.
const buscador = seleccionar("#buscar");

// Guarda todas las tarjetas de publicaciones.
const tarjetasPublicacion = seleccionarTodos(".tarjeta-publicacion");

// Guarda la categoria seleccionada por el usuario.
let categoriaSeleccionada = "todos";

// Rellena una tarjeta visual con datos de una publicacion.
function pintarTarjetaPublicacion(tarjeta, publicacion) {
    // Muestra la tarjeta por si estaba oculta.
    tarjeta.hidden = false;

    // Guarda el ID de la publicacion en la tarjeta.
    tarjeta.dataset.id = publicacion.id;

    // Guarda la categoria para poder filtrar.
    tarjeta.dataset.categoria = publicacion.category ? publicacion.category.name.toLowerCase() : "";

    // Guarda las etiquetas para buscar.
    tarjeta.dataset.etiquetas = publicacion.tags || "";

    // Busca el enlace de la imagen.
    const enlace = tarjeta.querySelector(".enlace-imagen");

    // Busca la imagen de la tarjeta.
    const imagen = tarjeta.querySelector("img");

    // Busca el titulo de la tarjeta.
    const titulo = tarjeta.querySelector("h2");

    // Busca el autor de la tarjeta.
    const autor = tarjeta.querySelector("p");

    // Actualiza el enlace hacia el detalle real.
    if (enlace) enlace.href = `detalle.html?id=${publicacion.id}`;

    // Actualiza la imagen de la publicacion.
    if (imagen) {
        imagen.src = convertirUrlArchivo(publicacion.image_url);
        imagen.alt = publicacion.title;
    }

    // Actualiza el titulo visible.
    if (titulo) titulo.textContent = publicacion.title;

    // Actualiza el autor visible.
    if (autor) autor.textContent = `Por ${publicacion.owner.full_name}`;
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
    if (buscador && buscador.value.trim()) {
        // Agrega la busqueda a los parametros de consulta.
        parametros.set("busqueda", buscador.value.trim());
    }

    // Guarda los parametros convertidos a texto.
    const consulta = parametros.toString();

    // Devuelve la ruta con o sin parametros.
    return consulta ? `/api/publicaciones?${consulta}` : "/api/publicaciones";
}

// Carga publicaciones desde la API local.
async function cargarPublicaciones() {
    // Intenta consultar las publicaciones guardadas en SQLite.
    try {
        // Obtiene publicaciones filtradas desde FastAPI.
        publicaciones = await apiJson(construirRutaPublicaciones());

        // Recorre las tarjetas existentes para rellenarlas.
        tarjetasPublicacion.forEach((tarjeta, indice) => {
            // Guarda la publicacion que corresponde a esta posicion.
            const publicacion = publicaciones[indice];

            // Oculta la tarjeta si no hay publicacion para mostrar.
            if (!publicacion) {
                tarjeta.hidden = true;
                return;
            }

            // Pinta la tarjeta con los datos reales.
            pintarTarjetaPublicacion(tarjeta, publicacion);
        });
    } catch (error) {
        // Muestra un aviso si la API no esta levantada.
        mostrarMensaje(`No se pudieron cargar publicaciones: ${error.message}`);
    }
}

// Verifica que exista el buscador antes de usarlo.
if (buscador) {
    // Escucha cada cambio que el usuario escribe en la busqueda.
    buscador.addEventListener("input", () => {
        // Solicita al backend las publicaciones que coinciden con la busqueda.
        cargarPublicaciones();
    });
}

// Recorre los enlaces de categorias.
seleccionarTodos(".categorias a").forEach((enlace) => {
    // Escucha el clic sobre cada categoria.
    enlace.addEventListener("click", (evento) => {
        // Evita que el enlace recargue la pagina.
        evento.preventDefault();

        // Quita la categoria activa anterior.
        seleccionarTodos(".categorias a").forEach((item) => item.classList.remove("categoria-activa"));

        // Marca la categoria seleccionada.
        enlace.classList.add("categoria-activa");

        // Guarda la categoria seleccionada.
        categoriaSeleccionada = enlace.textContent.trim().toLowerCase();

        // Solicita al backend las publicaciones de esa categoria.
        cargarPublicaciones();
    });
});

// Recorre los botones para guardar publicaciones.
seleccionarTodos(".boton-guardar").forEach((boton) => {
    // Escucha el clic sobre el boton guardar.
    boton.addEventListener("click", async (evento) => {
        // Evita la navegacion automatica del enlace.
        evento.preventDefault();

        // Busca la tarjeta donde esta el boton.
        const tarjeta = boton.closest("article");

        // Obtiene el ID real de la publicacion.
        const postId = tarjeta ? Number(tarjeta.dataset.id) : 0;

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
});

// Recorre los botones de mas opciones.
seleccionarTodos(".boton-opciones").forEach((boton) => {
    // Escucha el clic sobre el boton de opciones.
    boton.addEventListener("click", (evento) => {
        // Evita que el boton navegue a otra pagina.
        evento.preventDefault();

        // Evita que el clic afecte otros controles.
        evento.stopPropagation();
    });
});

// Carga las publicaciones cuando abre la pagina.
cargarPublicaciones();
