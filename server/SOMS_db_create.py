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
create table if not exists team
(
    team_id int auto_increment primary key,
    name varchar(100) not null,
    level varchar(50),
    date_created date not null default(CURDATE()),
    unique key uq_team_name (name)
);
""")

cursor.execute("""
    INSERT IGNORE INTO team (team_id, name, level) VALUES (1, 'SOMS FC', 'Senior');
""")

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
    );
""")

cursor.execute("""
    create table if not exists coach
    (
        staff_id int  primary key,
        role varchar(50) not null,
        team_id int null, 
        CONSTRAINT fk_coach_staff
        FOREIGN KEY (staff_id) REFERENCES staff(staff_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_coach_team
        FOREIGN KEY (team_id) REFERENCES team(team_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
        INDEX idx_coach_team (team_id)
    );
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
    );
    """)
cursor.execute("""
    create table if not exists med_staff
    (
        staff_id int primary key,
        med_specialization varchar(100) not null,
        certification varchar(100) not null,
        YOE int not null,
        CONSTRAINT fk_med_staff_staff
        FOREIGN KEY (staff_id) REFERENCES staff(staff_id)
        ON DELETE CASCADE ON UPDATE CASCADE
    );
    """)

# Player table now includes LONGBLOB columns for a single profile photo and metadata
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
    contract_end_date DATE NOT NULL,
    scouted_player BOOLEAN DEFAULT FALSE,
    team_id INT NULL,
    -- profile photo stored in the DB (LONGBLOB): binary, content type, filename, size and timestamp
    photo LONGBLOB,
    photo_content_type VARCHAR(100),
    photo_filename VARCHAR(255),
    photo_size BIGINT,
    photo_uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_player_team FOREIGN KEY (team_id) REFERENCES team(team_id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_player_team (team_id)
);
""")
#scouted_player indicates if the player is being scouted and not on team



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
        ON DELETE CASCADE,
    INDEX idx_medrep_player (player_id)
);
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
        ON DELETE CASCADE,
    INDEX idx_condition_med_report (med_report_id)
);
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
);
""")


cursor.execute("""
create table if not exists scouting_report 
(
    report_id int auto_increment primary key,
    scout_id int,
    target_player_name varchar(100),
    target_player_id int,
    report_date date,
    report_desc text,
    CONSTRAINT fk_scouting_scout FOREIGN KEY (scout_id)
        REFERENCES scout(staff_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_scouting_target_player FOREIGN KEY (target_player_id)
        REFERENCES player(player_id)
        ON DELETE CASCADE,
    INDEX idx_scouting_scout (scout_id),
    INDEX idx_scouting_target_player (target_player_id)
);
""")

#this is staff account make sure this is working I am doing this on a text editor right 
#with no highlighting


cursor.execute("""
create table if not exists staff_account(
 staff_id int primary key, 
 username varchar(64) not null unique, 
 password_hash varchar(255) not null, 
 is_active boolean default true, 
 last_login datetime null,
   CONSTRAINT fk_staff_account_staff
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id)
    ON DELETE CASCADE ON UPDATE CASCADE
);
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
);
""")

#quick convenience view for medical staff to see player medical summaries
cursor.execute("""
    create or replace view vw_player_medical_summary as
    select p.player_id, 
    concat_ws(' ', p.first_name, p.middle_name, p.last_name) as player_name,
  mr.med_report_id,
  mr.report_date,
  mr.severity_of_injury,
  mc.condition_id,
  mc.condition_name,
  mc.diagnosis_date
FROM player p
JOIN medical_report mr ON mr.player_id = p.player_id
LEFT JOIN medical_condition mc ON mc.med_report_id = mr.med_report_id;
""")


cursor.execute("""
    CREATE TABLE IF NOT EXISTS role_number (
    slot_no TINYINT UNSIGNED PRIMARY KEY,
    default_label VARCHAR(50) NOT NULL
    );
    """)
cursor.execute("""
    INSERT IGNORE INTO role_number (slot_no, default_label) VALUES
    (1, 'Goalkeeper'),
    (2, 'Right Fullback'),
    (3, 'Left Fullback'),
    (4, 'Center Back'),
    (5, 'Center Back (or Sweeper)'),
    (6, 'Defending/Holding Midfielder'),
    (7, 'Right Midfielder/Winger'),
    (8, 'Central/Box-to-Box Midfielder'),
    (9, 'Striker'),
    (10,'Attacking Midfielder/Playmaker'),
    (11,'Left Midfielder/Winger');
    """)

