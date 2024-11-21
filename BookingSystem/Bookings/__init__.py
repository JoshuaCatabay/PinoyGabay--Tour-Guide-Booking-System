from flask import Blueprint

# Define the admin blueprint
booking = Blueprint('booking', __name__)

# Import the routes to register them with the blueprint
from . import routes

