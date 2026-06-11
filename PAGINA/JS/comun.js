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

// Detecta desde donde debe consumir la API.
function obtenerBaseApi() {
    // Guarda si la pagina se abrio como archivo local.
    const esArchivoLocal = window.location.protocol === "file:";

    // Guarda si la pagina se esta probando en un servidor local.
    const esHostLocal = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";

    // Guarda los puertos que normalmente usa FastAPI durante las pruebas.
    const puertosFastApi = ["8000", "8001", "8010", "8013", "8014", "8020", "8023", "8024", "8025", "8030"];

    // Usa FastAPI en el puerto 8000 cuando se abre con archivo local.
    if (esArchivoLocal) return "http://127.0.0.1:8000";

    // Usa FastAPI en el puerto 8000 cuando la pagina viene de Live Server u otro puerto externo.
    if (esHostLocal && window.location.port && !puertosFastApi.includes(window.location.port)) return "http://127.0.0.1:8000";

    // Usa el mismo origen cuando FastAPI sirve los HTML.
    return "";
}

// Guarda el origen de la API para todas las peticiones.
const API_BASE = obtenerBaseApi();

// Busca un elemento con jQuery y devuelve el nodo para mantener el codigo claro.
function seleccionar(selector, contexto) {
    // Usa jQuery dentro de un contexto cuando se recibe un contenedor.
    const elementos = contexto ? $(contexto).find(selector) : $(selector);

    // Devuelve el primer elemento encontrado.
    return elementos.get(0);
}

