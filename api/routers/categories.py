# Importa elementos especificos desde otro modulo.
from fastapi import APIRouter, Depends, HTTPException, status
# Importa elementos especificos desde otro modulo.
from sqlalchemy.orm import Session

# Importa elementos especificos desde otro modulo.
from api import models
# Importa elementos especificos desde otro modulo.
from api.database import get_database_session
# Importa elementos especificos desde otro modulo.
from api.schemas.category import CategoryCreate, CategoryRead


# Guarda el valor necesario para usarlo posteriormente.
router = APIRouter(prefix="/api/categorias", tags=["categorias"])


# Define una ruta POST para registrar informacion nueva.
@router.post("", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
# Define una funcion con la responsabilidad indicada por su nombre.
def create_category(category_data: CategoryCreate, database: Session = Depends(get_database_session)):
    # Guarda el valor necesario para usarlo posteriormente.
    existing_category = (
        # Ejecuta la operacion indicada con los valores definidos.
        database.query(models.Category)
        # Filtra los registros segun las condiciones indicadas.
        .filter((models.Category.slug == category_data.slug) | (models.Category.name == category_data.name))
        # Obtiene el primer registro encontrado.
        .first()
    # Cierra la estructura iniciada anteriormente.
    )
    # Evalua una condicion antes de continuar.
    if existing_category:
        # Detiene la operacion y devuelve un error controlado.
        raise HTTPException(status_code=400, detail="La categoria ya existe")

    # Guarda el valor necesario para usarlo posteriormente.
    category = models.Category(**category_data.model_dump())
    # Ejecuta la operacion indicada con los valores definidos.
    database.add(category)
    # Ejecuta la operacion indicada con los valores definidos.
    database.commit()
    # Ejecuta la operacion indicada con los valores definidos.
    database.refresh(category)
    # Devuelve el resultado de la operacion.
    return category


# Define una ruta GET para consultar informacion.
@router.get("", response_model=list[CategoryRead])
# Define una funcion con la responsabilidad indicada por su nombre.
def list_categories(database: Session = Depends(get_database_session)):
    # Devuelve el resultado de la operacion.
    return database.query(models.Category).all()
