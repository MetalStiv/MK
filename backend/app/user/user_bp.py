from flask import Blueprint, jsonify, request, current_app, session
from app.user.datamodule import *
from app.decorators import log, requires_roles
from werkzeug.security import check_password_hash, generate_password_hash

user_bp = Blueprint('user_bp', __name__)

@user_bp.route('/signIn', methods=['POST'])
def signIn():
    conn = current_app.get_db_connection()
    user_info = get_user_by_name(conn, request.json['name'])
    if user_info is None:
        return jsonify({
            'role': -1 
        })
    if check_password_hash(user_info['PasswordHash'], 
        request.json['password']):
        session['user_id'] = user_info['Id']
        session['user_role'] = user_info['Role']
        session['user_name'] = user_info['Name']
        return jsonify({
            'role': user_info['Role'],
            'id': user_info['Id'], 
        })
    else:
        return jsonify({
            'role': -1 
        })

@user_bp.route('/signOut', methods=['POST'])
def signOut():
    session.pop('user_id', None)
    session.pop('user_role', None)
    return ''

@requires_roles([0])
@user_bp.route('/getUsers', methods=['GET'])
def getUsers():
    conn = current_app.get_db_connection()
    return jsonify(get_users(conn))

@requires_roles([0])
@log()
@user_bp.route('/addUser', methods=['POST'])
def addUser():
    conn = current_app.get_db_connection()
    request.json['password_hash'] = \
        generate_password_hash(request.json['password'])
    add_user(conn, request.json)
    return '', '200'

@requires_roles([0])
@user_bp.route('/checkUserName', methods=['GET'])
def checkUserName():
    conn = current_app.get_db_connection()
    return jsonify(check_user_name(conn, request.json))

@requires_roles([0])
@log()
@user_bp.route('/removeUserById', methods=['GET'])
def removeUserById():
    conn = current_app.get_db_connection()
    delete_user(conn, request.json)
    return '200'

@requires_roles([0])
@log()
@user_bp.route('/updateUserMail', methods=['GET'])
def updateUserMail():
    conn = current_app.get_db_connection()
    update_user_mail(conn, request.json)
    return '200'

@requires_roles([0])
@log()
@user_bp.route('/updateUserRole', methods=['GET'])
def updateUserRole():
    conn = current_app.get_db_connection()
    update_user_role(conn, request.json)
    return '200'

@requires_roles([0])
@log()
@user_bp.route('/updateUserPass', methods=['GET'])
def updateUserPass():
    conn = current_app.get_db_connection()
    request.json['user_password_hash'] = generate_password_hash(request.json['user_pass'])
    update_user_password(conn, request.json)
    return '200'