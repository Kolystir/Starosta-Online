from datetime import datetime, timedelta
from sqlalchemy import select
from typing import List, Dict, Optional, Any
from passlib.context import CryptContext
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from database import get_db
from models import User, GroupList, Subject, Statement, Class, Reason
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
    group_id: Optional[int] = None

class UserUpdate(BaseModel):
    username: str | None = None
    password: str | None = None
    email: str | None = None
    Last_Name: str
    First_Name: str
    Middle_Name: str
    group_id: Optional[int] = None 

class SubjectCreate(BaseModel):
    Title: str
    Time_hour: int


class ClassCreate(BaseModel):
    Pair_number: int
    Date: date
    subject_id: int
    Group_List_Group_ID: int 
    
class StatementCreate(BaseModel):
    Presence: str | None
    Class_Class_ID: int
    Users_User_ID: int
    
class GroupCreate(BaseModel):
    Group_Name: str

class GroupUpdate(BaseModel):
    Group_Name: str
    
    
class UpdateStatement(BaseModel):
    presence: Optional[str] = None
    reason: Optional[str] = None



@router.post("/admin")
def create_admin(student: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.username == student.username).first()
    if existing_user:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": "Username already taken"}
        )
    st_dict = student.dict()
    st_dict["role"] = "Админ"
    st_dict["password"] = ctx.hash(st_dict["password"])
    db_student = User(**st_dict)
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student




@router.get("/report/{group_id}/{start_date}/{end_date}", response_model=Dict[str, Any])
async def get_report_range(group_id: int, start_date: date, end_date: date, db: Session = Depends(get_db)):
    group = db.query(GroupList).filter(GroupList.Group_ID == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    users = db.query(User).filter(User.group_id == group_id, User.role.in_(["Студент", "Староста"])).all()
    classes = db.query(Class).filter(Class.Group_List_Group_ID == group_id, Class.Date.between(start_date, end_date)).all()

    if not classes:
        raise HTTPException(status_code=404, detail="No classes found for the given date range")

    def is_sunday(d):
        return d.weekday() == 6

    missing_dates = set((start_date + timedelta(days=i)).isoformat() 
                        for i in range((end_date - start_date).days + 1) 
                        if not is_sunday(start_date + timedelta(days=i)))
    missing_dates -= {cls.Date.isoformat() for cls in classes}

    if missing_dates:
        return {"missing_dates": list(missing_dates)}

    report = []
    for user in users:
        student_classes = {}
        daily_absences = {}
        for cls in classes:
            date_str = cls.Date.isoformat()
            if is_sunday(cls.Date):
                continue
            
            statement = db.query(Statement).filter(Statement.Class_Class_ID == cls.Class_ID, Statement.Users_User_ID == user.User_ID).first()
            reason_description = statement.reason.Description if statement and statement.reason else ""

            if date_str not in daily_absences:
                daily_absences[date_str] = {"уважительная": 0, "неуважительная": 0}

            if statement is not None and str(statement.Presence) == "Н":
                hours = 2  # 1 пара = 2 часа
                if reason_description in ["Б", "УВ"]:
                    daily_absences[date_str]["уважительная"] += hours
                else:
                    daily_absences[date_str]["неуважительная"] += hours

            elif statement is not None and str(statement.Presence) in ["Б", "УВ"]:
                hours = 2  # 1 пара = 2 часа
                daily_absences[date_str]["уважительная"] += hours

            if date_str not in student_classes:
                student_classes[date_str] = []

            student_classes[date_str].append({
                "statement_id": statement.Statement_ID if statement else None,
                "presence": statement.Presence if statement else None,
                "reason": reason_description,
                "Class_Class_ID": cls.Class_ID,
                "Users_User_ID": user.User_ID
            })

        report.append({
            "Last_Name": user.Last_Name,
            "First_Name": user.First_Name,
            "Middle_Name": user.Middle_Name,
            "classes": student_classes,
            "daily_absences": daily_absences
        })

    subjects = {}
    for cls in classes:
        date_str = cls.Date.isoformat()
        if is_sunday(cls.Date):
            continue

        if date_str not in subjects:
            subjects[date_str] = {}
        subjects[date_str][cls.Pair_number] = cls.subject.Title

    return {"subjects": subjects, "report": report}






@router.get("/report/{group_id}/{report_date}", response_model=Dict)
async def get_report(group_id: int, report_date: date, db: Session = Depends(get_db)):
    group = db.query(GroupList).filter(GroupList.Group_ID == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    users = db.query(User).filter(User.group_id == group_id, User.role.in_(["Студент", "Староста"])).all()
    classes = db.query(Class).filter(Class.Group_List_Group_ID == group_id, Class.Date == report_date).all()

    report = []
    for user in users:
        student_classes = {}
        for cls in classes:
            statement = db.query(Statement).filter(Statement.Class_Class_ID == cls.Class_ID, Statement.Users_User_ID == user.User_ID).first()
            student_classes[cls.Pair_number] = {
                "statement_id": statement.Statement_ID if statement else None,
                "presence": statement.Presence if statement else None,
                "reason": statement.reason.Description if statement and statement.reason else None,
                "Class_Class_ID": cls.Class_ID,  # добавляем Class_Class_ID
                "Users_User_ID": user.User_ID  # добавляем Users_User_ID
            }
        report.append({
            "Last_Name": user.Last_Name,
            "First_Name": user.First_Name,
            "Middle_Name": user.Middle_Name,
            "classes": student_classes
        })

    subjects = {cls.Pair_number: cls.subject.Title for cls in classes}
    return {"subjects": subjects, "report": report}





@router.put("/statement/{statement_id}")
def update_statement(statement_id: int, update_data: UpdateStatement, db: Session = Depends(get_db)):
    statement = db.query(Statement).filter(Statement.Statement_ID == statement_id).first()
    if not statement:
        raise HTTPException(status_code=404, detail=f"Statement with id {statement_id} not found")

    if update_data.presence is not None:
        statement.presence = update_data.presence

    # Если причина не указана, устанавливаем её как None
    if update_data.reason is not None:
        statement.reason_Reason_ID = update_data.reason
    else:
        statement.reason_Reason_ID = None

    db.commit()
    return {"message": "Statement updated successfully"}


@router.post("/groups", response_model=Dict)
def create_group(group: GroupCreate, db: Session = Depends(get_db)):
    # Проверка, существует ли уже группа с таким именем
    existing_group = db.query(GroupList).filter(GroupList.Group_Name == group.Group_Name).first()
    if existing_group:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Group name already exists"
        )

    # Создание новой группы
    new_group = GroupList(Group_Name=group.Group_Name)
    db.add(new_group)
    db.commit()
    db.refresh(new_group)
    
    return {
        "Group_ID": new_group.Group_ID,
        "Group_Name": new_group.Group_Name
    }


@router.put("/groups/{group_id}", response_model=Dict)
def update_group(group_id: int, group: GroupCreate, db: Session = Depends(get_db)):
    db_group = db.query(GroupList).filter(GroupList.Group_ID == group_id).first()
    if not db_group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Обновляем поля, только если они не равны None
    update_data = group.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_group, key, value)

    db.commit()
    db.refresh(db_group)
    
    return {"message": "Group updated successfully"}

