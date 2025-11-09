CREATE DATABASE IF NOT EXISTS SOMS;
USE SOMS;

CREATE TABLE IF NOT EXISTS team
(
    team_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    level VARCHAR(50),
    date_created DATE NOT NULL DEFAULT(CURDATE()),
    UNIQUE KEY uq_team_name (name)
);

CREATE TABLE IF NOT EXISTS staff
( staff_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    middle_name VARCHAR(50),
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    salary DECIMAL(10,2) NOT NULL,
    age INT NOT NULL,
    date_hired DATE NOT NULL DEFAULT(CURDATE()),
    staff_type VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS coach
(
    staff_id INT  PRIMARY KEY,
    role VARCHAR(50) NOT NULL,
    team_id INT NULL, 
    CONSTRAINT fk_coach_staff
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_coach_team
    FOREIGN KEY (team_id) REFERENCES team(team_id)
    ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_coach_team (team_id)
);

CREATE TABLE IF NOT EXISTS scout
(
    staff_id INT PRIMARY KEY,
    region VARCHAR(100),
    YOE INT NOT NULL,
  CONSTRAINT fk_scout_staff
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS med_staff
(
    staff_id INT PRIMARY KEY,
    med_specialization VARCHAR(100) NOT NULL,
    certification VARCHAR(100) NOT NULL,
    YOE INT NOT NULL,
    CONSTRAINT fk_med_staff_staff
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS player 
(
    player_id INT AUTO_INCREMENT PRIMARY KEY,
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
    -- profile photo stored in the DB (LONGBLOB): binary, content type, filename, size and timestamp
    photo LONGBLOB,
    photo_content_type VARCHAR(100),
    photo_filename VARCHAR(255),
    photo_size BIGINT,
    photo_uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medical_report 
(
    med_report_id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    summary TEXT,
    report_date DATE NOT NULL,
    treatment TEXT,
    severity_of_injury VARCHAR(50),
    CONSTRAINT fk_med_report_player FOREIGN KEY (player_id)
        REFERENCES player(player_id)
        ON DELETE CASCADE,
    INDEX idx_medrep_player (player_id)
);

CREATE TABLE IF NOT EXISTS medical_condition 
(
    condition_id INT AUTO_INCREMENT PRIMARY KEY,
    med_report_id INT,
    condition_name VARCHAR(100) NOT NULL,
    description TEXT,
    diagnosis_date DATE,
    CONSTRAINT fk_condition_med_report FOREIGN KEY (med_report_id)
        REFERENCES medical_report(med_report_id)
        ON DELETE CASCADE,
    INDEX idx_condition_med_report (med_report_id)
);

CREATE TABLE IF NOT EXISTS match_table 
(
    match_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    venue VARCHAR(100),
    match_time TIME,
    opponent_team VARCHAR   (100),
    match_date DATE,
    result VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS scouting_report 
(
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    scout_id INT,
    target_player_name VARCHAR(100),
    target_player_id INT,
    report_date DATE,
    report_desc TEXT,
    CONSTRAINT fk_scouting_scout FOREIGN KEY (scout_id)
        REFERENCES scout(staff_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_scouting_target_player FOREIGN KEY (target_player_id)
        REFERENCES player(player_id)
        ON DELETE CASCADE,
    INDEX idx_scouting_scout (scout_id),
    INDEX idx_scouting_target_player (target_player_id)
);

CREATE TABLE IF NOT EXISTS staff_account(
 staff_id INT PRIMARY KEY, 
 username VARCHAR(64) NOT NULL UNIQUE, 
 password_hash VARCHAR(255) NOT NULL, 
 is_active BOOLEAN DEFAULT TRUE, 
 last_login DATETIME NULL,
  CONSTRAINT fk_staff_account_staff
   FOREIGN KEY (staff_id) REFERENCES staff(staff_id)
   ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS player_match_stats 
(
    pms_id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT,
    match_id INT,
    team_id INT,
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

CREATE OR REPLACE VIEW vw_player_medical_summary AS
    SELECT p.player_id, 
    CONCAT_WS(' ', p.first_name, p.middle_name, p.last_name) AS player_name,
  mr.med_report_id,
  mr.report_date,
  mr.severity_of_injury,
  mc.condition_id,
  mc.condition_name,
  mc.diagnosis_date
FROM player p
JOIN medical_report mr ON mr.player_id = p.player_id
LEFT JOIN medical_condition mc ON mc.med_report_id = mr.med_report_id;
