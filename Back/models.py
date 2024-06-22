from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from database import Base, engine


class GroupList(Base):
    __tablename__ = "Group_List"

    Group_ID = Column(Integer, primary_key=True, index=True)
    Group_Name = Column(String(50), nullable=False)
    #groups = relationship("Group", back_populates="group_list")
    users = relationship("User", back_populates="group", )

class User(Base):
    __tablename__ = "Users"

    User_ID = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True)
    password = Column(String(1000))
    Last_Name = Column(String(50), nullable=False)
    First_Name = Column(String(50), nullable=False)
    Middle_Name = Column(String(50), nullable=True)
    group_id = Column(Integer, ForeignKey(GroupList.Group_ID))
    group = relationship("GroupList", back_populates="users")
    role = Column(String(20))




    #group_list = relationship("GroupList", back_populates="groups")



if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)


