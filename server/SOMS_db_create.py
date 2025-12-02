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
    salary DECIMAL(12,2) NOT NULL,
    positions VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    is_injured BOOLEAN DEFAULT FALSE,
    transfer_value DECIMAL(12,2),
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

# Alter existing table columns to support larger values if table already exists
cursor.execute("""
ALTER TABLE player 
MODIFY COLUMN salary DECIMAL(12,2) NOT NULL,
MODIFY COLUMN transfer_value DECIMAL(12,2)
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
    ('Diogo', None, 'Dalot', 4000000.00, 'RB', 1, 0, 25000000.00, '2028-06-30', 0, 'player_images/Dalot.png'),
    ('Antony', None, 'Matheus dos Santos', 35000000.00, 'RW', 1, 0, 60000000.00, '2027-06-30', 0, 'player_images/Antony.png'),
    ('Lisandro', None, 'Martinez', 30000000.00, 'CB', 1, 0, 55000000.00, '2026-06-30', 0, 'player_images/Martinez.png'),
    ('Casemiro', None, 'de Souza', 45000000.00, 'CDM', 1, 0, 70000000.00, '2025-06-30', 0, 'player_images/Casemiro.png'),
    ('Bruno', None, 'Fernandes', 50000000.00, 'CAM', 1, 0, 80000000.00, '2026-06-30', 0, 'player_images/Fernandes.png'),
    ('Marcus', None, 'Rashford', 55000000.00, 'ST', 1, 0, 90000000.00, '2027-06-30', 0, 'player_images/Rashford.png'),
    ('Jadon', None, 'Sancho', 60000000.00, 'LW', 1, 0, 95000000.00, '2026-06-30', 0, 'player_images/Sancho.png'),
    ('Cole', None, 'Palmer', 1500000.00, 'CM', 1, 0, 10000000.00, '2025-06-30', 0, 'player_images/Palmer.png'),
    ('Harry', None, 'Maguire', 25000000.00, 'CB', 1, 0, 40000000.00, '2026-06-30', 0, 'player_images/Maguire.png'),
    ('Raphael', None, 'Varane', 30000000.00, 'CB', 1, 0, 45000000.00, '2025-06-30', 0, 'player_images/Varane.png'),
    ('Luke', None, 'Shaw', 20000000.00, 'LB', 1, 0, 35000000.00, '2026-06-30', 0, 'player_images/Shaw.png'),
    ('Altay', None, 'Bayindir', 500000.00, 'GK', 1, 0, 5000000.00, '2025-06-30', 1, 'player_images/Bayindir.png'),
    ('Christian', None, 'Eriksen', 10000000.00, 'CAM', 1, 0, 20000000.00, '2025-06-30', 1, 'player_images/Eriksen.png'),
    ('Rasmus', None, 'Hojlund', 8000000.00, 'ST', 1, 0, 15000000.00, '2027-06-30', 1, 'player_images/Hojlund.png'),
    ('Kevin', None, 'De Bruyne', 70000000.00, 'CM', 1, 0, 100000000.00, '2025-06-30', 0, 'player_images/DeBruyne.png'),
    ('Erling', None, 'Haaland', 90000000.00, 'ST', 1, 0, 150000000.00, '2027-06-30', 0, 'player_images/Haaland.png'),
    ('Virgil', None, 'van Dijk', 60000000.00, 'CB', 1, 0, 80000000.00, '2026-06-30', 0, 'player_images/Dijk.png'),
    ('Lionel', None, 'Messi', 120000000.00, 'RW', 1, 0, 200000000.00, '2025-06-30', 0, 'player_images/Messi.png'), 
    ('Christiano', None, 'Ronaldo', 100000000.00, 'ST', 1, 0, 180000000.00, '2025-06-30', 0, 'player_images/Ronaldo.png'),
    ('Declan', None, 'Rice', 45000000.00, 'CDM', 1, 0, 75000000.00, '2026-06-30', 0, 'player_images/Rice.png'), 
    ('Kaoru', None, 'Mitoma', 20000000.00, 'LW', 1, 0, 40000000.00, '2027-06-30', 0, 'player_images/Mitoma.png'),
    ('Heung-Min', None, 'Son', 80000000.00, 'LW', 1, 0, 120000000.00, '2026-06-30', 0, 'player_images/Son.png'),
    ('Kobbie', None, 'Mainoo', 1000000.00, 'CM', 1, 0, 8000000.00, '2025-06-30', 1, 'player_images/Mainoo.png'), 
    ('Mason', None, 'Mount', 40000000.00, 'CAM', 1, 0, 70000000.00, '2026-06-30', 0, 'player_images/Mount.png'),
    ('Jadon', None, 'Sancho', 60000000.00, 'RW', 1, 0, 95000000.00, '2026-06-30', 0, 'player_images/Sancho.png'),
    ('Andre', None, 'Onana', 15000000.00, 'GK', 1, 0, 30000000.00, '2027-06-30', 0, 'player_images/Onana.png')
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



cursor.execute("""
INSERT INTO team (name, level) VALUES ('Lions', 'Professional')
  ON DUPLICATE KEY UPDATE team_id = LAST_INSERT_ID(team_id);
""")
cursor.execute("SET @team_lions_id = LAST_INSERT_ID();")

cursor.execute("""
INSERT INTO team (name, level) VALUES ('Tigers', 'Development')
  ON DUPLICATE KEY UPDATE team_id = LAST_INSERT_ID(team_id);
""")
cursor.execute("SET @team_tigers_id = LAST_INSERT_ID();")


# Could I have made this in a loop yes but I am tired
cursor.execute("""
INSERT INTO match_table (name, venue, match_time, opponent_team, match_date, result)
VALUES ('Season Opener', 'Main Stadium', '15:00:00', 'Rivals FC', CURDATE(), '2-1')
  ON DUPLICATE KEY UPDATE match_id = LAST_INSERT_ID(match_id);
""")
cursor.execute("SET @match_id = LAST_INSERT_ID();")

# Past matches (3)
cursor.execute("""
INSERT INTO match_table (name, venue, match_time, opponent_team, match_date, result)
VALUES ('Premier League Round 1', 'Old Trafford', '17:30:00', 'Liverpool FC', DATE_SUB(CURDATE(), INTERVAL 30 DAY), '1-3')
  ON DUPLICATE KEY UPDATE match_id = LAST_INSERT_ID(match_id);
""")

cursor.execute("""
INSERT INTO match_table (name, venue, match_time, opponent_team, match_date, result)
VALUES ('Premier League Round 2', 'Etihad Stadium', '16:00:00', 'Manchester City', DATE_SUB(CURDATE(), INTERVAL 23 DAY), '0-2')
  ON DUPLICATE KEY UPDATE match_id = LAST_INSERT_ID(match_id);
""")

cursor.execute("""
INSERT INTO match_table (name, venue, match_time, opponent_team, match_date, result)
VALUES ('FA Cup Round 3', 'Wembley Stadium', '15:00:00', 'Chelsea FC', DATE_SUB(CURDATE(), INTERVAL 16 DAY), '2-1')
  ON DUPLICATE KEY UPDATE match_id = LAST_INSERT_ID(match_id);
""")

# Future matches (7)
cursor.execute("""
INSERT INTO match_table (name, venue, match_time, opponent_team, match_date, result)
VALUES ('Premier League Round 15', 'Anfield', '20:00:00', 'Liverpool FC', DATE_ADD(CURDATE(), INTERVAL 7 DAY), NULL)
  ON DUPLICATE KEY UPDATE match_id = LAST_INSERT_ID(match_id);
""")

cursor.execute("""
INSERT INTO match_table (name, venue, match_time, opponent_team, match_date, result)
VALUES ('Premier League Round 16', 'Stamford Bridge', '17:30:00', 'Chelsea FC', DATE_ADD(CURDATE(), INTERVAL 14 DAY), NULL)
  ON DUPLICATE KEY UPDATE match_id = LAST_INSERT_ID(match_id);
""")

cursor.execute("""
INSERT INTO match_table (name, venue, match_time, opponent_team, match_date, result)
VALUES ('Premier League Round 17', 'Camp Nou', '21:00:00', 'FC Barcelona', DATE_ADD(CURDATE(), INTERVAL 21 DAY), NULL)
  ON DUPLICATE KEY UPDATE match_id = LAST_INSERT_ID(match_id);
""")

cursor.execute("""
INSERT INTO match_table (name, venue, match_time, opponent_team, match_date, result)
VALUES ('Premier League Round 18', 'Santiago Bernabeu', '19:00:00', 'Real Madrid', DATE_ADD(CURDATE(), INTERVAL 28 DAY), NULL)
  ON DUPLICATE KEY UPDATE match_id = LAST_INSERT_ID(match_id);
""")

cursor.execute("""
INSERT INTO match_table (name, venue, match_time, opponent_team, match_date, result)
VALUES ('Premier League Round 19', 'Allianz Arena', '18:30:00', 'Bayern Munich', DATE_ADD(CURDATE(), INTERVAL 35 DAY), NULL)
  ON DUPLICATE KEY UPDATE match_id = LAST_INSERT_ID(match_id);
""")

cursor.execute("""
INSERT INTO match_table (name, venue, match_time, opponent_team, match_date, result)
VALUES ('Premier League Round 20', 'Parc des Princes', '21:00:00', 'Paris Saint-Germain', DATE_ADD(CURDATE(), INTERVAL 42 DAY), NULL)
  ON DUPLICATE KEY UPDATE match_id = LAST_INSERT_ID(match_id);
""")

cursor.execute("""
INSERT INTO match_table (name, venue, match_time, opponent_team, match_date, result)
VALUES ('Champions League Quarter Final', 'San Siro', '20:45:00', 'AC Milan', DATE_ADD(CURDATE(), INTERVAL 49 DAY), NULL)
  ON DUPLICATE KEY UPDATE match_id = LAST_INSERT_ID(match_id);
""")

cursor.execute("""
INSERT INTO match_table (name, venue, match_time, opponent_team, match_date, result)
VALUES ('Premier League Round 21', 'Signal Iduna Park', '15:30:00', 'Borussia Dortmund', DATE_ADD(CURDATE(), INTERVAL 56 DAY), NULL)
  ON DUPLICATE KEY UPDATE match_id = LAST_INSERT_ID(match_id);
""")

#LOL
player_match_stats_data = [
    # Match 2 - Premier League Round 1 vs Liverpool FC
    (1, 2, 1, True, 45, 2, 1, 0, 0, 0, 1, 3, 0, 0, 85.2),  # Dalot
    (2, 2, 1, True, 90, 1, 3, 1, 0, 0, 2, 5, 1, 0, 78.5),  # Antony
    (3, 2, 1, True, 90, 3, 0, 0, 0, 0, 0, 1, 0, 0, 92.1),  # Martinez
    (4, 2, 1, True, 90, 6, 1, 0, 0, 0, 3, 2, 0, 0, 88.7),  # Casemiro
    (5, 2, 1, True, 90, 2, 2, 0, 0, 0, 1, 4, 1, 1, 82.3),  # Fernandes
    (6, 2, 1, True, 90, 0, 4, 2, 0, 0, 0, 2, 0, 1, 75.8),  # Rashford
    (7, 2, 1, False, 67, 1, 2, 1, 0, 0, 1, 3, 0, 0, 79.4), # Sancho
    (8, 2, 1, False, 23, 0, 0, 0, 0, 0, 0, 1, 0, 0, 90.0), # Palmer
    (9, 2, 1, True, 90, 4, 0, 0, 0, 0, 1, 0, 0, 0, 94.5),  # Maguire
    (10, 2, 1, True, 90, 2, 0, 0, 0, 0, 0, 0, 0, 0, 91.8), # Varane
    (11, 2, 1, True, 90, 1, 1, 0, 0, 0, 2, 2, 0, 0, 86.9), # Shaw
    (12, 2, 1, False, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.0),   # Bayindir (didn't play)
    (13, 2, 1, False, 45, 1, 1, 0, 0, 0, 0, 2, 0, 0, 83.2), # Eriksen
    (14, 2, 1, False, 68, 0, 2, 1, 0, 0, 0, 1, 0, 0, 77.1), # Hojlund
    (15, 2, 1, True, 90, 3, 3, 0, 0, 0, 1, 6, 2, 0, 84.7), # De Bruyne
    (16, 2, 1, True, 90, 1, 5, 3, 0, 0, 0, 3, 0, 2, 72.4), # Haaland
    (17, 2, 1, True, 90, 5, 0, 0, 0, 0, 2, 0, 0, 0, 95.3), # Van Dijk
    (18, 2, 1, True, 90, 0, 4, 2, 0, 0, 0, 4, 1, 1, 76.8), # Messi
    (19, 2, 1, True, 90, 1, 6, 4, 0, 0, 1, 2, 0, 3, 69.2), # Ronaldo
    (20, 2, 1, True, 90, 4, 1, 0, 0, 0, 2, 1, 0, 0, 89.6), # Rice
    (21, 2, 1, False, 22, 0, 1, 0, 0, 0, 0, 2, 0, 0, 81.5), # Mitoma
    (22, 2, 1, True, 90, 1, 3, 1, 0, 0, 1, 5, 1, 1, 78.9), # Son
    (23, 2, 1, False, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.0),   # Mainoo (didn't play)
    (24, 2, 1, True, 90, 2, 2, 0, 0, 0, 0, 3, 1, 0, 85.1), # Mount
    (25, 2, 1, False, 45, 1, 1, 0, 0, 0, 1, 2, 0, 0, 80.3), # Sancho (duplicate, made different)
    (26, 2, 1, True, 90, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100.0), # Onana

    # Match 3 - Premier League Round 2 vs Manchester City
    (1, 3, 1, True, 90, 3, 0, 0, 0, 0, 2, 1, 0, 0, 87.4),  # Dalot
    (2, 3, 1, True, 90, 2, 2, 1, 0, 0, 3, 4, 0, 0, 76.9),  # Antony
    (3, 3, 1, True, 90, 4, 0, 0, 0, 0, 1, 0, 0, 0, 93.2),  # Martinez
    (4, 3, 1, True, 90, 5, 0, 0, 0, 0, 4, 1, 0, 0, 90.1),  # Casemiro
    (5, 3, 1, True, 90, 1, 3, 0, 0, 0, 0, 5, 2, 0, 83.7),  # Fernandes
    (6, 3, 1, True, 90, 0, 3, 2, 0, 0, 1, 1, 0, 0, 74.6),  # Rashford
    (7, 3, 1, False, 78, 2, 1, 0, 0, 0, 2, 3, 0, 0, 81.8), # Sancho
    (8, 3, 1, True, 90, 3, 1, 0, 0, 0, 1, 2, 0, 0, 88.9), # Palmer
    (9, 3, 1, True, 90, 2, 0, 0, 0, 0, 0, 0, 0, 0, 95.7),  # Maguire
    (10, 3, 1, False, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 85.0), # Varane
    (11, 3, 1, True, 90, 1, 0, 0, 0, 0, 1, 1, 0, 0, 89.3), # Shaw
    (12, 3, 1, True, 90, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100.0), # Bayindir
    (13, 3, 1, False, 34, 1, 0, 0, 0, 0, 0, 1, 0, 0, 86.4), # Eriksen
    (14, 3, 1, True, 90, 0, 2, 1, 0, 0, 0, 0, 0, 1, 79.2), # Hojlund
    (15, 3, 1, True, 90, 4, 2, 0, 0, 0, 2, 4, 1, 0, 85.6), # De Bruyne
    (16, 3, 1, True, 90, 0, 4, 3, 0, 0, 0, 2, 0, 2, 71.9), # Haaland
    (17, 3, 1, True, 90, 3, 0, 0, 0, 0, 1, 0, 0, 0, 96.1), # Van Dijk
    (18, 3, 1, True, 90, 1, 3, 1, 0, 0, 0, 3, 1, 0, 80.5), # Messi
    (19, 3, 1, True, 90, 2, 5, 3, 0, 0, 2, 1, 0, 2, 73.8), # Ronaldo
    (20, 3, 1, True, 90, 6, 0, 0, 0, 0, 3, 0, 0, 0, 91.4), # Rice
    (21, 3, 1, False, 56, 1, 1, 0, 0, 0, 1, 2, 0, 0, 82.7), # Mitoma
    (22, 3, 1, True, 90, 1, 4, 2, 0, 0, 0, 4, 1, 1, 77.3), # Son
    (23, 3, 1, False, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.0),   # Mainoo
    (24, 3, 1, True, 90, 1, 1, 0, 0, 0, 0, 2, 0, 0, 87.9), # Mount
    (25, 3, 1, False, 67, 0, 1, 0, 0, 0, 0, 1, 0, 0, 83.6), # Sancho
    (26, 3, 1, True, 90, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100.0), # Onana

    # Match 4 - FA Cup Round 3 vs Chelsea FC
    (1, 4, 1, True, 90, 2, 1, 0, 0, 0, 1, 2, 0, 0, 88.5),  # Dalot
    (2, 4, 1, True, 90, 1, 4, 2, 0, 0, 2, 6, 1, 1, 75.2),  # Antony
    (3, 4, 1, True, 90, 3, 0, 0, 0, 0, 0, 0, 0, 0, 94.8),  # Martinez
    (4, 4, 1, True, 90, 7, 0, 0, 0, 0, 4, 1, 0, 0, 89.3),  # Casemiro
    (5, 4, 1, True, 90, 2, 2, 0, 0, 0, 1, 4, 1, 0, 84.1),  # Fernandes
    (6, 4, 1, True, 90, 0, 5, 3, 0, 0, 0, 3, 0, 2, 70.9),  # Rashford
    (7, 4, 1, False, 89, 1, 2, 1, 0, 0, 1, 4, 0, 0, 78.7), # Sancho
    (8, 4, 1, True, 90, 4, 0, 0, 0, 0, 2, 1, 0, 0, 90.6), # Palmer
    (9, 4, 1, True, 90, 1, 0, 0, 0, 0, 0, 0, 0, 0, 96.2),  # Maguire
    (10, 4, 1, True, 90, 4, 0, 0, 0, 0, 1, 0, 0, 0, 92.7), # Varane
    (11, 4, 1, True, 90, 2, 1, 0, 0, 0, 3, 3, 0, 0, 85.4), # Shaw
    (12, 4, 1, False, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.0),   # Bayindir
    (13, 4, 1, False, 78, 2, 1, 0, 0, 0, 0, 3, 1, 0, 81.9), # Eriksen
    (14, 4, 1, True, 90, 0, 3, 2, 0, 0, 0, 1, 0, 1, 76.5), # Hojlund
    (15, 4, 1, True, 90, 3, 3, 0, 0, 0, 1, 5, 2, 0, 86.8), # De Bruyne
    (16, 4, 1, True, 90, 1, 6, 4, 0, 0, 1, 4, 0, 3, 68.7), # Haaland
    (17, 4, 1, True, 90, 6, 0, 0, 0, 0, 2, 0, 0, 0, 93.9), # Van Dijk
    (18, 4, 1, True, 90, 0, 5, 3, 0, 0, 0, 5, 1, 2, 74.1), # Messi
    (19, 4, 1, True, 90, 1, 7, 5, 0, 0, 1, 2, 0, 4, 65.3), # Ronaldo
    (20, 4, 1, True, 90, 5, 1, 0, 0, 0, 3, 1, 0, 0, 91.2), # Rice
    (21, 4, 1, False, 45, 0, 2, 1, 0, 0, 0, 3, 0, 0, 79.8), # Mitoma
    (22, 4, 1, True, 90, 1, 4, 2, 0, 0, 1, 6, 1, 1, 77.6), # Son
    (23, 4, 1, False, 23, 0, 0, 0, 0, 0, 0, 1, 0, 0, 88.0), # Mainoo
    (24, 4, 1, True, 90, 3, 2, 0, 0, 0, 0, 4, 1, 0, 84.9), # Mount
    (25, 4, 1, False, 56, 1, 1, 0, 0, 0, 1, 2, 0, 0, 82.1), # Sancho
    (26, 4, 1, True, 90, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100.0), # Onana
]

for player_id, match_id, team_id, started, minutes, tackles, shots_total, offsides, red_cards, yellow_cards, fouls_committed, dribbles_attempted, assists, goals, passing_accuracy in player_match_stats_data:
    cursor.execute("""
        INSERT INTO player_match_stats (player_id, match_id, team_id, started, minutes, tackles, shots_total, offsides, red_cards, yellow_cards, fouls_committed, dribbles_attempted, assists, goals, passing_accuracy)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (player_id, match_id, team_id, started, minutes, tackles, shots_total, offsides, red_cards, yellow_cards, fouls_committed, dribbles_attempted, assists, goals, passing_accuracy))

