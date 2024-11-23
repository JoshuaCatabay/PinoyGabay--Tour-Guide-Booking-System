from flask import render_template, redirect, url_for, flash, request, session, jsonify, current_app
from flask_login import login_required, current_user, logout_user, login_user
from BookingSystem.TourOperator_Page import touroperator
from . import booking
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

# def update_statuses():
#     today = date.today()

#     # Update 'Upcoming' to 'Ongoing'
#     upcoming_bookings = Booking.query.filter(
#         Booking.status == BookingStatus.STATUS_UPCOMING.value,
#         Booking.date_start <= today
#     ).all()

#     for booking in upcoming_bookings:
#         print(f"Updating booking {booking.id} to '{BookingStatus.STATUS_ONGOING.value}'")
#         booking.status = BookingStatus.STATUS_ONGOING.value

#     # Update 'Ongoing' to 'Completed'
#     ongoing_bookings = Booking.query.filter(
#         Booking.status == BookingStatus.STATUS_ONGOING.value,
#         Booking.date_end < today
#     ).all()

#     for booking in ongoing_bookings:
#         print(f"Updating booking {booking.id} to '{BookingStatus.STATUS_COMPLETED.value}'")
#         booking.status = BookingStatus.STATUS_COMPLETED.value

#     db.session.commit()


def update_statuses():
    today = date.today()

    # Update 'Upcoming' to 'Ongoing' if the start date is today or in the past and the end date is in the future or today
    upcoming_bookings = Booking.query.filter(
        Booking.status == BookingStatus.STATUS_UPCOMING.value,
        Booking.date_start <= today,
        Booking.date_end >= today
    ).all()

    for booking in upcoming_bookings:
        print(f"Updating booking {booking.id} to '{BookingStatus.STATUS_ONGOING.value}'")
        booking.status = BookingStatus.STATUS_ONGOING.value

    # Update 'Ongoing' to 'Completed' if the end date is in the past
    ongoing_bookings = Booking.query.filter(
        Booking.status == BookingStatus.STATUS_ONGOING.value,
        Booking.date_end < today
    ).all()

    for booking in ongoing_bookings:
        print(f"Updating booking {booking.id} to '{BookingStatus.STATUS_COMPLETED.value}'")
        booking.status = BookingStatus.STATUS_COMPLETED.value

    db.session.commit()



# @booking.route('/create_booking', methods=['POST'])
# @login_required
# def create_booking():
#     try:
#         data = request.get_json()
#         print("Incoming booking payload:", data)  # Debugging

#         if not data:
#             return jsonify({"error": "Invalid input"}), 400

#         # Extract required fields
#         tour_guide_id = data.get('tour_guide_id')
#         package_id = data.get('package_id')
#         date_start = data.get('date_start')
#         date_end = data.get('date_end') or date_start  # Default to date_start if not provided
#         traveler_quantity = data.get('traveler_quantity')
#         special_notes = data.get('special_notes', '')
#         price = data.get('price')

#         # Validate input
#         if not all([tour_guide_id, package_id, date_start, traveler_quantity, price]):
#             return jsonify({"error": "Missing required fields"}), 400

#         # Validate date formats
#         try:
#             date_start = datetime.strptime(date_start, '%Y-%m-%d').date()
#             date_end = datetime.strptime(date_end, '%Y-%m-%d').date()
#         except ValueError:
#             return jsonify({"error": "Invalid date format. Expected YYYY-MM-DD."}), 400

#         # Calculate duration in days
#         duration = (date_end - date_start).days + 1  # Inclusive of both dates

#         # Check if the tour guide and package exist
#         tour_guide = TourGuide.query.get(tour_guide_id)
#         tour_package = TourPackage.query.get(package_id)

#         if not tour_guide or not tour_package:
#             return jsonify({"error": "Tour guide or package not found"}), 404

#         # Create the booking
#         booking = Booking(
#             user_id=current_user.id,
#             tour_guide_id=tour_guide_id,
#             package_id=package_id,
#             date_start=date_start,
#             date_end=date_end,
#             traveler_quantity=traveler_quantity,
#             special_notes=special_notes,
#             price=price,
#             status='confirmed',  # Default status
#             duration=timedelta(days=duration),  # Store as timedelta
#         )

#         db.session.add(booking)
#         db.session.commit()

#         print(f"Booking successfully created with ID {booking.id}")
#         return jsonify({"message": "Booking confirmed", "booking_id": booking.id}), 201

#     except Exception as e:
#         print(f"Error in create_booking route: {e}")
#         return jsonify({"error": "Server error"}), 500



