from datetime import datetime, timedelta
from sqlalchemy import select
from typing import List, Dict, Optional
from passlib.context import CryptContext
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from database import get_db
from models import User, GroupList, Subject, Statement, Class
from pydantic import BaseModel
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt
from datetime import date
from sqlalchemy import func
from fastapi.responses import JSONResponse

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
    email: str | None = None
    Last_Name: str
    First_Name: str
    Middle_Name: str
    group_id: int 

class SubjectCreate(BaseModel):
    Title: str
    Time_hour: int


class ClassCreate(BaseModel):
    Pair_number: int
    Date: date
    subject_id: int

class StatementCreate(BaseModel):
    Presence: str
    Class_Class_ID: int
    Reason_Reason_ID: Optional[int] = None
    Users_User_ID: int


@router.get("/report/{group_id}/{report_date}", response_model=Dict)
def get_report_by_date(group_id: int, report_date: date, db: Session = Depends(get_db)):
    group = db.query(GroupList).options(joinedload(GroupList.users)).filter(GroupList.Group_ID == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    students = []
    for student in group.users:
        if student.role == "Студент":
            student_data = {
                "Last_Name": student.Last_Name,
                "First_Name": student.First_Name,
                "Middle_Name": student.Middle_Name,
                "classes": {}
            }
            classes = db.query(Class).join(Statement).filter(
                Statement.Users_User_ID == student.User_ID,
                Class.Date == report_date
            ).all()
            for class_ in classes:
                student_data["classes"][class_.Pair_number] = class_.subject.Title
            students.append(student_data)

    classes_on_date = db.query(Class).filter(Class.Date == report_date).all()

    return {
        "report": students,
        "classes": classes_on_date
    }




# Создание занятия
@router.post("/classes", response_model=Dict)
def create_class(class_data: ClassCreate, db: Session = Depends(get_db)):
    class_dict = class_data.dict()
    db_class = Class(**class_dict)
    db.add(db_class)
    db.commit()
    db.refresh(db_class)
    return {
        "Class_ID": db_class.Class_ID,
        "Pair_number": db_class.Pair_number,
        "Date": db_class.Date,
        "subject_id": db_class.subject_id
    }

# Чтение данных о занятиях
@router.get("/classes", response_model=List[Dict])
def read_classes(db: Session = Depends(get_db)):
    classes = db.query(Class).all()
    result = []
    for class_ in classes:
        result.append({
            "Class_ID": class_.Class_ID,
            "Pair_number": class_.Pair_number,
            "Date": class_.Date,
            "subject_id": class_.subject_id
        })
    return result

# Создание записи о посещаемости
@router.post("/statements", response_model=Dict)
def create_statement(statement: StatementCreate, db: Session = Depends(get_db)):
    statement_dict = statement.dict()
    db_statement = Statement(**statement_dict)
    db.add(db_statement)
    db.commit()
    db.refresh(db_statement)
    return {
        "Statement_ID": db_statement.Statement_ID,
        "Presence": db_statement.Presence,
        "Class_Class_ID": db_statement.Class_Class_ID,
        "Reason_Reason_ID": db_statement.Reason_Reason_ID,
        "Users_User_ID": db_statement.Users_User_ID
    }

# Чтение записей о посещаемости
@router.get("/statements", response_model=List[Dict])
def read_statements(db: Session = Depends(get_db)):
    statements = db.query(Statement).all()
    result = []
    for statement in statements:
        result.append({
            "Statement_ID": statement.Statement_ID,
            "Presence": statement.Presence,
            "Class_Class_ID": statement.Class_Class_ID,
            "Reason_Reason_ID": statement.Reason_Reason_ID,
            "Users_User_ID": statement.Users_User_ID
        })
    return result

# Чтение общей информации о посещаемости студентов
@router.get("/report", response_model=List[Dict])
def get_attendance_report(db: Session = Depends(get_db)):
    result = db.query(
        User.Last_Name,
        User.First_Name,
        func.count(Statement.Statement_ID).label("total_classes"),
        func.sum(func.case([(Statement.Presence == 'Present', 1)], else_=0)).label("attended_classes")
    ).join(Statement, Statement.Users_User_ID == User.User_ID)\
     .group_by(User.User_ID).all()
    
    report = []
    for row in result:
        report.append({
            "Last_Name": row.Last_Name,
            "First_Name": row.First_Name,
            "Total_Classes": row.total_classes,
            "Attended_Classes": row.attended_classes
        })
    
    return report


# Чтение данных о предметах
@router.get("/predmets", response_model=List[Dict])
def read_predmets(db: Session = Depends(get_db)):
    predmets = db.query(Subject).all()
    result = []
    for predmet in predmets:
        result.append({
            "Subject_ID": predmet.Subject_ID,
            "Title": predmet.Title,
            "Time_hour": predmet.Time_hour
        })
    return result

#Создание предмета
@router.post("/predmets", response_model=Dict)
def create_predmet(predmet: SubjectCreate, db: Session = Depends(get_db)):
    subject_dict = predmet.dict()
    db_subject = Subject(**subject_dict)
    db.add(db_subject)
    db.commit()
    db.refresh(db_subject)
    return {
        "Subject_ID": db_subject.Subject_ID,
        "Title": db_subject.Title,
        "Time_hour": db_subject.Time_hour
    }




# Обновление предмета
@router.put("/predmets/{subject_id}")
def update_predmet(subject_id: int, subject: SubjectCreate, db: Session = Depends(get_db)):
    db_subject = db.query(Subject).filter(Subject.Subject_ID == subject_id).first()
    if not db_subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    # Обновляем поля, только если они не равны None
    update_data = subject.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_subject, key, value)

    db.commit()
    db.refresh(db_subject)
    return db_subject



