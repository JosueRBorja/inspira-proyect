# Importa elementos especificos desde otro modulo.
from sqlalchemy.orm import Session

# Importa elementos especificos desde otro modulo.
from api import models
# Importa elementos especificos desde otro modulo.
from api.security import hash_password


# Define una funcion con la responsabilidad indicada por su nombre.
def build_alias_with_at(alias: str) -> str:
    # Guarda el valor necesario para usarlo posteriormente.
    cleaned_alias = alias.strip()
    # Evalua una condicion antes de continuar.
    if cleaned_alias.startswith("@"):
        # Devuelve el resultado de la operacion.
        return cleaned_alias
    # Devuelve el resultado de la operacion.
    return f"@{cleaned_alias}"


# Define una funcion con la responsabilidad indicada por su nombre.
def normalize_existing_user_aliases(database_session: Session) -> None:
    # Guarda el valor necesario para usarlo posteriormente.
    users = database_session.query(models.User).all()
    # Guarda el valor necesario para usarlo posteriormente.
    existing_aliases = {user.alias for user in users if user.alias.startswith("@")}

    # Recorre los elementos disponibles uno por uno.
    for user in users:
        # Guarda el valor necesario para usarlo posteriormente.
        normalized_alias = build_alias_with_at(user.alias)
        # Evalua una condicion antes de continuar.
        if normalized_alias == user.alias:
            # Continua con la siguiente vuelta del recorrido.
            continue

        # Guarda el valor necesario para usarlo posteriormente.
        unique_alias = normalized_alias
        # Evalua una condicion antes de continuar.
        if unique_alias in existing_aliases:
            # Guarda el valor necesario para usarlo posteriormente.
            unique_alias = f"{normalized_alias}.{user.id}"

        # Guarda el valor necesario para usarlo posteriormente.
        user.alias = unique_alias
        # Ejecuta la operacion indicada con los valores definidos.
        existing_aliases.add(unique_alias)


# Define una funcion con la responsabilidad indicada por su nombre.
def get_or_create_category(database_session: Session, name: str, slug: str) -> models.Category:
    # Guarda el valor necesario para usarlo posteriormente.
    category = database_session.query(models.Category).filter(models.Category.slug == slug).first()
    # Evalua una condicion antes de continuar.
    if category:
        # Devuelve el resultado de la operacion.
        return category

    # Guarda el valor necesario para usarlo posteriormente.
    category = models.Category(name=name, slug=slug)
    # Ejecuta la operacion indicada con los valores definidos.
    database_session.add(category)
    # Ejecuta la operacion indicada con los valores definidos.
    database_session.flush()
    # Devuelve el resultado de la operacion.
    return category


# Define una funcion con la responsabilidad indicada por su nombre.
def get_or_create_user(
    # Declara un atributo con su tipo de dato.
    database_session: Session,
    # Declara un atributo con su tipo de dato.
    full_name: str,
    # Declara un atributo con su tipo de dato.
    alias: str,
    # Declara un atributo con su tipo de dato.
    email: str,
    # Declara un atributo con su tipo de dato.
    profile_photo_url: str,
    # Declara un atributo con su tipo de dato.
    biography: str,
# Cierra los parametros y declara el tipo de resultado.
) -> models.User:
    # Guarda el valor necesario para usarlo posteriormente.
    user = database_session.query(models.User).filter(models.User.email == email).first()
    # Evalua una condicion antes de continuar.
    if user:
        # Guarda el valor necesario para usarlo posteriormente.
        user.alias = build_alias_with_at(user.alias)
        # Devuelve el resultado de la operacion.
        return user

    # Guarda el valor necesario para usarlo posteriormente.
    user = models.User(
        # Guarda el valor necesario para usarlo posteriormente.
        full_name=full_name,
        # Guarda el valor necesario para usarlo posteriormente.
        alias=build_alias_with_at(alias),
        # Guarda el valor necesario para usarlo posteriormente.
        email=email,
        # Guarda el valor necesario para usarlo posteriormente.
        password_hash=hash_password("12345678"),
        # Guarda el valor necesario para usarlo posteriormente.
        profile_photo_url=profile_photo_url,
        # Guarda el valor necesario para usarlo posteriormente.
        biography=biography,
    # Cierra la estructura iniciada anteriormente.
    )
    # Ejecuta la operacion indicada con los valores definidos.
    database_session.add(user)
    # Ejecuta la operacion indicada con los valores definidos.
    database_session.flush()
    # Devuelve el resultado de la operacion.
    return user


