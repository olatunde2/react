import random
import string
from functools import wraps
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from flask_mail import Message
from flask import current_app, jsonify
import logging
from ..models.user import User  # Ensure correct import path

# Configure logging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)

def generate_verification_code():
    """Generate a 6-character alphanumeric verification code."""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

def send_verification_email(user_email, verification_code):
    """Send a verification email with a generated verification code."""
    try:
        msg = Message(
            'Verify your email address',
            sender=current_app.config.get('MAIL_DEFAULT_SENDER', 'noreply@yourapp.com'),
            recipients=[user_email]
        )
        msg.body = f'Your verification code is: {verification_code}'
        current_app.extensions['mail'].send(msg)
        logger.info(f"Verification email sent to {user_email}")
    except Exception as e:
        logger.error(f"Error sending verification email: {e}")

def send_reset_password_email(user_email, reset_token):
    """Send a password reset email with a reset token."""
    try:
        reset_url = f"http://yourapp.com/reset_password/{reset_token}"
        msg = Message(
            'Reset your password',
            sender=current_app.config.get('MAIL_DEFAULT_SENDER', 'noreply@yourapp.com'),
            recipients=[user_email]
        )
        msg.body = f'Click the link to reset your password: {reset_url}'
        current_app.extensions['mail'].send(msg)
        logger.info(f"Password reset email sent to {user_email}")
    except Exception as e:
        logger.error(f"Error sending password reset email: {e}")

def admin_required(fn):
    """Decorator to ensure the user is an admin before accessing an endpoint."""
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        identity = get_jwt_identity()
        user = User.query.filter_by(username=identity).first()

        logger.debug(f"JWT Claims: {get_jwt()}")

        if not user or user.role.lower() != 'admin':
            return jsonify({"message": "Admin access required"}), 403

        return fn(*args, **kwargs)

    return wrapper

def is_admin():
    """Check if the current user has admin privileges."""
    identity = get_jwt_identity()
    user = User.query.filter_by(username=identity).first()
    return bool(user and user.role.lower() in ['admin', 'superadmin'])
