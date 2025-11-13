import os
import mysql.connector
from datetime import date, datetime, time as dtime

from fastapi import FastAPI, Request, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from typing import Dict
from db_connect_module import get_db_connection
from models import (
    Staff,
    Coach,
    Player,
    Scout,
    MedicalReport,
    MedicalStaff,
    StaffCreate,
    LoginRequest,
)
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


@app.post("/staff/create", status_code=201)
def create_staff_member(staff: StaffCreate):
    try:
        staff_id = Staff.create(staff)
        return {"status": "success", "staff_id": staff_id}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))


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

@app.get("/fixtures", response_model=Dict)
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


# --- Create endpoints for models ---
class CoachCreate(BaseModel):
    staff_id: int
    role: str
    team_id: Optional[int] = None


@app.post("/coach/create", status_code=201)
def create_coach(coach: CoachCreate):
    try:
        staff_id = Coach.create(coach)
        return {"status": "success", "staff_id": staff_id}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))


class PlayerCreate(BaseModel):
    first_name: str
    middle_name: Optional[str] = None
    last_name: str
    salary: float
    positions: Optional[str] = None
    is_active: Optional[bool] = True
    is_injured: Optional[bool] = False
    transfer_value: Optional[float] = None
    contract_end_date: Optional[date] = None
    scouted_player: Optional[bool] = False


@app.post("/player/create", status_code=201)
def create_player(player: PlayerCreate):
    try:
        player_id = Player.create(player)
        return {"status": "success", "player_id": player_id}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))


@app.post("/player/create-with-photo", status_code=201)
async def create_player_with_photo(
    first_name: str = Form(...),
    middle_name: Optional[str] = Form(None),
    last_name: str = Form(...),
    salary: float = Form(...),
    positions: Optional[str] = Form(None),
    is_active: Optional[bool] = Form(True),
    is_injured: Optional[bool] = Form(False),
    transfer_value: Optional[float] = Form(None),
    contract_end_date: Optional[str] = Form(None),
    scouted_player: Optional[bool] = Form(False),
    file: UploadFile = File(None),
):
    # build Player instance
    contract_date = None
    if contract_end_date:
        try:
            contract_date = date.fromisoformat(contract_end_date)
        except Exception:
            raise HTTPException(status_code=400, detail="contract_end_date must be YYYY-MM-DD")

    player_obj = Player(
        first_name=first_name,
        middle_name=middle_name,
        last_name=last_name,
        salary=salary,
        positions=positions,
        is_active=is_active,
        is_injured=is_injured,
        transfer_value=transfer_value,
        contract_end_date=contract_date,
        scouted_player=scouted_player,
    )

    photo_bytes = None
    content_type = None
    filename = None
    size = None
    if file is not None:
        try:
            photo_bytes = await file.read()
            content_type = file.content_type
            filename = file.filename
            size = len(photo_bytes)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error reading uploaded file: {e}")

    try:
        player_id = Player.create_with_photo(player_obj, photo_bytes, content_type, filename, size)
        return {"status": "success", "player_id": player_id}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))


class ScoutCreate(BaseModel):
    staff_id: int
    region: Optional[str] = None
    YOE: int


@app.post("/scout/create", status_code=201)
def create_scout(scout: ScoutCreate):
    try:
        staff_id = Scout.create(scout)
        return {"status": "success", "staff_id": staff_id}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))


class MedicalStaffCreate(BaseModel):
    staff_id: int
    med_specialization: str
    certification: str
    YOE: int


@app.post("/medical_staff/create", status_code=201)
def create_medical_staff(ms: MedicalStaffCreate):
    try:
        staff_id = MedicalStaff.create(ms)
        return {"status": "success", "staff_id": staff_id}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))


class MedicalReportCreate(BaseModel):
    player_id: int
    summary: Optional[str] = None
    report_date: date
    treatment: Optional[str] = None
    severity_of_injury: Optional[str] = None


@app.post("/medical_report/create", status_code=201)
def create_medical_report(mr: MedicalReportCreate):
    try:
        med_report_id = MedicalReport.create(mr)
        return {"status": "success", "med_report_id": med_report_id}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))



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




