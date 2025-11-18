import mysql.connector
from datetime import date, datetime, time as dtime
import uvicorn
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from typing import Dict, Optional
from db_connect_module import get_db_connection
from models import (
    Staff,
    Coach,
    Player,
    Scout,
    MedicalReport,
    MedicalStaff,
    Formation,
    Lineup,
    StaffCreate,
    LoginRequest,
    CoachCreate,
    PlayerCreate,
    MedicalReportCreate,
    ScoutCreate,
    MedicalStaffCreate,
    FormationCreate,
    LineupCreate,
    StaffAccountCreate
)
from werkzeug.security import check_password_hash, generate_password_hash

load_dotenv()

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

@app.get("/staff/{staff_id}", response_model=Dict)
def get_staff_by_id(staff_id: int):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT staff_id, first_name, middle_name, last_name, email, 
                   salary, age, date_hired, staff_type 
            FROM staff 
            WHERE staff_id = %s
        """, (staff_id,))
        row = cursor.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="Staff member not found")
        
        row = _serialize_row_dates(row)
        return {"status": "success", "data": row}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))
    finally:
        if cursor:
            cursor.close()
        if connection:
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
        if cursor:
            cursor.close()
        if connection:
            connection.close()

# this is set up weird since we need to have the staff memember already in the system for them to create a account
# so we can prob have it where still the DBA needs to create the staff 
# memeber but the staff memeber itself can create its own account


@app.post("/create_account", status_code=201)
def create_account(payload: StaffAccountCreate):
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        # Ensure staff exists
        cursor.execute("SELECT staff_id FROM staff WHERE staff_id = %s", (payload.staff_id,))
        if cursor.fetchone() is None:
            raise HTTPException(status_code=404, detail="Staff member not found")

        # Check username isn't already taken
        cursor.execute("SELECT username FROM staff_account WHERE username = %s", (payload.username,))
        if cursor.fetchone() is not None:
            raise HTTPException(status_code=409, detail="Username already exists")

        # Check account doesn't already exist for this staff member
        cursor.execute("SELECT staff_id FROM staff_account WHERE staff_id = %s", (payload.staff_id,))
        if cursor.fetchone() is not None:
            raise HTTPException(status_code=409, detail="Account already exists for this staff.")

        # Hash the password and store the account
        password_hash = generate_password_hash(payload.password, method='pbkdf2:sha256', salt_length=12)
        cursor.execute(
            "INSERT INTO staff_account (staff_id, username, password_hash, is_active) VALUES (%s, %s, %s, %s)",
            (payload.staff_id, payload.username, password_hash, payload.is_active)
        )
        connection.commit()
        return {"status": "success", "staff_id": payload.staff_id}
    except mysql.connector.IntegrityError as err:
        raise HTTPException(status_code=409, detail=str(err))
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))
    finally:
        if cursor:
            cursor.close()
        if connection:
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
        if cursor:
            cursor.close()
        if connection:
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
        if cursor:
            cursor.close()
        if connection:
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
        if cursor:
            cursor.close()
        if connection:
            connection.close()


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
        if cursor:
            cursor.close()
        if connection:
            connection.close()


@app.get("/coaches", response_model=Dict)
def get_all_coaches():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT c.staff_id, st.first_name, st.middle_name, st.last_name, st.email, c.role, c.team_id
            FROM coach c
            JOIN staff st ON c.staff_id = st.staff_id
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
        if cursor:
            cursor.close()
        if connection:
            connection.close()



@app.post("/coach/create", status_code=201)
def create_coach(coach: CoachCreate):
    try:
        staff_id = Coach.create(coach)
        return {"status": "success", "staff_id": staff_id}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))



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
    finally:
        if file:
            await file.close()
            photo_bytes = None
            content_type = None
            filename = None
            size = None


@app.post("/scout/create", status_code=201)
def create_scout(scout: ScoutCreate):
    try:
        staff_id = Scout.create(scout)
        return {"status": "success", "staff_id": staff_id}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))

@app.get("/medical_staff", status_code=200)
def get_all_medical_staff():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT ms.staff_id, st.first_name, st.middle_name, st.last_name, st.email, ms.med_specialization, ms.certification, ms.YOE
            FROM medical_staff ms
            JOIN staff st ON ms.staff_id = st.staff_id
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
        if cursor:
            cursor.close()
        if connection:
            connection.close()

@app.post("/medical_staff/create", status_code=201)
def create_medical_staff(ms: MedicalStaffCreate):
    try:
        staff_id = MedicalStaff.create(ms)
        return {"status": "success", "staff_id": staff_id}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))


@app.post("/medical_report/create", status_code=201)
def create_medical_report(mr: MedicalReportCreate):
    try:
        med_report_id = MedicalReport.create(mr)
        return {"status": "success", "med_report_id": med_report_id}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))



@app.get("/medical_reports/{player_id}", response_model=Dict)
def get_all_medical_reports(player_id: int):
    """Return all medical reports for a player, with linked medical conditions nested per report"""
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT
                mr.med_report_id,
                mr.player_id,
                p.first_name,
                p.middle_name,
                p.last_name,
                mr.summary,
                mr.report_date,
                mr.treatment,
                mr.severity_of_injury,
                mc.condition_id,
                mc.condition_name,
                mc.description AS condition_description,
                mc.diagnosis_date
            FROM medical_report mr
            JOIN player p ON mr.player_id = p.player_id
            LEFT JOIN medical_condition mc ON mc.med_report_id = mr.med_report_id
            WHERE mr.player_id = %s
            ORDER BY mr.report_date DESC, mc.diagnosis_date DESC
        """, (player_id,))
        rows = cursor.fetchall()
        if rows is None:
            rows = []

        # Group rows by med_report_id and accumulate conditions into a list for each report
        reports_by_id = {}
        for r in rows:
            report_id = r.get('med_report_id')
            if report_id not in reports_by_id:
                report = {
                    'med_report_id': report_id,
                    'player_id': r.get('player_id'),
                    'player_first_name': r.get('first_name'),
                    'player_middle_name': r.get('middle_name'),
                    'player_last_name': r.get('last_name'),
                    'summary': r.get('summary'),
                    'report_date': r.get('report_date'),
                    'treatment': r.get('treatment'),
                    'severity_of_injury': r.get('severity_of_injury'),
                    'conditions': []
                }
                reports_by_id[report_id] = report

            # If there is a condition row (may be NULL if no conditions linked), append it
            if r.get('condition_id') is not None:
                cond = {
                    'condition_id': r.get('condition_id'),
                    'condition_name': r.get('condition_name'),
                    'description': r.get('condition_description'),
                    'diagnosis_date': r.get('diagnosis_date')
                }
                reports_by_id[report_id]['conditions'].append(_serialize_row_dates(cond))

        # Prepare final list with serialized report dates
        result = []
        for rep in reports_by_id.values():
            rep_serialized = _serialize_row_dates(rep)
            result.append(rep_serialized)

        return {"status": "success", "count": len(result), "data": result}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))
    finally:
        if cursor:
            cursor.close()
        if connection:
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
        if cursor:
            cursor.close()
        if connection:
            connection.close()

