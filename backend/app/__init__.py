from flask import Flask, current_app
from flask_cors import CORS
from flask_mail import Mail
from app.user.user_bp import user_bp
from app.author.author_bp import author_bp
from app.cath.cath_bp import cath_bp
from app.committee.committee_bp import committee_bp
from app.degree.degree_bp import degree_bp
from app.development.development_bp import development_bp
import psycopg2

def create_app(config):
    app = Flask(__name__, static_folder='/app/build')
    app.config.from_object(config)
    CORS(app)

    mail = Mail(app)

    def get_db_connection():
        return psycopg2.connect(
            host = app.config['DB_HOST'],
            database = app.config['DB_NAME'],
            user = app.config['DB_USER_NAME'],
            password = app.config['DB_USER_PASSWORD'])

    app_ctx = app.app_context()
    app_ctx.push()
    current_app.get_db_connection = get_db_connection
    current_app.FILE_PATH = app.config['FILE_PATH']
    current_app.ADMIN_MAIL = app.config['ADMIN_MAIL']
    current_app.mail = mail

    app.register_blueprint(user_bp)
    app.register_blueprint(author_bp)
    app.register_blueprint(cath_bp)
    app.register_blueprint(committee_bp)
    app.register_blueprint(degree_bp)
    app.register_blueprint(development_bp)

    return app