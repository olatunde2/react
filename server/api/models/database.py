from .exts import db
from datetime import datetime
import uuid
from sqlalchemy.dialects.postgresql import JSON
from enum import Enum

class ShiftPeriod(Enum):
    MORNING = "morning"
    AFTERNOON = "afternoon"
    NIGHT = "night"


class Client(db.Model):
    __tablename__ = 'client'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(255), nullable=False)
    phone_number = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Client {self.name}>'

    def save(self):
        db.session.add(self)
        db.session.commit()

    def update(self, name, address, phone_number, email):
        self.name = name
        self.address = address
        self.phone_number = phone_number
        self.email = email
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()


class Shift(db.Model):
    __tablename__ = 'shift'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String, db.ForeignKey('user.id'), nullable=False)
    client = db.Column(db.String, db.ForeignKey('client.id'), nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    location = db.Column(db.JSON, nullable=True)
    is_checked_in = db.Column(db.Boolean, default=False)
    is_checked_out = db.Column(db.Boolean, default=False)
    notification_sent = db.Column(db.Boolean, default=False)
    period = db.Column(db.Enum(ShiftPeriod), nullable=False)

    def __repr__(self):
        return f'<Shift {self.start_time} - {self.end_time} ({self.period.value})>'

    def save(self):
        db.session.add(self)
        db.session.commit()

    def update(self, start_time, end_time, period, location, user_id, client):
        self.user_id = user_id
        self.client = client
        self.location = location
        self.start_time = start_time
        self.end_time = end_time
        self.period = period
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'client': self.client,
            'start_time': self.start_time.isoformat(),
            'end_time': self.end_time.isoformat(),
            'location': self.location,
            'is_checked_in': self.is_checked_in,
            'is_checked_out': self.is_checked_out,
            'notification_sent': self.notification_sent,
            'period': self.period.value
        }

class CheckInOut(db.Model):
    __tablename__ = 'check_in_out'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    shift_id = db.Column(db.String, db.ForeignKey('shift.id'), nullable=False)
    check_in_time = db.Column(db.DateTime, nullable=True)
    check_out_time = db.Column(db.DateTime, nullable=True)
    check_in_location = db.Column(db.JSON, nullable=True)
    check_out_location = db.Column(db.JSON, nullable=True)
    total_hours = db.Column(db.Float, nullable=True)

    def __repr__(self):
        return f"<CheckInOut user_id={self.user_name}>"

    def save(self):
        db.session.add(self)
        db.session.commit()