@app.post("/formation/create", status_code=201)
def create_formation(payload: FormationCreate):
    try:
        formation_id = Formation.create(payload)
        return {"status": "success", "formation_id": formation_id}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))

@app.post("/lineup/create", status_code=201)
def create_lineup(payload: LineupCreate):
    try:
        lineup_id = Lineup.create_with_slots(payload)
        return {"status": "success", "lineup_id": lineup_id}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))


@app.get("/formations", response_model=Dict)
def get_all_formations():
    """Get all available formations"""
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT formation_id, code, name
            FROM formation
            ORDER BY code
        """)
        rows = cursor.fetchall()
        if rows is None:
            rows = []
        return {"status": "success", "count": len(rows), "data": rows}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


@app.get("/lineups", response_model=Dict)
def get_all_lineups():
    """Get all saved lineups"""
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT 
                ml.lineup_id, 
                ml.match_id, 
                ml.team_id, 
                ml.formation_id,
                ml.is_starting,
                ml.minute_applied,
                f.code as formation_code,
                f.name as formation_name,
                m.name as match_name,
                m.match_date,
                t.team_name
            FROM match_lineup ml
            JOIN formation f ON f.formation_id = ml.formation_id
            LEFT JOIN match_table m ON m.match_id = ml.match_id
            LEFT JOIN team t ON t.team_id = ml.team_id
            ORDER BY ml.lineup_id DESC
        """)
        rows = cursor.fetchall()
        if rows is None:
            rows = []
        rows = [_serialize_row_dates(r) for r in rows]
        return {"status": "success", "count": len(rows), "data": rows}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


@app.get("/lineups/{lineup_id}", response_model=Dict)
def get_lineup_details(lineup_id: int):
    """Get detailed lineup with all players and positions"""
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        # Get lineup header
        cursor.execute("""
            SELECT 
                ml.lineup_id, 
                ml.match_id, 
                ml.team_id, 
                ml.formation_id,
                ml.is_starting,
                ml.minute_applied,
                f.code as formation_code,
                f.name as formation_name
            FROM match_lineup ml
            JOIN formation f ON f.formation_id = ml.formation_id
            WHERE ml.lineup_id = %s
        """, (lineup_id,))
        lineup = cursor.fetchone()
        
        if not lineup:
            raise HTTPException(status_code=404, detail="Lineup not found")
        
        # Get all slots with players
        cursor.execute("""
            SELECT 
                mls.slot_no,
                mls.player_id,
                mls.jersey_number,
                mls.captain,
                p.first_name,
                p.middle_name,
                p.last_name,
                p.positions
            FROM match_lineup_slot mls
            JOIN player p ON p.player_id = mls.player_id
            WHERE mls.lineup_id = %s
            ORDER BY mls.slot_no
        """, (lineup_id,))
        slots = cursor.fetchall()
        
        lineup = _serialize_row_dates(lineup)
        lineup['slots'] = slots if slots else []
        
        return {"status": "success", "data": lineup}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()



