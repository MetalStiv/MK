def get_committees(conn, onlyValid=False):
    cursor = conn.cursor()
    sql = 'SELECT committee_id, '\
        ' committee_date, committee_state, (SELECT count(development_id) '\
        ' FROM development WHERE development_committee_id = committee_id) '\
        ' as dev_quantity, committee_number '\
        ' FROM committee'
    if onlyValid:
        sql += ' WHERE committee_state = 0 '
    cursor.execute(sql)
    committees = []
    for committee in cursor.fetchall():
        committees.append({'Id': committee[0], 'Date': committee[1], 
        'State': committee[2], 'DevQuantity': committee[3], 'Number': committee[4]})
    cursor.close()
    return committees

def get_current_committee(conn):
    cursor = conn.cursor()
    cursor.execute('SELECT committee_id, ' +
        ' committee_date, committee_state, committee_number FROM committee' +
        ' WHERE committee_id = (SELECT max(committee_id) FROM committee)')
    res = cursor.fetchone()
    cursor.close()
    return res[0]

def add_committee(conn, data):
    cursor = conn.cursor()
    cursor.execute('INSERT INTO committee (committee_date, committee_number) ' +
        ' VALUES (%(date)s, %(number)s)', data)
    cursor.close()
    conn.commit()
    return 'Ok'

def set_committee_state(conn, data):
    cursor = conn.cursor()
    cursor.execute('UPDATE committee SET committee_state = %(state)s ' +
        ' WHERE committee_id = %(id)s ', data)
    if data['state'] == 3:
        cursor2 = conn.cursor()
        cursor2.execute('UPDATE development SET development_state = 4 ' +
            ' WHERE development_committee_id = %(id)s AND development_state = 3 ' +
            ' AND NOT development_review IS NULL AND NOT development_cath_resolution IS NULL ' +
            ' AND NOT development_deanary_resolution IS NULL AND NOT development_review2 IS NULL', data)
        cursor2.clode()
    cursor.close()
    conn.commit()
    return 'Ok'