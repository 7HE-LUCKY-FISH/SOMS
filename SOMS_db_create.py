import mysql.connector
from mysql.connector import Error
import os
import time
import dotenv
dotenv.load_dotenv()    


for _ in range(10):
    try:
        mydb = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            user=os.getenv('DB_USER', 'root'),   #we can change to port vs socket if needed
            password=os.getenv('DB_PASSWORD', 'adminpass'),#change password here or grab from env  DO ENV!!!!!!!!!!!!
            auth_plugin='mysql_native_password'
        )
        break
    except Error:
        print("Waiting for database connection...")
        time.sleep(5)
else:
    print("Could not connect to the database.")
    exit(1)



cursor = mydb.cursor()

cursor.execute("CREATE DATABASE IF NOT EXISTS SOMS")
cursor.execute("USE SOMS")

#DDL to create tables


cursor.execute("""
    create table if not exists staff
    ( staff_id int auto_increment primary key,
        first_name varchar(50) not null,
        middle_name varchar(50),
        last_name varchar(50) not null,
        email varchar(100) not null unique,
        salary decimal(10,2) not null,
        age int not null,
        date_hired date not null default(current_date)
    )
    """)

cursor.execute("""
    create table if not exists coach(
        staff_id int auto_increment primary key,
        role varchar(50) not null
    )
    """)

#  CONSTRAINT fk_coach
#    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE
#idk what the hell we want here lol :cry: