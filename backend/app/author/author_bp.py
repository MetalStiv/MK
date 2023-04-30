from flask import Blueprint, current_app, jsonify
from requests import request
from app.author.datamodule import *
from app.decorators import log, requires_login, requires_roles

author_bp = Blueprint('author_bp', __name__)

@requires_login()
@author_bp.route('/getAuthors', methods=['GET'])
def getAuthors():
    conn = current_app.get_db_connection()
    return jsonify(get_authors(conn))

@requires_roles([0, 1])
@log()
@author_bp.route('/addAuthor', methods=['POST'])
def addAuthors():
    conn = current_app.get_db_connection()
    add_author(conn, request.json)
    return '200'

@requires_roles([0, 1])
@log()
@author_bp.route('/updateAuthor', methods=['POST'])
def updateAuthor():
    conn = current_app.get_db_connection()
    update_author(conn, request.json)
    return '200'

@requires_roles([0, 1])
@log()
@author_bp.route('/setInvalidAuthor', methods=['POST'])
def setInvalidAuthor():
    conn = current_app.get_db_connection()
    set_invalid_author(conn, request.json)
    return '200'