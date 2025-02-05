from flask_restx import Resource, Namespace, fields
from flask import request, jsonify, make_response
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    get_jwt
)
from ..models.user import User, TokenBlocklist
from ..models.exts import db
from ..utils.email_utils import generate_verification_code, send_verification_email, send_reset_password_email
from ..utils.email_utils import admin_required

auth_ns = Namespace('auth', description="A Namespace for Authentication Management")

# Models for request validation
signup_model = auth_ns.model('Signup', {
    'name': fields.String(),
    'tenant_id': fields.String(),
    'role': fields.String(),
    'email': fields.String(),
    'password': fields.String(),
})

verify_email_model = auth_ns.model('VerifyEmail', {
    'email': fields.String(),
    'verification_code': fields.String()
})

login_model = auth_ns.model('Login', {
    'tenant_id': fields.String(),
    'password': fields.String()
})

forget_password_model = auth_ns.model('ForgetPassword', {
    'email': fields.String()
})

reset_password_model = auth_ns.model('ResetPassword', {
    'new_password': fields.String()
})

refresh_model = auth_ns.model('Refresh', {
    'refresh_token': fields.String()
})

logout_model = auth_ns.model('Logout', {
    'refresh_token': fields.String(),
    'access_token': fields.String()
})

@auth_ns.route('/signup')
class SignupResource(Resource):
    @auth_ns.expect(signup_model)
    def post(self):
        try:
            data = request.get_json()
            tenant_id = data.get('tenant_id')
            email = data.get('email')

            if User.query.filter_by(tenant_id=tenant_id).first():
                return {'message': f'Tenant with username {tenant_id} already exists'}, 400
            if User.query.filter_by(email=email).first():
                return {'message': f'{email} already exists'}, 400

            new_user = User(
                name=data.get('name'),
                email=email,
                tenant_id=tenant_id,
                role=data.get('role'),
                password=generate_password_hash(data.get('password')),
                is_verified=False,
                verification_code=generate_verification_code()
            )

            db.session.add(new_user)
            db.session.commit()
            send_verification_email(new_user.email, new_user.verification_code)

            return make_response(jsonify({'message': 'User created successfully. Please verify your email.'}), 201)
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500

@auth_ns.route('/verify_email')
class VerifyEmailResource(Resource):
    @auth_ns.expect(verify_email_model)
    def post(self):
        data = request.get_json()
        email = data.get('email')
        verification_code = data.get('verification_code')

        user = User.query.filter_by(email=email).first()
        if user and user.verification_code == verification_code:
            user.is_verified = True
            user.verification_code = None
            db.session.commit()
            return jsonify({'message': 'Email verified successfully'})
        return jsonify({'error': 'Invalid verification code or email'}), 400

@auth_ns.route('/login')
class LoginResource(Resource):
    @auth_ns.expect(login_model)
    def post(self):
        data = request.get_json()
        tenant_id = data.get('tenant_id')
        password = data.get('password')

        user = User.query.filter_by(tenant_id=tenant_id).first()
        if user and check_password_hash(user.password, password):
            if not user.is_verified:
                return jsonify({'error': 'Please verify your email first'}), 401

            access_token = create_access_token(identity=user.name, additional_claims={"role": user.role, "user_id": user.id})
            refresh_token = create_refresh_token(identity=user.name)
            return jsonify({'access_token': access_token, 'refresh_token': refresh_token})
        return jsonify({'error': 'Invalid username or password'}), 401

@auth_ns.route('/forgot_password')
class ForgotPasswordResource(Resource):
    @auth_ns.expect(forget_password_model)
    def post(self):
        data = request.get_json()
        email = data.get('email')

        user = User.query.filter_by(email=email).first()
        if user:
            reset_token = create_access_token(identity=user.name, fresh=False)
            send_reset_password_email(user.email, reset_token)
            return jsonify({'message': 'Password reset email sent'})
        return jsonify({'error': 'Email not found'}), 404

@auth_ns.route('/reset_password/<string:reset_token>')
class ResetPasswordResource(Resource):
    @auth_ns.expect(reset_password_model)
    def post(self, reset_token):
        data = request.get_json()
        new_password = data.get('new_password')

        try:
            identity = get_jwt_identity()
            user = User.query.filter_by(username=identity).first()
            if user:
                user.password = generate_password_hash(new_password)
                db.session.commit()
                return jsonify({'message': 'Password updated successfully'})
            return jsonify({'error': 'Invalid token'}), 401
        except Exception as e:
            return jsonify({'error': str(e)}), 500

@auth_ns.route('/refresh')
class RefreshResource(Resource):
    @auth_ns.expect(refresh_model)
    @jwt_required(refresh=True)
    def post(self):
        current_user = get_jwt_identity()
        new_access_token = create_access_token(identity=current_user)
        return make_response(jsonify({'access_token': new_access_token}), 200)

@auth_ns.route('/logout')
class LogoutResource(Resource):
    @auth_ns.expect(logout_model)
    @jwt_required()
    def post(self):
        try:
            jwt = get_jwt()
            jti = jwt['jti']
            token = TokenBlocklist(jti=jti)
            db.session.add(token)
            db.session.commit()
            return jsonify({"message": "Logged out successfully"}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

### 🔹 Admin Promotion Endpoint
@auth_ns.route('/promote_to_admin/<uuid:user_id>')
class PromoteToAdminResource(Resource):
    @jwt_required()
    def put(self, user_id):
        user_id_str = str(user_id)
        user = User.query.filter_by(id=user_id_str).first()

        if not user:
            return jsonify({"message": "User not found"}), 404

        user.is_admin = True
        try:
            db.session.commit()
            return jsonify({"message": f"User {user.username} promoted to admin"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": f"Error promoting user to admin: {str(e)}"}), 500