# Insert sample staff members
# Manchester United Staff
cursor.execute("""
INSERT INTO staff (first_name, middle_name, last_name, email, salary, age, date_hired, staff_type)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
ON DUPLICATE KEY UPDATE staff_id = LAST_INSERT_ID(staff_id)
""", ('Erik', None, 'ten Hag', 'erik.tenhag@manutd.com', 9000000.00, 54, '2022-06-01', 'Coach'))
coach_ten_hag_id = cursor.lastrowid

cursor.execute("""
INSERT INTO staff (first_name, middle_name, last_name, email, salary, age, date_hired, staff_type)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
ON DUPLICATE KEY UPDATE staff_id = LAST_INSERT_ID(staff_id)
""", ('David', None, 'Harrison', 'david.harrison@manutd.com', 500000.00, 45, '2021-07-01', 'Scout'))
scout_harrison_id = cursor.lastrowid

cursor.execute("""
INSERT INTO staff (first_name, middle_name, last_name, email, salary, age, date_hired, staff_type)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
ON DUPLICATE KEY UPDATE staff_id = LAST_INSERT_ID(staff_id)
""", ('Richard', None, 'Hartis', 'richard.hartis@manutd.com', 600000.00, 56, '2019-07-01', 'Med'))
med_hartis_id = cursor.lastrowid

