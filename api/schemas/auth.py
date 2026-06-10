# Importa elementos especificos desde otro modulo.
from pydantic import BaseModel, EmailStr

# Importa elementos especificos desde otro modulo.
from api.schemas.user import UserRead


# Declara una clase para representar esta estructura.
class LoginRequest(BaseModel):
    # Declara un atributo con su tipo de dato.
    email: EmailStr
    # Declara un atributo con su tipo de dato.
    password: str


# Declara una clase para representar esta estructura.
class LoginResponse(BaseModel):
    # Declara un atributo con su tipo de dato.
    mensaje: str
    # Declara un atributo con su tipo de dato.
    usuario: UserRead
