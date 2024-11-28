from flask import Blueprint

# Define the notification blueprint
notification = Blueprint('notification', __name__)

# Import the routes to register them with the blueprint
from . import routes
