# Importa elementos especificos desde otro modulo.
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
# Importa elementos especificos desde otro modulo.
from sqlalchemy.orm import Session

# Importa elementos especificos desde otro modulo.
from api import models
# Importa elementos especificos desde otro modulo.
from api.database import get_database_session
# Importa elementos especificos desde otro modulo.
from api.schemas.user import UserCreate, UserRead, UserUpdate
# Importa elementos especificos desde otro modulo.
from api.security import hash_password
# Importa elementos especificos desde otro modulo.
from api.services.storage import save_upload_image


# Guarda el valor necesario para usarlo posteriormente.
router = APIRouter(prefix="/api/usuarios", tags=["usuarios"])


# Define una ruta POST para registrar informacion nueva.
@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED)
# Define una funcion con la responsabilidad indicada por su nombre.
def create_user(user_data: UserCreate, database: Session = Depends(get_database_session)):
    # Guarda el valor necesario para usarlo posteriormente.
    existing_user = (
        # Ejecuta la operacion indicada con los valores definidos.
        database.query(models.User)
        # Filtra los registros segun las condiciones indicadas.
        .filter((models.User.email == user_data.email) | (models.User.alias == user_data.alias))
        # Obtiene el primer registro encontrado.
        .first()
    # Cierra la estructura iniciada anteriormente.
    )
    # Evalua una condicion antes de continuar.
    if existing_user:
        # Detiene la operacion y devuelve un error controlado.
        raise HTTPException(status_code=400, detail="El correo o alias ya esta registrado")

    # Guarda el valor necesario para usarlo posteriormente.
    user = models.User(
        # Guarda el valor necesario para usarlo posteriormente.
        full_name=user_data.full_name,
        # Guarda el valor necesario para usarlo posteriormente.
        alias=user_data.alias,
        # Guarda el valor necesario para usarlo posteriormente.
        email=user_data.email,
        # Guarda el valor necesario para usarlo posteriormente.
        password_hash=hash_password(user_data.password),
        # Guarda el valor necesario para usarlo posteriormente.
        profile_photo_url=user_data.profile_photo_url,
        # Guarda el valor necesario para usarlo posteriormente.
        biography=user_data.biography,
    # Cierra la estructura iniciada anteriormente.
    )
    # Ejecuta la operacion indicada con los valores definidos.
    database.add(user)
    # Ejecuta la operacion indicada con los valores definidos.
    database.commit()
    # Ejecuta la operacion indicada con los valores definidos.
    database.refresh(user)
    # Devuelve el resultado de la operacion.
    return user


# Define una ruta GET para consultar informacion.
@router.get("", response_model=list[UserRead])
# Define una funcion con la responsabilidad indicada por su nombre.
def list_users(database: Session = Depends(get_database_session)):
    # Devuelve el resultado de la operacion.
    return database.query(models.User).all()


# Define una ruta GET para consultar informacion.
@router.get("/{user_id}", response_model=UserRead)
# Define una funcion con la responsabilidad indicada por su nombre.
def get_user(user_id: int, database: Session = Depends(get_database_session)):
    # Guarda el valor necesario para usarlo posteriormente.
    user = database.get(models.User, user_id)
    # Evalua una condicion antes de continuar.
    if not user:
        # Detiene la operacion y devuelve un error controlado.
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    # Devuelve el resultado de la operacion.
    return user


# Define una ruta PATCH para actualizar informacion existente.
@router.patch("/{user_id}", response_model=UserRead)
# Define una funcion con la responsabilidad indicada por su nombre.
def update_user(user_id: int, user_data: UserUpdate, database: Session = Depends(get_database_session)):
    # Guarda el valor necesario para usarlo posteriormente.
    user = database.get(models.User, user_id)
    # Evalua una condicion antes de continuar.
    if not user:
        # Detiene la operacion y devuelve un error controlado.
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Evalua una condicion antes de continuar.
    if user_data.alias and user_data.alias != user.alias:
        # Guarda el valor necesario para usarlo posteriormente.
        existing_alias = database.query(models.User).filter(models.User.alias == user_data.alias).first()
        # Evalua una condicion antes de continuar.
        if existing_alias:
            # Detiene la operacion y devuelve un error controlado.
            raise HTTPException(status_code=400, detail="El alias ya esta registrado")

    # Recorre los elementos disponibles uno por uno.
    for field_name, field_value in user_data.model_dump(exclude_unset=True).items():
        # Ejecuta la operacion indicada con los valores definidos.
        setattr(user, field_name, field_value)

    # Ejecuta la operacion indicada con los valores definidos.
    database.commit()
    # Ejecuta la operacion indicada con los valores definidos.
    database.refresh(user)
    # Devuelve el resultado de la operacion.
    return user


# Define una ruta POST para registrar informacion nueva.
@router.post("/{user_id}/foto", response_model=UserRead)
# Define una funcion con la responsabilidad indicada por su nombre.
def upload_user_photo(
    # Declara un atributo con su tipo de dato.
    user_id: int,
    # Declara un atributo con su tipo de dato.
    image: UploadFile = File(...),
    # Declara un atributo con su tipo de dato.
    database: Session = Depends(get_database_session),
# Cierra los parametros e inicia el bloque de instrucciones.
):
    # Guarda el valor necesario para usarlo posteriormente.
    user = database.get(models.User, user_id)
    # Evalua una condicion antes de continuar.
    if not user:
        # Detiene la operacion y devuelve un error controlado.
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Guarda la imagen en el almacenamiento configurado.
    user.profile_photo_url = save_upload_image(image, f"perfiles/usuario-{user_id}", "perfil")
    # Ejecuta la operacion indicada con los valores definidos.
    database.commit()
    # Ejecuta la operacion indicada con los valores definidos.
    database.refresh(user)
    # Devuelve el resultado de la operacion.
    return user
