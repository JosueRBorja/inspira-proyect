# Importa elementos especificos desde otro modulo.
from collections.abc import Generator
# Importa elementos especificos desde otro modulo.
from pathlib import Path

# Importa elementos especificos desde otro modulo.
from sqlalchemy import create_engine, event
# Importa elementos especificos desde otro modulo.
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker


# Guarda el valor necesario para usarlo posteriormente.
API_DIR = Path(__file__).resolve().parent
# Guarda el valor necesario para usarlo posteriormente.
DATABASE_URL = f"sqlite:///{API_DIR / 'store.db'}"


# Declara una clase para representar esta estructura.
class Base(DeclarativeBase):
    # Mantiene el bloque valido sin agregar comportamiento.
    pass


# Guarda el valor necesario para usarlo posteriormente.
engine = create_engine(
    # Configura esta parte de la operacion actual.
    DATABASE_URL,
    # Guarda el valor necesario para usarlo posteriormente.
    connect_args={"check_same_thread": False},
# Cierra la estructura iniciada anteriormente.
)


# Escucha la creacion de conexiones para configurarlas.
@event.listens_for(engine, "connect")
# Define una funcion con la responsabilidad indicada por su nombre.
def enable_sqlite_foreign_keys(database_connection, connection_record) -> None:
    # Guarda el valor necesario para usarlo posteriormente.
    cursor = database_connection.cursor()
    # Ejecuta la operacion indicada con los valores definidos.
    cursor.execute("PRAGMA foreign_keys=ON")
    # Ejecuta la operacion indicada con los valores definidos.
    cursor.close()


# Guarda el valor necesario para usarlo posteriormente.
SessionLocal = sessionmaker(
    # Guarda el valor necesario para usarlo posteriormente.
    autocommit=False,
    # Guarda el valor necesario para usarlo posteriormente.
    autoflush=False,
    # Guarda el valor necesario para usarlo posteriormente.
    bind=engine,
# Cierra la estructura iniciada anteriormente.
)


# Define una funcion con la responsabilidad indicada por su nombre.
def create_database() -> None:
    # Importa elementos especificos desde otro modulo.
    from api import models

    # Ejecuta la operacion indicada con los valores definidos.
    Base.metadata.create_all(bind=engine)


# Define una funcion con la responsabilidad indicada por su nombre.
def get_database_session() -> Generator[Session, None, None]:
    # Guarda el valor necesario para usarlo posteriormente.
    database_session = SessionLocal()
    # Inicia un bloque controlado para ejecutar la operacion.
    try:
        # Entrega temporalmente la sesion creada.
        yield database_session
    # Ejecuta la limpieza final de recursos.
    finally:
        # Ejecuta la operacion indicada con los valores definidos.
        database_session.close()
