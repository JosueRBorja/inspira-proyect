# Importa el modulo necesario para usar sus herramientas.
import hashlib
# Importa el modulo necesario para usar sus herramientas.
import secrets


# Guarda el valor necesario para usarlo posteriormente.
HASH_NAME = "sha256"
# Guarda el valor necesario para usarlo posteriormente.
ITERATIONS = 120_000
# Guarda el valor necesario para usarlo posteriormente.
SALT_BYTES = 16


# Define una funcion con la responsabilidad indicada por su nombre.
def hash_password(plain_password: str) -> str:
    # Guarda el valor necesario para usarlo posteriormente.
    salt = secrets.token_hex(SALT_BYTES)
    # Guarda el valor necesario para usarlo posteriormente.
    password_hash = hashlib.pbkdf2_hmac(
        # Configura esta parte de la operacion actual.
        HASH_NAME,
        # Ejecuta la operacion indicada con los valores definidos.
        plain_password.encode("utf-8"),
        # Ejecuta la operacion indicada con los valores definidos.
        salt.encode("utf-8"),
        # Configura esta parte de la operacion actual.
        ITERATIONS,
    # Configura esta parte de la operacion actual.
    ).hex()
    # Devuelve el resultado de la operacion.
    return f"{HASH_NAME}${ITERATIONS}${salt}${password_hash}"


# Define una funcion con la responsabilidad indicada por su nombre.
def verify_password(plain_password: str, password_hash: str) -> bool:
    # Configura esta parte de la operacion actual.
    hash_name, iterations, salt, saved_hash = password_hash.split("$")
    # Guarda el valor necesario para usarlo posteriormente.
    checked_hash = hashlib.pbkdf2_hmac(
        # Configura esta parte de la operacion actual.
        hash_name,
        # Ejecuta la operacion indicada con los valores definidos.
        plain_password.encode("utf-8"),
        # Ejecuta la operacion indicada con los valores definidos.
        salt.encode("utf-8"),
        # Ejecuta la operacion indicada con los valores definidos.
        int(iterations),
    # Configura esta parte de la operacion actual.
    ).hex()
    # Devuelve el resultado de la operacion.
    return secrets.compare_digest(checked_hash, saved_hash)
