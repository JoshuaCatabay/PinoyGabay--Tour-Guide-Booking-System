# BookingSystem/utils.py

from flask import url_for
from flask_mail import Message
from BookingSystem import mail  # Ensure mail is initialized properly
from datetime import date, timedelta
from BookingSystem.models import Booking, BookingStatus, db, Notification

def send_confirmation_traveler_email(user):
    token = user.get_confirmation_token()  # Ensure this method exists in your User model
    msg = Message('Confirm Your Account',
                  recipients=[user.email])  # Use 'email' instead of 'email_address' if that is the property name
    msg.body = f'''To confirm your account, visit the following link:
{url_for('main.confirm_email', token=token, _external=True)}
'''
    mail.send(msg)

def send_confirmation_tourguide_email(user):
    token = user.get_confirmation_token()  # Ensure this method is implemented
    msg = Message('Confirm Your Account',
                  recipients=[user.email])  # Same here, ensure 'email' is the correct property
    msg.body = f'''To confirm your account, visit the following link:
{url_for('main.confirm_tourguide_email', token=token, _external=True)}  # Correct the endpoint name for tour guides
'''
    mail.send(msg)



def update_statuses():
    today = date.today()
    tomorrow = today + timedelta(days=1)

    # Update 'Upcoming' to 'Ongoing' if the start date is today or in the past and the end date is in the future or today
    upcoming_bookings = Booking.query.filter(
        Booking.status == BookingStatus.STATUS_UPCOMING.value,
        Booking.date_start <= today,
        Booking.date_end >= today
    ).all()

    for booking in upcoming_bookings:
        print(f"Updating booking {booking.id} to '{BookingStatus.STATUS_ONGOING.value}'")
        booking.status = BookingStatus.STATUS_ONGOING.value

        # Add notifications for both the traveler and the guide for today's tours
        # Traveler reminder notification
        traveler_message = f"Reminder: Your tour with {booking.assigned_guide.user.first_name} {booking.assigned_guide.user.last_name} starts today ({booking.date_start})."
        traveler_notification = Notification(
            user_id=booking.user_id,
            booking_id=booking.id,
            role='traveler',
            message=traveler_message,
            is_read=False
        )
        db.session.add(traveler_notification)

        # Tour guide reminder notification
        guide_message = f"Reminder: Your tour with {booking.traveler.first_name} {booking.traveler.last_name} starts today ({booking.date_start})."
        guide_notification = Notification(
            user_id=booking.assigned_guide.user_id,
            booking_id=booking.id,
            role='guide',
            message=guide_message,
            is_read=False
        )
        db.session.add(guide_notification)

    # # Add reminders for tours happening tomorrow
    # tomorrow_bookings = Booking.query.filter(
    #     Booking.status == BookingStatus.STATUS_UPCOMING.value,
    #     Booking.date_start == tomorrow
    # ).all()

    # for booking in tomorrow_bookings:
    #     # Traveler tomorrow reminder notification
    #     traveler_message = f"Reminder: Your tour with {booking.assigned_guide.user.first_name} {booking.assigned_guide.user.last_name} is scheduled for tomorrow ({booking.date_start})."
    #     traveler_notification = Notification(
    #         user_id=booking.user_id,
    #         booking_id=booking.id,
    #         role='traveler',
    #         message=traveler_message,
    #         is_read=False
    #     )
    #     db.session.add(traveler_notification)

    #     # Tour guide tomorrow reminder notification
    #     guide_message = f"Reminder: Your tour with {booking.traveler.first_name} {booking.traveler.last_name} is scheduled for tomorrow ({booking.date_start})."
    #     guide_notification = Notification(
    #         user_id=booking.assigned_guide.user_id,
    #         booking_id=booking.id,
    #         role='guide',
    #         message=guide_message,
    #         is_read=False
    #     )
    #     db.session.add(guide_notification)

    # Update 'Ongoing' to 'Completed'






    
    # Only generate notifications for automatic completions if the status is ongoing
    ongoing_bookings = Booking.query.filter(
        Booking.status == BookingStatus.STATUS_ONGOING.value,
        Booking.date_end < today
    ).all()

    for booking in ongoing_bookings:
        print(f"Automatically completing booking {booking.id}")
        booking.status = BookingStatus.STATUS_COMPLETED.value

        # Add notifications only if the tour was not manually completed
        if booking.status == BookingStatus.STATUS_COMPLETED.value and not any(
            notif.message.startswith("You have successfully marked") for notif in booking.notifications
        ):
            # Traveler Notification
            traveler_message = f"Your tour with {booking.assigned_guide.user.first_name} {booking.assigned_guide.user.last_name} has been completed. Leave a review to help others!"
            traveler_notification = Notification(
                user_id=booking.user_id,
                booking_id=booking.id,
                role='traveler',
                message=traveler_message,
                is_read=False
            )
            db.session.add(traveler_notification)

            # Tour Guide Notification
            guide_message = f"The tour with {booking.traveler.first_name} {booking.traveler.last_name} on {booking.date_start} has been successfully completed."
            guide_notification = Notification(
                user_id=booking.assigned_guide.user_id,
                booking_id=booking.id,
                role='guide',
                message=guide_message,
                is_read=False
            )
            db.session.add(guide_notification)

    db.session.commit()
