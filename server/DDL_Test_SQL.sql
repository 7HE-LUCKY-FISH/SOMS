CREATE DATABASE IF NOT EXISTS SOMS CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE SOMS;

-- Tables
CREATE TABLE IF NOT EXISTS team (
  team_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  level VARCHAR(50),
  date_created DATE NOT NULL DEFAULT (CURDATE()),
  UNIQUE KEY uq_team_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS staff (
  staff_id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  middle_name VARCHAR(50),
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  salary DECIMAL(10,2) NOT NULL,
  age INT NOT NULL,
  date_hired DATE NOT NULL DEFAULT (CURDATE()),
  staff_type VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS coach (
  staff_id INT PRIMARY KEY,
  role VARCHAR(50) NOT NULL,
  team_id INT NULL,
  CONSTRAINT fk_coach_staff FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_coach_team FOREIGN KEY (team_id) REFERENCES team(team_id) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_coach_team (team_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS scout (
  staff_id INT PRIMARY KEY,
  region VARCHAR(100),
  YOE INT NOT NULL,
  CONSTRAINT fk_scout_staff FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS med_staff (
  staff_id INT PRIMARY KEY,
  med_specialization VARCHAR(100) NOT NULL,
  certification VARCHAR(100) NOT NULL,
  YOE INT NOT NULL,
  CONSTRAINT fk_med_staff_staff FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS player (
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
  photo LONGBLOB,
  photo_content_type VARCHAR(100),
  photo_filename VARCHAR(255),
  photo_size BIGINT,
  photo_uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_player_identity (first_name, last_name, contract_end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS medical_report (
  med_report_id INT AUTO_INCREMENT PRIMARY KEY,
  player_id INT NOT NULL,
  summary TEXT,
  report_date DATE NOT NULL,
  treatment TEXT,
  severity_of_injury VARCHAR(50),
  CONSTRAINT fk_med_report_player FOREIGN KEY (player_id) REFERENCES player(player_id) ON DELETE CASCADE,
  INDEX idx_medrep_player (player_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS medical_condition (
  condition_id INT AUTO_INCREMENT PRIMARY KEY,
  med_report_id INT,
  condition_name VARCHAR(100) NOT NULL,
  description TEXT,
  diagnosis_date DATE,
  CONSTRAINT fk_condition_med_report FOREIGN KEY (med_report_id) REFERENCES medical_report(med_report_id) ON DELETE CASCADE,
  INDEX idx_condition_med_report (med_report_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS match_table (
  match_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  venue VARCHAR(100),
  match_time TIME,
  opponent_team VARCHAR(100),
  match_date DATE,
  result VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS scouting_report (
  report_id INT AUTO_INCREMENT PRIMARY KEY,
  scout_id INT,
  target_player_name VARCHAR(100),
  target_player_id INT,
  report_date DATE,
  report_desc TEXT,
  CONSTRAINT fk_scouting_scout FOREIGN KEY (scout_id) REFERENCES scout(staff_id) ON DELETE CASCADE,
  CONSTRAINT fk_scouting_target_player FOREIGN KEY (target_player_id) REFERENCES player(player_id) ON DELETE CASCADE,
  INDEX idx_scouting_scout (scout_id),
  INDEX idx_scouting_target_player (target_player_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS staff_account (
  staff_id INT PRIMARY KEY,
  username VARCHAR(64) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_login DATETIME NULL,
  CONSTRAINT fk_staff_account_staff FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS player_match_stats (
  pms_id INT AUTO_INCREMENT PRIMARY KEY,
  player_id INT,
  match_id INT,
  team_id INT,
  started BOOLEAN DEFAULT FALSE,
  tackles INT DEFAULT 0,
  minutes INT DEFAULT 0,
  saves INT DEFAULT 0,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- View
CREATE OR REPLACE VIEW vw_player_medical_summary AS
SELECT
  p.player_id,
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

-- Sample seed data (minimal, for testing)
INSERT INTO team (name, level) VALUES ('Lions', 'Professional')
  ON DUPLICATE KEY UPDATE team_id = LAST_INSERT_ID(team_id);
SET @team_lions_id = LAST_INSERT_ID();

INSERT INTO team (name, level) VALUES ('Tigers', 'Development')
  ON DUPLICATE KEY UPDATE team_id = LAST_INSERT_ID(team_id);
SET @team_tigers_id = LAST_INSERT_ID();

INSERT INTO staff (first_name, middle_name, last_name, email, salary, age, date_hired, staff_type)
VALUES ('John', 'A', 'Doe', 'john.doe@example.com', 60000.00, 42, CURDATE(), 'Coach')
  ON DUPLICATE KEY UPDATE staff_id = LAST_INSERT_ID(staff_id);
SET @coach_id = LAST_INSERT_ID();

INSERT INTO staff (first_name, middle_name, last_name, email, salary, age, date_hired, staff_type)
VALUES ('Sally', NULL, 'Scout', 'sally.scout@example.com', 45000.00, 36, CURDATE(), 'Scout')
  ON DUPLICATE KEY UPDATE staff_id = LAST_INSERT_ID(staff_id);
SET @scout_id = LAST_INSERT_ID();

INSERT INTO staff (first_name, middle_name, last_name, email, salary, age, date_hired, staff_type)
VALUES ('Marta', NULL, 'Medic', 'marta.med@example.com', 55000.00, 39, CURDATE(), 'Med')
  ON DUPLICATE KEY UPDATE staff_id = LAST_INSERT_ID(staff_id);
SET @med_id = LAST_INSERT_ID();

INSERT INTO staff (first_name, middle_name, last_name, email, salary, age, date_hired, staff_type)
VALUES ('Tom', NULL, 'Admin', 'tom.admin@example.com', 40000.00, 30, CURDATE(), 'Admin')
  ON DUPLICATE KEY UPDATE staff_id = LAST_INSERT_ID(staff_id);
SET @tom_id = LAST_INSERT_ID();

INSERT INTO staff_account (staff_id, username, password_hash, is_active, last_login)
VALUES (@tom_id, 'tom.admin', 'sha256_testhash_placeholder', 1, NULL)
  ON DUPLICATE KEY UPDATE username = VALUES(username), password_hash = VALUES(password_hash), is_active = VALUES(is_active);

INSERT INTO coach (staff_id, role, team_id) VALUES (@coach_id, 'Head Coach', @team_lions_id)
  ON DUPLICATE KEY UPDATE role = VALUES(role), team_id = VALUES(team_id);

INSERT INTO scout (staff_id, region, YOE) VALUES (@scout_id, 'North Region', 8)
  ON DUPLICATE KEY UPDATE region = VALUES(region), YOE = VALUES(YOE);

INSERT INTO med_staff (staff_id, med_specialization, certification, YOE)
VALUES (@med_id, 'Physiotherapy', 'Certified Physio', 12)
  ON DUPLICATE KEY UPDATE med_specialization = VALUES(med_specialization), certification = VALUES(certification), YOE = VALUES(YOE);

INSERT INTO player (first_name, middle_name, last_name, salary, positions, is_active, is_injured, transfer_value, contract_end_date, scouted_player)
VALUES ('Alex', NULL, 'Forward', 30000.00, 'FW', 1, 0, 150000.00, '2026-06-30', 0)
  ON DUPLICATE KEY UPDATE player_id = LAST_INSERT_ID(player_id);
SET @alex_id = LAST_INSERT_ID();

INSERT INTO player (first_name, middle_name, last_name, salary, positions, is_active, is_injured, transfer_value, contract_end_date, scouted_player)
VALUES ('Ben', 'K', 'Keeper', 25000.00, 'GK', 1, 0, 80000.00, '2025-12-31', 0)
  ON DUPLICATE KEY UPDATE player_id = LAST_INSERT_ID(player_id);
SET @ben_id = LAST_INSERT_ID();

INSERT INTO player (first_name, middle_name, last_name, salary, positions, is_active, is_injured, transfer_value, contract_end_date, scouted_player)
VALUES ('Sam', NULL, 'Injured', 20000.00, 'MF', 0, 1, 50000.00, '2024-11-30', 1)
  ON DUPLICATE KEY UPDATE player_id = LAST_INSERT_ID(player_id);
SET @sam_id = LAST_INSERT_ID();

INSERT INTO medical_report (player_id, summary, report_date, treatment, severity_of_injury)
VALUES (@sam_id, 'Hamstring tear', CURDATE(), 'Rest and physio', 'Moderate')
  ON DUPLICATE KEY UPDATE med_report_id = LAST_INSERT_ID(med_report_id);
SET @med_report_id = LAST_INSERT_ID();

INSERT INTO medical_condition (med_report_id, condition_name, description, diagnosis_date)
VALUES (@med_report_id, 'Hamstring Tear', 'Grade 2 hamstring strain', CURDATE())
  ON DUPLICATE KEY UPDATE condition_id = LAST_INSERT_ID(condition_id);
SET @condition_id = LAST_INSERT_ID();

INSERT INTO match_table (name, venue, match_time, opponent_team, match_date, result)
VALUES ('Season Opener', 'Main Stadium', '15:00:00', 'Rivals FC', CURDATE(), '2-1')
  ON DUPLICATE KEY UPDATE match_id = LAST_INSERT_ID(match_id);
SET @match_id = LAST_INSERT_ID();

INSERT INTO player_match_stats (player_id, match_id, team_id, started, minutes, goals, assists, shots_total, saves)
VALUES (@alex_id, @match_id, @team_lions_id, 1, 90, 1, 1, 4, 0)
  ON DUPLICATE KEY UPDATE pms_id = LAST_INSERT_ID(pms_id), minutes = VALUES(minutes), goals = VALUES(goals), assists = VALUES(assists), shots_total = VALUES(shots_total), saves = VALUES(saves);

INSERT INTO player_match_stats (player_id, match_id, team_id, started, minutes, tackles, goals, saves)
VALUES (@ben_id, @match_id, @team_lions_id, 1, 90, 3, 0, 3)
  ON DUPLICATE KEY UPDATE pms_id = LAST_INSERT_ID(pms_id), minutes = VALUES(minutes), tackles = VALUES(tackles), goals = VALUES(goals), saves = VALUES(saves);

INSERT INTO scouting_report (scout_id, target_player_name, target_player_id, report_date, report_desc)
VALUES (@scout_id, CONCAT('Alex',' ','Forward'), @alex_id, CURDATE(), 'Quick, agile forward with good finishing')
  ON DUPLICATE KEY UPDATE report_id = LAST_INSERT_ID(report_id), report_desc = VALUES(report_desc);

-- Manchester United 2024-2025 squad (at least 23 players)

-- Team
INSERT INTO team (name, level) VALUES ('Manchester United', 'Premier League')
  ON DUPLICATE KEY UPDATE team_id = LAST_INSERT_ID(team_id);
SET @team_mu_id = LAST_INSERT_ID();

-- Staff
INSERT INTO staff (first_name, middle_name, last_name, email, salary, age, date_hired, staff_type)
VALUES ('Erik', NULL, 'ten Hag', 'erik.tenhag@manutd.com', 9000000.00, 54, '2022-06-01', 'Coach')
  ON DUPLICATE KEY UPDATE staff_id = LAST_INSERT_ID(staff_id);
SET @coach_id = LAST_INSERT_ID();

INSERT INTO staff (first_name, middle_name, last_name, email, salary, age, date_hired, staff_type)
VALUES ('David', NULL, 'Harrison', 'david.harrison@manutd.com', 500000.00, 45, '2021-07-01', 'Scout')
  ON DUPLICATE KEY UPDATE staff_id = LAST_INSERT_ID(staff_id);
SET @scout_id = LAST_INSERT_ID();

INSERT INTO staff (first_name, middle_name, last_name, email, salary, age, date_hired, staff_type)
VALUES ('Richard', NULL, 'Hartis', 'richard.hartis@manutd.com', 600000.00, 56, '2019-07-01', 'Med')
  ON DUPLICATE KEY UPDATE staff_id = LAST_INSERT_ID(staff_id);
SET @med_id = LAST_INSERT_ID();

INSERT INTO staff (first_name, middle_name, last_name, email, salary, age, date_hired, staff_type)
VALUES ('Tom', NULL, 'Admin', 'tom.admin@manutd.com', 400000.00, 30, '2024-02-01', 'Admin')
  ON DUPLICATE KEY UPDATE staff_id = LAST_INSERT_ID(staff_id);
SET @admin_id = LAST_INSERT_ID();

-- Staff account
INSERT INTO staff_account (staff_id, username, password_hash, is_active, last_login)
VALUES (@admin_id, 'tom.admin', 'sha256_testhash_placeholder', 1, NULL)
  ON DUPLICATE KEY UPDATE username = VALUES(username), password_hash = VALUES(password_hash), is_active = VALUES(is_active);

-- Coach
INSERT INTO coach (staff_id, role, team_id) VALUES (@coach_id, 'Manager', @team_mu_id)
  ON DUPLICATE KEY UPDATE role = VALUES(role), team_id = VALUES(team_id);

-- Scout
INSERT INTO scout (staff_id, region, YOE) VALUES (@scout_id, 'Europe', 15)
  ON DUPLICATE KEY UPDATE region = VALUES(region), YOE = VALUES(YOE);

-- Med Staff
INSERT INTO med_staff (staff_id, med_specialization, certification, YOE)
VALUES (@med_id, 'Head of Medical', 'UEFA Certified', 25)
  ON DUPLICATE KEY UPDATE med_specialization = VALUES(med_specialization), certification = VALUES(certification), YOE = VALUES(YOE);

-- 23 Manchester United players (2024-2025 squad, sample salaries/values)
INSERT INTO player (first_name, middle_name, last_name, salary, positions, is_active, is_injured, transfer_value, contract_end_date, scouted_player,
    photo, photo_content_type, photo_filename, photo_size, photo_uploaded_at
) VALUES
('Andre', NULL, 'Onana', 7000000.00, 'GK', 1, 0, 35000000.00, '2028-06-30', 0, NULL, 'image/png', 'player_images/Onana.png', NULL, CURRENT_TIMESTAMP),
('Altay', NULL, 'Bayindir', 3000000.00, 'GK', 1, 0, 8000000.00, '2027-06-30', 0, NULL, 'image/png', 'player_images/Bayindir.png', NULL, CURRENT_TIMESTAMP),
('Tom', NULL, 'Heaton', 1500000.00, 'GK', 1, 0, 1000000.00, '2025-06-30', 0, NULL, 'image/png', 'player_images/Heaton.png', NULL, CURRENT_TIMESTAMP),

('Diogo', NULL, 'Dalot', 4000000.00, 'RB', 1, 0, 25000000.00, '2028-06-30', 0, NULL, 'image/png', 'player_images/Dalot.png', NULL, CURRENT_TIMESTAMP),
('Aaron', NULL, 'Wan-Bissaka', 4000000.00, 'RB', 1, 0, 20000000.00, '2025-06-30', 0, NULL, 'image/png', 'player_images/Wan-Bissaka.png', NULL, CURRENT_TIMESTAMP),
('Raphael', NULL, 'Varane', 10000000.00, 'CB', 1, 0, 25000000.00, '2025-06-30', 0, NULL, 'image/png', 'player_images/Varane.png', NULL, CURRENT_TIMESTAMP),
('Lisandro', NULL, 'Martinez', 8000000.00, 'CB', 1, 0, 40000000.00, '2027-06-30', 0, NULL, 'image/png', 'player_images/Martinez.png', NULL, CURRENT_TIMESTAMP),
('Leny', NULL, 'Yoro', 6000000.00, 'CB', 1, 0, 35000000.00, '2029-06-30', 0, NULL, 'image/png', 'player_images/Yoro.png', NULL, CURRENT_TIMESTAMP),
('Harry', NULL, 'Maguire', 9000000.00, 'CB', 1, 0, 15000000.00, '2025-06-30', 0, NULL, 'image/png', 'player_images/Maguire.png', NULL, CURRENT_TIMESTAMP),
('Jonny', NULL, 'Evans', 2000000.00, 'CB', 1, 0, 1000000.00, '2025-06-30', 0, NULL, 'image/png', 'player_images/Evans.png', NULL, CURRENT_TIMESTAMP),
('Luke', NULL, 'Shaw', 7000000.00, 'LB', 1, 1, 25000000.00, '2027-06-30', 0, NULL, 'image/png', 'player_images/Shaw.png', NULL, CURRENT_TIMESTAMP),
('Noussair', NULL, 'Mazraoui', 4000000.00, 'LB,RB', 1, 0, 25000000.00, '2027-06-30', 0, NULL, 'image/png', 'player_images/Mazraoui.png', NULL, CURRENT_TIMESTAMP),

('Casemiro', NULL, 'Casemiro', 12000000.00, 'CDM', 1, 0, 30000000.00, '2026-06-30', 0, NULL, 'image/png', 'player_images/Casemiro.png', NULL, CURRENT_TIMESTAMP),
('Kobbie', NULL, 'Mainoo', 1000000.00, 'CM', 1, 0, 25000000.00, '2027-06-30', 0, NULL, 'image/png', 'player_images/Mainoo.png', NULL, CURRENT_TIMESTAMP),
('Scott', NULL, 'McTominay', 4000000.00, 'CM', 1, 0, 18000000.00, '2025-06-30', 0, NULL, 'image/png', 'player_images/McTominay.png', NULL, CURRENT_TIMESTAMP),
('Christian', NULL, 'Eriksen', 6000000.00, 'CM', 1, 0, 8000000.00, '2025-06-30', 0, NULL, 'image/png', 'player_images/Eriksen.png', NULL, CURRENT_TIMESTAMP),
('Bruno', NULL, 'Fernandes', 12000000.00, 'CAM', 1, 0, 70000000.00, '2026-06-30', 0, NULL, 'image/png', 'player_images/Fernandes.png', NULL, CURRENT_TIMESTAMP),
('Mason', NULL, 'Mount', 7000000.00, 'CM', 1, 0, 50000000.00, '2028-06-30', 0, NULL, 'image/png', 'player_images/Mount.png', NULL, CURRENT_TIMESTAMP),

('Marcus', NULL, 'Rashford', 10000000.00, 'LW', 1, 0, 80000000.00, '2028-06-30', 0, NULL, 'image/png', 'player_images/Rashford.png', NULL, CURRENT_TIMESTAMP),
('Alejandro', NULL, 'Garnacho', 2000000.00, 'LW', 1, 0, 60000000.00, '2028-06-30', 0, NULL, 'image/png', 'player_images/Garnacho.png', NULL, CURRENT_TIMESTAMP),
('Antony', NULL, 'Antony', 8000000.00, 'RW', 1, 0, 40000000.00, '2027-06-30', 0, NULL, 'image/png', 'player_images/Antony.png', NULL, CURRENT_TIMESTAMP),
('Jadon', NULL, 'Sancho', 8000000.00, 'RW', 1, 0, 35000000.00, '2026-06-30', 0, NULL, 'image/png', 'player_images/Sancho.png', NULL, CURRENT_TIMESTAMP),
('Rasmus', NULL, 'Hojlund', 6000000.00, 'ST', 1, 0, 50000000.00, '2028-06-30', 0, NULL, 'image/png', 'player_images/Hojlund.png', NULL, CURRENT_TIMESTAMP),
('Anthony', NULL, 'Martial', 8000000.00, 'ST', 1, 0, 12000000.00, '2024-06-30', 0, NULL, 'image/png', 'player_images/Martial.png', NULL, CURRENT_TIMESTAMP);

-- Medical report for Luke Shaw (injured)
INSERT INTO medical_report (player_id, summary, report_date, treatment, severity_of_injury)
VALUES ((SELECT player_id FROM player WHERE last_name='Shaw' LIMIT 1), 'Muscle injury', '2024-10-01', 'Rest and physiotherapy', 'Moderate')
  ON DUPLICATE KEY UPDATE med_report_id = LAST_INSERT_ID(med_report_id);
SET @shaw_med_id = LAST_INSERT_ID();

INSERT INTO medical_condition (med_report_id, condition_name, description, diagnosis_date)
VALUES (@shaw_med_id, 'Muscle Injury', 'Left hamstring strain', '2024-10-01')
  ON DUPLICATE KEY UPDATE condition_id = LAST_INSERT_ID(condition_id);

-- Match
INSERT INTO match_table (name, venue, match_time, opponent_team, match_date, result)
VALUES ('Manchester United vs Liverpool', 'Old Trafford', '16:30:00', 'Liverpool', '2024-11-24', '2-2')
  ON DUPLICATE KEY UPDATE match_id = LAST_INSERT_ID(match_id);
SET @match_id = LAST_INSERT_ID();

-- Player match stats (for some players)
INSERT INTO player_match_stats (player_id, match_id, team_id, started, minutes, goals, assists, shots_total, saves)
VALUES ((SELECT player_id FROM player WHERE last_name='Onana' LIMIT 1), @match_id, @team_mu_id, 1, 90, 0, 0, 0, 5)
  ON DUPLICATE KEY UPDATE pms_id = LAST_INSERT_ID(pms_id), minutes = VALUES(minutes), saves = VALUES(saves);

INSERT INTO player_match_stats (player_id, match_id, team_id, started, minutes, goals, assists, shots_total, saves)
VALUES ((SELECT player_id FROM player WHERE last_name='Fernandes' LIMIT 1), @match_id, @team_mu_id, 1, 90, 1, 1, 3, 0)
  ON DUPLICATE KEY UPDATE pms_id = LAST_INSERT_ID(pms_id), minutes = VALUES(minutes), goals = VALUES(goals), assists = VALUES(assists);

INSERT INTO player_match_stats (player_id, match_id, team_id, started, minutes, goals, assists, shots_total, saves)
VALUES ((SELECT player_id FROM player WHERE last_name='Rashford' LIMIT 1), @match_id, @team_mu_id, 1, 90, 1, 0, 4, 0)
  ON DUPLICATE KEY UPDATE pms_id = LAST_INSERT_ID(pms_id), minutes = VALUES(minutes), goals = VALUES(goals);

-- Scouting report
INSERT INTO scouting_report (scout_id, target_player_name, target_player_id, report_date, report_desc)
VALUES (@scout_id, 'Rasmus Hojlund', (SELECT player_id FROM player WHERE last_name='Hojlund' LIMIT 1), '2024-08-01', 'Strong, fast striker with good finishing')
  ON DUPLICATE KEY UPDATE report_id = LAST_INSERT_ID(report_id), report_desc = VALUES(report_desc);

-- Quick tests
SELECT '--- Teams ---' AS info; SELECT * FROM team;
SELECT '--- Staff ---' AS info; SELECT staff_id, first_name, last_name, email, staff_type FROM staff;
SELECT '--- Players ---' AS info; SELECT player_id, first_name, last_name, positions, is_active, is_injured FROM player;
SELECT '--- Player medical summary view ---' AS info; SELECT * FROM vw_player_medical_summary LIMIT 10;
SELECT '--- Player match stats (recent) ---' AS info; SELECT pms_id, player_id, match_id, minutes, goals, assists, saves FROM player_match_stats LIMIT 10;
SELECT '--- Scouting reports ---' AS info; SELECT * FROM scouting_report LIMIT 10;
