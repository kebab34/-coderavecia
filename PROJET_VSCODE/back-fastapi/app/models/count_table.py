from sqlalchemy import Column, Integer
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class CountTable(Base):
    """Modèle SQLAlchemy pour la table count_table"""
    __tablename__ = "count_table"
    
    id = Column(Integer, primary_key=True, index=True)
    count_number = Column(Integer, default=0)
