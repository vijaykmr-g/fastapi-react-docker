from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker,declarative_base

DATABASE_URL = "postgresql+psycopg2://admin:admin123@host.docker.internal:5432/practice_db"



engine = create_engine(DATABASE_URL)

sessionlocal = sessionmaker(autocommit=False,autoflush=False,bind=engine)

base = declarative_base()