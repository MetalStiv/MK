def get_caths(conn, onlyValid=False):
    cursor = conn.cursor()
    sql = 'SELECT cath_id, cath_index, cath_full_name, cath_valid FROM cath'
    if onlyValid:
        sql += ' WHERE cath_valid = true'
    cursor.execute(sql)
    caths = []
    for cath in cursor.fetchall():
        caths.append({'Id': cath[0], 'Index': cath[1], 
        'Name': cath[2], 'Valid': cath[3]})
    cursor.close()
    return caths

def add_cath(conn, data):
    cursor = conn.cursor()
    cursor.execute('INSERT INTO cath (cath_index, cath_full_name, cath_valid) ' +
        ' VALUES (%(index)s, %(name)s, %(valid)s)', data)
    cursor.close()
    conn.commit()
    return 'Ok'

def set_cath_valid(conn, data):
    cursor = conn.cursor()
    cursor.execute('UPDATE cath SET cath_valid = %(valid)s ' +
        ' WHERE cath_id = %(id)s', data)
    cursor.close()
    conn.commit()
    return 'Ok'