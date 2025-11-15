from db_connect_module import get_db_connection

def seed_formations():
    formations = [
        {'code': '4-3-3', 'name': 'Four-Three-Three'},
        {'code': '4-2-3-1', 'name': 'Four-Two-Three-One'},
        {'code': '3-5-2', 'name': 'Three-Five-Two'},
        {'code': '4-4-2', 'name': 'Four-Four-Two'},
        {'code': '3-4-3', 'name': 'Three-Four-Three'},
        {'code': '5-3-2', 'name': 'Five-Three-Two'},
    ]
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        for formation in formations:
            # Check if formation already exists
            cursor.execute("SELECT formation_id FROM formation WHERE code = %s", (formation['code'],))
            existing = cursor.fetchone()
            
            if existing:
                print(f"Formation {formation['code']} already exists (ID: {existing[0]})")
            else:
                cursor.execute(
                    "INSERT INTO formation (code, name) VALUES (%s, %s)",
                    (formation['code'], formation['name'])
                )
                print(f"Created formation {formation['code']} (ID: {cursor.lastrowid})")
        
        conn.commit()
        print("\nFormations seeded successfully")
        
    except Exception as e:
        conn.rollback()
        print(f"Error seeding formations: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    seed_formations()
