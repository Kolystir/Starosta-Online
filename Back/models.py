from sqlalchemy import Column, Integer, String, ForeignKey, Date, Text
from sqlalchemy.orm import relationship

from database import Base, engine


class GroupList(Base):
    __tablename__ = "Group_List"

    Group_ID = Column(Integer, primary_key=True, index=True)
    Group_Name = Column(String(50), nullable=False)

    users = relationship("User", back_populates="group")
    classes = relationship("Class", back_populates="group")


class User(Base):
    __tablename__ = "Users"

    User_ID = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True)
    password = Column(String(1000))
    email = Column(String(100), nullable=True)
    Last_Name = Column(String(50), nullable=False)
    First_Name = Column(String(50), nullable=False)
    Middle_Name = Column(String(50), nullable=True)
    group_id = Column(Integer, ForeignKey(GroupList.Group_ID))
    group = relationship("GroupList", back_populates="users")
    role = Column(String(20))
    statements = relationship("Statement", back_populates="user")





class Subject(Base):
    __tablename__ = "Subject"

    Subject_ID = Column(Integer, primary_key=True, index=True)
    Title = Column(String(100), nullable=False)
    Time_hour = Column(Integer, nullable=False)

    classes = relationship("Class", back_populates="subject")
    
    
    
class Class(Base):
    __tablename__ = "Class"

    Class_ID = Column(Integer, primary_key=True, index=True)
    Pair_number = Column(Integer, nullable=False)
    Date = Column(Date, nullable=False)
    subject_id = Column(Integer, ForeignKey(Subject.Subject_ID), nullable=False)
    Group_List_Group_ID = Column(Integer, ForeignKey(GroupList.Group_ID), nullable=False)

    subject = relationship("Subject", back_populates="classes")
    group = relationship("GroupList", back_populates="classes")
    statements = relationship("Statement", back_populates="class_")



class Reason(Base):
    __tablename__ = "Reason"

    Reason_ID = Column(Integer, primary_key=True, index=True)
    Description = Column(Text, nullable=False)

    statements = relationship("Statement", back_populates="reason")
    


class Statement(Base):
    __tablename__ = "Statement"

    Statement_ID = Column(Integer, primary_key=True, index=True)
    Presence = Column(String(20))
    Class_Class_ID = Column(Integer, ForeignKey(Class.Class_ID), nullable=False)
    Reason_Reason_ID = Column(Integer, ForeignKey(Reason.Reason_ID), nullable=True)
    Users_User_ID = Column(Integer, ForeignKey(User.User_ID), nullable=False)

    class_ = relationship("Class", back_populates="statements")
    reason = relationship("Reason", back_populates="statements")
    user = relationship("User", back_populates="statements")


if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)


