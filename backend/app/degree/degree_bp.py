from flask import Blueprint, current_app, jsonify
from app.degree.datamodule import *
from app.decorators import requires_login

degree_bp = Blueprint('degree_bp', __name__)

@requires_login()
@degree_bp.route('/getDegrees', methods=['GET'])
def getDegrees():
    conn = current_app.get_db_connection()
    return jsonify(get_degrees(conn))