cursor.execute("""
INSERT INTO staff (first_name, middle_name, last_name, email, salary, age, date_hired, staff_type)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
ON DUPLICATE KEY UPDATE staff_id = LAST_INSERT_ID(staff_id)
""", ('Tom', None, 'Admin', 'tom.admin@manutd.com', 400000.00, 30, '2024-02-01', 'Admin'))
admin_tom_id = cursor.lastrowid

# Liverpool Staff
cursor.execute("""
INSERT INTO staff (first_name, middle_name, last_name, email, salary, age, date_hired, staff_type)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
ON DUPLICATE KEY UPDATE staff_id = LAST_INSERT_ID(staff_id)
""", ('Jurgen', None, 'Klopp', 'jurgen.klopp@liverpool.com', 8000000.00, 57, '2015-10-08', 'Coach'))
coach_klopp_id = cursor.lastrowid

cursor.execute("""
INSERT INTO staff (first_name, middle_name, last_name, email, salary, age, date_hired, staff_type)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
ON DUPLICATE KEY UPDATE staff_id = LAST_INSERT_ID(staff_id)
""", ('Michael', None, 'Edwards', 'michael.edwards@liverpool.com', 450000.00, 42, '2016-10-01', 'Scout'))
scout_edwards_id = cursor.lastrowid

