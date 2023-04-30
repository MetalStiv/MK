def get_developments(conn, committee_id=0, cath_id=0, user_id=0):
    cursor = conn.cursor()
    filterString = ''
    if committee_id > 0:
        filterString = ' AND committee_id = ' + str(committee_id)
    if user_id > 0:
        filterString += ' AND development_owner_id = ' + str(user_id)
    if cath_id > 0:
        filterString += " AND author_cath_id = " + str(cath_id)

    sql = ''.join(['SELECT distinct(development_id), development_name, '\
        ' committee_id, committee_date, development_reviewer, development_pages, '\
        ' development_state, development_owner_id, development_review, '\
        ' development_cath_resolution, development_deanary_resolution, '\
        ' development_review2, development_number FROM development '\
        ' LEFT JOIN a2dev on a2dev_development_id = development_id '\
        ' LEFT JOIN author on a2dev_author_id = author_id '\
        ' INNER JOIN committee on committee_id = development_committee_id '\
        ' WHERE development_id > 0 ', filterString, 
        ' ORDER BY committee_id DESC, development_id DESC'])

    cursor.execute(sql)
    data = cursor.fetchall()
    developments = []
    cursor.close()
    for development in data:
        cursor = conn.cursor()
        cursor.execute('SELECT author_id, author_short_name '\
            ' FROM author INNER JOIN a2dev on a2dev_author_id = author_id '\
            ' WHERE a2dev_development_id = %(development_id)s', 
            {'development_id': development[0]})
        authors = []
        for author in cursor.fetchall():
            authors.append({'Id': author[0], 'ShortName': author[1]})
        developments.append({'Id': development[0], 'Name': development[1], 
            'Authors': authors, 'Reviewer': development[4],
            'Committee': {'Id': development[2], 'Date': development[3]},
            'Pages': development[5], 'State': development[6],
            'User': {'Id': development[7]}, 'Review': development[8],
            'CathResolution': development[9], 'DeanaryResolution': development[10],
            'Review2': development[11], 'Number': development[12]
        })
    return developments

def get_development_by_id(conn, development_id, user_id):
    cursor = conn.cursor()

    cursor.execute('SELECT development_name, ' +
        ' committee_id, committee_date, development_reviewer, development_pages, development_owner_id, ' +
        ' development_state, development_review, development_cath_resolution, ' +
        ' development_deanary_resolution, development_review2, development_number FROM development ' +
        ' INNER JOIN committee on committee_id = development_committee_id ' +
        ' WHERE development_id = %(development_id)s AND ' + 
        ' (development_owner_id = %(user_id)s OR %(user_id)s IN (SELECT user_id FROM mk_user ' +
        ' WHERE user_role < 2)) ORDER BY development_id DESC', 
        {'development_id': development_id, 'user_id': user_id})
    development = cursor.fetchone()
    cursor.close()
    cursor = conn.cursor()
    cursor.execute('SELECT author_id, author_short_name '\
        ' FROM author INNER JOIN a2dev on a2dev_author_id = author_id '\
        ' WHERE a2dev_development_id = %(development_id)s', 
        {'development_id': development[0]})
    authors = []
    for author in cursor.fetchall():
        authors.append({'Id': author[0], 'ShortName': author[1]})
    return {'Id': development[0], 'Name': development[1], 
            'Authors': authors, 'Reviewer': development[4],
            'Committee': {'Id': development[2], 'Date': development[3]},
            'Pages': development[5], 'State': development[6],
            'User': {'Id': development[7]}, 'Review': development[8],
            'CathResolution': development[9], 'DeanaryResolution': development[10],
            'Review2': development[11], 'Number': development[12]
    }

def get_development_records_by_id(conn, development_id, user_id):
    cursor = conn.cursor()

    cursor.execute('SELECT user_name, dr_type, dr_comment, dr_date,' +
        ' dr_filename FROM development_record ' +
        ' INNER JOIN mk_user on dr_user_id = user_id ' +
        ' INNER JOIN development ON development_id = dr_development_id ' +
        ' WHERE dr_development_id = %(development_id)s AND ' +
        ' (development_owner_id = %(user_id)s OR %(user_id)s IN (SELECT user_id FROM mk_user ' +
        ' WHERE user_role < 2)) ORDER BY dr_date', {'development_id': development_id,
        'user_id': user_id})
    data = cursor.fetchall()
    records = []
    cursor.close()
    for record in data:
        records.append({'User': {'Name': record[0]}, 
            'Comment': record[2], 'Date': record[3],
            'File': record[4], 'Type': record[1]
        })
    return records

def add_document(conn, document_type, filename, development_id, user_id):
    cursor = conn.cursor()

    doc_type = ''
    if document_type == 'review':
        doc_type = 'development_review'
    elif document_type == 'review2':
        doc_type = 'development_review2'
    elif document_type == 'cath_resolution':
        doc_type = 'development_cath_resolution'
    elif document_type == 'deanary_resolution':
        doc_type == 'development_deanary_resolution'
    else:
        return False

    cursor.execute('UPDATE development SET ' + doc_type  + '= %(filename)s ' +
        ' WHERE development_id = %(development_id)s AND ' +
        ' (development_owner_id = %(user_id)s OR %(user_id)s IN ' +
        ' (SELECT user_id FROM mk_user WHERE user_role < 2)) AND development_state <> 4',
        {'filename': filename, 'development_id': development_id,
            'user_id': user_id})
    cursor.close()
    conn.commit()
    return

