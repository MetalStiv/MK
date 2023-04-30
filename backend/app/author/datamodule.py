def get_authors(conn):
    cursor = conn.cursor()
    cursor.execute('SELECT author_id, author_name, author_family, ' + 
        ' author_patronymic, author_short_name, author_full_name, ' +
        ' author_cath_id, author_degree_id FROM author WHERE author_valid = true' +
        ' ORDER BY author_id')
    authors = []
    for author in cursor.fetchall():
        authors.append({'Id': author[0], 'Name': author[1], 
        'Family': author[2], 'Patronimyc': author[3],
        'ShortName': author[4], 'FullName': author[5],
        'CathId': author[6], 'DegreeId': author[7]})
    cursor.close()
    return authors

def add_author(conn, data):
    cursor = conn.cursor()
    cursor.execute('INSERT INTO author(author_family, author_name, ' +
        ' author_patronymic, author_cath_id, author_degree_id) ' +
        ' VALUES (%(family)s, %(name)s, %(patronymic)s, %(cath)s, %(degree)s)',
        data)
    cursor.close()
    conn.commit()
    return 'Ok'

def update_author(conn, data):
    cursor = conn.cursor()
    cursor.execute('SELECT update_author(%(id)s, %(family)s, %(name)s, ' +
        ' %(patronymic)s, %(cath)s, %(degree)s)', data)
    cursor.close()
    conn.commit()
    return 'Ok'

def set_invalid_author(conn, data):
    cursor = conn.cursor()
    cursor.execute('UPDATE author set author_valid = false ' +
        ' WHERE author_id = %(id)s', data)
    cursor.close()
    conn.commit()
    return 'Ok'