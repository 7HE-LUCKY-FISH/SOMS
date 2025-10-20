from db_connect_module import get_db_connection


#do we want login , sanitization, validation, error handling etc
# there is optimization as python classes are slow
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
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
        INSERT INTO staff (first_name, middle_name, last_name, email, salary, age, staff_type)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (staff.first_name, staff.middle_name, staff.last_name, 
                               staff.email, staff.salary, staff.age, staff.staff_type))
        conn.commit()
        cursor.close()
        conn.close()

class Coach:
    def __init__(self, staff_id, role, team_id=None):
        self.staff_id = staff_id
        self.role = role
        self.team_id = team_id

    @staticmethod
    def create(coach):
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
        INSERT INTO coach (staff_id, role, team_id)
        VALUES (%s, %s, %s)
        """
        cursor.execute(query, (coach.staff_id, coach.role, coach.team_id))
        conn.commit()
        cursor.close()
        conn.close()

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
        conn.commit()
        cursor.close()
        conn.close() 

class Scout:
    def __init__(self, staff_id, region, YOE):
        self.staff_id = staff_id
        self.region = region
        self.YOE = YOE
    
    @staticmethod
    def create(scout):
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
        INSERT INTO scout (staff_id, region, YOE)
        VALUES (%s, %s, %s)
        """
        cursor.execute(query, (scout.staff_id, scout.region, scout.YOE))
        conn.commit()
        cursor.close()
        conn.close()


class MedicalStaff:
    def __init__(self, staff_id, specialization, qualification):
        self.staff_id = staff_id
        self.specialization = specialization
        self.qualification = qualification

    @staticmethod
    def create(medical_staff):
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
        INSERT INTO medical_staff (staff_id, specialization, qualification)
        VALUES (%s, %s, %s)
        """
        cursor.execute(query, (medical_staff.staff_id, medical_staff.specialization, medical_staff.qualification))
        conn.commit()
        cursor.close()
        conn.close()



class MedicalReport:
    def __init__(self, player_id, summary, report_date, treatment=None, severity_of_injury=None):
        self.player_id = player_id
        self.summary = summary
        self.report_date = report_date
        self.treatment = treatment
        self.severity_of_injury = severity_of_injury

    @staticmethod
    def create(medical_report):
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
        INSERT INTO medical_report (player_id, summary, report_date, treatment, severity_of_injury)
        VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(query, (medical_report.player_id, medical_report.summary, 
                               medical_report.report_date, medical_report.treatment, 
                               medical_report.severity_of_injury))
        conn.commit()
        cursor.close()
        conn.close()
