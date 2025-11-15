"""
Seed script to create a default team and dummy match for testing lineup functionality
"""

from db_connect_module import get_db_connection
from datetime import date, time

def seed_team_and_match():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Create a default team
        cursor.execute("SELECT team_id FROM team WHERE team_name = 'My Team'")
        team = cursor.fetchone()
        
        if team:
            team_id = team[0]
            print(f"Team already exists (ID: {team_id})")
        else:
            cursor.execute(
                "INSERT INTO team (team_name, league, stadium) VALUES (%s, %s, %s)",
                ('My Team', 'Premier League', 'Home Stadium')
            )
            team_id = cursor.lastrowid
            print(f"Created team 'My Team' (ID: {team_id})")
        
        # Create a default match
        cursor.execute("SELECT match_id FROM match_table WHERE name = 'Training Match'")
        match = cursor.fetchone()
        
        if match:
            match_id = match[0]
            print(f"Match already exists (ID: {match_id})")
        else:
            cursor.execute(
                "INSERT INTO match_table (name, venue, match_time, opponent_team, match_date, result) VALUES (%s, %s, %s, %s, %s, %s)",
                ('Training Match', 'Home', time(15, 0), 'TBD', date.today(), 'TBD')
            )
            match_id = cursor.lastrowid
            print(f"Created match 'Training Match' (ID: {match_id})")
        
        conn.commit()
        print(f"\nSeeding complete!")
        print(f"   Team ID: {team_id}")
        print(f"   Match ID: {match_id}")
        print(f"\nUse these IDs in your lineup builder for testing.")
        
    except Exception as e:
        conn.rollback()
        print(f"Error seeding: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    seed_team_and_match()