// Busca varios elementos con jQuery y devuelve una lista de nodos.
function seleccionarTodos(selector, contexto) {
    // Usa jQuery para localizar todos los elementos solicitados.
    const elementos = contexto ? $(contexto).find(selector) : $(selector);

    // Devuelve los elementos como arreglo para poder recorrerlos.
    return elementos.toArray();
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
    const textoNormalizado = texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");// Reemplaza espacios y caracteres especiales por guiones, y quita guiones al inicio o final.

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

// Obtiene un mensaje entendible desde un error de la API.
function obtenerMensajeErrorApi(error) {
    // Guarda la respuesta JSON cuando existe.
    const respuesta = error.responseJSON;

    // Devuelve el mensaje de validacion cuando FastAPI envia una lista.
    if (respuesta && Array.isArray(respuesta.detail)) return respuesta.detail[0]?.msg || "La API no pudo completar la accion.";

    // Devuelve el detalle directo cuando FastAPI envia texto.
    if (respuesta && respuesta.detail) return respuesta.detail;

    // Devuelve texto plano cuando no vino JSON.
    if (error.responseText) return error.responseText;

    // Devuelve un mensaje claro cuando no hay conexion.
    if (error.status === 0) return "No se pudo conectar con la API. Levanta FastAPI y abre la pagina desde http://127.0.0.1:8000.";

    // Devuelve un mensaje general para errores no esperados.
    return "La API no pudo completar la accion.";
}

// Ejecuta una peticion JSON contra la API usando jQuery.
async function apiJson(ruta, opciones = {}) {
    // Intenta ejecutar la peticion centralizada.
    try {
        // Devuelve la respuesta procesada por jQuery.
        return await $.ajax({
            url: `${API_BASE}${ruta}`,
            method: opciones.method || "GET",
            data: opciones.body || undefined,
            contentType: opciones.body ? "application/json" : undefined,
            dataType: "json",
            headers: opciones.headers || {}
        });
    } catch (error) {
        // Lanza un error entendible para las paginas.
        throw new Error(obtenerMensajeErrorApi(error));
    }
}

// Ejecuta una peticion con FormData contra la API usando jQuery.
async function apiFormulario(ruta, formulario, opciones = {}) {
    // Intenta ejecutar la peticion multipart centralizada.
    try {
        // Devuelve la respuesta procesada por jQuery.
        return await $.ajax({
            url: `${API_BASE}${ruta}`,
            method: opciones.method || "POST",
            data: formulario,
            processData: false,
            contentType: false,
            dataType: "json",
            headers: opciones.headers || {}
        });
    } catch (error) {
        // Permite que las respuestas 204 se traten como correctas.
        if (error.status === 204) return null;

        // Lanza un error entendible para las paginas.
        throw new Error(obtenerMensajeErrorApi(error));
    }
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
    $(".usuario-activo").each((indice, usuario) => {
        // Busca la imagen del usuario dentro del enlace.
        const imagen = seleccionar("img", usuario);

        // Busca el texto del alias dentro del enlace.
        const texto = seleccionar(".perfil-alias", usuario) || seleccionar("span", usuario);

        // Actualiza la descripcion accesible del enlace.
        $(usuario).attr("aria-label", `Perfil de ${perfil.nombre}`);

        // Actualiza la foto cuando existe la imagen.
        if (imagen) {
            // Coloca la foto del perfil guardado.
            $(imagen).attr("src", perfil.foto);

            // Describe la imagen con el nombre del usuario.
            $(imagen).attr("alt", `Foto de perfil de ${perfil.nombre}`);
        }

        // Actualiza el alias visible cuando existe el texto.
        if (texto) $(texto).text(perfil.alias);
    });

    // Recorre los enlaces que cierran la sesion.
    $('a[href="login.html"]').each((indice, enlace) => {
        // Verifica si el enlace representa la salida del usuario.
        if ($(enlace).text().trim().toLowerCase() === "salir" || $(enlace).hasClass("salir")) {
            // Escucha el clic del usuario en salir.
            $(enlace).off("click.sesion").on("click.sesion", () => {
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
    $(".perfil-desplegable").each((indice, contenedor) => {
        // Busca el boton que abre el menu.
        const boton = seleccionar(".boton-perfil", contenedor);

        // Detiene la configuracion si no existe el boton.
        if (!boton || $(boton).data("menuInicializado") === true) return;

        // Marca el boton para no duplicar eventos.
        $(boton).data("menuInicializado", true);

        // Prepara el estado accesible inicial del boton.
        $(boton).attr("aria-expanded", "false");
    });
}

// Cierra todos los menus de perfil abiertos.
function cerrarMenusDePerfil() {
    // Recorre cada contenedor de perfil.
    $(".perfil-desplegable").each((indice, contenedor) => {
        // Oculta el menu desplegable.
        $(contenedor).removeClass("abierto");

        // Busca el boton del menu.
        const boton = seleccionar(".boton-perfil", contenedor);

        // Actualiza el estado accesible cuando existe el boton.
        if (boton) $(boton).attr("aria-expanded", "false");
    });
}

// Controla los clics generales para abrir o cerrar el menu de perfil.
$(document).on("click", (evento) => {
    // Busca si el clic ocurrio sobre el boton de perfil.
    const botonPerfil = $(evento.target).closest(".boton-perfil").get(0);

    // Evalua si el usuario aplasto la foto o boton del perfil.
    if (botonPerfil) {
        // Evita acciones secundarias del clic.
        evento.preventDefault();

        // Busca el contenedor del menu.
        const contenedor = $(botonPerfil).closest(".perfil-desplegable").get(0);

        // Detiene la accion si no existe el contenedor.
        if (!contenedor) return;

        // Guarda si el menu estaba abierto.
        const menuAbierto = $(contenedor).hasClass("abierto");

        // Cierra cualquier menu abierto.
        cerrarMenusDePerfil();

        // Abre el menu actual si estaba cerrado.
        if (!menuAbierto) {
            // Muestra el menu del perfil.
            $(contenedor).addClass("abierto");

            // Actualiza el estado accesible del boton.
            $(botonPerfil).attr("aria-expanded", "true");
        }

        // Termina el manejo del clic.
        return;
    }

    // Cierra el menu de perfil cuando se hace clic fuera.
    cerrarMenusDePerfil();
});

// Cierra el menu de perfil cuando se presiona Escape.
$(document).on("keydown", (evento) => {
    // Evalua si la tecla presionada fue Escape.
    if (evento.key === "Escape") cerrarMenusDePerfil();
});