def update_development(conn, data):
    cursor = conn.cursor()
    cursor.execute('SELECT development_state ' +
        ' FROM development WHERE development_id = %(id)s', data)
    if cursor.fetchone()[0] == 4:
        return '521'
    cursor.close()
    cursor = conn.cursor()
    cursor.execute('UPDATE development SET development_name = %(name)s, ' +
        ' development_reviewer = %(reviewer)s, development_committee_id = %(committee)s,' +
        ' development_pages = %(pages)s WHERE development_id = %(id)s', data)
    cursor.close()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM a2dev ' +
        ' WHERE a2dev_development_id = %(id)s', data)
    cursor.close()
    for author in data['authors']:
        cursor = conn.cursor()
        cursor.execute('INSERT INTO a2dev(a2dev_author_id, ' +
            ' a2dev_development_id) values(%(author)s, %(id)s)',
            {'author': author, 'id': data['id']})
        cursor.close()
    conn.commit()
    return

def add_development(conn, data):
    cursor = conn.cursor()

    cursor.execute('INSERT INTO development(development_name, development_owner_id, ' +
        ' development_committee_id, development_reviewer, development_pages) ' +
        ' values(%(name)s, %(user_id)s, %(committee)s, %(reviewer)s, %(pages)s) ' +
        ' RETURNING development_id', data)
    development_id = cursor.fetchone()[0]
    cursor.close()

    for author in data['authors']:
        cursor = conn.cursor()
        cursor.execute('INSERT INTO a2dev(a2dev_author_id, ' +
            ' a2dev_development_id) values(%(author)s, %(id)s)', 
            {'author': author, 'id': development_id})
        cursor.close()

    cursor = conn.cursor()
    cursor.execute('INSERT INTO development_record (dr_development_id, ' +
        ' dr_user_id, dr_type, dr_comment, dr_filename) ' +
        ' values(%(id)s, %(user_id)s, 0, %(comment)s, %(filename)s)',
        {'author': author, 'id': data['id']})
    cursor.close()
    conn.commit()
    return

def add_comment(conn, data):
    cursor = conn.cursor()

    cursor.execute('INSERT INTO development_record (dr_development_id, ' +
        ' dr_user_id, dr_type, dr_comment, dr_filename) ' +
        ' values(%(development_id)s, %(user_id)s, %(type)s, ' +
        ' %(comment)s, %(filename)s)', data)
    cursor.close()

    cursor = conn.cursor()
    cursor.execute('SELECT development_owner_id' +
        ' FROM development WHERE development_id = %(development_id)s', data)
    res = cursor.fetchone()[0]
    cursor.close()
    if data['type'] == 2 and res[0] == data['user_id']:
        cursor = conn.cursor()
        cursor.execute('UPDATE development SET development_state = 2 ' +
            ' WHERE development_id = %(development_id)s AND ' +
            ' development_state <> 4 AND development_state <> 3', data)
        cursor.close()
    conn.commit()
    return

def get_development_mail(conn, development_id):
    cursor = conn.cursor()
    cursor.execute('SELECT development_name, user_mail ' +
        ' FROM development INNER JOIN mk_use ON development_owner_id = user_id ' +
        ' WHERE development_id = %(development_id)s', {'development_id': development_id})
    [development_name, mail] = cursor.fetchone()[0]
    cursor.close()
    return [development_name, mail]

def get_report_developments(conn, data):
    cursor = conn.cursor()

    cursor.execute('SELECT distinct(development_id), development_name, ' +
        ' committee_id, committee_date, development_reviewer, development_pages, ' +
        ' development_state, development_owner_id, development_review, ' +
        ' development_cath_resolution, development_deanary_resolution, ' +
        ' development_review2, development_number FROM development ' +
        ' LEFT JOIN a2dev on a2dev_development_id = development_id ' +
        ' LEFT JOIN author on a2dev_author_id = author_id ' +
        ' INNER JOIN committee on committee_id = development_committee_id ' +
        ' WHERE development_id > 0 AND committee_date >= %(startDate)s ' +
        ' AND committee_date <= %(endDate)s AND author_cath_id IN (' + data['caths'] + ')' +
        ' AND (development_state = 3 OR development_state = 4)'+
        ' ORDER BY committee_id DESC, development_id DESC', data)
    data = cursor.fetchall()
    developments = []
    cursor.close()
    for development in data:
        cursor = conn.cursor()
        cursor.execute('SELECT author_id, author_short_name '\
            ' FROM author INNER JOIN a2dev on a2dev_author_id = author_id '\
            ' WHERE a2dev_development_id = %(development_id)s', 
            {'development_id': development[0]})
        authors = []
        for author in cursor.fetchall():
            authors.append({'Id': author[0], 'ShortName': author[1]})
        developments.append({'Id': development[0], 'Name': development[1], 
            'Authors': authors, 'Reviewer': development[4],
            'Committee': {'Id': development[2], 'Date': development[3]},
            'Pages': development[5], 'State': development[6],
            'User': {'Id': development[7]}, 'Review': development[8],
            'CathResolution': development[9], 'DeanaryResolution': development[10],
            'Review2': development[11], 'Number': development[12]
        })
    return developments