cursor.execute("""
INSERT INTO staff (first_name, middle_name, last_name, email, salary, age, date_hired, staff_type)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
ON DUPLICATE KEY UPDATE staff_id = LAST_INSERT_ID(staff_id)
""", ('Dr.', 'Zaf', 'Iqbal', 'zaf.iqbal@liverpool.com', 550000.00, 48, '2018-07-01', 'Med'))
med_iqbal_id = cursor.lastrowid

# Manchester City Staff
cursor.execute("""
INSERT INTO staff (first_name, middle_name, last_name, email, salary, age, date_hired, staff_type)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
ON DUPLICATE KEY UPDATE staff_id = LAST_INSERT_ID(staff_id)
""", ('Pep', None, 'Guardiola', 'pep.guardiola@mancity.com', 20000000.00, 53, '2016-07-01', 'Coach'))
coach_guardiola_id = cursor.lastrowid

cursor.execute("""
INSERT INTO staff (first_name, middle_name, last_name, email, salary, age, date_hired, staff_type)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
ON DUPLICATE KEY UPDATE staff_id = LAST_INSERT_ID(staff_id)
""", ('Txiki', None, 'Begiristain', 'txiki.begiristain@mancity.com', 3000000.00, 59, '2012-07-01', 'Scout'))
scout_begiristain_id = cursor.lastrowid

cursor.execute("""
INSERT INTO staff (first_name, middle_name, last_name, email, salary, age, date_hired, staff_type)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
ON DUPLICATE KEY UPDATE staff_id = LAST_INSERT_ID(staff_id)
""", ('Dr.', 'Eva', 'Carrillo', 'eva.carrillo@mancity.com', 650000.00, 52, '2017-07-01', 'Med'))
med_carrillo_id = cursor.lastrowid

# Chelsea Staff
cursor.execute("""
INSERT INTO staff (first_name, middle_name, last_name, email, salary, age, date_hired, staff_type)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
ON DUPLICATE KEY UPDATE staff_id = LAST_INSERT_ID(staff_id)
""", ('Mauricio', None, 'Pochettino', 'mauricio.pochettino@chelsea.com', 15000000.00, 52, '2023-07-01', 'Coach'))
coach_pochettino_id = cursor.lastrowid

cursor.execute("""
INSERT INTO staff (first_name, middle_name, last_name, email, salary, age, date_hired, staff_type)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
ON DUPLICATE KEY UPDATE staff_id = LAST_INSERT_ID(staff_id)
""", ('Scott', None, 'McLachlan', 'scott.mclachlan@chelsea.com', 400000.00, 38, '2020-07-01', 'Scout'))
scout_mclachlan_id = cursor.lastrowid

cursor.execute("""
INSERT INTO staff (first_name, middle_name, last_name, email, salary, age, date_hired, staff_type)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
ON DUPLICATE KEY UPDATE staff_id = LAST_INSERT_ID(staff_id)
""", ('Dr.', 'Eva', 'Silvestre', 'eva.silvestre@chelsea.com', 580000.00, 49, '2021-07-01', 'Med'))
med_silvestre_id = cursor.lastrowid

# Real Madrid Staff (La Liga)
cursor.execute("""
INSERT INTO staff (first_name, middle_name, last_name, email, salary, age, date_hired, staff_type)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
ON DUPLICATE KEY UPDATE staff_id = LAST_INSERT_ID(staff_id)
""", ('Carlo', None, 'Ancelotti', 'carlo.ancelotti@realmadrid.com', 12000000.00, 65, '2021-06-01', 'Coach'))
coach_ancelotti_id = cursor.lastrowid

cursor.execute("""
INSERT INTO staff (first_name, middle_name, last_name, email, salary, age, date_hired, staff_type)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
ON DUPLICATE KEY UPDATE staff_id = LAST_INSERT_ID(staff_id)
""", ('Juni', None, 'Calafat', 'juni.calafat@realmadrid.com', 800000.00, 55, '2013-07-01', 'Scout'))
scout_calafat_id = cursor.lastrowid

cursor.execute("""
INSERT INTO staff (first_name, middle_name, last_name, email, salary, age, date_hired, staff_type)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
ON DUPLICATE KEY UPDATE staff_id = LAST_INSERT_ID(staff_id)
""", ('Dr.', 'Jesus', 'Olmo', 'jesus.olmo@realmadrid.com', 700000.00, 58, '2018-07-01', 'Med'))
med_olmo_id = cursor.lastrowid

# FC Barcelona Staff (La Liga)
cursor.execute("""
INSERT INTO staff (first_name, middle_name, last_name, email, salary, age, date_hired, staff_type)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
ON DUPLICATE KEY UPDATE staff_id = LAST_INSERT_ID(staff_id)
""", ('Xavi', None, 'Hernandez', 'xavi.hernandez@barcelona.com', 6000000.00, 44, '2021-11-06', 'Coach'))
coach_xavi_id = cursor.lastrowid

cursor.execute("""
INSERT INTO staff (first_name, middle_name, last_name, email, salary, age, date_hired, staff_type)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
ON DUPLICATE KEY UPDATE staff_id = LAST_INSERT_ID(staff_id)
""", ('Ramon', None, 'Planes', 'ramon.planes@barcelona.com', 350000.00, 41, '2018-07-01', 'Scout'))
scout_planes_id = cursor.lastrowid

cursor.execute("""
INSERT INTO staff (first_name, middle_name, last_name, email, salary, age, date_hired, staff_type)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
ON DUPLICATE KEY UPDATE staff_id = LAST_INSERT_ID(staff_id)
""", ('Dr.', 'Ricard', 'Pruna', 'ricard.pruna@barcelona.com', 620000.00, 54, '2019-07-01', 'Med'))
med_pruna_id = cursor.lastrowid

# AC Milan Staff (Serie A)
cursor.execute("""
INSERT INTO staff (first_name, middle_name, last_name, email, salary, age, date_hired, staff_type)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
ON DUPLICATE KEY UPDATE staff_id = LAST_INSERT_ID(staff_id)
""", ('Stefano', None, 'Pioli', 'stefano.pioli@acmilan.com', 4000000.00, 58, '2019-10-09', 'Coach'))
coach_pioli_id = cursor.lastrowid

