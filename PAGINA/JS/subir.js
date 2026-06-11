// Actualiza la navegacion con el usuario activo.
actualizarUsuarioEnNavegacion();

// Guarda el selector de categoria.
const selectorCategoria = seleccionar("#categoria");

// Guarda el grupo donde se escribe una categoria nueva.
const grupoOtraCategoria = seleccionar(".grupo-otra-categoria");

// Guarda el campo de la nueva categoria.
const campoNuevaCategoria = seleccionar("#nueva-categoria");

// Guarda las categorias reales que devuelve la API.
let categoriasSubida = [];

// Carga categorias desde la API para asociarlas al select.
async function cargarCategoriasSubida() {
    // Intenta consultar categorias reales.
    try {
        // Guarda las categorias recibidas.
        categoriasSubida = await obtenerCategoriasApi();

        // Recorre las opciones existentes del select.
        seleccionarTodos("#categoria option").forEach((opcion) => {
            // No modifica la opcion para crear otra categoria.
            if ($(opcion).val() === "otra") return;

            // Busca la categoria real que coincide con la opcion.
            const categoria = buscarCategoriaPorNombre(categoriasSubida, $(opcion).text());

            // Guarda el ID real como valor del option.
            if (categoria) $(opcion).val(categoria.id);
        });
    } catch (error) {
        // Avisa si no se pudieron consultar categorias.
        mostrarMensaje(`No se pudieron cargar categorias: ${error.message}`);
    }
}

// Actualiza la visibilidad del campo de nueva categoria.
function actualizarCampoOtraCategoria() {
    // Verifica si el usuario eligio otra categoria.
    const usaOtraCategoria = $(selectorCategoria).val() === "otra";

    // Muestra u oculta el campo segun la opcion elegida.
    $(grupoOtraCategoria).prop("hidden", !usaOtraCategoria);

    // Marca el campo como obligatorio si se eligio otra categoria.
    $(campoNuevaCategoria).prop("required", usaOtraCategoria);

    // Limpia el campo si el usuario vuelve a una categoria basica.
    if (!usaOtraCategoria) $(campoNuevaCategoria).val("");
}

// Verifica que existan los campos de categoria.
if (selectorCategoria && grupoOtraCategoria && campoNuevaCategoria) {
    // Escucha el cambio de categoria.
    $(selectorCategoria).on("change", actualizarCampoOtraCategoria);

    // Ejecuta la revision inicial del campo.
    actualizarCampoOtraCategoria();
}

// Guarda el campo de archivo.
const archivoSubida = seleccionar("#archivo");

// Guarda el area visual donde se previsualiza la imagen.
const selectorArchivo = seleccionar(".selector-archivo");

// Verifica que exista el campo de archivo.
if (archivoSubida && selectorArchivo) {
    // Escucha cuando el usuario selecciona una imagen.
    $(archivoSubida).on("change", () => {
        // Guarda el archivo seleccionado.
        const imagen = archivoSubida.files[0];

        // Detiene la vista previa si no hay archivo.
        if (!imagen) return;

        // Crea una ruta temporal para mostrar la imagen.
        const urlTemporal = URL.createObjectURL(imagen);

        // Coloca la imagen como fondo del selector.
        $(selectorArchivo).css("background-image", `linear-gradient(rgba(255,255,255,0.35), rgba(255,255,255,0.35)), url("${urlTemporal}")`);

        // Busca el texto interno del selector.
        const texto = seleccionar("span", selectorArchivo);

        // Muestra el nombre del archivo seleccionado.
        if (texto) $(texto).text(imagen.name);
    });
}

// Guarda el formulario de subida.
const formularioSubida = seleccionar(".formulario-subida");