# @booking.route('/create_booking', methods=['POST'])
# @login_required
# def create_booking():
#     try:
#         data = request.get_json()
#         print("Incoming booking payload:", data)  # Debugging
        
#         if not data:
#             return jsonify({"error": "Invalid input"}), 400

#         # Extract required fields
#         tour_guide_id = data.get('tour_guide_id')
#         package_id = data.get('package_id')
#         date_start = data.get('date_start')
#         date_end = data.get('date_end') or date_start
#         traveler_quantity = data.get('traveler_quantity')
#         special_notes = data.get('special_notes', '')
#         price = data.get('price')

#         # Validate input
#         if not all([tour_guide_id, package_id, date_start, traveler_quantity, price]):
#             return jsonify({"error": "Missing required fields"}), 400

#         # Validate date formats
#         try:
#             date_start = datetime.strptime(date_start, '%Y-%m-%d').date()
#             date_end = datetime.strptime(date_end, '%Y-%m-%d').date()
#         except ValueError as ve:
#             print("Date parsing error:", ve)
#             return jsonify({"error": "Invalid date format. Expected YYYY-MM-DD."}), 400

#         # Calculate duration in days
#         duration = (date_end - date_start).days + 1  # Inclusive of both dates

#         # Check if the tour guide and package exist
#         tour_guide = TourGuide.query.get(tour_guide_id)
#         tour_package = TourPackage.query.get(package_id)

#         if not tour_guide:
#             print(f"Tour guide with ID {tour_guide_id} not found.")
#             return jsonify({"error": "Tour guide not found"}), 404
#         if not tour_package:
#             print(f"Tour package with ID {package_id} not found.")
#             return jsonify({"error": "Tour package not found"}), 404

#         # Create the booking
#         booking = Booking(
#             user_id=current_user.id,
#             tour_guide_id=tour_guide_id,
#             package_id=package_id,
#             date_start=date_start,
#             date_end=date_end,
#             traveler_quantity=int(traveler_quantity),
#             special_notes=special_notes,
#             price=Decimal(price),
#             status='confirmed',  # Default status
#             duration=timedelta(days=duration),  # Store as timedelta
#         )

#         db.session.add(booking)
#         db.session.commit()

#         print(f"Booking successfully created with ID {booking.id}")
#         return jsonify({"message": "Booking confirmed", "booking_id": booking.id}), 201

#     except Exception as e:
#         print(f"Error in create_booking route: {e}")
#         db.session.rollback()
#         return jsonify({"error": f"Server error: {str(e)}"}), 500


@booking.route('/create_booking', methods=['POST'])
@login_required
def create_booking():
    try:
        data = request.get_json()
        print("Incoming booking payload:", data)  # Debugging

        if not data:
            return jsonify({"error": "Invalid input"}), 400

        # Extract required fields
        tour_guide_id = data.get('tour_guide_id')
        package_id = data.get('package_id')
        date_start = data.get('date_start')
        date_end = data.get('date_end') or date_start
        traveler_quantity = data.get('traveler_quantity')
        special_notes = data.get('special_notes', '')
        price = data.get('price')

        # Validate input
        if not all([tour_guide_id, package_id, date_start, traveler_quantity, price]):
            return jsonify({"error": "Missing required fields"}), 400

        # Validate date formats
        try:
            date_start = datetime.strptime(date_start, '%Y-%m-%d').date()
            date_end = datetime.strptime(date_end, '%Y-%m-%d').date()
        except ValueError as ve:
            print("Date parsing error:", ve)
            return jsonify({"error": "Invalid date format. Expected YYYY-MM-DD."}), 400

        # Calculate duration in days
        duration = (date_end - date_start).days + 1  # Inclusive of both dates

        # Check if the tour guide and package exist
        tour_guide = TourGuide.query.get(tour_guide_id)
        tour_package = TourPackage.query.get(package_id)

        if not tour_guide:
            print(f"Tour guide with ID {tour_guide_id} not found.")
            return jsonify({"error": "Tour guide not found"}), 404
        if not tour_package:
            print(f"Tour package with ID {package_id} not found.")
            return jsonify({"error": "Tour package not found."}), 404

        # Create the booking
        booking = Booking(
            user_id=current_user.id,
            tour_guide_id=tour_guide_id,
            package_id=package_id,
            date_start=date_start,
            date_end=date_end,
            traveler_quantity=int(traveler_quantity),
            special_notes=special_notes,
            price=Decimal(price),
            status=BookingStatus.STATUS_UPCOMING.value,  # Use Enum for status
            duration=timedelta(days=duration),  # Store as timedelta
            time=datetime.strptime("00:00:00", "%H:%M:%S").time(),  # Default to midnight
            is_reviewed=False  # Ensure this is explicitly set during creation
        )

        db.session.add(booking)
        db.session.commit()

        print(f"Booking successfully created with ID {booking.id}")
        return jsonify({"message": "Booking confirmed", "booking_id": booking.id}), 201

    except Exception as e:
        print(f"Error in create_booking route: {e}")
        db.session.rollback()
        return jsonify({"error": f"Server error: {str(e)}"}), 500

    


