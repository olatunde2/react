from .exts import db
import uuid
from datetime import datetime


class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(512), nullable=False)
    role = db.Column(db.String(128), default='worker') # e.g., 'admin', 'supervisor', 'worker'
    tenant_id = db.Column(db.String(36), nullable=True)
    is_verified = db.Column(db.Boolean, default=False)
    verification_code = db.Column(db.String(36), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


    def __repr__(self):
        return f'<User {self.name}>'

    @classmethod
    def get_user_by_name(cls, name):
        return cls.query.filter_by(name=name).first()

    @classmethod
    def get_user_by_email(cls, email):
        return cls.query.filter_by(email=email).first()

    def save(self):
        db.session.add(self)
        db.session.commit()

    def update(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()


class TokenBlocklist(db.Model):
    id = db.Column(db.Integer(), primary_key=True)
    jti = db.Column(db.String(36), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def __repr__(self):
        return f'<Token {self.jti}>'

    def save(self):
        db.session.add(self)
        db.session.commit()

    def to_dict(self):
        """Convert TokenBlocklist object to dictionary"""
        return {
            'id': self.id,
            'jti': self.jti,
            'created_at': self.created_at.isoformat()
        }
    
    @classmethod
    def is_token_blocked(cls, jti):
        """Check if the token's jti is already in the blocklist"""
        return cls.query.filter_by(jti=jti).first() is not None