@app.get("/medical_reports", response_model=Dict)
def get_all_medical_reports_all_players():
    """Return all medical reports across all players, with linked medical conditions nested per report"""
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT
                mr.med_report_id,
                mr.player_id,
                p.first_name,
                p.middle_name,
                p.last_name,
                mr.summary,
                mr.report_date,
                mr.treatment,
                mr.severity_of_injury,
                mc.condition_id,
                mc.condition_name,
                mc.description AS condition_description,
                mc.diagnosis_date
            FROM medical_report mr
            JOIN player p ON mr.player_id = p.player_id
            LEFT JOIN medical_condition mc ON mc.med_report_id = mr.med_report_id
            ORDER BY mr.report_date DESC, mc.diagnosis_date DESC
        """)
        rows = cursor.fetchall()
        if rows is None:
            rows = []

        # Group rows by med_report_id and accumulate conditions into a list for each report
        reports_by_id = {}
        for r in rows:
            report_id = r.get('med_report_id')
            if report_id not in reports_by_id:
                report = {
                    'med_report_id': report_id,
                    'player_id': r.get('player_id'),
                    'player_first_name': r.get('first_name'),
                    'player_middle_name': r.get('middle_name'),
                    'player_last_name': r.get('last_name'),
                    'summary': r.get('summary'),
                    'report_date': r.get('report_date'),
                    'treatment': r.get('treatment'),
                    'severity_of_injury': r.get('severity_of_injury'),
                    'conditions': []
                }
                reports_by_id[report_id] = report

            # If there is a condition row (may be NULL if no conditions linked), append it
            if r.get('condition_id') is not None:
                cond = {
                    'condition_id': r.get('condition_id'),
                    'condition_name': r.get('condition_name'),
                    'description': r.get('condition_description'),
                    'diagnosis_date': r.get('diagnosis_date')
                }
                reports_by_id[report_id]['conditions'].append(_serialize_row_dates(cond))

        # Prepare final list with serialized report dates
        result = []
        for rep in reports_by_id.values():
            rep_serialized = _serialize_row_dates(rep)
            result.append(rep_serialized)

        return {"status": "success", "count": len(result), "data": result}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

@app.get("/player_details/{player_id}", response_model=Dict)
def get_player_details(player_id: int):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT 
                player_id,
                first_name,
                middle_name,
                last_name,
                salary,
                positions,
                is_active,
                is_injured,
                transfer_value,
                contract_end_date,
                scouted_player
            FROM player
            WHERE player_id = %s
        """, (player_id,))
        player = cursor.fetchone()
        
        if not player:
            raise HTTPException(status_code=404, detail="Player not found")
        
        player = _serialize_row_dates(player)
        
        # Get medical reports for the player
        cursor.execute("""
            SELECT
                mr.med_report_id,
                mr.summary,
                mr.report_date,
                mr.treatment,
                mr.severity_of_injury
            FROM medical_report mr
            WHERE mr.player_id = %s
            ORDER BY mr.report_date DESC
        """, (player_id,))
        reports = cursor.fetchall()
        
        player['medical_reports'] = [_serialize_row_dates(r) for r in reports] if reports else []
        
        # Get match stats for the player across matches
        cursor.execute("""
            SELECT
                pms.pms_id,
                pms.player_id,
                pms.match_id,
                m.name AS match_name,
                m.match_date,
                m.match_time,
                pms.team_id,
                t.name AS team_name,
                pms.started,
                pms.tackles,
                pms.minutes,
                pms.shots_total,
                pms.offsides,
                pms.red_cards,
                pms.yellow_cards,
                pms.fouls_committed,
                pms.dribbles_attempted,
                pms.assists,
                pms.goals,
                pms.passing_accuracy
            FROM player_match_stats pms
            LEFT JOIN match_table m ON pms.match_id = m.match_id
            LEFT JOIN team t ON pms.team_id = t.team_id
            WHERE pms.player_id = %s
            ORDER BY m.match_date DESC, m.match_time DESC
        """, (player_id,))
        pms_rows = cursor.fetchall()
        player['match_stats'] = [_serialize_row_dates(r) for r in pms_rows] if pms_rows else []
        
        return {"status": "success", "data": player}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()



if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

