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