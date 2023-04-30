from flask import Blueprint, current_app, jsonify, request
from app.committee.datamodule import *
from app.decorators import log, requires_login, requires_roles
import subprocess

committee_bp = Blueprint('committee_bp', __name__)

@requires_login()
@committee_bp.route('/getCommittees', methods=['GET'])
def getCommittees():
    conn = current_app.get_db_connection()
    return jsonify(get_committees(conn))

@requires_login()
@committee_bp.route('/getAvailableCommittees', methods=['GET'])
def getAvailableCommittees():
    conn = current_app.get_db_connection()
    return jsonify(get_committees(conn, True))

@requires_roles([0, 1, 2])
@log()
@committee_bp.route('/addCommittee', methods=['POST'])
def addCommittee():
    conn = current_app.get_db_connection()
    add_committee(conn, request.json)
    return '200'

@requires_roles([0, 1, 2])
@log()
@committee_bp.route('/setCommitteeState', methods=['POST'])
def setCommitteeState():
    conn = current_app.get_db_connection()
    set_committee_state(conn, request.json)
    if request.json['state'] == 2:
        subprocess.call('python3 report.py ' +  
            str(request.json['id']), shell=True)
    return '200'

@requires_login()
@committee_bp.route('/getCurrentCommitteeId', methods=['GET'])
def getCurrentCommitteeId():
    conn = current_app.get_db_connection()
    return str(get_current_committee(conn))