# Удаление предмета
@router.delete("/predmets/{subject_id}")
def delete_predmet(subject_id: int, db: Session = Depends(get_db)):
    db_subject = db.query(Subject).filter(Subject.Subject_ID == subject_id).first()
    
    if db_subject is None:
        print(f"Subject with ID {subject_id} not found")
        raise HTTPException(status_code=404, detail="Subject not found")
    
    try:
        db.delete(db_subject)
        db.commit()
        print(f"Subject with ID {subject_id} deleted successfully")
        return {"detail": "Subject deleted successfully"}
    except Exception as e:
        db.rollback()
        print(f"Error deleting subject: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


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
            "Group_Name": student.group.Group_Name if student.group else "Нет группы"
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
    existing_user = db.query(User).filter(User.username == student.username).first()
    if existing_user:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": "Username already taken"}
        )
    st_dict = student.dict()
    st_dict["role"] = "Студент"
    st_dict["password"] = ctx.hash(st_dict["password"])
    db_student = User(**st_dict)
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

@router.post("/teachers")
def create_teacher(teacher: UserCreate, db: Session = Depends(get_db)):
    # Проверка на существование имени пользователя
    existing_user = db.query(User).filter(User.username == teacher.username).first()
    if existing_user:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": "Username already taken"}
        )
    st_dict = teacher.dict()
    st_dict["role"] = "Преподаватель"
    st_dict["password"] = ctx.hash(st_dict["password"])
    db_teacher = User(**st_dict)
    db.add(db_teacher)
    db.commit()
    db.refresh(db_teacher)
    return db_teacher



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


@router.get("/users_by_group/{group_id}")
def read_students_by_groups(group_id: int, db: Session = Depends(get_db)):
    group = db.query(GroupList).options(joinedload(GroupList.users)).filter(GroupList.Group_ID == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    students = []
    for student in group.users:
        if student.role == "Студент":
            students.append({
                "User_ID": student.User_ID,
                "Last_Name": student.Last_Name,
                "First_Name": student.First_Name,
                "Middle_Name": student.Middle_Name,
            })

    return {
        "group_name": group.Group_Name,
        "group_id": group.Group_ID,
        "students": students
    }

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