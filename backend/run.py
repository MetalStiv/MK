from app import create_app

class Config(object):
    DEBUG = False
    TESTING = False
    SECRET_KEY = 'SecretKeyqwerty12345!!'

class DevelopmentConfig(Config):
    DB_HOST = '10.50.103.24'
    DB_NAME = 'mk'
    DB_USER_NAME = 'sysadmin'
    DB_USER_PASSWORD = 'qwerty'
    DEBUG = False
    MAX_CONTENT_LENGTH = 16*1024*1024
    FILE_PATH = '/nginx/mk-files/storage/'
    MAIL_SERVER = 'mail.bmstu.ru'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = 'stepangrishunov@bmstu.ru'
    MAIL_DEFAULT_SENDER = 'stepangrishunov@bmstu.ru'
    MAIL_PASSWORD = 'bfg3svas8'
    ADMIN_MAIL = ['stepangrishunov@bmstu.ru']

app = create_app(DevelopmentConfig)
app_port = 8083
app.run('0.0.0.0', port=app_port)