# API de Inspira

API creada con FastAPI para conectar la maqueta HTML/CSS con una base de datos SQLite y almacenamiento de imagenes local o en AWS S3.

## Ejecutar

```bash
pip install -r api/requirements.txt
uvicorn api.main:app --reload
```

Luego abre:

- Maqueta principal: `http://127.0.0.1:8000/`
- Documentacion de la API: `http://127.0.0.1:8000/docs`

## Estructura

- `main.py`: crea la aplicacion, conecta las rutas y sirve los HTML/CSS.
- `database.py`: configura SQLite y las sesiones de base de datos.
- `models.py`: define las tablas.
- `schemas/`: define los datos que entran y salen de la API.
- `routers/`: agrupa las rutas por responsabilidad.
- `services/storage.py`: decide si las imagenes se guardan localmente o en AWS S3.
- `uploads/`: guarda imagenes subidas desde la API cuando `STORAGE_DRIVER=local`.

## Almacenamiento de imagenes

Por defecto la API guarda imagenes en `api/uploads` para poder probar el proyecto localmente.

Para usar AWS S3:

1. Copia `api/.env.example` como `api/.env`.
2. Cambia `STORAGE_DRIVER=local` por `STORAGE_DRIVER=s3`.
3. Coloca el nombre del bucket en `AWS_S3_BUCKET`.
4. Coloca la region del bucket en `AWS_DEFAULT_REGION`.
5. Coloca las claves del usuario IAM en `AWS_ACCESS_KEY_ID` y `AWS_SECRET_ACCESS_KEY`.

La API sube a S3 las fotos de perfil y las imagenes de publicaciones. La base de datos guarda la URL de la imagen en `profile_photo_url` o `image_url`.

## Rutas principales

- `/api/autenticacion/login`: valida el inicio de sesion.
- `/api/usuarios`: crea, lista y actualiza usuarios.
- `/api/categorias`: lista y crea categorias.
- `/api/publicaciones`: crea, lista, edita y elimina publicaciones.
- `/api/comentarios`: crea y lista comentarios.
- `/api/guardados`: guarda publicaciones y lista los guardados del usuario.
