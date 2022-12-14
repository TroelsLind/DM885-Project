from sqlalchemy.orm import Session
from sqlalchemy import func

from . import models


def get_file(db: Session, file_id: int):
	return db.query(models.File).filter(models.File.id == file_id).first()

def get_files(db: Session, skip: int = 0, limit: int = 100):
	return db.query(models.File).offset(skip).limit(limit).all()

def get_user_files(db: Session, owner: str):
	return db.query(models.File).filter(models.File.owner == owner).all()

def get_user_usage(db: Session, owner: str):
	qry = db.query(func.sum(models.File.size).label("sum")).filter(models.File.owner == owner)
	return qry.scalar()

def create_file(db: Session, name: str, size: int, owner: str):
	db_user = models.File(name=name, size=size, owner=owner)
	db.add(db_user)
	db.commit()
	db.refresh(db_user)
	return db_user

def update_file(db: Session, id: int, name: str, size: int):
	db_upd = db.query(models.File).filter(models.File.id == id).update({"size": size, "name": name})
	db.commit()
	return db_upd

def delete_file(db: Session, id: int):
	db_del = db.query(models.File).filter(models.File.id == id).delete()
	db.commit()
	return db_del

def delete_user_files(db: Session, owner: str):
	db_del = db.query(models.File).filter(models.File.owner == owner).delete()
	db.commit()
	return db_del
