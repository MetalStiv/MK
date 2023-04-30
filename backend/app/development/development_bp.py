from random import choices
from string import ascii_lowercase, ascii_uppercase, digits
from datetime import datetime
from flask import Blueprint, current_app, jsonify, session, request
from app.development.datamodule import *
from decorators import log, requires_login, requires_roles
import os
from flask_mail import Message

development_bp = Blueprint('development_bp', __name__)

@requires_login()
@development_bp.route('/getDevelopments', methods=['GET'])
def getDevelopments():
    conn = current_app.get_db_connection()
    committee_id = request.args['committee']
    cath_id = request.args['cath']
    return jsonify(get_developments(conn, 
        committee_id=committee_id, cath_id=cath_id))

@requires_login()
@development_bp.route('/getDevelopmentsByUser', methods=['GET'])
def getDevelopmentsByUser():
    conn = current_app.get_db_connection()
    committee_id = request.args['committee']
    return jsonify(get_developments(conn, 
        committee_id=committee_id, user_id=session['user_id']))

@requires_login()
@development_bp.route('/getDevelopmentById', methods=['GET'])
def getDevelopmentById():
    conn = current_app.get_db_connection()
    development_id = request.args['development_id']
    return jsonify(get_development_by_id(conn, 
        development_id, session['user_id']))

@requires_login()
@development_bp.route('/getDevelopmentRecordsById', methods=['GET'])
def getDevelopmentRecordsById():
    conn = current_app.get_db_connection()
    development_id = request.args['development_id']
    return jsonify(get_development_records_by_id(conn, 
        development_id, session['user_id']))

@requires_login()
@log()
@development_bp.route('/addDevelopment', methods=['POST'])
def addDevelopment():
    if 'file' not in request.files:
        return 'error'
    file = request.files['file']
    if file.filename == '':
        return 'error'
    filename = file.filename

    if not (filename.split('.')[-1] == 'pdf' or filename.split('.')[-1] == 'zip' \
        or filename.split('.')[-1] == 'tar' or filename.split('.')[-1] == 'docx'):
        return jsonify({'code': 1})
    extension = filename.split('.')[-1]

    current_date = datetime.today().strftime('%d-%m-%Y')
    filename = ''.join([current_date, '_', 
        choices(ascii_lowercase + ascii_uppercase+ digits, k=6)]) + '.' + extension
    conn = current_app.get_db_connection()
    file.save(os.path.join(current_app.FILE_PATH, filename))
    request.form['user_id'] = session['user_id']
    request.form['filename'] = filename
    add_development(conn, request.form)
    return '200'

@requires_roles([0, 1])
@log()
@development_bp.route('/acceptDevelopment', methods=['POST'])
def acceptDevelopment():
    if 'file' not in request.files:
        return 'error'
    file = request.files['file']
    if file.filename == '':
            return 'error'
    filename = file.filename

    if not (filename.split('.')[-1] == 'pdf' or filename.split('.')[-1] == 'zip' \
        or filename.split('.')[-1] == 'tar' or filename.split('.')[-1] == 'docx'):
        return jsonify({'code': 1})
    extension = filename.split('.')[-1]

    current_date = datetime.today().strftime('%d-%m-%Y')
    filename = ''.join([current_date, '_', 
        choices(ascii_lowercase + ascii_uppercase+ digits, k=6)]) + '.' + extension
    conn = current_app.get_db_connection()
    request.form['filename'] = filename
    request.form['type'] = 3
    add_comment(conn, request.form)

    [development_name, user_mail] = get_development_mail(request.form['development_id'])

    msg = Message('Ваша МР принята к МК', recipients=[user_mail])
    msg.body = 'Ваша МР "' + development_name + '" была принята к методической комиссии.'
    mail = current_app.mail
    mail.send(msg)
    return '200'

@requires_roles([0, 1])
@log()
@development_bp.route('/declineDevelopment', methods=['POST'])
def declineDevelopment():
    if 'file' not in request.files:
        return 'error'
    file = request.files['file']
    if file.filename == '':
            return 'error'
    filename = file.filename

    if not (filename.split('.')[-1] == 'pdf' or filename.split('.')[-1] == 'zip' \
        or filename.split('.')[-1] == 'tar' or filename.split('.')[-1] == 'docx'):
        return jsonify({'code': 1})
    extension = filename.split('.')[-1]

    current_date = datetime.today().strftime('%d-%m-%Y')
    filename = ''.join([current_date, '_', 
        choices(ascii_lowercase + ascii_uppercase+ digits, k=6)]) + '.' + extension
    conn = current_app.get_db_connection()
    request.form['filename'] = filename
    request.form['type'] = 1
    add_comment(conn, request.form)

    [development_name, user_mail] = get_development_mail(request.form['development_id'])

    msg = Message('Ваша МР требует доработки', recipients=[user_mail])
    msg.body = 'Ваша МР "' + development_name + '" требует доработки.'
    mail = current_app.mail
    mail.send(msg)
    return '200'

@requires_roles([0, 1])
@log()
@development_bp.route('/updateDevelopment', methods=['POST'])
def updateDevelopment():
    conn = current_app.get_db_connection()
    update_development(conn, request.form)
    return '200'

