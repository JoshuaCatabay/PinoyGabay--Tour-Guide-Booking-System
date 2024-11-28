from flask import render_template, redirect, url_for, flash, request, session, jsonify, current_app
from flask_login import login_required, current_user, logout_user, login_user
from BookingSystem.TourOperator_Page import touroperator
from . import notification
from BookingSystem.TourOperator_Page.form import UserTourGuideForm
from BookingSystem import bcrypt, db
from werkzeug.security import check_password_hash, generate_password_hash
from BookingSystem.models import User, Characteristic, Skill, Availability, TourGuide, TourPackage, Booking
# from .form import PasswordConfirmationForm
from datetime import datetime
from decimal import Decimal
from werkzeug.utils import secure_filename
import os
import re
from werkzeug.security import check_password_hash, generate_password_hash
from sqlalchemy import func  #!!!!!
from BookingSystem.models import ReviewsRating, ReviewImages   #!!!!!
from flask import Blueprint
from datetime import datetime, timedelta  # Ensure timedelta is imported
from datetime import date
from flask import jsonify
from datetime import date
from BookingSystem.models import BookingStatus
from BookingSystem.models import Notification
from BookingSystem.utils import update_statuses

notification = Blueprint('notification', __name__)

@notification.route('/', methods=['GET'])
@login_required
def get_notifications():
    """Fetch unread notifications for the current user."""
    try:
        # Filter unread notifications for the current user
        notifications = Notification.query.filter_by(
            user_id=current_user.id,
            is_read=False
        ).order_by(Notification.created_at.desc()).all()

        # Debugging: Log notifications retrieved
        print(f"Fetched Notifications for User {current_user.id}: {[n.message for n in notifications]}")

        # Prepare the notification data
        notifications_data = [
            {
                "id": notification.id,
                "message": notification.message,
                "created_at": notification.created_at.strftime('%b %d, %Y %I:%M %p'),
                "is_read": notification.is_read,
                "role": notification.role,  # Include role to differentiate notifications
            }
            for notification in notifications
        ]

        return jsonify({"notifications": notifications_data}), 200
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


@notification.route('/mark_as_read/<int:notification_id>', methods=['POST'])
@login_required
def mark_as_read(notification_id):
    """Mark a notification as read."""
    try:
        notification = Notification.query.get_or_404(notification_id)

        if notification.user_id != current_user.id:
            return jsonify({"error": "Unauthorized action"}), 403

        notification.is_read = True
        db.session.commit()

        return jsonify({"message": "Notification marked as read."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


@notification.route('/count', methods=['GET'])
@login_required
def get_notification_count():
    """Fetch the count of unread notifications."""
    try:
        count = Notification.query.filter_by(user_id=current_user.id, is_read=False).count()
        return jsonify({"count": count}), 200
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    


@notification.route('/operator', methods=['GET'])
@login_required
def get_operator_notifications():
    """Fetch unread notifications for the current operator."""
    try:
        # Ensure the user is an operator
        if current_user.role != 'operator':
            return jsonify({"error": "Unauthorized action"}), 403

        # Fetch notifications for the operator
        notifications = Notification.query.filter_by(
            user_id=current_user.id,
            is_read=False
        ).order_by(Notification.created_at.desc()).all()

        notifications_data = [
            {
                "id": notification.id,
                "message": notification.message,
                "created_at": notification.created_at.strftime('%b %d, %Y %I:%M %p'),
                "is_read": notification.is_read,
            }
            for notification in notifications
        ]

        return jsonify({"notifications": notifications_data}), 200
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