// Verifica que el formulario exista.
if (formularioSubida) {
    // Escucha el envio del formulario.
    $(formularioSubida).on("submit", async (evento) => {
        // Evita que se recargue la pagina.
        evento.preventDefault();

        // Guarda el campo del titulo.
        const titulo = seleccionar("#titulo", formularioSubida);

        // Guarda el campo del archivo.
        const archivo = seleccionar("#archivo", formularioSubida);

        // Guarda el campo de categoria.
        const categoria = seleccionar("#categoria", formularioSubida);

        // Guarda el campo de nueva categoria.
        const nuevaCategoria = seleccionar("#nueva-categoria", formularioSubida);

        // Guarda el campo de descripcion.
        const descripcion = seleccionar("#descripcion", formularioSubida);

        // Verifica que exista una imagen seleccionada.
        if (!archivo.files.length) {
            // Avisa que falta la imagen.
            mostrarMensaje("Selecciona una imagen antes de publicar.");

            // Detiene la publicacion.
            return;
        }

        // Verifica que exista un titulo.
        if (!$(titulo).val().trim()) {
            // Avisa que falta el titulo.
            mostrarMensaje("Escribe un titulo para la publicacion.");

            // Detiene la publicacion.
            return;
        }

        // Verifica que se escriba una categoria nueva cuando se eligio esa opcion.
        if ($(categoria).val() === "otra" && !$(nuevaCategoria).val().trim()) {
            // Avisa que falta la categoria.
            mostrarMensaje("Escribe el nombre de la nueva categoria.");

            // Detiene la publicacion.
            return;
        }

        // Valida el titulo con las normas eticas.
        if (!validarContenidoEtico($(titulo).val(), "titulo")) return;

        // Valida la descripcion con las normas eticas.
        if (descripcion && !validarContenidoEtico($(descripcion).val(), "descripcion")) return;

        // Valida la categoria nueva con las normas eticas.
        if (nuevaCategoria && $(nuevaCategoria).val() && !validarContenidoEtico($(nuevaCategoria).val(), "categoria")) return;

        // Intenta crear o usar la categoria y subir la publicacion.
        try {
            // Guarda el valor de categoria que se enviara.
            const valorCategoria = $(categoria).val();

            // Guarda el texto visible de la categoria seleccionada.
            const textoCategoria = $(categoria).find("option:selected").text().trim();

            // Guarda el ID de categoria que se enviara.
            let categoryId = Number(valorCategoria);

            // Crea una categoria si el usuario eligio la opcion otra.
            if (valorCategoria === "otra") {
                // Obtiene o crea la categoria escrita.
                const categoriaCreada = await obtenerOCrearCategoria($(nuevaCategoria).val());

                // Guarda el ID de la categoria creada.
                categoryId = categoriaCreada.id;
            }

            // Busca o crea la categoria cuando el select todavia tiene texto en lugar de ID.
            if (valorCategoria !== "otra" && !Number.isFinite(categoryId)) {
                // Obtiene o crea la categoria seleccionada por nombre.
                const categoriaEncontrada = await obtenerOCrearCategoria(textoCategoria);

                // Guarda el ID real de la categoria.
                categoryId = categoriaEncontrada.id;
            }

            // Prepara los datos de formulario para subir imagen.
            const datos = new FormData();

            // Agrega el usuario dueno de la publicacion.
            datos.append("owner_id", obtenerUsuarioIdActual());

            // Agrega el titulo de la publicacion.
            datos.append("title", $(titulo).val().trim());

            // Agrega la descripcion.
            datos.append("description", descripcion ? $(descripcion).val().trim() : "");

            // Agrega la categoria.
            datos.append("category_id", categoryId);

            // Agrega etiquetas basicas con la categoria.
            datos.append("tags", valorCategoria === "otra" ? $(nuevaCategoria).val().trim() : textoCategoria);

            // Agrega la imagen seleccionada.
            datos.append("image", archivo.files[0]);

            // Envia la publicacion a la API.
            await apiFormulario("/api/publicaciones/upload", datos, { method: "POST" });

            // Avisa que la publicacion fue guardada.
            mostrarMensaje("Publicacion guardada.");

            // Envia al usuario a su cuenta.
            irA("mi-cuenta.html");
        } catch (error) {
            // Muestra el error si la API no pudo guardar.
            mostrarMensaje(error.message);
        }
    });
}

// Carga categorias reales al abrir la pagina.
cargarCategoriasSubida();
