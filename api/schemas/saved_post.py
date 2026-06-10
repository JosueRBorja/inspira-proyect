# Importa elementos especificos desde otro modulo.
from datetime import datetime

# Importa elementos especificos desde otro modulo.
from pydantic import BaseModel

# Importa elementos especificos desde otro modulo.
from api.schemas.post import PostRead


# Declara una clase para representar esta estructura.
class SavedPostCreate(BaseModel):
    # Declara un atributo con su tipo de dato.
    user_id: int
    # Declara un atributo con su tipo de dato.
    post_id: int


# Declara una clase para representar esta estructura.
class SavedPostRead(BaseModel):
    # Declara un atributo con su tipo de dato.
    id: int
    # Declara un atributo con su tipo de dato.
    user_id: int
    # Declara un atributo con su tipo de dato.
    post_id: int
    # Declara un atributo con su tipo de dato.
    created_at: datetime
    # Declara un atributo con su tipo de dato.
    post: PostRead

    # Guarda el valor necesario para usarlo posteriormente.
    model_config = {"from_attributes": True}