# Define una funcion con la responsabilidad indicada por su nombre.
def get_or_create_post(
    # Declara un atributo con su tipo de dato.
    database_session: Session,
    # Declara un atributo con su tipo de dato.
    owner_id: int,
    # Declara un atributo con su tipo de dato.
    category_id: int,
    # Declara un atributo con su tipo de dato.
    title: str,
    # Declara un atributo con su tipo de dato.
    description: str,
    # Declara un atributo con su tipo de dato.
    image_url: str,
    # Declara un atributo con su tipo de dato.
    tags: str,
# Cierra los parametros y declara el tipo de resultado.
) -> models.Post:
    # Guarda el valor necesario para usarlo posteriormente.
    post = database_session.query(models.Post).filter(models.Post.title == title).first()
    # Evalua una condicion antes de continuar.
    if post:
        # Devuelve el resultado de la operacion.
        return post

    # Guarda el valor necesario para usarlo posteriormente.
    post = models.Post(
        # Guarda el valor necesario para usarlo posteriormente.
        owner_id=owner_id,
        # Guarda el valor necesario para usarlo posteriormente.
        category_id=category_id,
        # Guarda el valor necesario para usarlo posteriormente.
        title=title,
        # Guarda el valor necesario para usarlo posteriormente.
        description=description,
        # Guarda el valor necesario para usarlo posteriormente.
        image_url=image_url,
        # Guarda el valor necesario para usarlo posteriormente.
        tags=tags,
    # Cierra la estructura iniciada anteriormente.
    )
    # Ejecuta la operacion indicada con los valores definidos.
    database_session.add(post)
    # Ejecuta la operacion indicada con los valores definidos.
    database_session.flush()
    # Devuelve el resultado de la operacion.
    return post


