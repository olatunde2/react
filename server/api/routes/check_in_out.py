from flask_restx import Resource, Namespace, fields
from flask import request, jsonify
from flask_jwt_extended import jwt_required
from datetime import datetime
from ..models.database import CheckInOut, Shift
from ..models.exts import db
import logging
import uuid

# Define the CheckInOut model as an API schema for input/output
check_in_out_ns = Namespace('check', description="A Namespace for Check-In/Out Management")

logging.basicConfig(level=logging.DEBUG)

check_in_model = check_in_out_ns.model(
    'CheckIn',
    {
        'shift_id': fields.String(required=True, description='Shift ID to check in to'),
        'check_in_location': fields.Raw(required=True, description='Check-in location details'),
    }
)

check_out_model = check_in_out_ns.model(
    'CheckOut',
    {
        'check_out_location': fields.Raw(required=True, description='Check-out location details'),
        'total_hours': fields.Float(description='Total hours worked'),
    }
)

check_in_out_model = check_in_out_ns.model(
    'CheckInOut',
    {
        'id': fields.String(),
        'shift_id': fields.String(),
        'check_in_time': fields.DateTime(),
        'check_out_time': fields.DateTime(),
        'check_in_location': fields.Raw(),
        'check_out_location': fields.Raw(),
        'total_hours': fields.Float(),
    }
)


@check_in_out_ns.route('/check-in')
class CheckInResource(Resource):
    @check_in_out_ns.expect(check_in_model)
    def post(self):
        """Check-In for a specific shift"""
        try:
            data = request.get_json()
            shift_id = data.get('shift_id')
            check_in_location = data.get('check_in_location')

            if not shift_id or not check_in_location:
                return {"message": "shift_id and check_in_location are required"}, 400

            # Fetch the active shift
            active_shift = Shift.query.filter_by(id=shift_id, is_checked_in=False).first()
            if not active_shift:
                logging.warning(f"No active shift found for shift ID {shift_id}")
                return {"message": "No active shift found for the shift ID"}, 404

            # Create the CheckInOut entry
            check_in = CheckInOut(
                id=str(uuid.uuid4()),
                shift_id=active_shift.id,
                check_in_time=datetime.utcnow(),
                check_in_location=check_in_location
            )

            # Update the shift status
            active_shift.is_checked_in = True
            db.session.add(check_in)
            db.session.commit()

            logging.info(f"Successfully checked in for shift ID {shift_id}")
            return {"message": "Check-in successful", "check_in_id": check_in.id}, 201
        except Exception as e:
            logging.error(f"Error in check-in: {str(e)}")
            return {"message": f"An error occurred: {e}"}, 500


@check_in_out_ns.route('/check-out/<string:shift_id>')
class CheckOutResource(Resource):
    @check_in_out_ns.expect(check_out_model)
    def put(self, shift_id):
        """Check-Out for a specific shift using shift ID"""
        try:
            data = request.get_json()
            check_out_location = data.get('check_out_location')

            if not check_out_location:
                return {"message": "check_out_location is required"}, 400

            check_in_out = CheckInOut.query.filter_by(shift_id=shift_id).first()
            if not check_in_out:
                return {"message": "Check-in record not found for the given shift ID"}, 404

            if check_in_out.check_out_time:
                return {"message": "Check-out already recorded for this shift"}, 400

            check_in_out.check_out_time = datetime.utcnow()
            check_in_out.check_out_location = check_out_location

            total_duration = (check_in_out.check_out_time - check_in_out.check_in_time).total_seconds() / 3600
            check_in_out.total_hours = round(total_duration, 2)

            active_shift = Shift.query.filter_by(id=shift_id).first()
            if active_shift:
                active_shift.is_checked_out = True

            db.session.commit()

            logging.info(f"Successfully checked out for shift ID {shift_id}")
            return {"message": "Check-out successful", "total_hours": check_in_out.total_hours}, 200
        except Exception as e:
            logging.error(f"Error during check-out for shift ID {shift_id}: {str(e)}")
            return {"message": f"An error occurred: {e}"}, 500


@check_in_out_ns.route('/shifts/current/<string:shift_id>')
class CurrentShiftResource(Resource):
    def get(self, shift_id):
        """Fetch details for a specific shift by shift ID"""
        try:
            current_shift = Shift.query.filter_by(id=shift_id, is_checked_in=False).first()
            if not current_shift:
                return {'message': 'No active shift found'}, 404

            return {
                'id': current_shift.id,
                'client': current_shift.client.name,
                'location': current_shift.location,
                'start_time': current_shift.start_time,
                'is_checked_in': current_shift.is_checked_in
            }, 200
        except Exception as e:
            logging.error(f"Error fetching current shift: {str(e)}")
            return jsonify({'message': f'An error occurred: {e}'}), 500
