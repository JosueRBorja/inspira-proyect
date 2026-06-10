# Importa elementos especificos desde otro modulo.
from fastapi import APIRouter, Depends, HTTPException, status
# Importa elementos especificos desde otro modulo.
from sqlalchemy.orm import Session, joinedload

# Importa elementos especificos desde otro modulo.
from api import models
# Importa elementos especificos desde otro modulo.
from api.database import get_database_session
# Importa elementos especificos desde otro modulo.
from api.schemas.saved_post import SavedPostCreate, SavedPostRead


# Guarda el valor necesario para usarlo posteriormente.
router = APIRouter(prefix="/api/guardados", tags=["guardados"])


# Define una ruta POST para registrar informacion nueva.
@router.post("", response_model=SavedPostRead, status_code=status.HTTP_201_CREATED)
# Define una funcion con la responsabilidad indicada por su nombre.
def save_post(saved_post_data: SavedPostCreate, database: Session = Depends(get_database_session)):
    # Guarda el valor necesario para usarlo posteriormente.
    user = database.get(models.User, saved_post_data.user_id)
    # Guarda el valor necesario para usarlo posteriormente.
    post = database.get(models.Post, saved_post_data.post_id)
    # Evalua una condicion antes de continuar.
    if not user:
        # Detiene la operacion y devuelve un error controlado.
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    # Evalua una condicion antes de continuar.
    if not post:
        # Detiene la operacion y devuelve un error controlado.
        raise HTTPException(status_code=404, detail="Publicacion no encontrada")

    # Guarda el valor necesario para usarlo posteriormente.
    existing_saved_post = (
        # Ejecuta la operacion indicada con los valores definidos.
        database.query(models.SavedPost)
        # Filtra los registros segun las condiciones indicadas.
        .filter(
            # Guarda el valor necesario para usarlo posteriormente.
            models.SavedPost.user_id == saved_post_data.user_id,
            # Guarda el valor necesario para usarlo posteriormente.
            models.SavedPost.post_id == saved_post_data.post_id,
        # Cierra la estructura iniciada anteriormente.
        )
        # Obtiene el primer registro encontrado.
        .first()
    # Cierra la estructura iniciada anteriormente.
    )
    # Evalua una condicion antes de continuar.
    if existing_saved_post:
        # Devuelve el resultado de la operacion.
        return existing_saved_post

    # Guarda el valor necesario para usarlo posteriormente.
    saved_post = models.SavedPost(**saved_post_data.model_dump())
    # Ejecuta la operacion indicada con los valores definidos.
    database.add(saved_post)
    # Ejecuta la operacion indicada con los valores definidos.
    database.commit()
    # Ejecuta la operacion indicada con los valores definidos.
    database.refresh(saved_post)
    # Devuelve el resultado de la operacion.
    return saved_post


# Define una ruta GET para consultar informacion.
@router.get("/usuario/{user_id}", response_model=list[SavedPostRead])
# Define una funcion con la responsabilidad indicada por su nombre.
def list_user_saved_posts(user_id: int, database: Session = Depends(get_database_session)):
    # Devuelve el resultado de la operacion.
    return (
        # Ejecuta la operacion indicada con los valores definidos.
        database.query(models.SavedPost)
        # Configura la carga de relaciones necesarias.
        .options(joinedload(models.SavedPost.post))
        # Filtra los registros segun las condiciones indicadas.
        .filter(models.SavedPost.user_id == user_id)
        # Ordena los registros antes de devolverlos.
        .order_by(models.SavedPost.created_at.desc())
        # Obtiene todos los registros encontrados.
        .all()
    # Cierra la estructura iniciada anteriormente.
    )


# Define una ruta DELETE para eliminar informacion.
@router.delete("/{saved_post_id}", status_code=status.HTTP_204_NO_CONTENT)
# Define una funcion con la responsabilidad indicada por su nombre.
def remove_saved_post(saved_post_id: int, database: Session = Depends(get_database_session)):
    # Guarda el valor necesario para usarlo posteriormente.
    saved_post = database.get(models.SavedPost, saved_post_id)
    # Evalua una condicion antes de continuar.
    if not saved_post:
        # Detiene la operacion y devuelve un error controlado.
        raise HTTPException(status_code=404, detail="Publicacion guardada no encontrada")

    # Ejecuta la operacion indicada con los valores definidos.
    database.delete(saved_post)
    # Ejecuta la operacion indicada con los valores definidos.
    database.commit()
    # Devuelve el resultado de la operacion.
    return None