@requires_login()
@log()
@development_bp.route('/addRecord', methods=['POST'])
def addRecord():
    if 'file' not in request.files:
        return 'error'
    file = request.files['file']
    if file.filename == '':
            return 'error'
    filename = file.filename

    if not (filename.split('.')[-1] == 'pdf' or filename.split('.')[-1] == 'zip' \
        or filename.split('.')[-1] == 'tar' or filename.split('.')[-1] == 'docx'):
        return jsonify({'code': 1})
    extension = filename.split('.')[-1]

    current_date = datetime.today().strftime('%d-%m-%Y')
    filename = ''.join([current_date, '_', 
        choices(ascii_lowercase + ascii_uppercase+ digits, k=6)]) + '.' + extension
    conn = current_app.get_db_connection()
    request.form['filename'] = filename
    request.form['type'] = 2
    add_comment(conn, request.form)

    [development_name, user_mail] = get_development_mail(request.form['development_id'])

    msg = Message('К МР был оставлен комментарий автора', recipients=current_app.ADMIN_MAIL)
    msg.body = 'К МР "' + development_name + '" (ID= ' + str(request.form['development_id'])\
        + ') был оставлен комментарий автора.'
    mail = current_app.mail
    mail.send(msg)
    return '200'

@requires_login()
@development_bp.route('/addReview', methods=['POST'])
def addReview():
    if 'file' not in request.files:
        return 'error'
    file = request.files['file']
    if file.filename == '':
            return 'error'
    filename = file.filename

    if not (filename.split('.')[-1] == 'pdf' or filename.split('.')[-1] == 'zip' \
        or filename.split('.')[-1] == 'tar'):
        return jsonify({'code': 1})
    extension = filename.split('.')[-1]

    current_date = datetime.today().strftime('%d-%m-%Y')
    filename = ''.join([current_date, '_', 
        choices(ascii_lowercase + ascii_uppercase+ digits, k=6)]) + '.' + extension
    conn = current_app.get_db_connection()
    add_document(conn, 'review', filename, request.form['id'], session['user_id'])
    file.save(os.path.join(current_app.FILE_PATH, filename))

    msg = Message('Новая МР', recipients=current_app.ADMIN_MAIL)
    msg.body = 'В систему была добавлена новая МР "' + request.form['name'] + '".'
    mail = current_app.mail
    mail.send(msg)

    return '200'

@requires_login()
@development_bp.route('/addReview2', methods=['POST'])
def addReview2():
    if 'file' not in request.files:
        return 'error'
    file = request.files['file']
    if file.filename == '':
            return 'error'
    filename = file.filename

    if not (filename.split('.')[-1] == 'pdf' or filename.split('.')[-1] == 'zip' \
        or filename.split('.')[-1] == 'tar'):
        return jsonify({'code': 1})
    extension = filename.split('.')[-1]

    current_date = datetime.today().strftime('%d-%m-%Y')
    filename = ''.join([current_date, '_', 
        choices(ascii_lowercase + ascii_uppercase+ digits, k=6)]) + '.' + extension
    conn = current_app.get_db_connection()
    add_document(conn, 'review2', filename, request.form['id'], session['user_id'])
    file.save(os.path.join(current_app.FILE_PATH, filename))
    
    return '200'

@requires_login()
@development_bp.route('/addCathResolution', methods=['POST'])
def addCathResolution():
    if 'file' not in request.files:
        return 'error'
    file = request.files['file']
    if file.filename == '':
            return 'error'
    filename = file.filename

    if not (filename.split('.')[-1] == 'pdf' or filename.split('.')[-1] == 'zip' \
        or filename.split('.')[-1] == 'tar'):
        return jsonify({'code': 1})
    extension = filename.split('.')[-1]

    current_date = datetime.today().strftime('%d-%m-%Y')
    filename = ''.join([current_date, '_', 
        choices(ascii_lowercase + ascii_uppercase+ digits, k=6)]) + '.' + extension
    conn = current_app.get_db_connection()
    add_document(conn, 'cath_resolution', filename, request.form['id'], session['user_id'])
    file.save(os.path.join(current_app.FILE_PATH, filename))
    
    return '200'

@requires_login()
@development_bp.route('/addDeanaryResolution', methods=['POST'])
def addDeanaryResolution():
    if 'file' not in request.files:
        return 'error'
    file = request.files['file']
    if file.filename == '':
            return 'error'
    filename = file.filename

    if not (filename.split('.')[-1] == 'pdf' or filename.split('.')[-1] == 'zip' \
        or filename.split('.')[-1] == 'tar'):
        return jsonify({'code': 1})
    extension = filename.split('.')[-1]

    current_date = datetime.today().strftime('%d-%m-%Y')
    filename = ''.join([current_date, '_', 
        choices(ascii_lowercase + ascii_uppercase+ digits, k=6)]) + '.' + extension
    conn = current_app.get_db_connection()
    add_document(conn, 'deanary_resolution', filename, request.form['id'], session['user_id'])
    file.save(os.path.join(current_app.FILE_PATH, filename))
    
    return '200'

@requires_login()
@development_bp.route('/getReportDevelopments', methods=['GET'])
def getReportDevelopments():
    conn = current_app.get_db_connection()
    return jsonify(get_report_developments(conn, request.args))