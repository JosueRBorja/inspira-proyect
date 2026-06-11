// Actualiza la navegacion con el usuario activo.
actualizarUsuarioEnNavegacion();

// Guarda el formulario de edicion.
const formularioEdicion = seleccionar(".formulario-edicion");

// Obtiene los parametros de la URL.
const parametrosEdicion = new URLSearchParams(window.location.search);

// Guarda el ID de publicacion que se va a editar.
let publicacionEdicionId = Number(parametrosEdicion.get("id")) || 1;

// Guarda las categorias reales de la API.
let categoriasEdicion = [];

// Verifica que el formulario exista.
if (formularioEdicion) {
    // Guarda el campo para cambiar imagen.
    const archivoEdicion = seleccionar("#imagen", formularioEdicion);

    // Guarda la imagen actual.
    const imagenActual = seleccionar(".imagen-actual img");

    // Guarda el texto debajo de la imagen.
    const textoImagen = seleccionar(".imagen-actual figcaption");

    // Guarda el campo del titulo.
    const tituloEdicion = seleccionar("#titulo", formularioEdicion);

    // Guarda el selector de categoria.
    const categoriaEdicion = seleccionar("#categoria", formularioEdicion);

    // Guarda el campo de descripcion.
    const descripcionEdicion = seleccionar("#descripcion", formularioEdicion);

    // Guarda el campo de etiquetas.
    const etiquetasEdicion = seleccionar("#etiquetas", formularioEdicion);

    // Carga categorias y publicacion actual desde la API.
    async function cargarEdicionApi() {
        // Intenta consultar los datos necesarios.
        try {
            // Obtiene categorias reales.
            categoriasEdicion = await obtenerCategoriasApi();

            // Coloca IDs reales en las opciones existentes.
            seleccionarTodos("#categoria option").forEach((opcion) => {
                // Busca la categoria real por nombre.
                const categoria = buscarCategoriaPorNombre(categoriasEdicion, $(opcion).text());

                // Guarda el ID real si se encontro.
                if (categoria) $(opcion).val(categoria.id);
            });

            // Obtiene la publicacion que se editara.
            const publicacion = await apiJson(`/api/publicaciones/${publicacionEdicionId}`);

            // Guarda el ID real de la publicacion.
            publicacionEdicionId = publicacion.id;

            // Actualiza la imagen actual.
            if (imagenActual) {
                $(imagenActual).attr("src", convertirUrlArchivo(publicacion.image_url));
                $(imagenActual).attr("alt", publicacion.title);
            }

            // Actualiza el texto de la imagen.
            if (textoImagen) $(textoImagen).text(publicacion.title);

            // Actualiza el titulo.
            if (tituloEdicion) $(tituloEdicion).val(publicacion.title);

            // Actualiza la descripcion.
            if (descripcionEdicion) $(descripcionEdicion).val(publicacion.description || "");

            // Actualiza etiquetas.
            if (etiquetasEdicion) $(etiquetasEdicion).val(publicacion.tags || "");

            // Selecciona la categoria actual.
            if (categoriaEdicion && publicacion.category_id) $(categoriaEdicion).val(String(publicacion.category_id));
        } catch (error) {
            // Muestra el error si no se pudo cargar la edicion.
            mostrarMensaje(error.message);
        }
    }

    // Verifica que existan el campo de archivo y la imagen actual.
    if (archivoEdicion && imagenActual) {
        // Escucha cuando el usuario selecciona una imagen.
        $(archivoEdicion).on("change", () => {
            // Guarda la imagen seleccionada.
            const imagen = archivoEdicion.files[0];

            // Detiene la vista previa si no hay imagen.
            if (!imagen) return;

            // Muestra la imagen seleccionada.
            $(imagenActual).attr("src", URL.createObjectURL(imagen));

            // Actualiza el texto alternativo.
            $(imagenActual).attr("alt", imagen.name);

            // Muestra el nombre de la imagen nueva.
            if (textoImagen) $(textoImagen).text(imagen.name);
        });
    }

    // Verifica que existan el titulo y el texto de imagen.
    if (tituloEdicion && textoImagen) {
        // Escucha cambios del titulo.
        $(tituloEdicion).on("input", () => {
            // Muestra el titulo como referencia de la imagen.
            $(textoImagen).text($(tituloEdicion).val() || "Imagen actual");
        });
    }

    // Escucha el envio del formulario.
    $(formularioEdicion).on("submit", async (evento) => {
        // Evita que la pagina se recargue.
        evento.preventDefault();

        // Valida el titulo con las normas eticas.
        if (!validarContenidoEtico($(tituloEdicion).val(), "titulo")) return;

        // Valida la descripcion con las normas eticas.
        if (descripcionEdicion && !validarContenidoEtico($(descripcionEdicion).val(), "descripcion")) return;

        // Valida las etiquetas con las normas eticas.
        if (etiquetasEdicion && !validarContenidoEtico($(etiquetasEdicion).val(), "etiquetas")) return;

        // Intenta guardar cambios en la API.
        try {
            // Actualiza los datos de texto de la publicacion.
            await apiJson(`/api/publicaciones/${publicacionEdicionId}`, {
                method: "PATCH",
                body: JSON.stringify({
                    title: $(tituloEdicion).val().trim(),
                    description: descripcionEdicion ? $(descripcionEdicion).val().trim() : "",
                    tags: etiquetasEdicion ? $(etiquetasEdicion).val().trim() : "",
                    category_id: categoriaEdicion ? Number($(categoriaEdicion).val()) : null
                })
            });

            // Verifica si hay una imagen nueva seleccionada.
            if (archivoEdicion.files.length) {
                // Prepara el formulario para subir imagen.
                const datosImagen = new FormData();

                // Agrega la imagen nueva.
                datosImagen.append("image", archivoEdicion.files[0]);

                // Sube la imagen nueva.
                await apiFormulario(`/api/publicaciones/${publicacionEdicionId}/imagen`, datosImagen, { method: "POST" });
            }

            // Avisa que los cambios se guardaron.
            mostrarMensaje("Cambios guardados.");

            // Envia al usuario a su cuenta.
            irA("mi-cuenta.html");
        } catch (error) {
            // Muestra el error si no se pudo guardar.
            mostrarMensaje(error.message);
        }
    });

    // Carga los datos reales al abrir la pantalla.
    cargarEdicionApi();
}

// Guarda el boton para eliminar publicacion.
const botonEliminarEdicion = seleccionar(".boton-eliminar");

// Verifica que el boton exista.
if (botonEliminarEdicion) {
    // Escucha el clic sobre eliminar.
    $(botonEliminarEdicion).on("click", async () => {
        // Pide confirmacion antes de eliminar.
        if (!confirm("Seguro que quieres eliminar esta publicacion?")) return;

        // Intenta eliminar la publicacion en la API.
        try {
            // Elimina la publicacion actual.
            await apiJson(`/api/publicaciones/${publicacionEdicionId}`, { method: "DELETE" });

            // Avisa que la publicacion fue retirada.
            mostrarMensaje("Publicacion eliminada.");

            // Envia al usuario a su cuenta.
            irA("mi-cuenta.html");
        } catch (error) {
            // Muestra el error si no se pudo eliminar.
            mostrarMensaje(error.message);
        }
    });
}
