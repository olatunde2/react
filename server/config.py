from decouple import config
import os

BASE_DIR=os.path.dirname(os.path.realpath(__file__))


class Config:
    SECRET_KEY=config('SECRET_KEY')
    SQLALCHEMY_TRACK_MODIFICATIONS=config('SQLALCHEMY_TRACK_MODIFICATIONS', cast=bool)
    MAIL_SERVER = config("MAIL_SERVER", "smtp.googlemail.com")
    MAIL_PORT = int(config("MAIL_PORT", 587))
    MAIL_USE_TLS = config("MAIL_USE_TLS", "True").lower() == "true"
    MAIL_USE_SSL = config("MAIL_USE_SSL", "False").lower() == "true"
    MAIL_USERNAME = config("MAIL_USERNAME", "your_email@example.com")
    MAIL_PASSWORD = config("MAIL_PASSWORD", "your_password")
    MAIL_DEFAULT_SENDER = config("MAIL_DEFAULT_SENDER", MAIL_USERNAME)

class DevConfig(Config):
    SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(BASE_DIR, "db.sqlite3")
    DEBUG = True
    SQLALCHEMY_ECHO = True


class ProdConfig(Config):
    pass

class TestConfig(Config):
    SQLALCHEMY_DATABASE_URI="sqlite:///test.db"
    SQLALCHEMY_ECHO=False
    TESTING=True



config_dict={
    'dev':DevConfig,
    'test':TestConfig,
    'prod':ProdConfig
}

