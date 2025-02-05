from flask_restx import Resource,Namespace,fields
from flask import request
from ..models.database import Client, db
from flask_jwt_extended import jwt_required

client_ns = Namespace('client', description="A Namespace for Clients Management")


# model (serializer)
recipe_model=client_ns.model(
    'Client',
    {
        "id": fields.String(),
        "name": fields.String(),
        "address": fields.String(),
        "phone_number": fields.String(),
        "email": fields.String(),
    }
)

@client_ns.route('/')
class RecipesResource(Resource):
    @client_ns.marshal_list_with(recipe_model)
    def get(self):
        """Get all clients"""
        client = Client.query.all()
        return client

    @client_ns.marshal_with(recipe_model)
    @client_ns.expect(recipe_model)
    # @jwt_required()
    def post(self):
        """Create a new client"""
        data = request.get_json()
        new_client = Client(
            name = data.get('name'),
            address = data.get('address'),
            phone_number = data.get('phone_number'),
            email = data.get('email')
        )
        new_client.save()
        return new_client, 201


@client_ns.route('/<string:id>')
class RecipeResource(Resource):
    @client_ns.marshal_with(recipe_model)
    def get(self,id):
        """Get a client by id"""
        client = Client.query.get_or_404(id)
        return client

    @client_ns.marshal_with(recipe_model)
    def put(self, id):
        """Update a client"""
        try:
            client_to_update = Client.query.get_or_404(id)

            data = request.get_json()

            client_to_update.update(
                name=data.get('name'),
                address=data.get('address'),
                phone_number=data.get('phone_number'),
                email=data.get('email')
            )

            db.session.commit()

            return client_to_update, 200
        except Exception as e:
            # Rollback the transaction if an error occurs
            db.session.rollback()
            # logging.error(f"Error updating client {id}: {e}")
            return {"message": f"An error occurred: {e}"}, 500



    @client_ns.marshal_with(recipe_model)
    @jwt_required()
    def delete(self,id):
        """Delete a client"""
        client_to_delete = Client.query.get_or_404(id)
        client_to_delete.delete()
        return client_to_delete
