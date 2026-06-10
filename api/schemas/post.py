# Importa elementos especificos desde otro modulo.
from datetime import datetime

# Importa elementos especificos desde otro modulo.
from pydantic import BaseModel

# Importa elementos especificos desde otro modulo.
from api.schemas.category import CategoryRead
# Importa elementos especificos desde otro modulo.
from api.schemas.user import UserRead


# Declara una clase para representar esta estructura.
class PostBase(BaseModel):
    # Declara un atributo con su tipo de dato.
    title: str
    # Declara un atributo con su tipo de dato.
    description: str | None = None
    # Declara un atributo con su tipo de dato.
    image_url: str
    # Declara un atributo con su tipo de dato.
    tags: str | None = None
    # Declara un atributo con su tipo de dato.
    category_id: int | None = None


# Declara una clase para representar esta estructura.
class PostCreate(PostBase):
    # Declara un atributo con su tipo de dato.
    owner_id: int


# Declara una clase para representar esta estructura.
class PostUpdate(BaseModel):
    # Declara un atributo con su tipo de dato.
    title: str | None = None
    # Declara un atributo con su tipo de dato.
    description: str | None = None
    # Declara un atributo con su tipo de dato.
    image_url: str | None = None
    # Declara un atributo con su tipo de dato.
    tags: str | None = None
    # Declara un atributo con su tipo de dato.
    category_id: int | None = None


# Declara una clase para representar esta estructura.
class PostRead(PostBase):
    # Declara un atributo con su tipo de dato.
    id: int
    # Declara un atributo con su tipo de dato.
    owner_id: int
    # Declara un atributo con su tipo de dato.
    created_at: datetime
    # Declara un atributo con su tipo de dato.
    owner: UserRead
    # Declara un atributo con su tipo de dato.
    category: CategoryRead | None = None

    # Guarda el valor necesario para usarlo posteriormente.
    model_config = {"from_attributes": True}
