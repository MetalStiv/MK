from flask import Blueprint, jsonify, current_app
from requests import request
from app.cath.datamodule import *
from app.decorators import log, requires_login, requires_roles

cath_bp = Blueprint('cath_bp', __name__)

@requires_login()
@cath_bp.route('/getCaths', methods=['GET'])
def getCaths():
    conn = current_app.get_db_connection()
    return jsonify(get_caths(conn))

@requires_login()
@cath_bp.route('/getValidCaths', methods=['GET'])
def getValidCaths():
    conn = current_app.get_db_connection()
    return jsonify(get_caths(conn, True))

@requires_roles([0])
@log()
@cath_bp.route('/addCath', methods=['POST'])
def addCath():
    conn = current_app.get_db_connection()
    add_cath(conn, request.json)
    return '200'

@requires_roles([0])
@log()
@cath_bp.route('/setCathValid', methods=['POST'])
def setCathValid():
    conn = current_app.get_db_connection()
    set_cath_valid(conn, request.json)
    return ''