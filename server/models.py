from db_connect_module import get_db_connection
from typing import Optional, Dict
from pydantic import BaseModel, EmailStr, Field
from datetime import date


class StaffCreate(BaseModel): 
    first_name: str
    middle_name: Optional[str] = None
    last_name: str
    email: EmailStr
    salary: float = Field(..., ge=0)              
    age: int = Field(..., ge=14, le=120)   
    staff_type: str



class MedicalStaffCreate(BaseModel):
    staff_id: int
    med_specialization: str
    certification: str
    YOE: int


class LoginRequest(BaseModel):
    username: str
    password: str


class StaffAccountCreate(BaseModel):
    staff_id: int
    username: str
    password: str
    is_active: Optional[bool] = True


class CoachCreate(BaseModel):
    staff_id: int
    role: str
    team_id: Optional[int] = None


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



class MedicalReportCreate(BaseModel):
    player_id: int
    summary: Optional[str] = None
    report_date: date
    treatment: Optional[str] = None
    severity_of_injury: Optional[str] = None


class ScoutCreate(BaseModel):
    staff_id: int
    region: Optional[str] = None
    YOE: int

class FormationCreate(BaseModel):
    code: str
    name: Optional[str] = None
    roles: Optional[Dict[int, str]] = None  # {slot_no: custom_label}

class LineupCreate(BaseModel):
    match_id: int
    team_id: int
    formation_id: int
    is_starting: bool = True
    minute_applied: int = 0
    players: Dict[int, int]  # {slot_no: player_id}; expect keys 1..11



class Staff:
    def __init__(self, first_name, middle_name, last_name, email, salary, age, staff_type):
        self.first_name = first_name
        self.middle_name = middle_name
        self.last_name = last_name
        self.email = email
        self.salary = salary
        self.age = age
        self.staff_type = staff_type

    @staticmethod
    def create(staff):  
        conn = None
        cursor = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            query = """
            INSERT INTO staff (first_name, middle_name, last_name, email, salary, age, staff_type)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
            cursor.execute(query, (staff.first_name, staff.middle_name, staff.last_name,
                               staff.email, staff.salary, staff.age, staff.staff_type))
            last_id = cursor.lastrowid
            conn.commit()
        except Exception as e:
            print(f"Error creating staff: {e}")
            conn.rollback()
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()
        return last_id

class Coach:
    def __init__(self, staff_id, role, team_id=None):
        self.staff_id = staff_id
        self.role = role
        self.team_id = team_id

    @staticmethod
    def create(coach):
        conn = None
        cursor = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            query = """
            INSERT INTO coach (staff_id, role, team_id)
            VALUES (%s, %s, %s)
            """
            cursor.execute(query, (coach.staff_id, coach.role, coach.team_id))
            conn.commit()
        except Exception as e:
            print(f"Error creating coach: {e}")
            conn.rollback()
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()
        return coach.staff_id

class Player:
    def __init__(self, first_name, middle_name, last_name, salary, positions, 
                 is_active=True, is_injured=False, transfer_value=None, 
                 contract_end_date=None, scouted_player=False):
        self.first_name = first_name
        self.middle_name = middle_name
        self.last_name = last_name
        self.salary = salary
        self.positions = positions
        self.is_active = is_active
        self.is_injured = is_injured
        self.transfer_value = transfer_value
        self.contract_end_date = contract_end_date
        self.scouted_player = scouted_player

    @staticmethod
    def create(player):
        conn = None
        cursor = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            query = """
            INSERT INTO player (first_name, middle_name, last_name, salary, positions, 
                               is_active, is_injured, transfer_value, contract_end_date, scouted_player)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(query, (player.first_name, player.middle_name, player.last_name,
                                player.salary, player.positions, player.is_active,
                                player.is_injured, player.transfer_value, player.contract_end_date,
                                player.scouted_player))
            last_id = cursor.lastrowid
            conn.commit()
        except Exception as e:
            print(f"Error creating player: {e}")
            conn.rollback()
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()
        return last_id

    @staticmethod
    def create_with_photo(player, photo_bytes: bytes, photo_content_type: str, photo_filename: str, photo_size: int):
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
        INSERT INTO player (first_name, middle_name, last_name, salary, positions, 
                           is_active, is_injured, transfer_value, contract_end_date, scouted_player,
                           photo, photo_content_type, photo_filename, photo_size)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (
            player.first_name,
            player.middle_name,
            player.last_name,
            player.salary,
            player.positions,
            player.is_active,
            player.is_injured,
            player.transfer_value,
            player.contract_end_date,
            player.scouted_player,
            photo_bytes,
            photo_content_type,
            photo_filename,
            photo_size,
        ))
        last_id = cursor.lastrowid
        conn.commit()
        cursor.close()
        conn.close()
        return last_id

