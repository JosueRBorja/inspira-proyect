# Proyecto Inspira

Proyecto web tipo Pinterest creado con HTML, CSS, JavaScript y FastAPI.

## Estructura principal

```text
maquetacion/
  api/
    routers/      Rutas de la API separadas por responsabilidad.
    schemas/      Esquemas de entrada y salida de datos.
    services/     Servicios reutilizables, como almacenamiento local o S3.
    main.py       Punto de entrada de FastAPI.
    models.py     Modelos de base de datos.
    database.py   Configuracion de SQLite.
  PAGINA/
    css/          Hojas de estilo separadas por pagina.
    js/           Logica JavaScript separada por pagina.
    *.html        Vistas principales del sistema.
```

## Buenas practicas aplicadas

- El frontend separa estructura HTML, estilos CSS y logica JavaScript.
- Cada pagina tiene su propio archivo CSS y JS para facilitar mantenimiento.
- El backend separa rutas, esquemas, modelos y servicios.
- Las imagenes pueden guardarse localmente o en AWS S3 mediante variables de entorno.
- Las claves y configuraciones privadas se guardan en `api/.env` y no se suben a GitHub.
- La base de datos local `store.db` y las imagenes temporales de `uploads/` no se suben al repositorio.

## Ejecutar localmente

```powershell
.\venv\Scripts\activate
pip install -r api\requirements.txt
uvicorn api.main:app --reload
```

Abrir en el navegador:

```text
http://127.0.0.1:8000/login.html
```