cursor.execute("""
INSERT INTO staff (first_name, middle_name, last_name, email, salary, age, date_hired, staff_type)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
ON DUPLICATE KEY UPDATE staff_id = LAST_INSERT_ID(staff_id)
""", ('Paolo', None, 'Maldini', 'paolo.maldini@acmilan.com', 1200000.00, 56, '2018-07-01', 'Scout'))
scout_maldini_id = cursor.lastrowid

cursor.execute("""
INSERT INTO staff (first_name, middle_name, last_name, email, salary, age, date_hired, staff_type)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
ON DUPLICATE KEY UPDATE staff_id = LAST_INSERT_ID(staff_id)
""", ('Dr.', 'Stefano', 'Mazzoni', 'stefano.mazzoni@acmilan.com', 550000.00, 47, '2020-07-01', 'Med'))
med_mazzoni_id = cursor.lastrowid

# Bayern Munich Staff (Bundesliga)
cursor.execute("""
INSERT INTO staff (first_name, middle_name, last_name, email, salary, age, date_hired, staff_type)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
ON DUPLICATE KEY UPDATE staff_id = LAST_INSERT_ID(staff_id)
""", ('Thomas', None, 'Tuchel', 'thomas.tuchel@bayernmunich.com', 8000000.00, 51, '2024-03-01', 'Coach'))
coach_tuchel_id = cursor.lastrowid

cursor.execute("""
INSERT INTO staff (first_name, middle_name, last_name, email, salary, age, date_hired, staff_type)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
ON DUPLICATE KEY UPDATE staff_id = LAST_INSERT_ID(staff_id)
""", ('Michael', None, 'Reschke', 'michael.reschke@bayernmunich.com', 600000.00, 50, '2017-07-01', 'Scout'))
scout_reschke_id = cursor.lastrowid

cursor.execute("""
INSERT INTO staff (first_name, middle_name, last_name, email, salary, age, date_hired, staff_type)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
ON DUPLICATE KEY UPDATE staff_id = LAST_INSERT_ID(staff_id)
""", ('Dr.', 'Hans-Wilhelm', 'Muller-Wohlfahrt', 'hans.muller@bayernmunich.com', 750000.00, 74, '1977-07-01', 'Med'))
med_muller_id = cursor.lastrowid

# Paris Saint-Germain Staff (Ligue 1)
cursor.execute("""
INSERT INTO staff (first_name, middle_name, last_name, email, salary, age, date_hired, staff_type)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
ON DUPLICATE KEY UPDATE staff_id = LAST_INSERT_ID(staff_id)
""", ('Luis', None, 'Enrique', 'luis.enrique@psg.com', 10000000.00, 54, '2023-07-01', 'Coach'))
coach_enrique_id = cursor.lastrowid

cursor.execute("""
INSERT INTO staff (first_name, middle_name, last_name, email, salary, age, date_hired, staff_type)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
ON DUPLICATE KEY UPDATE staff_id = LAST_INSERT_ID(staff_id)
""", ('Antero', None, 'Henrique', 'antero.henrique@psg.com', 900000.00, 54, '2017-06-01', 'Scout'))
scout_henrique_id = cursor.lastrowid

cursor.execute("""
INSERT INTO staff (first_name, middle_name, last_name, email, salary, age, date_hired, staff_type)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
ON DUPLICATE KEY UPDATE staff_id = LAST_INSERT_ID(staff_id)
""", ('Dr.', 'Nicolas', 'Bauer', 'nicolas.bauer@psg.com', 580000.00, 46, '2022-07-01', 'Med'))
med_bauer_id = cursor.lastrowid

# Borussia Dortmund Staff (Bundesliga)
cursor.execute("""
INSERT INTO staff (first_name, middle_name, last_name, email, salary, age, date_hired, staff_type)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
ON DUPLICATE KEY UPDATE staff_id = LAST_INSERT_ID(staff_id)
""", ('Edin', None, 'Terzic', 'edin.terzic@borussiadortmund.com', 2000000.00, 41, '2022-05-01', 'Coach'))
coach_terzic_id = cursor.lastrowid

cursor.execute("""
INSERT INTO staff (first_name, middle_name, last_name, email, salary, age, date_hired, staff_type)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
ON DUPLICATE KEY UPDATE staff_id = LAST_INSERT_ID(staff_id)
""", ('Sven', None, 'Mislintat', 'sven.mislintat@borussiadortmund.com', 700000.00, 51, '2018-07-01', 'Scout'))
scout_mislintat_id = cursor.lastrowid

cursor.execute("""
INSERT INTO staff (first_name, middle_name, last_name, email, salary, age, date_hired, staff_type)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
ON DUPLICATE KEY UPDATE staff_id = LAST_INSERT_ID(staff_id)
""", ('Dr.', 'Markus', 'Braun', 'markus.braun@borussiadortmund.com', 520000.00, 43, '2021-07-01', 'Med'))
med_braun_id = cursor.lastrowid

# Staff accounts for admin staff
cursor.execute("""
INSERT INTO staff_account (staff_id, username, password_hash, is_active, last_login)
VALUES (%s, %s, %s, %s, %s)
ON DUPLICATE KEY UPDATE username = VALUES(username), password_hash = VALUES(password_hash), is_active = VALUES(is_active)
""", (admin_tom_id, 'tom.admin', 'sha256_testhash_placeholder', 1, None))

# Coach assignments
cursor.execute("""
INSERT INTO coach (staff_id, role, team_id) VALUES (%s, %s, %s)
ON DUPLICATE KEY UPDATE role = VALUES(role), team_id = VALUES(team_id)
""", (coach_ten_hag_id, 'Manager', 1))

# Assign remaining coaches to teams
cursor.execute("""
INSERT INTO coach (staff_id, role, team_id) VALUES (%s, %s, %s)
ON DUPLICATE KEY UPDATE role = VALUES(role), team_id = VALUES(team_id)
""", (coach_klopp_id, 'Manager', 2))

cursor.execute("""
INSERT INTO coach (staff_id, role, team_id) VALUES (%s, %s, %s)
ON DUPLICATE KEY UPDATE role = VALUES(role), team_id = VALUES(team_id)
""", (coach_guardiola_id, 'Manager', 3))

cursor.execute("""
INSERT INTO coach (staff_id, role, team_id) VALUES (%s, %s, %s)
ON DUPLICATE KEY UPDATE role = VALUES(role), team_id = VALUES(team_id)
""", (coach_pochettino_id, 'Manager', 2))

cursor.execute("""
INSERT INTO coach (staff_id, role, team_id) VALUES (%s, %s, %s)
ON DUPLICATE KEY UPDATE role = VALUES(role), team_id = VALUES(team_id)
""", (coach_ancelotti_id, 'Manager', 3))

cursor.execute("""
INSERT INTO coach (staff_id, role, team_id) VALUES (%s, %s, %s)
ON DUPLICATE KEY UPDATE role = VALUES(role), team_id = VALUES(team_id)
""", (coach_xavi_id, 'Manager', 1))

cursor.execute("""
INSERT INTO coach (staff_id, role, team_id) VALUES (%s, %s, %s)
ON DUPLICATE KEY UPDATE role = VALUES(role), team_id = VALUES(team_id)
""", (coach_pioli_id, 'Manager', 2))

