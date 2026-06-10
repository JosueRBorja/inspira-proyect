// Guarda las palabras que el sistema bloquea por politica de contenido.
const palabrasNoPermitidas = [
    "odio",
    "violencia",
    "insulto",
    "discriminacion",
    "acoso",
    "amenaza",
    "muerte",
    "muerto",
    "maldito",
    "basura",
    "asco",
    "idiota",
    "imbecil",
    "estupido",
    "tonto",
    "mierda",
    "puta",
    "puto",
    "carajo",
    "verga",
    "pendejo",
    "gilipollas",
    "cabrón",
    "hijo de puta",
    "hija de puta",
    "malparido",
    "malparida",
    "zorra",
    "cerdo",
    "perra",
    "maricón",
    "maricona",
    "marica",
    "gay",
    "lesbiana",
    "transexual",
    "transgénero",
    "travesti",
    "puto el que lo lea",
    "Jochis",
    "Maje",
    "Inutil",
    "Imbécil",
    "Pendejo",
    "Gilipollas",
    "Zorra",
    "Cerdo",
    "Perra",
    "Maricón",
    "Maricona",
    "Marica",
        
];

// Guarda el origen de la API cuando la pagina se sirve desde FastAPI.
const API_BASE = "";

// Busca un elemento dentro del documento con querySelector.
function seleccionar(selector) {
    // Devuelve el primer elemento que coincide con el selector.
    return document.querySelector(selector);
}

// Busca varios elementos dentro del documento con querySelectorAll.
function seleccionarTodos(selector) {
    // Devuelve todos los elementos que coinciden con el selector.
    return document.querySelectorAll(selector);
}

// Muestra una alerta sencilla al usuario.
function mostrarMensaje(mensaje) {
    // Presenta el mensaje recibido en pantalla.
    alert(mensaje);
}

// Redirige al usuario hacia otra pagina.
function irA(ruta) {
    // Cambia la ubicacion actual del navegador.
    window.location.href = ruta;
}

// Convierte una ruta relativa de la API en una URL completa.
function convertirUrlArchivo(ruta) {
    // Devuelve una imagen de respaldo si no hay ruta.
    if (!ruta) return "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80";

    // Devuelve la ruta original cuando ya es una URL externa.
    if (ruta.startsWith("http")) return ruta;

    // Devuelve la ruta local servida por FastAPI.
    return `${API_BASE}${ruta}`;
}