# Define una funcion con la responsabilidad indicada por su nombre.
def seed_initial_data(database_session: Session) -> None:
    # Ejecuta la operacion indicada con los valores definidos.
    normalize_existing_user_aliases(database_session)

    # Guarda el valor necesario para usarlo posteriormente.
    categories = {
        # Agrega un valor de texto a la estructura actual.
        "deportes": get_or_create_category(database_session, "Deportes", "deportes"),
        # Agrega un valor de texto a la estructura actual.
        "casas": get_or_create_category(database_session, "Casas", "casas"),
        # Agrega un valor de texto a la estructura actual.
        "edificios": get_or_create_category(database_session, "Edificios", "edificios"),
        # Agrega un valor de texto a la estructura actual.
        "caballos": get_or_create_category(database_session, "Caballos", "caballos"),
        # Agrega un valor de texto a la estructura actual.
        "ropa": get_or_create_category(database_session, "Ropa de hombre", "ropa-de-hombre"),
        # Agrega un valor de texto a la estructura actual.
        "paisajes": get_or_create_category(database_session, "Paisajes", "paisajes"),
    # Cierra la estructura iniciada anteriormente.
    }

    # Guarda el valor necesario para usarlo posteriormente.
    josue = get_or_create_user(
        # Configura esta parte de la operacion actual.
        database_session,
        # Agrega un valor de texto a la estructura actual.
        "Josue Ramirez",
        # Agrega un valor de texto a la estructura actual.
        "@josue.visual",
        # Agrega un valor de texto a la estructura actual.
        "josue@example.com",
        # Agrega un valor de texto a la estructura actual.
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=260&q=80",
        # Agrega un valor de texto a la estructura actual.
        "Creador de contenido visual sobre deportes, casas, edificios, caballos, ropa masculina y paisajes.",
    # Cierra la estructura iniciada anteriormente.
    )
    # Guarda el valor necesario para usarlo posteriormente.
    daniel = get_or_create_user(
        # Configura esta parte de la operacion actual.
        database_session,
        # Agrega un valor de texto a la estructura actual.
        "Daniel Rodriguez",
        # Agrega un valor de texto a la estructura actual.
        "@daniel.rodriguez",
        # Agrega un valor de texto a la estructura actual.
        "daniel@example.com",
        # Agrega un valor de texto a la estructura actual.
        "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=260&q=80",
        # Agrega un valor de texto a la estructura actual.
        "Comparte referencias de casas, caballos y escenas deportivas.",
    # Cierra la estructura iniciada anteriormente.
    )
    # Guarda el valor necesario para usarlo posteriormente.
    emilio = get_or_create_user(
        # Configura esta parte de la operacion actual.
        database_session,
        # Agrega un valor de texto a la estructura actual.
        "Emilio Poveda",
        # Agrega un valor de texto a la estructura actual.
        "@emilio.poveda",
        # Agrega un valor de texto a la estructura actual.
        "emilio@example.com",
        # Agrega un valor de texto a la estructura actual.
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=260&q=80",
        # Agrega un valor de texto a la estructura actual.
        "Publica paisajes, edificios y referencias urbanas.",
    # Cierra la estructura iniciada anteriormente.
    )

    # Guarda el valor necesario para usarlo posteriormente.
    posts = [
        # Inicia una agrupacion de valores.
        (josue, categories["deportes"], "Futbol en accion", "Referencia visual de energia deportiva y movimiento dentro de una cancha.", "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=900&q=80", "deportes, futbol, accion"),
        # Inicia una agrupacion de valores.
        (daniel, categories["casas"], "Casa familiar", "Fachada moderna para una referencia de vivienda amplia.", "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=900&q=80", "casas, hogar, fachada"),
        # Inicia una agrupacion de valores.
        (emilio, categories["edificios"], "Edificio urbano", "Edificio alto con composicion arquitectonica moderna.", "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80", "edificios, arquitectura, urbano"),
        # Inicia una agrupacion de valores.
        (daniel, categories["caballos"], "Caballo en campo", "Caballo corriendo en un espacio natural.", "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=900&q=80", "caballos, campo, animales"),
        # Inicia una agrupacion de valores.
        (josue, categories["ropa"], "Ropa casual masculina", "Referencia de estilo masculino casual.", "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?auto=format&fit=crop&w=900&q=80", "ropa, hombre, casual"),
        # Inicia una agrupacion de valores.
        (emilio, categories["paisajes"], "Paisaje de montana", "Camino rodeado de montanas y naturaleza.", "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80", "paisajes, montana, naturaleza"),
        # Inicia una agrupacion de valores.
        (josue, categories["deportes"], "Basquet urbano", "Cancha y aro como referencia deportiva.", "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=80", "deportes, basquet, urbano"),
        # Inicia una agrupacion de valores.
        (josue, categories["casas"], "Casa moderna", "Casa amplia con fachada moderna.", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80", "casas, moderna, fachada"),
        # Inicia una agrupacion de valores.
        (emilio, categories["edificios"], "Arquitectura moderna", "Edificio con formas geometricas modernas.", "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=80", "edificios, arquitectura, geometria"),
        # Inicia una agrupacion de valores.
        (daniel, categories["ropa"], "Estilo formal hombre", "Referencia de ropa masculina formal.", "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=900&q=80", "ropa, hombre, formal"),
    # Cierra la estructura iniciada anteriormente.
    ]

    # Recorre los elementos disponibles uno por uno.
    for owner, category, title, description, image_url, tags in posts:
        # Ejecuta la operacion indicada con los valores definidos.
        get_or_create_post(database_session, owner.id, category.id, title, description, image_url, tags)

    # Ejecuta la operacion indicada con los valores definidos.
    database_session.commit()
