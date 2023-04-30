def log_data(conn, user_id, request, params):
    cursor = conn.cursor()
    cursor.execute('INSERT INTO log ' +
        ' (log_user, log_url, log_data) ' + 
        ' VALUES (%(user_id)s, %(request)s, %(params)s)', 
        {'user_id': user_id, 'request': request, 'params': params})
    cursor.close()
    conn.commit()
    return {'code': 0}

def get_user_by_name(conn, name):
    cursor = conn.cursor()
    cursor.execute('SELECT user_id, user_name, user_password_hash, ' +
        ' user_role FROM user ' +
        ' WHERE user_name = %(name)s', {'name': name})
    data = cursor.fetchone()
    cursor.close()
    if data is None:
        return None
    return {'Id': data[0], 'Name': name, 'PasswordHash': data[2], 
        'Role': data[3]}

def get_users(conn):
    cursor = conn.cursor()
    cursor.execute('SELECT user_id, user_name, user_role, ' +
        ' user_mail FROM mk_user ORDER BY user_id')
    users = []
    for user in cursor.fetchall():
        users.append({'Id': user[0], 'Role': user[1], 'Name': user[2], 
            'Mail': user[3]})
    cursor.close()
    return users

def add_user(conn, data):
    cursor = conn.cursor()
    cursor.execute('INSERT INTO mk_user (user_name, user_role, user_mail, ' +
        ' user_password_hash) VALUES (%(name)s, %(role)s, ' + 
        ' %(mail)s, %(password_hash)s)', data)
    cursor.close()
    conn.commit()
    return 'Ok'

def update_user_mail(conn, data):
    cursor = conn.cursor()
    cursor.execute('UPDATE mk_user SET user_mail = %(user_mail)s ' +
        ' WHERE user_id = %(user_id)s', data)
    cursor.close()
    conn.commit()
    return 'Ok'

def update_user_role(conn, data):
    cursor = conn.cursor()
    cursor.execute('UPDATE mk_user SET user_role = %(user_role)s ' +
        ' WHERE user_id = %(user_id)s', data)
    cursor.close()
    conn.commit()
    return 'Ok'

def update_user_password(conn, data):
    cursor = conn.cursor()
    cursor.execute('UPDATE mk_user SET user_password_hash = %(user_password_hash)s ' +
        ' WHERE user_id = %(user_id)s', data)
    cursor.close()
    conn.commit()
    return 'Ok'

def delete_user(conn, data):
    cursor = conn.cursor()
    cursor.execute('DELETE FROM mk_user WHERE user_id = %(user_id)s ', data)
    cursor.close()
    conn.commit()
    return 'Ok'

def check_user_name(conn, data):
    cursor = conn.cursor()
    cursor.execute('SELECT count(*) FROM mk_user ' +
        ' WHERE user_name like %(user_name)s', data)
    count = cursor.fetchone()[0]
    cursor.close()
    return {'count': count}