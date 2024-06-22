from datetime import datetime, timedelta
from sqlalchemy import select
from typing import List, Dict
from passlib.context import CryptContext
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from database import get_db
from models import User, GroupList
from pydantic import BaseModel
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt


KEY = "AGFshjjbghfj"
ALG = "HS256"

router = APIRouter()

ctx = CryptContext(schemes="bcrypt")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")


class UserCreate(BaseModel):
    Last_Name: str
    First_Name: str
    Middle_Name: str
    username: str
    password: str
    group_id: int

class UserUpdate(BaseModel):
    username: str | None = None
    password: str | None = None
    Last_Name: str
    First_Name: str
    Middle_Name: str
    group_id: int

# Чтение данных Студента и Преподавателя
@router.get("/students", response_model=List[Dict])
def read_students(db: Session = Depends(get_db)):
    students = db.query(User).options(joinedload(User.group)).all()
    result = []
    for student in students:
        result.append({
            "User_ID": student.User_ID,
            "Last_Name": student.Last_Name,
            "First_Name": student.First_Name,
            "Middle_Name": student.Middle_Name,
            "Group_Name": student.group.Group_Name
        })
    return result

@router.get("/teachers", response_model=List[Dict])
def read_teachers(db: Session = Depends(get_db)):
    teachers = db.query(User).options(joinedload(User.group)).filter(User.role == "Преподаватель").all()
    result = []
    for teacher in teachers:
        result.append({
            "User_ID": teacher.User_ID,
            "Last_Name": teacher.Last_Name,
            "First_Name": teacher.First_Name,
            "Middle_Name": teacher.Middle_Name,
            "Group_Name": teacher.group.Group_Name
        })
    return result


# Создание Студента и Преподавателя
@router.post("/students")
def create_student(student: UserCreate, db: Session = Depends(get_db)):
    st_dict = student.dict()
    st_dict["role"]="Студент"
    st_dict["password"]=ctx.encrypt(st_dict["password"])
    print(st_dict)
    db_student = User(**st_dict)
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

@router.post("/teachers")
def create_teacher(student: UserCreate, db: Session = Depends(get_db)):
    st_dict = student.dict()
    st_dict["role"]="Преподаватель"
    st_dict["password"]=ctx.encrypt(st_dict["password"])
    print(st_dict)
    db_student = User(**st_dict)
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student


#Обновление данных Студента и Преподавателя
@router.put("/students/{user_id}",)
def update_student(user_id: int, student: UserUpdate, db: Session = Depends(get_db)):
    db_student = db.query(User).filter(User.User_ID == user_id).first()
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Шифруем пароль, если он указан
    if student.password:
        student.password = ctx.encrypt(student.password)
    
    # Обновляем поля, только если они не равны None
    update_data = student.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_student, key, value)

    db.commit()
    db.refresh(db_student)
    return db_student



@router.put("/teachers/{user_id}",)
def update_teachers(user_id: int, teacher: UserUpdate, db: Session = Depends(get_db)):
    db_teacher = db.query(User).filter(User.User_ID == user_id).first()
    if not db_teacher:
        raise HTTPException(status_code=404, detail="teacher not found")
    
    # Шифруем пароль, если он указан
    if teacher.password:
        teacher.password = ctx.encrypt(teacher.password)
    
    # Обновляем поля, только если они не равны None
    update_data = teacher.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_teacher, key, value)

    db.commit()
    db.refresh(db_teacher)
    return db_teacher

# Удаление данных Студента и Преподавателя
@router.delete("/students/{user_id}", )
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.User_ID == user_id).first()
    
    if user is None:
        print(f"User with ID {user_id} not found")
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        db.delete(user)
        db.commit()
        print(f"User with ID {user_id} deleted successfully")
        return {"detail": "User deleted successfully"}
    except Exception as e:
        db.rollback()
        print(f"Error deleting user: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    
    
@router.delete("/teachers/{user_id}", )
def delete_teachers(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.User_ID == user_id).first()
    
    if user is None:
        print(f"User with ID {user_id} not found")
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        db.delete(user)
        db.commit()
        print(f"User with ID {user_id} deleted successfully")
        return {"detail": "User deleted successfully"}
    except Exception as e:
        db.rollback()
        print(f"Error deleting user: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

# Чтение данных групп
@router.get("/group", )
def read_groups(db: Session = Depends(get_db)):
    groups = db.query(GroupList).all()
    print(select(GroupList))
    return [{"Group_ID": group.Group_ID, "Group_Name": group.Group_Name} for group in groups]


from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from typing import List, Dict

# Отношение Студентов и Учителей к группам
@router.get("/users_by_group")
def read_students_by_group(db: Session = Depends(get_db)):
    result = []
    groups = db.query(GroupList).options(joinedload(GroupList.users)).all()
    for grp in groups:
        grp_dict = {"group_name": grp.Group_Name, "students": []}
        for student in grp.users:
            if student.role == "Студент":
                grp_dict["students"].append({
                    "User_ID": student.User_ID,
                    "Last_Name": student.Last_Name,
                    "First_Name": student.First_Name,
                    "Middle_Name": student.Middle_Name,
                })
        result.append(grp_dict)
    return result


# Созданеи уникального токена 
@router.post("/token")
def login(user: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    username = user.username
    us = db.query(User).filter_by(username = username).first()
    if not us:
        raise HTTPException(status_code=403, detail="Неверный логин или пароль")
    if ctx.verify(user.password, us.password):
        token = jwt.encode({"username": us.username, "type": "access", "exp": datetime.now()+timedelta(minutes=45)}, key=KEY, algorithm=ALG)
        return {"access_token": token, "role": us.role, "userId": us.User_ID}
    else: raise HTTPException(status_code=403, detail="Неверный логин или пароль")

@router.post("/register")
def register():
    pass