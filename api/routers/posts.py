# Importa elementos especificos desde otro modulo.
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
# Importa elementos especificos desde otro modulo.
from sqlalchemy import or_
# Importa elementos especificos desde otro modulo.
from sqlalchemy.orm import Session, joinedload

# Importa elementos especificos desde otro modulo.
from api import models
# Importa elementos especificos desde otro modulo.
from api.database import get_database_session
# Importa elementos especificos desde otro modulo.
from api.schemas.post import PostCreate, PostRead, PostUpdate
# Importa elementos especificos desde otro modulo.
from api.services.storage import save_upload_image


# Guarda el valor necesario para usarlo posteriormente.
router = APIRouter(prefix="/api/publicaciones", tags=["publicaciones"])


# Define una funcion con la responsabilidad indicada por su nombre.
def get_post_or_404(post_id: int, database: Session) -> models.Post:
    # Guarda el valor necesario para usarlo posteriormente.
    post = database.get(models.Post, post_id)
    # Evalua una condicion antes de continuar.
    if not post:
        # Detiene la operacion y devuelve un error controlado.
        raise HTTPException(status_code=404, detail="Publicacion no encontrada")
    # Devuelve el resultado de la operacion.
    return post


# Define una funcion con la responsabilidad indicada por su nombre.
def validate_post_relations(owner_id: int, category_id: int | None, database: Session) -> None:
    # Evalua una condicion antes de continuar.
    if not database.get(models.User, owner_id):
        # Detiene la operacion y devuelve un error controlado.
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    # Evalua una condicion antes de continuar.
    if category_id is not None and not database.get(models.Category, category_id):
        # Detiene la operacion y devuelve un error controlado.
        raise HTTPException(status_code=404, detail="Categoria no encontrada")


# Define una ruta POST para registrar informacion nueva.
@router.post("", response_model=PostRead, status_code=status.HTTP_201_CREATED)
# Define una funcion con la responsabilidad indicada por su nombre.
def create_post(post_data: PostCreate, database: Session = Depends(get_database_session)):
    # Ejecuta la operacion indicada con los valores definidos.
    validate_post_relations(post_data.owner_id, post_data.category_id, database)
    # Guarda el valor necesario para usarlo posteriormente.
    post = models.Post(**post_data.model_dump())
    # Ejecuta la operacion indicada con los valores definidos.
    database.add(post)
    # Ejecuta la operacion indicada con los valores definidos.
    database.commit()
    # Ejecuta la operacion indicada con los valores definidos.
    database.refresh(post)
    # Devuelve el resultado de la operacion.
    return post


# Define una ruta POST para registrar informacion nueva.
@router.post("/upload", response_model=PostRead, status_code=status.HTTP_201_CREATED)
# Define una funcion con la responsabilidad indicada por su nombre.
def upload_post_with_image(
    # Declara un atributo con su tipo de dato.
    owner_id: int = Form(...),
    # Declara un atributo con su tipo de dato.
    title: str = Form(...),
    # Declara un atributo con su tipo de dato.
    description: str | None = Form(None),
    # Declara un atributo con su tipo de dato.
    category_id: int | None = Form(None),
    # Declara un atributo con su tipo de dato.
    tags: str | None = Form(None),
    # Declara un atributo con su tipo de dato.
    image: UploadFile = File(...),
    # Declara un atributo con su tipo de dato.
    database: Session = Depends(get_database_session),
# Cierra los parametros e inicia el bloque de instrucciones.
):
    # Ejecuta la operacion indicada con los valores definidos.
    validate_post_relations(owner_id, category_id, database)
    # Guarda la imagen en el almacenamiento configurado.
    image_url = save_upload_image(image, f"publicaciones/usuario-{owner_id}", "publicacion")

    # Guarda el valor necesario para usarlo posteriormente.
    post = models.Post(
        # Guarda el valor necesario para usarlo posteriormente.
        owner_id=owner_id,
        # Guarda el valor necesario para usarlo posteriormente.
        title=title,
        # Guarda el valor necesario para usarlo posteriormente.
        description=description,
        # Guarda el valor necesario para usarlo posteriormente.
        category_id=category_id,
        # Guarda el valor necesario para usarlo posteriormente.
        tags=tags,
        # Guarda el valor necesario para usarlo posteriormente.
        image_url=image_url,
    # Cierra la estructura iniciada anteriormente.
    )
    # Ejecuta la operacion indicada con los valores definidos.
    database.add(post)
    # Ejecuta la operacion indicada con los valores definidos.
    database.commit()
    # Ejecuta la operacion indicada con los valores definidos.
    database.refresh(post)
    # Devuelve el resultado de la operacion.
    return post


