from functools import wraps
from flask import session, current_app, request
from app.user.datamodule import log_data

def requires_login():
    def wrapper(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            if not 'user_name' in session:
                '', '255 User not allowed'
            return f(*args, **kwargs)
        return wrapped
    return wrapper

def requires_roles(*roles):
    def wrapper(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            if session['user_role'] not in roles:
                return '', '255 User not allowed'
            return f(*args, **kwargs)
        return wrapped
    return wrapper

def log():
    def wrapper(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            response = f(*args, **kwargs)
            flag = 0
            try:
                if response[1] == 200 or response[1] == 302:
                    flag = 1
            except:
                pass

            if flag:
                conn = current_app.get_db_connection()
                log_data(conn, session['user_id'], request.path, str(request.json))
            return response
        return wrapped
    return wrapper