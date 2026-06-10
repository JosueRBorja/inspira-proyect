# Importa elementos especificos desde otro modulo.
from pydantic import BaseModel


# Declara una clase para representar esta estructura.
class CategoryBase(BaseModel):
    # Declara un atributo con su tipo de dato.
    name: str
    # Declara un atributo con su tipo de dato.
    slug: str


# Declara una clase para representar esta estructura.
class CategoryCreate(CategoryBase):
    # Mantiene el bloque valido sin agregar comportamiento.
    pass


# Declara una clase para representar esta estructura.
class CategoryRead(CategoryBase):
    # Declara un atributo con su tipo de dato.
    id: int

    # Guarda el valor necesario para usarlo posteriormente.
    model_config = {"from_attributes": True}