# Define una ruta GET para consultar informacion.
@router.get("", response_model=list[PostRead])
# Define una funcion con la responsabilidad indicada por su nombre.
def list_posts(
    # Declara un filtro opcional por usuario.
    owner_id: int | None = None,
    # Declara un filtro opcional por categoria.
    categoria: str | None = None,
    # Declara un filtro opcional por texto de busqueda.
    busqueda: str | None = None,
    # Declara la sesion de base de datos usada por la ruta.
    database: Session = Depends(get_database_session),
):
    # Crea la consulta base con las relaciones necesarias.
    query = (
        # Ejecuta la operacion indicada con los valores definidos.
        database.query(models.Post)
        # Une la tabla de categorias para permitir filtros por nombre.
        .outerjoin(models.Category)
        # Une la tabla de usuarios para permitir busquedas por autor.
        .join(models.User)
        # Configura la carga de relaciones necesarias.
        .options(joinedload(models.Post.owner), joinedload(models.Post.category))
    # Cierra la estructura iniciada anteriormente.
    )

    # Evalua si se pidieron publicaciones de un usuario concreto.
    if owner_id is not None:
        # Filtra las publicaciones por el usuario propietario.
        query = query.filter(models.Post.owner_id == owner_id)

    # Evalua si se pidio una categoria concreta.
    if categoria and categoria.lower() != "todos":
        # Filtra las publicaciones por nombre o slug de categoria.
        query = query.filter(
            # Agrupa condiciones alternativas para la categoria.
            or_(
                # Compara el nombre de categoria recibido.
                models.Category.name.ilike(categoria),
                # Compara el slug de categoria recibido.
                models.Category.slug.ilike(categoria),
            )
        )

    # Evalua si se envio un texto de busqueda.
    if busqueda:
        # Guarda el patron que se usara en las comparaciones.
        search_pattern = f"%{busqueda.strip()}%"
        # Filtra por titulo, descripcion, etiquetas, autor o categoria.
        query = query.filter(
            # Agrupa condiciones alternativas para la busqueda.
            or_(
                # Busca coincidencias en el titulo.
                models.Post.title.ilike(search_pattern),
                # Busca coincidencias en la descripcion.
                models.Post.description.ilike(search_pattern),
                # Busca coincidencias en las etiquetas.
                models.Post.tags.ilike(search_pattern),
                # Busca coincidencias en el nombre del autor.
                models.User.full_name.ilike(search_pattern),
                # Busca coincidencias en la categoria.
                models.Category.name.ilike(search_pattern),
            )
        )

    # Devuelve la respuesta filtrada y ordenada desde el backend.
    return query.order_by(models.Post.created_at.desc()).all()


# Define una ruta GET para consultar informacion.
@router.get("/{post_id}", response_model=PostRead)
# Define una funcion con la responsabilidad indicada por su nombre.
def get_post(post_id: int, database: Session = Depends(get_database_session)):
    # Devuelve el resultado de la operacion.
    return get_post_or_404(post_id, database)


# Define una ruta PATCH para actualizar informacion existente.
@router.patch("/{post_id}", response_model=PostRead)
# Define una funcion con la responsabilidad indicada por su nombre.
def update_post(post_id: int, post_data: PostUpdate, database: Session = Depends(get_database_session)):
    # Guarda el valor necesario para usarlo posteriormente.
    post = get_post_or_404(post_id, database)
    # Evalua una condicion antes de continuar.
    if post_data.category_id is not None and not database.get(models.Category, post_data.category_id):
        # Detiene la operacion y devuelve un error controlado.
        raise HTTPException(status_code=404, detail="Categoria no encontrada")

    # Recorre los elementos disponibles uno por uno.
    for field_name, field_value in post_data.model_dump(exclude_unset=True).items():
        # Ejecuta la operacion indicada con los valores definidos.
        setattr(post, field_name, field_value)

    # Ejecuta la operacion indicada con los valores definidos.
    database.commit()
    # Ejecuta la operacion indicada con los valores definidos.
    database.refresh(post)
    # Devuelve el resultado de la operacion.
    return post


# Define una ruta POST para reemplazar la imagen de una publicacion.
@router.post("/{post_id}/imagen", response_model=PostRead)
# Define una funcion con la responsabilidad indicada por su nombre.
def upload_post_image(
    # Declara un atributo con su tipo de dato.
    post_id: int,
    # Declara un atributo con su tipo de dato.
    image: UploadFile = File(...),
    # Declara un atributo con su tipo de dato.
    database: Session = Depends(get_database_session),
# Cierra los parametros e inicia el bloque de instrucciones.
):
    # Guarda la publicacion encontrada o detiene la operacion.
    post = get_post_or_404(post_id, database)
    # Actualiza la ruta publica de la imagen.
    post.image_url = save_upload_image(image, f"publicaciones/usuario-{post.owner_id}", "publicacion")
    # Guarda los cambios en la base de datos.
    database.commit()
    # Refresca la publicacion con los cambios.
    database.refresh(post)
    # Devuelve la publicacion actualizada.
    return post


# Define una ruta DELETE para eliminar informacion.
@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
# Define una funcion con la responsabilidad indicada por su nombre.
def delete_post(post_id: int, database: Session = Depends(get_database_session)):
    # Guarda el valor necesario para usarlo posteriormente.
    post = get_post_or_404(post_id, database)
    # Ejecuta la operacion indicada con los valores definidos.
    database.delete(post)
    # Ejecuta la operacion indicada con los valores definidos.
    database.commit()
    # Devuelve el resultado de la operacion.
    return None