class Scout:
    def __init__(self, staff_id, region, YOE):
        self.staff_id = staff_id
        self.region = region
        self.YOE = YOE
    
    @staticmethod
    def create(scout):
        conn = None
        cursor = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            query = """
            INSERT INTO scout (staff_id, region, YOE)
            VALUES (%s, %s, %s)
            """
            cursor.execute(query, (scout.staff_id, scout.region, scout.YOE))
            conn.commit()
        except Exception as e:
            print(f"Error creating scout: {e}")
            conn.rollback()
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()
        return scout.staff_id


class MedicalStaff:
    def __init__(self, staff_id, med_specialization, certification, YOE=None):
        self.staff_id = staff_id
        self.med_specialization = med_specialization
        self.certification = certification
        self.YOE = YOE

    @staticmethod
    def create(medical_staff):
        conn = None
        cursor = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            query = """
            INSERT INTO med_staff (staff_id, med_specialization, certification, YOE)
            VALUES (%s, %s, %s, %s)
            """
            cursor.execute(query, (medical_staff.staff_id, medical_staff.med_specialization, medical_staff.certification, medical_staff.YOE))
            conn.commit()
        except Exception as e:
            print(f"Error creating medical staff: {e}")
            conn.rollback()
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()
        return medical_staff.staff_id



class MedicalReport:
    def __init__(self, player_id, summary, report_date, treatment=None, severity_of_injury=None):
        self.player_id = player_id
        self.summary = summary
        self.report_date = report_date
        self.treatment = treatment
        self.severity_of_injury = severity_of_injury

    @staticmethod
    def create(medical_report):
        conn = None
        cursor = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            query = """
            INSERT INTO medical_report (player_id, summary, report_date, treatment, severity_of_injury)
            VALUES (%s, %s, %s, %s, %s)
            """
            cursor.execute(query, (medical_report.player_id, medical_report.summary,
                                   medical_report.report_date, medical_report.treatment,
                                   medical_report.severity_of_injury))
            last_id = cursor.lastrowid
            conn.commit()
        except Exception as e:
            print(f"Error creating medical report: {e}")
            conn.rollback()
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()
        return last_id


class Formation:
    @staticmethod
    def create(f: FormationCreate) -> int:
        conn = None
        cursor = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("INSERT INTO formation (code, name) VALUES (%s, %s)", (f.code, f.name))
            formation_id = cursor.lastrowid
            if f.roles:
                for slot_no, label in f.roles.items():
                    cursor.execute(
                        "INSERT INTO formation_role (formation_id, slot_no, label) VALUES (%s, %s, %s)",
                        (formation_id, slot_no, label)
                    )
            conn.commit()
        except Exception as e:
            print(f"Error creating formation: {e}")
            conn.rollback()
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()
        return formation_id

class Lineup:
    @staticmethod
    def create_with_slots(lc: LineupCreate) -> int:
        conn = None
        cursor = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("""INSERT INTO match_lineup (match_id, team_id, formation_id, is_starting, minute_applied)
                           VALUES (%s,%s,%s,%s,%s)""",
                           (lc.match_id, lc.team_id, lc.formation_id, lc.is_starting, lc.minute_applied))
            lineup_id = cursor.lastrowid
            for slot_no, player_id in lc.players.items():
                cursor.execute("""INSERT INTO match_lineup_slot (lineup_id, slot_no, player_id)
                               VALUES (%s, %s, %s)""", (lineup_id, slot_no, player_id))
            conn.commit()
            return lineup_id
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()
