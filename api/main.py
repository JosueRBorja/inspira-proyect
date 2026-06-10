# Importa elementos especificos desde otro modulo.
from pathlib import Path

# Importa elementos especificos desde otro modulo.
from fastapi import FastAPI, HTTPException
# Importa elementos especificos desde otro modulo.
from fastapi.middleware.cors import CORSMiddleware
# Importa elementos especificos desde otro modulo.
from fastapi.responses import FileResponse
# Importa elementos especificos desde otro modulo.
from fastapi.staticfiles import StaticFiles

# Importa elementos especificos desde otro modulo.
from api.database import API_DIR, SessionLocal, create_database
# Importa elementos especificos desde otro modulo.
from api.routers import auth, categories, comments, posts, saved_posts, users
# Importa elementos especificos desde otro modulo.
from api.seed import seed_initial_data


# Intenta importar la funcion para cargar variables desde .env.
try:
    # Importa elementos especificos desde otro modulo.
    from dotenv import load_dotenv
# Captura el caso en que la dependencia aun no este instalada.
except ImportError:
    # Guarda una referencia vacia para continuar sin detener la API.
    load_dotenv = None

# Evalua si la funcion para leer .env esta disponible.
if load_dotenv:
    # Carga variables de entorno desde un archivo .env si existe.
    load_dotenv(API_DIR / ".env")

# Guarda el valor necesario para usarlo posteriormente.
FRONTEND_DIR = API_DIR.parent / "PAGINA"
# Guarda el valor necesario para usarlo posteriormente.
UPLOADS_DIR = API_DIR / "uploads"
# Guarda el valor necesario para usarlo posteriormente.
ALLOWED_FRONTEND_EXTENSIONS = {".html", ".css", ".js"}

# Ejecuta la operacion indicada con los valores definidos.
UPLOADS_DIR.mkdir(exist_ok=True)


# Guarda el valor necesario para usarlo posteriormente.
app = FastAPI(
    # Guarda el valor necesario para usarlo posteriormente.
    title="API de Inspira",
    # Guarda el valor necesario para usarlo posteriormente.
    description="API para conectar la maqueta HTML/CSS con usuarios, publicaciones, comentarios y publicaciones guardadas.",
    # Guarda el valor necesario para usarlo posteriormente.
    version="1.0.0",
# Cierra la estructura iniciada anteriormente.
)

# Ejecuta la operacion indicada con los valores definidos.
app.add_middleware(
    # Configura esta parte de la operacion actual.
    CORSMiddleware,
    # Guarda el valor necesario para usarlo posteriormente.
    allow_origins=["*"],
    # Guarda el valor necesario para usarlo posteriormente.
    allow_credentials=True,
    # Guarda el valor necesario para usarlo posteriormente.
    allow_methods=["*"],
    # Guarda el valor necesario para usarlo posteriormente.
    allow_headers=["*"],
# Cierra la estructura iniciada anteriormente.
)


# Ejecuta la funcion indicada cuando inicia la aplicacion.
@app.on_event("startup")
# Define una funcion con la responsabilidad indicada por su nombre.
def start_application() -> None:
    # Ejecuta la operacion indicada con los valores definidos.
    create_database()
    # Guarda el valor necesario para usarlo posteriormente.
    database = SessionLocal()
    # Inicia un bloque controlado para ejecutar la operacion.
    try:
        # Ejecuta la operacion indicada con los valores definidos.
        seed_initial_data(database)
    # Ejecuta la limpieza final de recursos.
    finally:
        # Ejecuta la operacion indicada con los valores definidos.
        database.close()


# Ejecuta la operacion indicada con los valores definidos.
app.include_router(auth.router)
# Ejecuta la operacion indicada con los valores definidos.
app.include_router(users.router)
# Ejecuta la operacion indicada con los valores definidos.
app.include_router(categories.router)
# Ejecuta la operacion indicada con los valores definidos.
app.include_router(posts.router)
# Ejecuta la operacion indicada con los valores definidos.
app.include_router(comments.router)
# Ejecuta la operacion indicada con los valores definidos.
app.include_router(saved_posts.router)

# Ejecuta la operacion indicada con los valores definidos.
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")


# Define una ruta GET para entregar un recurso al navegador.
@app.get("/", include_in_schema=False)
# Define una funcion con la responsabilidad indicada por su nombre.
def serve_home_page():
    # Devuelve el resultado de la operacion.
    return FileResponse(FRONTEND_DIR / "index.html")


# Define una ruta GET para entregar un recurso al navegador.
@app.get("/{file_name:path}", include_in_schema=False)
# Define una funcion con la responsabilidad indicada por su nombre.
def serve_frontend_file(file_name: str):
    # Guarda el valor necesario para usarlo posteriormente.
    requested_file = (FRONTEND_DIR / file_name).resolve()
    # Guarda la carpeta base del frontend ya resuelta.
    frontend_root = FRONTEND_DIR.resolve()

    # Evalua una condicion antes de continuar.
    if not requested_file.is_relative_to(frontend_root):
        # Detiene la operacion y devuelve un error controlado.
        raise HTTPException(status_code=404, detail="Archivo no encontrado")

    # Evalua una condicion antes de continuar.
    if requested_file.suffix not in ALLOWED_FRONTEND_EXTENSIONS:
        # Detiene la operacion y devuelve un error controlado.
        raise HTTPException(status_code=404, detail="Archivo no encontrado")

    # Evalua una condicion antes de continuar.
    if not requested_file.exists():
        # Detiene la operacion y devuelve un error controlado.
        raise HTTPException(status_code=404, detail="Archivo no encontrado")

    # Devuelve el resultado de la operacion.
    return FileResponse(requested_file)