cursor.execute("""
INSERT INTO coach (staff_id, role, team_id) VALUES (%s, %s, %s)
ON DUPLICATE KEY UPDATE role = VALUES(role), team_id = VALUES(team_id)
""", (coach_tuchel_id, 'Manager', 3))

cursor.execute("""
INSERT INTO coach (staff_id, role, team_id) VALUES (%s, %s, %s)
ON DUPLICATE KEY UPDATE role = VALUES(role), team_id = VALUES(team_id)
""", (coach_enrique_id, 'Manager', 1))

cursor.execute("""
INSERT INTO coach (staff_id, role, team_id) VALUES (%s, %s, %s)
ON DUPLICATE KEY UPDATE role = VALUES(role), team_id = VALUES(team_id)
""", (coach_terzic_id, 'Manager', 2))

# Scout assignments
cursor.execute("""
INSERT INTO scout (staff_id, region, YOE) VALUES (%s, %s, %s)
ON DUPLICATE KEY UPDATE region = VALUES(region), YOE = VALUES(YOE)
""", (scout_harrison_id, 'Europe', 15))

cursor.execute("""
INSERT INTO scout (staff_id, region, YOE) VALUES (%s, %s, %s)
ON DUPLICATE KEY UPDATE region = VALUES(region), YOE = VALUES(YOE)
""", (scout_edwards_id, 'UK', 12))

cursor.execute("""
INSERT INTO scout (staff_id, region, YOE) VALUES (%s, %s, %s)
ON DUPLICATE KEY UPDATE region = VALUES(region), YOE = VALUES(YOE)
""", (scout_begiristain_id, 'Global', 25))

cursor.execute("""
INSERT INTO scout (staff_id, region, YOE) VALUES (%s, %s, %s)
ON DUPLICATE KEY UPDATE region = VALUES(region), YOE = VALUES(YOE)
""", (scout_mclachlan_id, 'UK', 10))

cursor.execute("""
INSERT INTO scout (staff_id, region, YOE) VALUES (%s, %s, %s)
ON DUPLICATE KEY UPDATE region = VALUES(region), YOE = VALUES(YOE)
""", (scout_calafat_id, 'Spain', 20))

cursor.execute("""
INSERT INTO scout (staff_id, region, YOE) VALUES (%s, %s, %s)
ON DUPLICATE KEY UPDATE region = VALUES(region), YOE = VALUES(YOE)
""", (scout_planes_id, 'Spain', 8))

cursor.execute("""
INSERT INTO scout (staff_id, region, YOE) VALUES (%s, %s, %s)
ON DUPLICATE KEY UPDATE region = VALUES(region), YOE = VALUES(YOE)
""", (scout_maldini_id, 'Italy', 18))

cursor.execute("""
INSERT INTO scout (staff_id, region, YOE) VALUES (%s, %s, %s)
ON DUPLICATE KEY UPDATE region = VALUES(region), YOE = VALUES(YOE)
""", (scout_reschke_id, 'Germany', 16))

cursor.execute("""
INSERT INTO scout (staff_id, region, YOE) VALUES (%s, %s, %s)
ON DUPLICATE KEY UPDATE region = VALUES(region), YOE = VALUES(YOE)
""", (scout_henrique_id, 'Portugal', 14))

cursor.execute("""
INSERT INTO scout (staff_id, region, YOE) VALUES (%s, %s, %s)
ON DUPLICATE KEY UPDATE region = VALUES(region), YOE = VALUES(YOE)
""", (scout_mislintat_id, 'Germany', 13))

# Med Staff assignments
cursor.execute("""
INSERT INTO med_staff (staff_id, med_specialization, certification, YOE)
VALUES (%s, %s, %s, %s)
ON DUPLICATE KEY UPDATE med_specialization = VALUES(med_specialization), certification = VALUES(certification), YOE = VALUES(YOE)
""", (med_hartis_id, 'Head of Medical', 'UEFA Certified', 25))

cursor.execute("""
INSERT INTO med_staff (staff_id, med_specialization, certification, YOE)
VALUES (%s, %s, %s, %s)
ON DUPLICATE KEY UPDATE med_specialization = VALUES(med_specialization), certification = VALUES(certification), YOE = VALUES(YOE)
""", (med_iqbal_id, 'Sports Medicine', 'FIFA Certified', 18))

cursor.execute("""
INSERT INTO med_staff (staff_id, med_specialization, certification, YOE)
VALUES (%s, %s, %s, %s)
ON DUPLICATE KEY UPDATE med_specialization = VALUES(med_specialization), certification = VALUES(certification), YOE = VALUES(YOE)
""", (med_carrillo_id, 'Physiotherapy', 'UEFA Certified', 22))

cursor.execute("""
INSERT INTO med_staff (staff_id, med_specialization, certification, YOE)
VALUES (%s, %s, %s, %s)
ON DUPLICATE KEY UPDATE med_specialization = VALUES(med_specialization), certification = VALUES(certification), YOE = VALUES(YOE)
""", (med_silvestre_id, 'Sports Science', 'FIFA Certified', 15))

cursor.execute("""
INSERT INTO med_staff (staff_id, med_specialization, certification, YOE)
VALUES (%s, %s, %s, %s)
ON DUPLICATE KEY UPDATE med_specialization = VALUES(med_specialization), certification = VALUES(certification), YOE = VALUES(YOE)
""", (med_olmo_id, 'Head of Medical', 'UEFA Certified', 28))

cursor.execute("""
INSERT INTO med_staff (staff_id, med_specialization, certification, YOE)
VALUES (%s, %s, %s, %s)
ON DUPLICATE KEY UPDATE med_specialization = VALUES(med_specialization), certification = VALUES(certification), YOE = VALUES(YOE)
""", (med_pruna_id, 'Sports Medicine', 'FIFA Certified', 20))

cursor.execute("""
INSERT INTO med_staff (staff_id, med_specialization, certification, YOE)
VALUES (%s, %s, %s, %s)
ON DUPLICATE KEY UPDATE med_specialization = VALUES(med_specialization), certification = VALUES(certification), YOE = VALUES(YOE)
""", (med_mazzoni_id, 'Physiotherapy', 'UEFA Certified', 12))

cursor.execute("""
INSERT INTO med_staff (staff_id, med_specialization, certification, YOE)
VALUES (%s, %s, %s, %s)
ON DUPLICATE KEY UPDATE med_specialization = VALUES(med_specialization), certification = VALUES(certification), YOE = VALUES(YOE)
""", (med_muller_id, 'Head of Medical', 'FIFA Certified', 45))

cursor.execute("""
INSERT INTO med_staff (staff_id, med_specialization, certification, YOE)
VALUES (%s, %s, %s, %s)
ON DUPLICATE KEY UPDATE med_specialization = VALUES(med_specialization), certification = VALUES(certification), YOE = VALUES(YOE)
""", (med_bauer_id, 'Sports Science', 'UEFA Certified', 11))

cursor.execute("""
INSERT INTO med_staff (staff_id, med_specialization, certification, YOE)
VALUES (%s, %s, %s, %s)
ON DUPLICATE KEY UPDATE med_specialization = VALUES(med_specialization), certification = VALUES(certification), YOE = VALUES(YOE)
""", (med_braun_id, 'Physiotherapy', 'FIFA Certified', 9))


