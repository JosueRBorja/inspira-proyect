# Importa elementos especificos desde otro modulo.
from fastapi import APIRouter, Depends, HTTPException, status
# Importa elementos especificos desde otro modulo.
from sqlalchemy.orm import Session

# Importa elementos especificos desde otro modulo.
from api import models
# Importa elementos especificos desde otro modulo.
from api.database import get_database_session
# Importa elementos especificos desde otro modulo.
from api.schemas.comment import CommentCreate, CommentRead


# Guarda el valor necesario para usarlo posteriormente.
router = APIRouter(prefix="/api/comentarios", tags=["comentarios"])
# Guarda las palabras que no se permiten en comentarios publicos.
PALABRAS_NO_PERMITIDAS = {
    "odio",
    "violencia",
    "insulto",
    "discriminacion",
    "acoso",
    "amenaza",
    "muerte",
    "muerto",
    "maldito",
    "basura",
    "asco",
    "idiota",
    "imbecil",
    "estupido",
    "tonto",
    "mierda",
    "puta",
    "puto",
    "carajo",
    "verga",
    "pendejo",
    "gilipollas",
    "cabrón",
    "hijo de puta",
    "hija de puta",
    "malparido",
    "malparida",
    "zorra",
    "cerdo",
    "perra",
    "maricón",
    "maricona",
    "marica",
    "gay",
    "lesbiana",
    "transexual",
    "transgénero",
    "travesti",
    "puto el que lo lea",
    "Jochis",
    "Maje",
    "Inutil",
    "Imbécil",
    "Pendejo",
    "Gilipollas"
}


# Define una funcion con la responsabilidad indicada por su nombre.
def normalize_text_for_moderation(text: str) -> str:
    # Importa el modulo necesario para quitar tildes del texto.
    import unicodedata

    # Convierte el texto a minusculas.
    lowered_text = text.lower()
    # Separa letras y tildes para poder limpiar acentos.
    normalized_text = unicodedata.normalize("NFD", lowered_text)
    # Devuelve el texto sin marcas de acento.
    return "".join(character for character in normalized_text if unicodedata.category(character) != "Mn")


# Define una funcion con la responsabilidad indicada por su nombre.
def contains_forbidden_content(text: str) -> bool:
    # Normaliza el comentario antes de comparar.
    checked_text = normalize_text_for_moderation(text)
    # Devuelve si alguna palabra prohibida aparece en el texto.
    return any(word in checked_text for word in PALABRAS_NO_PERMITIDAS)


# Define una funcion con la responsabilidad indicada por su nombre.
def validate_comment_content(content: str) -> None:
    # Evalua si el comentario esta vacio.
    if not content.strip():
        # Detiene la operacion y devuelve un error controlado.
        raise HTTPException(status_code=400, detail="El comentario no puede estar vacio")
    # Evalua si el comentario incumple las normas.
    if contains_forbidden_content(content):
        # Detiene la operacion y devuelve un error controlado.
        raise HTTPException(status_code=400, detail="El comentario contiene contenido no permitido por las normas")


# Define una ruta POST para registrar informacion nueva.
@router.post("", response_model=CommentRead, status_code=status.HTTP_201_CREATED)
# Define una funcion con la responsabilidad indicada por su nombre.
def create_comment(comment_data: CommentCreate, database: Session = Depends(get_database_session)):
    # Valida el comentario antes de guardarlo.
    validate_comment_content(comment_data.content)
    # Guarda el valor necesario para usarlo posteriormente.
    post = database.get(models.Post, comment_data.post_id)
    # Guarda el valor necesario para usarlo posteriormente.
    author = database.get(models.User, comment_data.author_id)
    # Evalua una condicion antes de continuar.
    if not post:
        # Detiene la operacion y devuelve un error controlado.
        raise HTTPException(status_code=404, detail="Publicacion no encontrada")
    # Evalua una condicion antes de continuar.
    if not author:
        # Detiene la operacion y devuelve un error controlado.
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Guarda el valor necesario para usarlo posteriormente.
    comment = models.Comment(**comment_data.model_dump())
    # Ejecuta la operacion indicada con los valores definidos.
    database.add(comment)
    # Ejecuta la operacion indicada con los valores definidos.
    database.commit()
    # Ejecuta la operacion indicada con los valores definidos.
    database.refresh(comment)
    # Devuelve el resultado de la operacion.
    return comment


# Define una ruta GET para consultar informacion.
@router.get("/publicacion/{post_id}", response_model=list[CommentRead])
# Define una funcion con la responsabilidad indicada por su nombre.
def list_post_comments(post_id: int, database: Session = Depends(get_database_session)):
    # Guarda los comentarios encontrados.
    comments = (
        # Ejecuta la operacion indicada con los valores definidos.
        database.query(models.Comment)
        # Filtra los comentarios de la publicacion solicitada.
        .filter(models.Comment.post_id == post_id)
        # Ordena para que los comentarios recientes aparezcan primero.
        .order_by(models.Comment.created_at.desc())
        # Obtiene todos los comentarios encontrados.
        .all()
    )
    # Devuelve solo comentarios que cumplen las normas actuales.
    return [comment for comment in comments if not contains_forbidden_content(comment.content)]
