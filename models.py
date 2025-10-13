from db_connect_module import get_db_connection


#do we want login , sanitization, validation, error handling etc

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



#can prob do this later if we add more depending on the framework 