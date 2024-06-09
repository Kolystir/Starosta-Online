from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "Users"

    User_ID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    Last_Name = Column(String(50), nullable=False)
    First_Name = Column(String(50), nullable=False)
    Middle_Name = Column(String(50), nullable=True)
    group = relationship("Group", back_populates="user")

class GroupList(Base):
    __tablename__ = "Group_List"

    Group_ID = Column(Integer, primary_key=True, index=True)
    Group_Name = Column(String(50), nullable=False)
    groups = relationship("Group", back_populates="group_list")

class Group(Base):
    __tablename__ = "Group"

    Group_ID = Column(Integer, primary_key=True, autoincrement=True)
    User_ID = Column(Integer, ForeignKey("Users.User_ID"), nullable=False)
    List_Group_ID = Column(Integer, ForeignKey("Group_List.Group_ID"), nullable=False)
    user = relationship("User", back_populates="group")
    group_list = relationship("GroupList", back_populates="groups")
