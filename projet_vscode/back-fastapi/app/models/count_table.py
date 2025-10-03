from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class CountTable(Base):
    __tablename__ = "count_table"

    id = Column(Integer, primary_key=True, index=True)
    count_number = Column(Integer, default=0)

class CountHistory(Base):
    __tablename__ = "count_history"

    id = Column(Integer, primary_key=True, index=True)
    count_value = Column(Integer)
    action = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
