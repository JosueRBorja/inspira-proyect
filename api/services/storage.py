# Importa herramientas para leer configuraciones del sistema.
import os
# Importa herramientas para trabajar con rutas de archivos.
from pathlib import Path
# Importa una funcion para copiar archivos cuando se usa almacenamiento local.
from shutil import copyfileobj
# Importa una funcion para crear nombres unicos.
from uuid import uuid4

# Importa la ruta base de la API.
from api.database import API_DIR


# Guarda la carpeta local donde se almacenan archivos cuando no se usa AWS.
UPLOADS_DIR = API_DIR / "uploads"
# Guarda las extensiones permitidas para subir imagenes.
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


# Define una funcion para leer configuraciones sin repetir codigo.
def get_setting(name: str, default: str = "") -> str:
    # Devuelve el valor de la variable de entorno o un valor por defecto.
    return os.getenv(name, default).strip()


# Define una funcion para saber si la API debe usar AWS S3.
def should_use_s3() -> bool:
    # Guarda el tipo de almacenamiento configurado.
    storage_driver = get_setting("STORAGE_DRIVER", "local").lower()
    # Guarda el nombre del bucket configurado.
    bucket_name = get_setting("AWS_S3_BUCKET")
    # Devuelve verdadero solo cuando se eligio S3 y existe un bucket.
    return storage_driver == "s3" and bool(bucket_name)


# Define una funcion para obtener una extension segura.
def get_safe_extension(filename: str | None) -> str:
    # Guarda la extension recibida en minusculas.
    extension = Path(filename or "").suffix.lower()
    # Evalua si la extension esta permitida.
    if extension in ALLOWED_IMAGE_EXTENSIONS:
        # Devuelve la extension validada.
        return extension
    # Devuelve una extension segura por defecto.
    return ".jpg"


# Define una funcion para construir nombres de archivo sin choques.
def build_object_name(folder: str, prefix: str, filename: str | None) -> str:
    # Guarda la extension segura del archivo recibido.
    extension = get_safe_extension(filename)
    # Limpia barras sobrantes de la carpeta recibida.
    safe_folder = folder.strip("/")
    # Limpia barras sobrantes del prefijo recibido.
    safe_prefix = prefix.strip("-/")
    # Guarda un nombre unico para el objeto.
    object_name = f"{safe_prefix}-{uuid4().hex}{extension}"
    # Devuelve la ruta final dentro del almacenamiento.
    return f"{safe_folder}/{object_name}" if safe_folder else object_name


# Define una funcion para construir la URL publica del objeto en S3.
def build_s3_public_url(bucket_name: str, object_name: str) -> str:
    # Guarda una URL base personalizada si existe.
    custom_base_url = get_setting("AWS_S3_BASE_URL").rstrip("/")
    # Evalua si se configuro una URL base personalizada.
    if custom_base_url:
        # Devuelve la URL usando la base personalizada.
        return f"{custom_base_url}/{object_name}"

    # Guarda la region configurada para AWS.
    region_name = get_setting("AWS_DEFAULT_REGION", "us-east-1")
    # Evalua si se usa la region por defecto global.
    if region_name == "us-east-1":
        # Devuelve la URL publica comun para us-east-1.
        return f"https://{bucket_name}.s3.amazonaws.com/{object_name}"
    # Devuelve la URL publica regional del objeto.
    return f"https://{bucket_name}.s3.{region_name}.amazonaws.com/{object_name}"


# Define una funcion para subir un archivo a AWS S3.
def save_file_to_s3(upload_file, object_name: str) -> str:
    # Importa boto3 solo cuando realmente se va a usar AWS.
    import boto3

    # Guarda el nombre del bucket configurado.
    bucket_name = get_setting("AWS_S3_BUCKET")
    # Guarda la region configurada para AWS.
    region_name = get_setting("AWS_DEFAULT_REGION", "us-east-1")
    # Crea el cliente de S3 usando las variables de entorno disponibles.
    s3_client = boto3.client("s3", region_name=region_name)
    # Regresa el cursor del archivo al inicio antes de subirlo.
    upload_file.file.seek(0)
    # Guarda metadatos basicos para que el navegador reconozca la imagen.
    extra_args = {"ContentType": upload_file.content_type or "application/octet-stream"}
    # Sube el archivo recibido al bucket de S3.
    s3_client.upload_fileobj(upload_file.file, bucket_name, object_name, ExtraArgs=extra_args)
    # Devuelve la URL publica calculada para guardarla en la base de datos.
    return build_s3_public_url(bucket_name, object_name)


# Define una funcion para guardar un archivo en la carpeta local.
def save_file_locally(upload_file, object_name: str) -> str:
    # Crea la carpeta local si todavia no existe.
    UPLOADS_DIR.mkdir(exist_ok=True)
    # Guarda solo el nombre final del archivo para evitar subcarpetas en local.
    safe_filename = object_name.replace("/", "-")
    # Guarda la ruta final dentro de uploads.
    destination = UPLOADS_DIR / safe_filename
    # Regresa el cursor del archivo al inicio antes de copiarlo.
    upload_file.file.seek(0)
    # Abre el archivo local en modo escritura binaria.
    with destination.open("wb") as saved_file:
        # Copia el archivo subido hacia el archivo local.
        copyfileobj(upload_file.file, saved_file)
    # Devuelve la ruta publica local para guardarla en la base de datos.
    return f"/uploads/{safe_filename}"


# Define una funcion principal para guardar imagenes sin depender del proveedor.
def save_upload_image(upload_file, folder: str, prefix: str) -> str:
    # Construye el nombre final del objeto a guardar.
    object_name = build_object_name(folder, prefix, upload_file.filename)
    # Evalua si el almacenamiento configurado es S3.
    if should_use_s3():
        # Guarda el archivo en AWS S3 y devuelve su URL.
        return save_file_to_s3(upload_file, object_name)
    # Guarda el archivo localmente y devuelve su ruta.
    return save_file_locally(upload_file, object_name)
