from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from database import get_db
from models.models import User, GroupList, Group
from pydantic import BaseModel

router = APIRouter()

class UserCreate(BaseModel):
    Last_Name: str
    First_Name: str
    Middle_Name: str
    group_id: int

class UserUpdate(BaseModel):
    Last_Name: str
    First_Name: str
    Middle_Name: str
    group_id: int

@router.get("/users", response_model=list[dict])
def read_students(db: Session = Depends(get_db)):
    students = db.query(User).options(joinedload(User.group).joinedload(Group.group_list)).all()
    result = []
    for student in students:
        for grp in student.group:
            result.append({
                "User_ID": student.User_ID,
                "Last_Name": student.Last_Name,
                "First_Name": student.First_Name,
                "Middle_Name": student.Middle_Name,
                "Group_Name": grp.group_list.Group_Name
            })
    return result


@router.post("/users", response_model=dict)
def create_student(student: UserCreate, db: Session = Depends(get_db)):
    db_student = User(**student.dict())
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

@router.put("/users/{user_id}", response_model=dict)
def update_student(user_id: int, student: UserUpdate, db: Session = Depends(get_db)):
    db_student = db.query(User).filter(User.User_ID == user_id).first()
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")
    for var, value in vars(student).items():
        if value:
            setattr(db_student, var, value)
    db.commit()
    db.refresh(db_student)
    return db_student

@router.delete("/users/{user_id}", response_model=dict)
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


@router.get("/group", response_model=list[dict])
def read_groups(db: Session = Depends(get_db)):
    groups = db.query(GroupList).all()
    return [{"Group_ID": group.Group_ID, "Group_Name": group.Group_Name} for group in groups]


@router.get("/users_by_group")
def read_students_by_group(db: Session = Depends(get_db)):
    students_by_group = db.query(User).options(joinedload(User.group).joinedload(Group.group_list)).all()
    result = []
    groups_dict = {}
    
    for student in students_by_group:
        for grp in student.group:
            group_name = grp.group_list.Group_Name
            if group_name not in groups_dict:
                groups_dict[group_name] = []
            groups_dict[group_name].append({
                "User_ID": student.User_ID,
                "Last_Name": student.Last_Name,
                "First_Name": student.First_Name,
                "Middle_Name": student.Middle_Name,
            })
    
    for group_name, students in groups_dict.items():
        result.append({
            "group_name": group_name,
            "students": students
        })
    
    return result