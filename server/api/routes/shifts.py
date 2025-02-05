import logging
from flask_restx import Resource, Namespace, fields
from flask import request
from flask_jwt_extended import jwt_required
from ..models.database import Shift, Client, ShiftPeriod
from ..models.user import User, db
from datetime import datetime


shift_ns = Namespace('shifts', description="A Namespace for Shift Management")

shift_model = shift_ns.model(
    'Shift',
    {
        'id': fields.String(),
        'user_id': fields.String(),
        'client': fields.String(),
        'start_time': fields.DateTime(),
        'end_time': fields.DateTime(),
        'location': fields.Raw(),
        'period': fields.String(),
        'is_checked_in': fields.Boolean(),
        'is_checked_out': fields.Boolean(),
        'notification_sent': fields.Boolean()
    }
)

shift_update_model = shift_ns.model(
    'Update Shift',
    {
        'start_time': fields.DateTime(),
        'end_time': fields.DateTime(),
        'location': fields.Raw(),
        'period': fields.String()
    }
)

@shift_ns.route('/')
class ShiftsResource(Resource):
    @shift_ns.marshal_list_with(shift_model)
    def get(self):
        """Get all shifts"""
        shifts = Shift.query.all()
        return shifts

    @shift_ns.marshal_with(shift_model)
    @shift_ns.expect(shift_model)
    def post(self):
        """Create a new shift"""
        try:
            data = request.get_json()

            user_name = data.get('user')
            user = User.query.filter_by(name=user_name).first()
            if not user:
                logging.debug(f"Received user from payload: {user_name}")
                return {'message': f'User {user_name} not found'}, 404

            client_name = data.get('client')
            client = Client.query.filter_by(name=client_name).first()
            if not client:
                return {'message': f'Client {client_name} not found'}, 404

            start_time_str = data.get('start_time')
            end_time_str = data.get('end_time')

            datetime_format_with_z = '%Y-%m-%dT%H:%M'
            datetime_format_without_z = '%Y-%m-%dT%H:%M'

            try:
                start_time = datetime.strptime(start_time_str, datetime_format_with_z)
            except ValueError:
                start_time = datetime.strptime(start_time_str, datetime_format_without_z)

            try:
                end_time = datetime.strptime(end_time_str, datetime_format_with_z)
            except ValueError:
                end_time = datetime.strptime(end_time_str, datetime_format_without_z)

            period = data.get('period', '').upper()

            location = data.get('location')
            if location and isinstance(location, dict):
                latitude = location.get('latitude')
                longitude = location.get('longitude')
                address = location.get('address')

                if not latitude or not longitude:
                    return {'message': 'Location must contain both latitude and longitude'}, 400

            else:
                return {'message': 'Invalid location format'}, 400

            new_shift = Shift(
                user_id=user_name,
                client=client_name,
                start_time=start_time,
                end_time=end_time,
                location=location,
                is_checked_in=data.get('is_checked_in', False),
                is_checked_out=data.get('is_checked_out', False),
                notification_sent=data.get('notification_sent', False),
                period=period
            )
            new_shift.save()
            return new_shift, 201
        except Exception as e:
            logging.error(f"Error in shift creation: {str(e)}")
            return {'message': f'An error occurred: {e}'}, 500




@shift_ns.route('/<string:id>')
class ShiftResource(Resource):
    @shift_ns.marshal_with(shift_model)
    def get(self, id):
        """Get a shift by ID"""
        shift = Shift.query.get_or_404(id)
        return shift

    @shift_ns.marshal_with(shift_update_model)
    def put(self, id):
        """Update a shift"""
        try:
            # Fetch the shift object
            shift_to_update = Shift.query.get_or_404(id)
            data = request.get_json()

            # Parse start_time and end_time
            try:
                start_time = datetime.strptime(data['start_time'], "%Y-%m-%dT%H:%M:%S")
                end_time = datetime.strptime(data['end_time'], "%Y-%m-%dT%H:%M:%S")
            except (ValueError, KeyError) as e:
                return {"error": f"Invalid datetime format or missing field: {e}"}, 400

            # Validate period
            period = data.get('period', '').upper()
            if period not in ShiftPeriod.__members__:
                valid_periods = ", ".join(ShiftPeriod.__members__)
                return {"error": f"Invalid period. Must be one of: {valid_periods}"}, 400

            # Validate location
            location = data.get('location')
            if location and not all(k in location for k in ('latitude', 'longitude', 'address')):
                return {"error": "Invalid location format. Must include 'latitude', 'longitude', and 'address'."}, 400

            # Update fields
            shift_to_update.user_id = data.get('user_id', shift_to_update.user_id)
            shift_to_update.client = data.get('client', shift_to_update.client)
            shift_to_update.start_time = start_time
            shift_to_update.end_time = end_time
            shift_to_update.location = location or shift_to_update.location
            shift_to_update.period = period

            # Save to database
            shift_to_update.save()

            return {"message": "Shift updated successfully", "shift": shift_to_update.to_dict()}, 200

        except Exception as e:
            logging.error(f"Error updating shift {id}: {e}")
            return {"error": "An unexpected error occurred. Please try again later."}, 500


    @shift_ns.marshal_with(shift_model)
    # @jwt_required()
    def delete(self, id):
        """Delete a shift"""
        shift_to_delete = Shift.query.get_or_404(id)
        shift_to_delete.delete()
        return shift_to_delete
