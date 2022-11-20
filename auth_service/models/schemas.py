from sqlalchemy import Boolean, Column, Identity, ForeignKey, Integer, String, JSON
from sqlalchemy.orm import relationship

from .setup import Base


class User(Base):
	__tablename__ = "users"

	id = Column(Integer, Identity("always"), primary_key=True, index=True)
	username = Column(String, index=True)
	permissions = Column(JSON) 