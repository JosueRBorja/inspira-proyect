// Actualiza la navegacion con el usuario activo.
actualizarUsuarioEnNavegacion();

// Guarda los filtros de la pagina de guardados.
const filtrosGuardados = seleccionarTodos(".filtros-guardados a");

// Guarda las tarjetas guardadas.
const tarjetasGuardadas = seleccionarTodos(".tarjeta-guardada");

// Guarda los guardados recibidos desde la API.
let guardadosUsuario = [];

// Rellena una tarjeta guardada con datos reales.
function pintarTarjetaGuardada(tarjeta, guardado) {
    // Guarda la publicacion relacionada.
    const publicacion = guardado.post;

    // Muestra la tarjeta.
    tarjeta.hidden = false;

    // Guarda el ID del guardado.
    tarjeta.dataset.id = guardado.id;

    // Guarda la categoria para filtrar.
    tarjeta.dataset.categoria = publicacion.category ? publicacion.category.name.toLowerCase() : "";

    // Busca el enlace de detalle.
    const enlace = tarjeta.querySelector("a");

    // Busca la imagen.
    const imagen = tarjeta.querySelector("img");

    // Busca el titulo.
    const titulo = tarjeta.querySelector("h2");

    // Busca la categoria visible.
    const categoria = tarjeta.querySelector("p");

    // Actualiza el enlace al detalle.
    if (enlace) enlace.href = `detalle.html?id=${publicacion.id}`;

    // Actualiza la imagen guardada.
    if (imagen) {
        imagen.src = convertirUrlArchivo(publicacion.image_url);
        imagen.alt = publicacion.title;
    }

    // Actualiza el titulo.
    if (titulo) titulo.textContent = publicacion.title;

    // Actualiza la categoria visible.
    if (categoria) categoria.textContent = `Guardado desde ${publicacion.category ? publicacion.category.name : "Sin categoria"}`;
}

// Carga guardados reales desde la API.
async function cargarGuardadosApi() {
    // Intenta consultar los guardados del usuario.
    try {
        // Obtiene los guardados del usuario activo.
        guardadosUsuario = await apiJson(`/api/guardados/usuario/${obtenerUsuarioIdActual()}`);

        // Recorre las tarjetas disponibles.
        tarjetasGuardadas.forEach((tarjeta, indice) => {
            // Guarda el guardado que corresponde.
            const guardado = guardadosUsuario[indice];

            // Oculta la tarjeta si no hay datos.
            if (!guardado) {
                tarjeta.hidden = true;
                return;
            }

            // Rellena la tarjeta con el guardado.
            pintarTarjetaGuardada(tarjeta, guardado);
        });
    } catch (error) {
        // Muestra el error si no se pudieron cargar guardados.
        mostrarMensaje(error.message);
    }
}

// Recorre cada filtro disponible.
filtrosGuardados.forEach((enlace) => {
    // Escucha el clic sobre el filtro.
    enlace.addEventListener("click", (evento) => {
        // Evita que el enlace recargue la pagina.
        evento.preventDefault();

        // Quita el filtro activo anterior.
        filtrosGuardados.forEach((item) => item.classList.remove("filtro-activo"));

        // Marca el filtro seleccionado.
        enlace.classList.add("filtro-activo");

        // Guarda el nombre del filtro.
        const categoria = enlace.textContent.trim().toLowerCase();

        // Recorre las tarjetas guardadas.
        tarjetasGuardadas.forEach((tarjeta) => {
            // Obtiene la categoria de la tarjeta.
            const categoriaTarjeta = tarjeta.dataset.categoria || "";

            // Muestra todo o filtra por categoria.
            tarjeta.hidden = categoria !== "todos" && categoriaTarjeta !== categoria;
        });
    });
});

// Recorre los botones para quitar elementos guardados.
seleccionarTodos(".tarjeta-guardada button").forEach((boton) => {
    // Escucha el clic sobre quitar.
    boton.addEventListener("click", async () => {
        // Busca la tarjeta guardada.
        const tarjeta = boton.closest(".tarjeta-guardada");

        // Obtiene el ID real del guardado.
        const guardadoId = tarjeta ? Number(tarjeta.dataset.id) : 0;

        // Detiene la accion si no hay ID.
        if (!guardadoId) return;

        // Intenta eliminar el guardado.
        try {
            // Elimina el guardado en la API.
            await apiJson(`/api/guardados/${guardadoId}`, { method: "DELETE" });

            // Oculta la tarjeta en la maqueta.
            if (tarjeta) tarjeta.hidden = true;
        } catch (error) {
            // Muestra el error si no se pudo quitar.
            mostrarMensaje(error.message);
        }
    });
});

// Carga los guardados reales al abrir la pagina.
cargarGuardadosApi();