cursor.execute("""
   CREATE TABLE IF NOT EXISTS formation (
  formation_id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,  -- e.g. '4-4-2'
  name VARCHAR(100)
    );
            
""")

cursor.execute("""
    INSERT IGNORE INTO formation (formation_id, code, name) VALUES 
    (1, '4-3-3', '4-3-3 Standard'),
    (2, '4-4-2', '4-4-2 Standard'),
    (3, '4-2-3-1', '4-2-3-1 Wide'),
    (4, '3-5-2', '3-5-2 Attacking');
""")


cursor.execute("""
    CREATE TABLE IF NOT EXISTS formation_role (
    formation_id INT NOT NULL,
    slot_no TINYINT UNSIGNED NOT NULL,
    label VARCHAR(50) NOT NULL,
    PRIMARY KEY (formation_id, slot_no),
    CONSTRAINT fk_fr_form FOREIGN KEY (formation_id) REFERENCES formation(formation_id) ON DELETE CASCADE,
    CONSTRAINT fk_fr_slot FOREIGN KEY (slot_no) REFERENCES role_number(slot_no) ON DELETE RESTRICT
);
""")

cursor.execute("""
    CREATE TABLE IF NOT EXISTS match_lineup (
    lineup_id INT AUTO_INCREMENT PRIMARY KEY,
    match_id INT NOT NULL,
    team_id INT NOT NULL,
    formation_id INT NOT NULL,
    is_starting BOOLEAN DEFAULT TRUE,
    minute_applied SMALLINT UNSIGNED DEFAULT 0,  -- 0 = kickoff
    CONSTRAINT fk_ml_match FOREIGN KEY (match_id) REFERENCES match_table(match_id) ON DELETE CASCADE,
    CONSTRAINT fk_ml_team  FOREIGN KEY (team_id)  REFERENCES team(team_id)         ON DELETE CASCADE,
    CONSTRAINT fk_ml_form  FOREIGN KEY (formation_id) REFERENCES formation(formation_id) ON DELETE RESTRICT,
    INDEX idx_ml_match_team (match_id, team_id)
);                  
""")



cursor.execute("""
    CREATE TABLE IF NOT EXISTS match_lineup_slot (
    lineup_slot_id INT AUTO_INCREMENT PRIMARY KEY,
    lineup_id INT NOT NULL,
    slot_no TINYINT UNSIGNED NOT NULL,
    player_id INT NOT NULL,
    jersey_number INT,
    captain BOOLEAN DEFAULT FALSE,
    UNIQUE KEY uq_lineup_slot (lineup_id, slot_no),
    UNIQUE KEY uq_lineup_player (lineup_id, player_id),
    CONSTRAINT fk_mls_lineup FOREIGN KEY (lineup_id) REFERENCES match_lineup(lineup_id) ON DELETE CASCADE,
    CONSTRAINT fk_mls_slot   FOREIGN KEY (slot_no)   REFERENCES role_number(slot_no) ON DELETE RESTRICT,
    CONSTRAINT fk_mls_player FOREIGN KEY (player_id) REFERENCES player(player_id) ON DELETE RESTRICT
);               
""")


cursor.execute("""
    create or replace view v_lineup_roles as
    select
    ml.lineup_id, ml.match_id, ml.team_id, ml.is_starting, ml.minute_applied,
    f.formation_id, f.code as formation_code,
    mls.slot_no,
    coalesce(fr.label, rn.default_label) as role_label,
    p.player_id,
    concat_ws(' ', p.first_name, p.last_name) as player_name
    from match_lineup ml
    join formation f            on f.formation_id = ml.formation_id
    join match_lineup_slot mls  on mls.lineup_id   = ml.lineup_id
    left join formation_role fr on fr.formation_id = ml.formation_id
                            and fr.slot_no      = mls.slot_no
    join role_number rn         on rn.slot_no      = mls.slot_no
    join player p               on p.player_id     = mls.player_id;
               
""")



#someone test for stability and performance

