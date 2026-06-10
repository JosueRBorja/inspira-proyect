# Importa elementos especificos desde otro modulo.
from datetime import datetime

# Importa elementos especificos desde otro modulo.
from sqlalchemy import DateTime, ForeignKey, String, Text, UniqueConstraint
# Importa elementos especificos desde otro modulo.
from sqlalchemy.orm import Mapped, mapped_column, relationship

# Importa elementos especificos desde otro modulo.
from api.database import Base


# Declara una clase para representar esta estructura.
class User(Base):
    # Guarda el valor necesario para usarlo posteriormente.
    __tablename__ = "users"

    # Declara un campo o relacion administrada por la base de datos.
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    # Declara un campo o relacion administrada por la base de datos.
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    # Declara un campo o relacion administrada por la base de datos.
    alias: Mapped[str] = mapped_column(String(60), unique=True, index=True, nullable=False)
    # Declara un campo o relacion administrada por la base de datos.
    email: Mapped[str] = mapped_column(String(160), unique=True, index=True, nullable=False)
    # Declara un campo o relacion administrada por la base de datos.
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    # Declara un campo o relacion administrada por la base de datos.
    profile_photo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    # Declara un campo o relacion administrada por la base de datos.
    biography: Mapped[str | None] = mapped_column(Text, nullable=True)
    # Declara un campo o relacion administrada por la base de datos.
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Declara un campo o relacion administrada por la base de datos.
    posts: Mapped[list["Post"]] = relationship(back_populates="owner")
    # Declara un campo o relacion administrada por la base de datos.
    comments: Mapped[list["Comment"]] = relationship(back_populates="author")
    # Declara un campo o relacion administrada por la base de datos.
    saved_posts: Mapped[list["SavedPost"]] = relationship(back_populates="user")


# Declara una clase para representar esta estructura.
class Category(Base):
    # Guarda el valor necesario para usarlo posteriormente.
    __tablename__ = "categories"

    # Declara un campo o relacion administrada por la base de datos.
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    # Declara un campo o relacion administrada por la base de datos.
    name: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    # Declara un campo o relacion administrada por la base de datos.
    slug: Mapped[str] = mapped_column(String(80), unique=True, index=True, nullable=False)

    # Declara un campo o relacion administrada por la base de datos.
    posts: Mapped[list["Post"]] = relationship(back_populates="category")


# Declara una clase para representar esta estructura.
class Post(Base):
    # Guarda el valor necesario para usarlo posteriormente.
    __tablename__ = "posts"

    # Declara un campo o relacion administrada por la base de datos.
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    # Declara un campo o relacion administrada por la base de datos.
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    # Declara un campo o relacion administrada por la base de datos.
    category_id: Mapped[int | None] = mapped_column(ForeignKey("categories.id"), nullable=True)
    # Declara un campo o relacion administrada por la base de datos.
    title: Mapped[str] = mapped_column(String(140), nullable=False)
    # Declara un campo o relacion administrada por la base de datos.
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    # Declara un campo o relacion administrada por la base de datos.
    image_url: Mapped[str] = mapped_column(String(500), nullable=False)
    # Declara un campo o relacion administrada por la base de datos.
    tags: Mapped[str | None] = mapped_column(String(300), nullable=True)
    # Declara un campo o relacion administrada por la base de datos.
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Declara un campo o relacion administrada por la base de datos.
    owner: Mapped[User] = relationship(back_populates="posts")
    # Declara un campo o relacion administrada por la base de datos.
    category: Mapped[Category | None] = relationship(back_populates="posts")
    # Declara un campo o relacion administrada por la base de datos.
    comments: Mapped[list["Comment"]] = relationship(back_populates="post", cascade="all, delete-orphan")
    # Declara un campo o relacion administrada por la base de datos.
    saved_by: Mapped[list["SavedPost"]] = relationship(back_populates="post", cascade="all, delete-orphan")


# Declara una clase para representar esta estructura.
class Comment(Base):
    # Guarda el valor necesario para usarlo posteriormente.
    __tablename__ = "comments"

    # Declara un campo o relacion administrada por la base de datos.
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    # Declara un campo o relacion administrada por la base de datos.
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id"), nullable=False)
    # Declara un campo o relacion administrada por la base de datos.
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    # Declara un campo o relacion administrada por la base de datos.
    content: Mapped[str] = mapped_column(Text, nullable=False)
    # Declara un campo o relacion administrada por la base de datos.
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Declara un campo o relacion administrada por la base de datos.
    post: Mapped[Post] = relationship(back_populates="comments")
    # Declara un campo o relacion administrada por la base de datos.
    author: Mapped[User] = relationship(back_populates="comments")


# Declara una clase para representar esta estructura.
class SavedPost(Base):
    # Guarda el valor necesario para usarlo posteriormente.
    __tablename__ = "saved_posts"
    # Guarda el valor necesario para usarlo posteriormente.
    __table_args__ = (UniqueConstraint("user_id", "post_id", name="unique_saved_post_per_user"),)

    # Declara un campo o relacion administrada por la base de datos.
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    # Declara un campo o relacion administrada por la base de datos.
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    # Declara un campo o relacion administrada por la base de datos.
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id"), nullable=False)
    # Declara un campo o relacion administrada por la base de datos.
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Declara un campo o relacion administrada por la base de datos.
    user: Mapped[User] = relationship(back_populates="saved_posts")
    # Declara un campo o relacion administrada por la base de datos.
    post: Mapped[Post] = relationship(back_populates="saved_by")
