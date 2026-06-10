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

// Guarda las tarjetas disponibles para las publicaciones del usuario.
const tarjetasCuenta = seleccionarTodos(".lista-publicaciones .tarjeta-publicacion");

// Rellena una publicacion dentro de mi cuenta.
function pintarPublicacionCuenta(tarjeta, publicacion) {
    // Muestra la tarjeta.
    tarjeta.hidden = false;

    // Guarda el ID de la publicacion.
    tarjeta.dataset.id = publicacion.id;

    // Busca la imagen de la publicacion.
    const imagen = tarjeta.querySelector("img");

    // Busca el titulo.
    const titulo = tarjeta.querySelector("h3");

    // Busca la categoria.
    const categoria = tarjeta.querySelector(".contenido-publicacion p");

    // Busca el texto de guardados.
    const guardados = tarjeta.querySelector(".contenido-publicacion span");

    // Busca el enlace de detalle.
    const enlaceVer = tarjeta.querySelector('.acciones-publicacion a[href^="detalle"]');

    // Busca el enlace de edicion.
    const enlaceEditar = tarjeta.querySelector('.acciones-publicacion a[href^="editar"]');

    // Actualiza la imagen.
    if (imagen) {
        imagen.src = convertirUrlArchivo(publicacion.image_url);
        imagen.alt = publicacion.title;
    }

    // Actualiza el titulo.
    if (titulo) titulo.textContent = publicacion.title;

    // Actualiza la categoria.
    if (categoria) categoria.textContent = publicacion.category ? publicacion.category.name : "Sin categoria";

    // Muestra un texto de referencia para guardados.
    if (guardados) guardados.textContent = "Guardados por usuarios";

    // Actualiza el enlace para ver.
    if (enlaceVer) enlaceVer.href = `detalle.html?id=${publicacion.id}`;

    // Actualiza el enlace para editar.
    if (enlaceEditar) enlaceEditar.href = `editar-publicacion.html?id=${publicacion.id}`;
}

// Carga la cuenta real desde la API.
async function cargarCuentaApi() {
    // Intenta consultar usuario y publicaciones.
    try {
        // Obtiene el usuario actual.
        const usuario = await cargarUsuarioActualDesdeApi();

        // Obtiene desde el backend solo las publicaciones del usuario actual.
        const publicacionesUsuario = await apiJson(`/api/publicaciones?owner_id=${usuario.id}`);

        // Coloca el nombre del usuario.
        if (nombreCuenta) nombreCuenta.textContent = usuario.full_name;

        // Coloca el alias del usuario.
        if (aliasCuenta) aliasCuenta.textContent = usuario.alias;

        // Coloca la biografia del usuario.
        if (descripcionCuenta) descripcionCuenta.textContent = usuario.biography || "Sin biografia registrada.";

        // Actualiza la foto cuando existe el elemento.
        if (fotoCuenta) {
            // Coloca la foto del usuario.
            fotoCuenta.src = convertirUrlArchivo(usuario.profile_photo_url);

            // Describe la imagen con el nombre del usuario.
            fotoCuenta.alt = `Foto de perfil de ${usuario.full_name}`;
        }

        // Actualiza los numeros de resumen.
        seleccionarTodos(".resumen-cuenta article strong").forEach((numero, indice) => {
            // Muestra publicaciones reales en el primer contador.
            if (indice === 0) numero.textContent = publicacionesUsuario.length;
        });

        // Recorre las tarjetas para mostrar publicaciones reales.
        tarjetasCuenta.forEach((tarjeta, indice) => {
            // Guarda la publicacion de esa posicion.
            const publicacion = publicacionesUsuario[indice];

            // Oculta la tarjeta si no hay publicacion.
            if (!publicacion) {
                tarjeta.hidden = true;
                return;
            }

            // Pinta la tarjeta con la publicacion.
            pintarPublicacionCuenta(tarjeta, publicacion);
        });
    } catch (error) {
        // Muestra el error si la cuenta no pudo cargar.
        mostrarMensaje(error.message);
    }
}

// Recorre los botones para eliminar publicaciones.
seleccionarTodos(".boton-eliminar").forEach((boton) => {
    // Escucha el clic sobre eliminar.
    boton.addEventListener("click", async () => {
        // Pide confirmacion antes de ocultar la publicacion.
        if (!confirm("Seguro que quieres eliminar esta publicacion?")) return;

        // Busca la tarjeta de la publicacion.
        const tarjeta = boton.closest(".tarjeta-publicacion");

        // Obtiene el ID real de la publicacion.
        const postId = tarjeta ? Number(tarjeta.dataset.id) : 0;

        // Detiene la accion si no hay ID.
        if (!postId) return;

        // Intenta eliminar en la API.
        try {
            // Elimina la publicacion en FastAPI.
            await apiJson(`/api/publicaciones/${postId}`, { method: "DELETE" });

            // Oculta la publicacion dentro de la maqueta.
            if (tarjeta) tarjeta.hidden = true;
        } catch (error) {
            // Muestra el error si no se pudo eliminar.
            mostrarMensaje(error.message);
        }
    });
});

// Carga la informacion real de la cuenta al abrir.
cargarCuentaApi();
