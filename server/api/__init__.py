from flask import Flask
from flask_restx import Api,Resource
from .models.user import User
from .models.database import Client, CheckInOut, Shift
from .models.exts import db
from flask_migrate import Migrate
from flask_mail import Mail
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from .routes.client import client_ns
from .routes.auth import auth_ns
from .routes.shifts import shift_ns
from .routes.check_in_out import check_in_out_ns
from .routes.user import user_ns


def create_app(config):
    app=Flask(__name__)
    app.config.from_object(config)
    db.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}}, methods=["GET", "POST", "OPTIONS"])
    migrate=Migrate(app,db)
    JWTManager(app)
    mail = Mail(app)

    api = Api(app, doc='/', version="1.0", title="API", description="Worker System API")

    api.add_namespace(client_ns, path='/api/v1/clients')
    api.add_namespace(auth_ns, path='/api/v1/auth')
    api.add_namespace(shift_ns, path='/api/v1/shifts')
    api.add_namespace(check_in_out_ns, path='/api/v1/check_in_out')
    api.add_namespace(user_ns, path='/api/v1/users')

    with app.app_context():
        db.create_all()

    @api.route('/hello')
    class HelloResource(Resource):
        def get(self):
            return {'message':'Hello World'}


    @app.shell_context_processor
    def make_shell_context():
        return{
            'db':db,
            'Client': Client,
            'CheckInOut':CheckInOut,
            'Shift':Shift,
            'User':User
        }



    return app