# Insert sample players with images
players_data = [
('Andre', None, 'Onana', 7000000.00, 'GK', 1, 0, 35000000.00, '2028-06-30', 0, 'player_images/Onana.png'),
('Altay', None, 'Bayindir', 3000000.00, 'GK', 1, 0, 8000000.00, '2027-06-30', 0, 'player_images/Bayindir.png'),
('Tom', None, 'Heaton', 1500000.00, 'GK', 1, 0, 1000000.00, '2025-06-30', 0, 'player_images/Heaton.png'),

('Diogo', None, 'Dalot', 4000000.00, 'RB', 1, 0, 25000000.00, '2028-06-30', 0, 'player_images/Dalot.png'),
('Aaron', None, 'Wan-Bissaka', 4000000.00, 'RB', 1, 0, 20000000.00, '2025-06-30', 0,'player_images/Wan-Bissaka.png'),
('Raphael', None, 'Varane', 10000000.00, 'CB', 1, 0, 25000000.00, '2025-06-30', 0, 'player_images/Varane.png'),
('Lisandro', None, 'Martinez', 8000000.00, 'CB', 1, 0, 40000000.00, '2027-06-30', 0, 'player_images/Martinez.png'),
('Leny', None, 'Yoro', 6000000.00, 'CB', 1, 0, 35000000.00, '2029-06-30', 0, 'player_images/Yoro.png'),
('Harry', None, 'Maguire', 9000000.00, 'CB', 1, 0, 15000000.00, '2025-06-30', 0, 'player_images/Maguire.png'),
('Jonny', None, 'Evans', 2000000.00, 'CB', 1, 0, 1000000.00, '2025-06-30', 0, 'player_images/Evans.png'),
('Luke', None, 'Shaw', 7000000.00, 'LB', 1, 1, 25000000.00, '2027-06-30', 0, 'player_images/Shaw.png'),
('Noussair', None, 'Mazraoui', 4000000.00, 'LB,RB', 1, 0, 25000000.00, '2027-06-30', 0,  'player_images/Mazraoui.png'),

('Casemiro', None, 'Casemiro', 12000000.00, 'CDM', 1, 0, 30000000.00, '2026-06-30', 0,  'player_images/Casemiro.png'),
('Kobbie', None, 'Mainoo', 1000000.00, 'CM', 1, 0, 25000000.00, '2027-06-30', 0,  'player_images/Mainoo.png'),
('Scott', None, 'McTominay', 4000000.00, 'CM', 1, 0, 18000000.00, '2025-06-30', 0,  'player_images/McTominay.png'),
('Christian', None, 'Eriksen', 6000000.00, 'CM', 1, 0, 8000000.00, '2025-06-30', 0,  'player_images/Eriksen.png'),
('Bruno', None, 'Fernandes', 12000000.00, 'CAM', 1, 0, 70000000.00, '2026-06-30', 0,  'player_images/Fernandes.png'),
('Mason', None, 'Mount', 7000000.00, 'CM', 1, 0, 50000000.00, '2028-06-30', 0,  'player_images/Mount.png'),

('Marcus', None, 'Rashford', 10000000.00, 'LW', 1, 0, 80000000.00, '2028-06-30', 0,  'player_images/Rashford.png'),
('Alejandro', None, 'Garnacho', 2000000.00, 'LW', 1, 0, 60000000.00, '2028-06-30', 0,  'player_images/Garnacho.png'),
('Antony', None, 'Antony', 8000000.00, 'RW', 1, 0, 40000000.00, '2027-06-30', 0,  'player_images/Antony.png'),
('Jadon', None, 'Sancho', 8000000.00, 'RW', 1, 0, 35000000.00, '2026-06-30', 0,  'player_images/Sancho.png'),
('Rasmus', None, 'Hojlund', 6000000.00, 'ST', 1, 0, 50000000.00, '2028-06-30', 0,  'player_images/Hojlund.png'),
('Anthony', None, 'Martial', 8000000.00, 'ST', 1, 0, 12000000.00, '2024-06-30', 0,  'player_images/Martial.png')
]

for first_name, middle_name, last_name, salary, positions, is_active, is_injured, transfer_value, contract_end_date, scouted_player, photo_filename in players_data:
    photo_data = None
    photo_content_type = 'image/png'
    photo_size = None
    full_path = os.path.join(os.path.dirname(__file__), photo_filename)
    if os.path.exists(full_path):
        with open(full_path, 'rb') as f:
            photo_data = f.read()
        photo_size = len(photo_data)
        print(f"Read image file: {full_path}, size: {photo_size} bytes")
    else:
        print(f"Image file not found: {full_path}")
    
    cursor.execute("""
        INSERT INTO player (first_name, middle_name, last_name, salary, positions, is_active, is_injured, transfer_value, contract_end_date, scouted_player,
            photo, photo_content_type, photo_filename, photo_size, photo_uploaded_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
    """, (first_name, middle_name, last_name, salary, positions, is_active, is_injured, transfer_value, contract_end_date, scouted_player,
          photo_data, photo_content_type, photo_filename, photo_size))

mydb.commit()
cursor.close()
