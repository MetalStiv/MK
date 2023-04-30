def get_degrees(conn):
    cursor = conn.cursor()
    cursor.execute('SELECT degree_id, degree_name ' +
        ' FROM degree ORDER BY degree_id')
    degrees = []
    for degree in cursor.fetchall():
        degrees.append({'Id': degree[0], 'Name': degree[1]})
    cursor.close()
    return degrees