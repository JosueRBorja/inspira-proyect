# Importa elementos especificos desde otro modulo.
from datetime import datetime

# Importa elementos especificos desde otro modulo.
from pydantic import BaseModel

# Importa elementos especificos desde otro modulo.
from api.schemas.user import UserRead


# Declara una clase para representar esta estructura.
class CommentBase(BaseModel):
    # Declara un atributo con su tipo de dato.
    post_id: int
    # Declara un atributo con su tipo de dato.
    author_id: int
    # Declara un atributo con su tipo de dato.
    content: str


# Declara una clase para representar esta estructura.
class CommentCreate(CommentBase):
    # Mantiene el bloque valido sin agregar comportamiento.
    pass


# Declara una clase para representar esta estructura.
class CommentRead(CommentBase):
    # Declara un atributo con su tipo de dato.
    id: int
    # Declara un atributo con su tipo de dato.
    created_at: datetime
    # Declara un atributo con su tipo de dato.
    author: UserRead

    # Guarda el valor necesario para usarlo posteriormente.
    model_config = {"from_attributes": True}