# Insert sample scouting reports
# Manchester United scout (David Harrison) scouting reports
cursor.execute("""
INSERT INTO scouting_report (scout_id, target_player_name, target_player_id, report_date, report_desc)
VALUES (%s, %s, %s, %s, %s)
""", (scout_harrison_id, 'Kylian Mbappe', 18, '2024-11-15', 
'Exceptional winger with blistering pace and clinical finishing. Age 25, at peak performance. Transfer value estimated at €180M. Would be perfect addition to our attacking lineup. Strong work rate and leadership qualities.'))

cursor.execute("""
INSERT INTO scouting_report (scout_id, target_player_name, target_player_id, report_date, report_desc)
VALUES (%s, %s, %s, %s, %s)
""", (scout_harrison_id, 'Jude Bellingham', 20, '2024-10-20', 
'Outstanding central midfielder with excellent vision and passing range. Age 21, huge potential for growth. Transfer value around €150M. Box-to-box midfielder with strong defensive capabilities. Would strengthen our midfield significantly.'))

# Liverpool scout (Michael Edwards) scouting reports
cursor.execute("""
INSERT INTO scouting_report (scout_id, target_player_name, target_player_id, report_date, report_desc)
VALUES (%s, %s, %s, %s, %s)
""", (scout_edwards_id, 'Phil Foden', 15, '2024-09-10', 
'Creative midfielder with exceptional dribbling skills and vision. Age 24, already at world-class level. Transfer value estimated at €120M. Perfect for our possession-based style of play. Excellent set-piece specialist.'))

cursor.execute("""
INSERT INTO scouting_report (scout_id, target_player_name, target_player_id, report_date, report_desc)
VALUES (%s, %s, %s, %s, %s)
""", (scout_edwards_id, 'Trent Alexander-Arnold', 11, '2024-08-05', 
'World-class right-back with exceptional crossing ability. Age 25, peak years ahead. Transfer value around €80M. Would provide width and creativity from full-back position. Strong defensively as well.'))

# Manchester City scout (Txiki Begiristain) scouting reports
cursor.execute("""
INSERT INTO scouting_report (scout_id, target_player_name, target_player_id, report_date, report_desc)
VALUES (%s, %s, %s, %s, %s)
""", (scout_begiristain_id, 'Vinicius Jr', 2, '2024-12-01', 
'Dynamic winger with incredible dribbling and pace. Age 24, explosive talent. Transfer value estimated at €150M. Would add flair and unpredictability to our attacking options. Still developing consistency.'))

cursor.execute("""
INSERT INTO scouting_report (scout_id, target_player_name, target_player_id, report_date, report_desc)
VALUES (%s, %s, %s, %s, %s)
""", (scout_begiristain_id, 'Rodri', 4, '2024-11-25', 
'Complete defensive midfielder with outstanding passing range. Age 28, in prime. Transfer value around €100M. Would provide stability and control in midfield. Excellent leadership qualities.'))

# Chelsea scout (Scott McLachlan) scouting reports
cursor.execute("""
INSERT INTO scouting_report (scout_id, target_player_name, target_player_id, report_date, report_desc)
VALUES (%s, %s, %s, %s, %s)
""", (scout_mclachlan_id, 'Mohamed Salah', 6, '2024-10-30', 
'Clinical finisher with exceptional pace and dribbling. Age 32, still world-class. Transfer value estimated at €50M. Would provide immediate goal threat. Experience and leadership invaluable.'))

cursor.execute("""
INSERT INTO scouting_report (scout_id, target_player_name, target_player_id, report_date, report_desc)
VALUES (%s, %s, %s, %s, %s)
""", (scout_mclachlan_id, 'Alisson Becker', 26, '2024-09-15', 
'World-class goalkeeper with excellent shot-stopping and distribution. Age 31, prime goalkeeper. Transfer value around €60M. Would provide stability in goal. Strong command of area.'))

# Real Madrid scout (Juni Calafat) scouting reports
cursor.execute("""
INSERT INTO scouting_report (scout_id, target_player_name, target_player_id, report_date, report_desc)
VALUES (%s, %s, %s, %s, %s)
""", (scout_calafat_id, 'Pedri', 8, '2024-11-20', 
'Exceptional young midfielder with incredible vision and technique. Age 21, huge potential. Transfer value estimated at €120M. Would be long-term solution for central midfield. Already showing world-class qualities.'))

cursor.execute("""
INSERT INTO scouting_report (scout_id, target_player_name, target_player_id, report_date, report_desc)
VALUES (%s, %s, %s, %s, %s)
""", (scout_calafat_id, 'Ronald Araujo', 3, '2024-10-10', 
'Modern center-back with excellent pace and technical ability. Age 25, peak years ahead. Transfer value around €90M. Would strengthen our defensive options significantly.'))

# Barcelona scout (Ramon Planes) scouting reports
cursor.execute("""
INSERT INTO scouting_report (scout_id, target_player_name, target_player_id, report_date, report_desc)
VALUES (%s, %s, %s, %s, %s)
""", (scout_planes_id, 'Federico Valverde', 5, '2024-09-25', 
'Box-to-box midfielder with exceptional work rate and passing. Age 26, in prime. Transfer value estimated at €100M. Would add dynamism and energy to our midfield. Strong defensively.'))

cursor.execute("""
INSERT INTO scouting_report (scout_id, target_player_name, target_player_id, report_date, report_desc)
VALUES (%s, %s, %s, %s, %s)
""", (scout_planes_id, 'Martin Odegaard', 10, '2024-08-20', 
'Creative midfielder with excellent vision and technical ability. Age 25, peak performance. Transfer value around €80M. Would provide creativity and control in attacking midfield.'))

# AC Milan scout (Paolo Maldini) scouting reports
cursor.execute("""
INSERT INTO scouting_report (scout_id, target_player_name, target_player_id, report_date, report_desc)
VALUES (%s, %s, %s, %s, %s)
""", (scout_maldini_id, 'Harry Kane', 19, '2024-11-05', 
'Clinical striker with exceptional finishing and movement. Age 31, still elite level. Transfer value estimated at €100M. Would provide guaranteed goals. Leadership and experience invaluable.'))

cursor.execute("""
INSERT INTO scouting_report (scout_id, target_player_name, target_player_id, report_date, report_desc)
VALUES (%s, %s, %s, %s, %s)
""", (scout_maldini_id, 'Joshua Kimmich', 9, '2024-10-15', 
'Complete full-back with outstanding crossing and defensive ability. Age 29, prime years. Transfer value around €70M. Would provide width and defensive solidity.'))

# Bayern Munich scout (Michael Reschke) scouting reports
cursor.execute("""
INSERT INTO scouting_report (scout_id, target_player_name, target_player_id, report_date, report_desc)
VALUES (%s, %s, %s, %s, %s)
""", (scout_reschke_id, 'Jamal Musiala', 7, '2024-12-01', 
'Exceptional young talent with incredible dribbling and vision. Age 21, huge potential. Transfer value estimated at €130M. Would be perfect for our attacking style. Already showing world-class qualities.'))

cursor.execute("""
INSERT INTO scouting_report (scout_id, target_player_name, target_player_id, report_date, report_desc)
VALUES (%s, %s, %s, %s, %s)
""", (scout_reschke_id, 'Florian Wirtz', 14, '2024-11-10', 
'Creative midfielder with outstanding technical ability. Age 21, recovering from injury. Transfer value around €100M. Huge potential once fully fit. Would add creativity to our midfield.'))