@router.delete("/groups/{group_id}", response_model=Dict)
def delete_group(group_id: int, db: Session = Depends(get_db)):
    db_group = db.query(GroupList).filter(GroupList.Group_ID == group_id).first()
    if not db_group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )

    db.delete(db_group)
    db.commit()
    
    return {
        "detail": "Group deleted successfully"
    }


# Создание занятия
@router.post("/classes", response_model=List[Dict])
def create_classes(classes_data: List[ClassCreate], db: Session = Depends(get_db)):
    created_classes = []
    for class_data in classes_data:
        class_dict = class_data.dict()
        db_class = Class(**class_dict)
        db.add(db_class)
        db.commit()
        db.refresh(db_class)
        created_classes.append({
            "Class_ID": db_class.Class_ID,
            "Pair_number": db_class.Pair_number,
            "Date": db_class.Date,
            "subject_id": db_class.subject_id,
            "Group_List_Group_ID": db_class.Group_List_Group_ID
        })
    return created_classes

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
            "subject_id": class_.subject_id,
            "Group_List_Group_ID": class_.Group_List_Group_ID
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
            "Group_Name": teacher.group.Group_Name if teacher.group else None  # Проверка на None
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



@router.put("/teachers/{user_id}")
def update_teachers(user_id: int, teacher: UserUpdate, db: Session = Depends(get_db)):
    db_teacher = db.query(User).filter(User.User_ID == user_id).first()
    if not db_teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    # Шифруем пароль, если он указан
    if teacher.password:
        teacher.password = ctx.hash(teacher.password)
    
    # Обновляем поля, только если они не равны None
    update_data = teacher.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_teacher, key, value)

    db.commit()
    db.refresh(db_teacher)
    return db_teacher

# Удаление данных Студента и Преподавателя
@router.delete("/students/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(User).filter(User.User_ID == student_id).first()
    if student:
        # Удаляем все связанные записи в таблице Statement
        db.query(Statement).filter(Statement.Users_User_ID == student_id).delete(synchronize_session=False)
        
        # Теперь удаляем самого студента
        db.delete(student)
        db.commit()
        return {"message": f"Студент с ID {student_id} успешно удален"}
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Студент с ID {student_id} не найден")

    
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
            if student.role in ["Студент", "Староста"]:
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
        if student.role in ["Студент", "Староста"]:
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