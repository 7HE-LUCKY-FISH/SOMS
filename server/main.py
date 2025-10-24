import os
import mysql.connector

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from typing import Dict
from db_connect_module import get_db_connection
from models import Staff, Coach, Player, Scout, MedicalReport, MedicalStaff


#prob move this into this own thing if we are using pydantic to load the default
# report

from typing import Optional, List, Dict
from pydantic import BaseModel, EmailStr, Field
#we need to add a class to create the users
load_dotenv()

app = FastAPI(title = 'SOMS_API')

app.add_middleware(
    CORSMiddleware,
    allow_origins = [
        "http://localhost",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check() -> Dict[str, str]:
    return {"status": "ok"}



#prob move this into its own file
class StaffCreate(BaseModel): 
    first_name: str
    middle_name: Optional[str] = None
    last_name: str
    email: EmailStr
    salary: float = Field(..., ge=0)              
    age: int = Field(..., ge=14, le=120)   
    staff_type: str



@app.post("/staff", status_code=201)
def create_staff_member(staff: StaffCreate):
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute(
            """
            INSERT INTO staff 
              (first_name, middle_name, last_name, email, salary, age, staff_type) 
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (
                staff.first_name,
                staff.middle_name,
                staff.last_name,
                staff.email,
                staff.salary,
                staff.age,
                staff.staff_type,
            ),
        )
        connection.commit()
        return {"status": "success", "staff_id": cursor.lastrowid}
    except mysql.connector.Error as err:
        connection.rollback()
        # optional: raise HTTPException(400, str(err)) if you prefer non-200 on error
        return {"status": "error", "message": str(err)}
    finally:
        cursor.close()
        connection.close()