// Convierte texto en un slug para categorias nuevas.
function crearSlug(texto) {
    // Normaliza el texto y quita tildes.
    const textoNormalizado = texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Devuelve el slug limpio para guardar en la API.
    return textoNormalizado.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// Obtiene el ID del usuario que esta usando la maqueta.
function obtenerUsuarioIdActual() {
    // Devuelve el ID guardado o usa el primer usuario de ejemplo.
    return Number(localStorage.getItem("usuarioId")) || 1;
}

// Guarda los datos del usuario que inicio sesion.
function guardarSesionUsuario(usuario) {
    // Guarda el ID del usuario.
    localStorage.setItem("usuarioId", usuario.id);

    // Marca la sesion como activa.
    localStorage.setItem("sesionActiva", "true");

    // Guarda los datos visibles del perfil.
    guardarPerfilLocal(usuario.full_name, usuario.alias, usuario.biography || "", convertirUrlArchivo(usuario.profile_photo_url));
}

// Cierra la sesion local de la maqueta.
function cerrarSesionLocal() {
    // Elimina el estado de sesion activa.
    localStorage.removeItem("sesionActiva");

    // Elimina el ID del usuario activo.
    localStorage.removeItem("usuarioId");
}

// Lee una respuesta JSON de la API y controla errores.
async function leerRespuestaApi(respuesta) {
    // Devuelve null cuando la API no envia cuerpo.
    if (respuesta.status === 204) return null;

    // Convierte la respuesta en JSON.
    const datos = await respuesta.json();

    // Lanza un error cuando la API responde mal.
    if (!respuesta.ok) {
        // Obtiene el mensaje principal del error.
        const detalle = Array.isArray(datos.detail) ? datos.detail[0]?.msg : datos.detail;

        // Detiene la operacion con un mensaje entendible.
        throw new Error(detalle || "La API no pudo completar la accion.");
    }

    // Devuelve los datos recibidos.
    return datos;
}

// Ejecuta una peticion JSON contra la API.
async function apiJson(ruta, opciones = {}) {
    // Ejecuta la peticion con encabezados JSON.
    const respuesta = await fetch(`${API_BASE}${ruta}`, {
        ...opciones,
        headers: {
            "Content-Type": "application/json",
            ...(opciones.headers || {})
        }
    });

    // Devuelve la respuesta procesada.
    return leerRespuestaApi(respuesta);
}

// Ejecuta una peticion con FormData contra la API.
async function apiFormulario(ruta, formulario, opciones = {}) {
    // Ejecuta la peticion sin forzar encabezados para que el navegador cree multipart.
    const respuesta = await fetch(`${API_BASE}${ruta}`, {
        ...opciones,
        body: formulario
    });

    // Devuelve la respuesta procesada.
    return leerRespuestaApi(respuesta);
}

// Obtiene todas las categorias desde la API.
async function obtenerCategoriasApi() {
    // Devuelve la lista de categorias.
    return apiJson("/api/categorias");
}

// Busca una categoria por nombre.
function buscarCategoriaPorNombre(categorias, nombre) {
    // Limpia el nombre recibido.
    const nombreBuscado = nombre.trim().toLowerCase();

    // Devuelve la categoria que coincide por nombre.
    return categorias.find((categoria) => categoria.name.toLowerCase() === nombreBuscado);
}

// Crea una categoria cuando no existe todavia.
async function obtenerOCrearCategoria(nombre) {
    // Obtiene las categorias actuales.
    const categorias = await obtenerCategoriasApi();

    // Busca si la categoria ya existe.
    const categoriaExistente = buscarCategoriaPorNombre(categorias, nombre);

    // Devuelve la categoria existente cuando se encontro.
    if (categoriaExistente) return categoriaExistente;

    // Crea una nueva categoria en la API.
    return apiJson("/api/categorias", {
        method: "POST",
        body: JSON.stringify({
            name: nombre.trim(),
            slug: crearSlug(nombre)
        })
    });
}

// Carga los datos reales del usuario activo.
async function cargarUsuarioActualDesdeApi() {
    // Obtiene el usuario activo desde la API.
    const usuario = await apiJson(`/api/usuarios/${obtenerUsuarioIdActual()}`);

    // Guarda los datos recibidos en localStorage.
    guardarSesionUsuario(usuario);

    // Devuelve el usuario consultado.
    return usuario;
}

// Asegura que el alias siempre empiece con arroba.
function normalizarAlias(alias) {
    // Limpia los espacios sobrantes del alias.
    const aliasLimpio = alias.trim();

    // Devuelve el alias vacio si no se escribio nada.
    if (!aliasLimpio) return aliasLimpio;

    // Agrega la arroba cuando el usuario no la escribio.
    return aliasLimpio.startsWith("@") ? aliasLimpio : `@${aliasLimpio}`;
}

// Revisa si un texto contiene palabras prohibidas.
function contieneContenidoNoPermitido(texto) {
    // Convierte el texto a minusculas y quita tildes para comparar mejor.
    const textoRevisado = texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Indica si alguna palabra no permitida aparece en el texto.
    return palabrasNoPermitidas.some((palabra) => textoRevisado.includes(palabra));
}

// Revisa si un texto parece contener un correo electronico.
function contieneCorreo(texto) {
    // Devuelve verdadero cuando el patron de correo aparece en el texto.
    return /\S+@\S+\.\S+/.test(texto);
}

// Valida que un campo publico cumpla las reglas eticas.
function validarContenidoEtico(texto, campo) {
    // Revisa si el campo contiene palabras no permitidas.
    if (contieneContenidoNoPermitido(texto)) {
        // Avisa que el contenido no cumple las normas.
        mostrarMensaje(`El campo ${campo} contiene contenido no permitido por las normas de la plataforma.`);

        // Detiene la accion que se estaba realizando.
        return false;
    }

    // Revisa si el campo publica un correo electronico.
    if (contieneCorreo(texto)) {
        // Avisa que no se debe mostrar correo en campos publicos.
        mostrarMensaje(`No publiques correos electronicos en ${campo}. Usa tu alias para proteger tu privacidad.`);

        // Detiene la accion que se estaba realizando.
        return false;
    }

    // Permite continuar cuando el campo pasa la validacion.
    return true;
}

// Guarda los datos basicos del perfil en el navegador.
function guardarPerfilLocal(nombre, alias, biografia, foto) {
    // Guarda el nombre visible del usuario.
    localStorage.setItem("perfilNombre", nombre);

    // Guarda el alias visible del usuario.
    localStorage.setItem("perfilAlias", normalizarAlias(alias));

    // Guarda la biografia publica del usuario.
    localStorage.setItem("perfilBiografia", biografia || "");

    // Guarda la foto cuando existe una imagen seleccionada.
    if (foto) localStorage.setItem("perfilFoto", convertirUrlArchivo(foto));
}

// Obtiene los datos del perfil guardados en el navegador.
function obtenerPerfilLocal() {
    // Devuelve un objeto con datos guardados o datos de ejemplo.
    return {
        nombre: localStorage.getItem("perfilNombre") || "Josue Ramirez",
        alias: localStorage.getItem("perfilAlias") || "@josue.visual",
        biografia: localStorage.getItem("perfilBiografia") || "Creador de contenido visual.",
        foto: localStorage.getItem("perfilFoto") || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=260&q=80"
    };
}

// Actualiza la foto y alias del usuario en la navegacion.
function actualizarUsuarioEnNavegacion() {
    // Obtiene el perfil guardado.
    const perfil = obtenerPerfilLocal();

    // Recorre los enlaces que muestran el usuario activo.
    seleccionarTodos(".usuario-activo").forEach((usuario) => {
        // Busca la imagen del usuario dentro del enlace.
        const imagen = usuario.querySelector("img");

        // Busca el texto del alias dentro del enlace.
        const texto = usuario.querySelector(".perfil-alias") || usuario.querySelector("span");

        // Actualiza la descripcion accesible del enlace.
        usuario.setAttribute("aria-label", `Perfil de ${perfil.nombre}`);

        // Actualiza la foto cuando existe la imagen.
        if (imagen) {
            // Coloca la foto del perfil guardado.
            imagen.src = perfil.foto;

            // Describe la imagen con el nombre del usuario.
            imagen.alt = `Foto de perfil de ${perfil.nombre}`;
        }

        // Actualiza el alias visible cuando existe el texto.
        if (texto) texto.textContent = perfil.alias;
    });

    // Recorre los enlaces que cierran la sesion.
    seleccionarTodos('a[href="login.html"]').forEach((enlace) => {
        // Verifica si el enlace representa la salida del usuario.
        if (enlace.textContent.trim().toLowerCase() === "salir" || enlace.classList.contains("salir")) {
            // Escucha el clic del usuario en salir.
            enlace.addEventListener("click", () => {
                // Elimina el estado de sesion local.
                cerrarSesionLocal();
            });
        }
    });

    // Activa los menus desplegables del perfil.
    inicializarMenusDePerfil();
}

// Controla los menus desplegables de perfil en la navegacion.
function inicializarMenusDePerfil() {
    // Recorre cada contenedor de perfil disponible.
    seleccionarTodos(".perfil-desplegable").forEach((contenedor) => {
        // Busca el boton que abre el menu.
        const boton = contenedor.querySelector(".boton-perfil");

        // Detiene la configuracion si no existe el boton.
        if (!boton || boton.dataset.menuInicializado === "true") return;

        // Marca el boton para no duplicar eventos.
        boton.dataset.menuInicializado = "true";

        // Prepara el estado accesible inicial del boton.
        boton.setAttribute("aria-expanded", "false");
    });
}

// Cierra todos los menus de perfil abiertos.
function cerrarMenusDePerfil() {
    // Recorre cada contenedor de perfil.
    seleccionarTodos(".perfil-desplegable").forEach((contenedor) => {
        // Oculta el menu desplegable.
        contenedor.classList.remove("abierto");

        // Busca el boton del menu.
        const boton = contenedor.querySelector(".boton-perfil");

        // Actualiza el estado accesible cuando existe el boton.
        if (boton) boton.setAttribute("aria-expanded", "false");
    });
}

// Controla los clics generales para abrir o cerrar el menu de perfil.
document.addEventListener("click", (evento) => {
    // Busca si el clic ocurrio sobre el boton de perfil.
    const botonPerfil = evento.target.closest(".boton-perfil");

    // Evalua si el usuario aplasto la foto o boton del perfil.
    if (botonPerfil) {
        // Evita acciones secundarias del clic.
        evento.preventDefault();

        // Busca el contenedor del menu.
        const contenedor = botonPerfil.closest(".perfil-desplegable");

        // Detiene la accion si no existe el contenedor.
        if (!contenedor) return;

        // Guarda si el menu estaba abierto.
        const menuAbierto = contenedor.classList.contains("abierto");

        // Cierra cualquier menu abierto.
        cerrarMenusDePerfil();

        // Abre el menu actual si estaba cerrado.
        if (!menuAbierto) {
            // Muestra el menu del perfil.
            contenedor.classList.add("abierto");

            // Actualiza el estado accesible del boton.
            botonPerfil.setAttribute("aria-expanded", "true");
        }

        // Termina el manejo del clic.
        return;
    }

    // Cierra el menu de perfil cuando se hace clic fuera.
    cerrarMenusDePerfil();
});

// Cierra el menu de perfil cuando se presiona Escape.
document.addEventListener("keydown", (evento) => {
    // Evalua si la tecla presionada fue Escape.
    if (evento.key === "Escape") cerrarMenusDePerfil();
});
