import os
import mysql.connector
from datetime import date, datetime, time as dtime
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from typing import Dict
from db_connect_module import get_db_connection
from models import Staff, Coach, Player, Scout, MedicalReport, MedicalStaff
from werkzeug.security import check_password_hash

#prob move this into this own thing if we are using pydantic to load the default
# report

from typing import Optional, List, Dict
from pydantic import BaseModel, EmailStr, Field
#we need to add a class to create the users
load_dotenv()


# someone move this later
def verify_password(plain: str, hashed: str) -> bool:
    if hashed is None:
        return False
    return check_password_hash(hashed, plain)



def _serialize_row_dates(row: dict) -> dict:
    # Convert date/time/datetime objects into strings for JSON serialization
    for k, v in list(row.items()):
        if isinstance(v, (date, datetime, dtime)):
            row[k] = str(v)
    return row



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


class LoginRequest(BaseModel):
    username: str
    password: str



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


@app.post("/login")
def login(credentials: LoginRequest):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        #probablly really unsafe lol
        cursor.execute(
            "SELECT staff_id, password_hash, is_active FROM staff_account WHERE username = %s",
            (credentials.username,)
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        if not row.get("is_active", True):
            raise HTTPException(status_code=403, detail="Account is inactive")

        stored_hash = row.get("password_hash")
        if not verify_password(credentials.password, stored_hash):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        return {"status": "success", "staff_id": row.get("staff_id")}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))
    finally:
        cursor.close()
        connection.close()

#get staff
@app.get("/staff", response_model=Dict)
def get_all_staff():

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("SELECT staff_id, first_name, middle_name, last_name, email, salary, age, date_hired, staff_type FROM staff")
        rows = cursor.fetchall()
        if rows is None:
            rows = []
        # serialize any date fields
        rows = [_serialize_row_dates(r) for r in rows]
        return {"status": "success", "count": len(rows), "data": rows}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))
    finally:
        cursor.close()
        connection.close()

#get scouts
@app.get("/scouts", response_model=Dict)
def get_all_scouts():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT s.staff_id, st.first_name, st.middle_name, st.last_name, st.email, s.region, s.YOE
            FROM scout s
            JOIN staff st ON s.staff_id = st.staff_id
            ORDER BY st.last_name, st.first_name
        """)
        rows = cursor.fetchall()
        if rows is None:
            rows = []
        rows = [_serialize_row_dates(r) for r in rows]
        return {"status": "success", "count": len(rows), "data": rows}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))
    finally:
        cursor.close()
        connection.close()


#player data
@app.get("/players", response_model=Dict)
def get_all_players():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT player_id, first_name, middle_name, last_name, salary, positions, is_active, is_injured, transfer_value, contract_end_date, scouted_player
            FROM player
            ORDER BY last_name, first_name
        """)
        rows = cursor.fetchall()
        if rows is None:
            rows = []
        rows = [_serialize_row_dates(r) for r in rows]
        return {"status": "success", "count": len(rows), "data": rows}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))
    finally:
        cursor.close()
        connection.close()

#this might be buggy due to the DATE time to normal date conversion

@app.get("/fixtures", reponse_model=Dict)
def get_fixtures():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT match_id, name, venue, match_time, opponent_team, match_date, result
            FROM match_table
            ORDER BY match_date ASC, match_time ASC
        """)
        rows = cursor.fetchall()
        if rows is None:
            rows = []
        # serialize date/time fields
        serialized = []
        for r in rows:
            serialized.append(_serialize_row_dates(r))
        return {"status": "success", "count": len(serialized), "data": serialized}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))
    finally:
        cursor.close()
        connection.close()



@app.get("/fixtures/upcoming", response_model=Dict)
def get_upcoming_fixtures():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT match_id, name, venue, match_time, opponent_team, match_date, result
            FROM match_table
            WHERE match_date >= CURDATE()
            ORDER BY match_date ASC, match_time ASC
        """)
        rows = cursor.fetchall()
        if rows is None:
            rows = []
        # serialize date/time fields
        serialized = []
        for r in rows:
            serialized.append(_serialize_row_dates(r))
        return {"status": "success", "count": len(serialized), "data": serialized}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))
    finally:
        cursor.close()
        connection.close()

