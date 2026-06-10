# Importa elementos especificos desde otro modulo.
from fastapi import APIRouter, Depends, HTTPException
# Importa elementos especificos desde otro modulo.
from sqlalchemy.orm import Session

# Importa elementos especificos desde otro modulo.
from api import models
# Importa elementos especificos desde otro modulo.
from api.database import get_database_session
# Importa elementos especificos desde otro modulo.
from api.schemas.auth import LoginRequest, LoginResponse
# Importa elementos especificos desde otro modulo.
from api.security import verify_password


# Guarda el valor necesario para usarlo posteriormente.
router = APIRouter(prefix="/api/autenticacion", tags=["autenticacion"])


# Define una ruta POST para registrar informacion nueva.
@router.post("/login", response_model=LoginResponse)
# Define una funcion con la responsabilidad indicada por su nombre.
def login(login_data: LoginRequest, database: Session = Depends(get_database_session)):
    # Guarda el valor necesario para usarlo posteriormente.
    user = database.query(models.User).filter(models.User.email == login_data.email).first()
    # Evalua una condicion antes de continuar.
    if not user or not verify_password(login_data.password, user.password_hash):
        # Detiene la operacion y devuelve un error controlado.
        raise HTTPException(status_code=401, detail="Correo o contrasena incorrectos")

    # Devuelve el resultado de la operacion.
    return {"mensaje": "Inicio de sesion correcto", "usuario": user}
