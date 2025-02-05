from flask_restx import Resource, Namespace, fields
from flask import request
from ..models.user import User
from flask_jwt_extended import jwt_required

user_ns = Namespace('users', description="A Namespace for User Management")

# model (serializer)
user_model = user_ns.model(
    'User',
    {
        'id': fields.String(description='User ID'),
        'name': fields.String(required=True, description="User's name"),
        'email': fields.String(required=True, description="User's email"),
        'password': fields.String(required=True, description="User's password"),
        'role': fields.String(description="User's role (worker, admin, etc.)", default='worker'),
        'tenant_id': fields.String(description="Tenant ID for multi-tenancy support"),
        'is_verified': fields.Boolean(description="User verification status", default=False)
    }
)

@user_ns.route('/')
class UsersResource(Resource):
    @user_ns.marshal_list_with(user_model)
    # @jwt_required()
    def get(self):
        """Get all users"""
        try:
            users = User.query.all()
            return users
        except Exception as e:
            return {'message': f'An error occurred: {e}'}, 500



@user_ns.route('/<string:id>')
class UserResource(Resource):
    @user_ns.marshal_with(user_model)
    # @jwt_required()
    def get(self, id):
        """Get a user by ID"""
        try:
            user = User.query.get_or_404(id)
            return user
        except Exception as e:
            return {'message': f'An error occurred: {e}'}, 500

    @user_ns.marshal_with(user_model)
    @user_ns.expect(user_model)
    # @jwt_required()
    def put(self, id):
        """Update a user by ID"""
        try:
            user_to_update = User.query.get_or_404(id)
            data = request.get_json()
            user_to_update.name = data.get('name', user_to_update.name)
            user_to_update.email = data.get('email', user_to_update.email)
            user_to_update.tenant_id = data.get('tenant_id', user_to_update.tenant_id)
            user_to_update.update()
            return user_to_update
        except Exception as e:
            return {'message': f'An error occurred: {e}'}, 500

    # @jwt_required()
    def delete(self, id):
        """Delete a user by ID"""
        try:
            user_to_delete = User.query.get_or_404(id)
            user_to_delete.delete()
            return {'message': 'User deleted successfully'}, 200
        except Exception as e:
            return {'message': f'An error occurred: {e}'}, 500