# PSG scout (Antero Henrique) scouting reports
cursor.execute("""
INSERT INTO scouting_report (scout_id, target_player_name, target_player_id, report_date, report_desc)
VALUES (%s, %s, %s, %s, %s)
""", (scout_henrique_id, 'Bukayo Saka', 21, '2024-10-25', 
'Dynamic winger with exceptional dribbling and crossing. Age 22, developing into world-class. Transfer value estimated at €120M. Would provide width and creativity from left flank.'))

cursor.execute("""
INSERT INTO scouting_report (scout_id, target_player_name, target_player_id, report_date, report_desc)
VALUES (%s, %s, %s, %s, %s)
""", (scout_henrique_id, 'William Saliba', 17, '2024-09-30', 
'Modern center-back with excellent reading of game and composure. Age 23, prime ahead. Transfer value around €80M. Would strengthen our defensive options significantly.'))

# Borussia Dortmund scout (Sven Mislintat) scouting reports
cursor.execute("""
INSERT INTO scouting_report (scout_id, target_player_name, target_player_id, report_date, report_desc)
VALUES (%s, %s, %s, %s, %s)
""", (scout_mislintat_id, 'Enzo Fernandez', 24, '2024-11-15', 
'Creative midfielder with excellent passing range and vision. Age 23, developing well. Transfer value estimated at €90M. Would add control and creativity to our midfield.'))

cursor.execute("""
INSERT INTO scouting_report (scout_id, target_player_name, target_player_id, report_date, report_desc)
VALUES (%s, %s, %s, %s, %s)
""", (scout_mislintat_id, 'Raphinha', 22, '2024-10-20', 
'Skilled winger with excellent dribbling and finishing. Age 28, experienced. Transfer value around €60M. Would provide attacking threat from wide positions.'))


# Insert sample medical reports
# Medical reports for injured players
cursor.execute("""
INSERT INTO medical_report (player_id, summary, report_date, treatment, severity_of_injury)
VALUES (%s, %s, %s, %s, %s)
""", (1, 'Sprained ankle sustained during training session. Player experiencing pain and swelling in right ankle.', '2024-11-15', 'RICE protocol, anti-inflammatory medication, physiotherapy sessions twice daily', 'Moderate'))

cursor.execute("""
INSERT INTO medical_report (player_id, summary, report_date, treatment, severity_of_injury)
VALUES (%s, %s, %s, %s, %s)
""", (3, 'Hamstring strain from sprint training. Grade 2 tear identified via MRI scan.', '2024-10-28', 'Rest, ice therapy, compression, elevation. Physiotherapy focusing on strengthening exercises.', 'Moderate'))

cursor.execute("""
INSERT INTO medical_report (player_id, summary, report_date, treatment, severity_of_injury)
VALUES (%s, %s, %s, %s, %s)
""", (5, 'Groin injury sustained during match. Player reports sharp pain in right groin area.', '2024-11-05', 'Anti-inflammatory medication, rest from training, gradual return to play protocol', 'Mild'))

cursor.execute("""
INSERT INTO medical_report (player_id, summary, report_date, treatment, severity_of_injury)
VALUES (%s, %s, %s, %s, %s)
""", (7, 'Knee ligament sprain from tackle in training. MRI shows partial ACL tear.', '2024-09-20', 'Immobilization with brace, physiotherapy, possible surgical intervention if no improvement', 'Severe'))

cursor.execute("""
INSERT INTO medical_report (player_id, summary, report_date, treatment, severity_of_injury)
VALUES (%s, %s, %s, %s, %s)
""", (9, 'Shoulder dislocation during aerial challenge. X-ray confirms anterior dislocation.', '2024-10-12', 'Closed reduction performed, sling immobilization for 2 weeks, rehabilitation program', 'Moderate'))

cursor.execute("""
INSERT INTO medical_report (player_id, summary, report_date, treatment, severity_of_injury)
VALUES (%s, %s, %s, %s, %s)
""", (11, 'Calf muscle tear from acceleration training. Ultrasound shows partial tear.', '2024-11-22', 'Rest, ice therapy, compression bandage, graduated return to running program', 'Moderate'))

cursor.execute("""
INSERT INTO medical_report (player_id, summary, report_date, treatment, severity_of_injury)
VALUES (%s, %s, %s, %s, %s)
""", (13, 'Concussion from head collision in match. Player showing symptoms of headache and confusion.', '2024-10-05', 'Immediate removal from play, concussion protocol followed, gradual return to contact training', 'Severe'))

cursor.execute("""
INSERT INTO medical_report (player_id, summary, report_date, treatment, severity_of_injury)
VALUES (%s, %s, %s, %s, %s)
""", (15, 'Achilles tendonitis from overuse. Player reports pain at back of heel.', '2024-09-15', 'Rest from running activities, orthotics, eccentric strengthening exercises, anti-inflammatory medication', 'Mild'))

cursor.execute("""
INSERT INTO medical_report (player_id, summary, report_date, treatment, severity_of_injury)
VALUES (%s, %s, %s, %s, %s)
""", (17, 'Back spasm from heavy lifting in gym. Acute lower back pain with restricted movement.', '2024-11-10', 'Pain management medication, rest, core strengthening exercises, manual therapy', 'Mild'))

cursor.execute("""
INSERT INTO medical_report (player_id, summary, report_date, treatment, severity_of_injury)
VALUES (%s, %s, %s, %s, %s)
""", (19, 'Quadriceps contusion from direct impact. Large hematoma on thigh.', '2024-10-18', 'Ice therapy, compression, elevation, pain management, gradual return to training', 'Moderate'))


# Insert medical conditions linked to the medical reports above
# Get the medical report IDs that were just inserted
#this might work 
cursor.execute("SELECT med_report_id, player_id FROM medical_report ORDER BY med_report_id DESC LIMIT 10")
recent_reports = cursor.fetchall()

# Create a mapping of player_id to med_report_id for the conditions
report_mapping = {report[1]: report[0] for report in recent_reports}

# Insert medical conditions for each medical report
# Player 1 (Dalot) - Ankle sprain
cursor.execute("""
INSERT INTO medical_condition (med_report_id, condition_name, description, diagnosis_date)
VALUES (%s, %s, %s, %s)
""", (report_mapping[1], 'Lateral Ankle Sprain', 'Grade 2 sprain of the lateral ligaments with swelling and bruising', '2024-11-15'))

cursor.execute("""
INSERT INTO medical_condition (med_report_id, condition_name, description, diagnosis_date)
VALUES (%s, %s, %s, %s)
""", (report_mapping[1], 'Ankle Instability', 'Chronic ankle instability contributing to repeated sprains', '2024-11-15'))

# Player 3 (Martinez) - Hamstring strain
cursor.execute("""
INSERT INTO medical_condition (med_report_id, condition_name, description, diagnosis_date)
VALUES (%s, %s, %s, %s)
""", (report_mapping[3], 'Hamstring Strain', 'Grade 2 tear of the biceps femoris muscle', '2024-10-28'))

# Player 5 (Fernandes) - Groin injury
cursor.execute("""
INSERT INTO medical_condition (med_report_id, condition_name, description, diagnosis_date)
VALUES (%s, %s, %s, %s)
""", (report_mapping[5], 'Adductor Strain', 'Strain of the adductor longus muscle', '2024-11-05'))



mydb.commit()
cursor.close()