@booking.route('/details/<int:booking_id>', methods=['GET'])
@login_required
def booking_details(booking_id):
    try:
        # Fetch the booking
        booking = Booking.query.get_or_404(booking_id)

      # Check if the current user is authorized
        if booking.user_id != current_user.id and (
            not hasattr(current_user, 'tour_guide') or booking.tour_guide_id != current_user.tour_guide.id
        ):
            return jsonify({"error": "Unauthorized access"}), 403

        # Build response data
        details = {
            "status": booking.status.capitalize(),
            "traveler": {
                "name": f"{booking.traveler.first_name} {booking.traveler.last_name}" if booking.traveler else "Unknown"
            },
            "tour_guide": {
                "id": booking.tour_guide_id,
                "name": f"{booking.assigned_guide.user.first_name} {booking.assigned_guide.user.last_name}" if booking.assigned_guide else "Unknown",
                "contact": booking.assigned_guide.contact_num if booking.assigned_guide else "N/A",
            },
            "package": {
                "id": booking.package_id,
                "name": booking.selected_package.name,
                "location": booking.selected_package.location,
                "description": booking.selected_package.description,
                "package_img": booking.selected_package.package_img,
                "estimated_prices": [
                    {"description": p.description, "estimated_price": str(p.estimated_price)}
                    for p in booking.selected_package.estimated_prices
                ],
                "inclusions": [{"inclusion": i.inclusion} for i in booking.selected_package.inclusions],
                "exclusions": [{"exclusion": e.exclusion} for e in booking.selected_package.exclusions],
                "itineraries": [{"title": i.title, "subtitle": i.subtitle} for i in booking.selected_package.itineraries],
            },
            "date_start": booking.date_start.strftime('%Y-%m-%d'),
            "date_end": booking.date_end.strftime('%Y-%m-%d'),
            "traveler_quantity": booking.traveler_quantity,
            "special_notes": booking.special_notes or "None",
            "price": str(booking.price),
            "review": {
                "is_reviewed": booking.is_reviewed,
                "review_text": booking.reviews[0].comment if booking.reviews else None,
            } if booking.status == BookingStatus.STATUS_COMPLETED.value else None,
        }

        return jsonify(details)

    except AttributeError as e:
        print(f"Attribute error: {e}")  # Debugging output
        return jsonify({"error": f"Data is missing or improperly configured: {e}"}), 500
    except Exception as e:
        print(f"Unexpected error: {e}")  # Debugging output
        return jsonify({"error": "An unexpected error occurred"}), 500





from BookingSystem.models import BookingStatus

@booking.route('/cancel/<int:booking_id>', methods=['POST'])
@login_required
def cancel_booking(booking_id):
    try:
        booking = Booking.query.get_or_404(booking_id)

        # Ensure only the owner can cancel their booking
        if booking.user_id != current_user.id:
            return jsonify({"error": "Unauthorized action"}), 403

        # Allow cancellation only for upcoming bookings
        if booking.status != BookingStatus.STATUS_UPCOMING.value:
            return jsonify({"error": "Only upcoming bookings can be canceled."}), 400

        booking.status = BookingStatus.STATUS_CANCELLED.value
        db.session.commit()

        return jsonify({"message": "Booking has been successfully canceled."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    

@booking.route('/complete/<int:booking_id>', methods=['POST'])
@login_required
def complete_booking(booking_id):
    try:
        booking = Booking.query.get_or_404(booking_id)

        # Ensure the current user is the assigned tour guide
        if booking.tour_guide_id != current_user.tour_guide.id:
            return jsonify({"error": "Unauthorized action"}), 403

        # Allow marking as completed only for ongoing bookings
        if booking.status != BookingStatus.STATUS_ONGOING.value:
            return jsonify({"error": "Only ongoing bookings can be marked as completed."}), 400

        # Update booking status to completed
        booking.status = BookingStatus.STATUS_COMPLETED.value
        db.session.commit()

        return jsonify({"message": "Booking has been successfully marked as completed."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
