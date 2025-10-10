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
        date_hired date not null default(CURDATE()),
        staff_type varchar(50) not null
    )""")

cursor.execute("""
    create table if not exists coach
    (
        staff_id int  primary key,
        role varchar(50) not null,
        CONSTRAINT fk_coach
        CONSTRAINT fk_coach_staff
        FOREIGN KEY (staff_id) REFERENCES staff(staff_id)
        ON DELETE CASCADE ON UPDATE CASCADE
    )
    """)
cursor.execute("""
    create table if not exists scout
    (
        staff_id int primary key,
        region varchar(100),
        YOE int not null,
      CONSTRAINT fk_scout_staff
        FOREIGN KEY (staff_id) REFERENCES staff(staff_id)
        ON DELETE CASCADE ON UPDATE CASCADE
    )
    """)
cursor.execute("""
    create table if not exists med_staff
    (
        staff_id int primary key,
        med_specialization varchar(100) not null,
        certification varchar)(100) not null,
        YOE int not null,
        CONSTRAINT fk_med_staff_staff
        FOREIGN KEY (staff_id) REFERENCES staff(staff_id)
        ON DELETE CASCADE ON UPDATE CASCADE
    )
    """)

cursor.execute("""
create table if not exists player 
(
    player_id int auto_increment primary key,
    first_name VARCHAR(50) NOT NULL,
    middle_name VARCHAR(50),
    last_name VARCHAR(50) NOT NULL,
    salary DECIMAL(10,2) NOT NULL,
    positions VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    is_injured BOOLEAN DEFAULT FALSE,
    transfer_value DECIMAL(10,2),
    contract_end_date DATE NOT NULL
)
""")

cursor.execute("""
create table if not exists team
(
    team_id int auto_increment primary key,
    name varchar(100) not null,
    level varchar(50),
    date_created date not null default(CURDATE())
)
""")

cursor.execute("""
create table if not exists medical_report 
(
    med_report_id int auto_increment primary key,
    player_id int not null,
    summary text,
    report_date date not null,
    treatment text,
    severity_of_injury varchar(50),
    CONSTRAINT fk_med_report_player FOREIGN KEY (player_id)
        REFERENCES player(player_id)
        ON DELETE CASCADE
)
""")

# Conditions table
cursor.execute("""
create table if not exists medical_condition 
(
    condition_id int auto_increment primary key,
    med_report_id int,
    condition_name varchar(100) not null,
    description text,
    diagnosis_date date,
    CONSTRAINT fk_condition_med_report FOREIGN KEY (med_report_id)
        REFERENCES medical_report(med_report_id)
        ON DELETE CASCADE
)
""")

cursor.execute("""
create table if not exists match_table 
(
    match_id int auto_increment primary key,
    name varchar(100) not null,
    venue varchar(100),
    match_time time,
    opponent_team varchar   (100),
    match_date date,
    result varchar(50)
)
""")


cursor.execute("""
create table if not exists scouting_report 
(
    report_id int auto_increment primary key,
    scout_id int,
    target_player_name varchar(100),
    report_date date,
    report_desc text,
    CONSTRAINT fk_scouting_scout FOREIGN KEY (scout_id)
        REFERENCES scout(staff_id)
        ON DELETE CASCADE
)
""")

cursor.execute("""
create table if not exists player_match_stats 
(
    pms_id int auto_increment primary key,
    player_id int,
    match_id int,
    team_id int,
    started BOOLEAN DEFAULT FALSE,
    tackles INT DEFAULT 0,
    minutes INT DEFAULT 0,
    shots_total INT DEFAULT 0,
    offsides INT DEFAULT 0,
    red_cards INT DEFAULT 0,
    yellow_cards INT DEFAULT 0,
    fouls_committed INT DEFAULT 0,
    dribbles_attempted INT DEFAULT 0,
    assists INT DEFAULT 0,
    goals INT DEFAULT 0,
    passing_accuracy DECIMAL(5,2) DEFAULT 0,
    CONSTRAINT fk_pms_player FOREIGN KEY (player_id) REFERENCES player(player_id) ON DELETE CASCADE,
    CONSTRAINT fk_pms_match FOREIGN KEY (match_id) REFERENCES match_table(match_id) ON DELETE CASCADE,
    CONSTRAINT fk_pms_team FOREIGN KEY (team_id) REFERENCES team(team_id) ON DELETE CASCADE
)
""")


#  CONSTRAINT fk_coach
#    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE
#idk what the hell we want here lol :cry: