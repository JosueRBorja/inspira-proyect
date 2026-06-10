# Importa elementos especificos desde otro modulo.
from datetime import datetime

# Importa elementos especificos desde otro modulo.
from pydantic import BaseModel, EmailStr, field_validator


# Declara una clase para representar esta estructura.
class UserBase(BaseModel):
    # Declara un atributo con su tipo de dato.
    full_name: str
    # Declara un atributo con su tipo de dato.
    alias: str
    # Declara un atributo con su tipo de dato.
    email: EmailStr
    # Declara un atributo con su tipo de dato.
    profile_photo_url: str | None = None
    # Declara un atributo con su tipo de dato.
    biography: str | None = None

    # Aplica una validacion al campo indicado.
    @field_validator("alias")
    # Permite ejecutar el metodo desde la clase.
    @classmethod
    # Define una funcion con la responsabilidad indicada por su nombre.
    def validate_alias(cls, alias: str) -> str:
        # Evalua una condicion antes de continuar.
        if not alias.startswith("@"):
            # Detiene la operacion y devuelve un error controlado.
            raise ValueError("El alias debe empezar con @")
        # Evalua una condicion antes de continuar.
        if len(alias.strip()) < 2:
            # Detiene la operacion y devuelve un error controlado.
            raise ValueError("El alias debe tener texto despues de @")
        # Devuelve el resultado de la operacion.
        return alias.strip()


# Declara una clase para representar esta estructura.
class UserCreate(UserBase):
    # Declara un atributo con su tipo de dato.
    password: str


# Declara una clase para representar esta estructura.
class UserUpdate(BaseModel):
    # Declara un atributo con su tipo de dato.
    full_name: str | None = None
    # Declara un atributo con su tipo de dato.
    alias: str | None = None
    # Declara un atributo con su tipo de dato.
    profile_photo_url: str | None = None
    # Declara un atributo con su tipo de dato.
    biography: str | None = None

    # Aplica una validacion al campo indicado.
    @field_validator("alias")
    # Permite ejecutar el metodo desde la clase.
    @classmethod
    # Define una funcion con la responsabilidad indicada por su nombre.
    def validate_optional_alias(cls, alias: str | None) -> str | None:
        # Evalua una condicion antes de continuar.
        if alias is None:
            # Devuelve el resultado de la operacion.
            return alias
        # Evalua una condicion antes de continuar.
        if not alias.startswith("@"):
            # Detiene la operacion y devuelve un error controlado.
            raise ValueError("El alias debe empezar con @")
        # Evalua una condicion antes de continuar.
        if len(alias.strip()) < 2:
            # Detiene la operacion y devuelve un error controlado.
            raise ValueError("El alias debe tener texto despues de @")
        # Devuelve el resultado de la operacion.
        return alias.strip()


# Declara una clase para representar esta estructura.
class UserRead(UserBase):
    # Declara un atributo con su tipo de dato.
    id: int
    # Declara un atributo con su tipo de dato.
    created_at: datetime

    # Guarda el valor necesario para usarlo posteriormente.
    model_config = {"from_attributes": True}
