import re
import secrets
import os, re
from flask import current_app, session
from flask import Blueprint, render_template, url_for, flash, redirect, request, jsonify
from BookingSystem import db, bcrypt, mail
from BookingSystem.forms import TravelerLoginForm, TravelerRegistrationForm, TravelerRequestResetForm, TravelerResetPasswordForm, UpdateAccountForm
from BookingSystem.models import User, TourOperator , send_confirmation_email
from flask_login import login_user, current_user, logout_user, login_required 
from werkzeug.utils import secure_filename
from BookingSystem.models import Availability
from werkzeug.security import check_password_hash, generate_password_hash
from BookingSystem.models import ReviewsRating, ReviewImages  #!!!!!
from sqlalchemy import func   #!!!!!
from BookingSystem.models import User, TourOperator, TourGuide, TourPackage, EstimatedPrice, Inclusion, Exclusion, Itinerary, Booking
from BookingSystem.Bookings.routes import update_statuses
from datetime import datetime, timedelta
from BookingSystem.models import BookingStatus


main = Blueprint('main', __name__)  # Ensure the 'main' blueprint is set


@main.route('/')
@main.route('/home')
def home():
    return render_template('home.html')

@main.route('/pg_home', endpoint='pg_home')
def pg_home():
    return render_template('pg_home.html')




# TRAVELER LOGIN

@main.route('/traveler_login', methods=['GET', 'POST'])
def traveler_login():
    # If someone is already logged in, log them out to avoid session conflicts
    if current_user.is_authenticated:
        logout_user()
        print(f"Previous user logged out. Current user (should be anonymous): {current_user}")

    # form = TravelerLoginForm()
    # if form.validate_on_submit():
    #     user = (
    #         UserAdmin.query.filter_by(email=form.email.data).first() or
    #         UserTourOperator.query.filter_by(email=form.email.data).first() or
    #         UserTraveler.query.filter_by(email=form.email.data).first() or
    #         UserTourGuide.query.filter_by(email=form.email.data).first()
    #     )
        
    form = TravelerLoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user:
            if user.role == 'Admin':
            # Process as Admin
                pass  # Replace with actual logic
            elif user.role == 'TourOperator':
            # Process as Tour Operator
                pass  # Replace with actual logic
            elif user.role == 'Traveler':
            # Process as Traveler
                pass  # Replace with actual logic
            elif user.role == 'TourGuide':
            # Process as Tour Guide
                pass  # Replace with actual logic
        

        if user:
            print(f"User found: {user.email}, Role: {user.role}")

            if bcrypt.check_password_hash(user.password, form.password.data):
                # Log out any previous session
                logout_user()
                print(f"Logged out previous user. Current user: {current_user}")
                
                # Log in the current user
                login_user(user)
                print(f"Logged in user: {user.email}, Role: {user.role}, Session: {session}")

                # Handle role-based redirection
                role_redirects = {
                    'admin': 'admin.admin_dashboard',
                    'touroperator': 'touroperator.touroperator_dashboard',
                    'traveler': 'main.traveler_dashboard',
                    'tourguide': 'tourguide.tourguide_dashboard',
                }

                redirect_url = url_for(role_redirects.get(user.role, 'main.home'))
                print(f"Redirecting to: {redirect_url}") 
                return redirect(redirect_url)
                
            else:
                flash('Invalid password. Please try again.', 'danger')
        else:
            flash('No account found with that email.', 'danger')

    return render_template('traveler_login.html', title='Traveler Login', form=form)



@main.route('/traveler_register', methods=['GET', 'POST'])
def traveler_register():
    if current_user.is_authenticated:
        return redirect(url_for('main.home'))
    form = TravelerRegistrationForm()
    if form.validate_on_submit():
        hashed_password = bcrypt.generate_password_hash(form.password.data).decode('utf-8')
        new_traveler = User(
            first_name=form.first_name.data,
            last_name=form.last_name.data,
            nationality=form.nationality.data,
            email=form.email_address.data,
            password=hashed_password,
            profile_img='default.jpg',
            role='traveler',
        )
        db.session.add(new_traveler)
        db.session.commit()
        send_confirmation_email(new_traveler)
        flash('Registration successful! Please confirm your email to complete the process.', 'info')
        return redirect(url_for('main.traveler_register'))
    else:
        print(form.errors)
        
    return render_template('traveler_register.html', title='Traveler Register', form=form)



@main.route('/pending_confirmation')
def pending_confirmation():
    return render_template('pending_confirmation.html') 




#CONFIRMATION EMAIL FOR TRAVELER
@main.route('/confirm_email/<token>')
def confirm_email(token):
    user = User.verify_confirmation_token(token)
    if not user:
        user = User.verify_confirmation_token(token)
    if user is None:
        flash('The confirmation link is invalid or has expired.', 'warning')
        return redirect(url_for('main.home'))
    user.confirmed = True
    db.session.commit()
    flash('Your email has been confirmed! You can now log in.', 'success')
    if isinstance(user, User):
        return redirect(url_for('main.traveler_login'))
    else:
        return redirect(url_for('main.tourguide_login'))
    

    


# RESET PASSWORD FOR TRAVELER
@main.route('/traveler_reset_password', methods=['GET', 'POST'])
def traveler_reset_request():
    form = TravelerRequestResetForm()
    
    if form.validate_on_submit():
        traveler = User.query.filter_by(email=form.email.data).first()
        if traveler:
            traveler.send_reset_email()
            flash('An email has been sent with instructions to reset your password.', 'info')
            return redirect(url_for('main.traveler_login'))
        else:
            flash('There is no account with that email. Please register first.', 'warning')
            return redirect(url_for('main.traveler_register'))
    
    return render_template('traveler_reset_request.html', title='Reset Password', form=form)



@main.route('/traveler_reset_password/<token>', methods=['GET', 'POST'])
def traveler_reset_token(token):
    traveler = User.verify_reset_token(token)  # Verify the token first
    if traveler is None:
        flash('That is an invalid or expired token', 'warning')
        return redirect(url_for('main.traveler_reset_request')) 

    form = TravelerResetPasswordForm()
    if form.validate_on_submit():
        hashed_password = bcrypt.generate_password_hash(form.password.data).decode('utf-8')
        traveler.password = hashed_password
        db.session.commit()
        flash('Your password has been updated! You are able to log in now.', 'success')
        return redirect(url_for('main.traveler_login'))
    return render_template('traveler_reset_token.html', title='Reset Password', form=form)






# TRAVELER PROFILE
# def save_picture(form_picture):
#     random_hex = secrets.token_hex(8)
#     _, f_ext = os.path.splitext(form_picture.filename)
#     picture_fn = random_hex + f_ext
#     picture_path = os.path.join(current_app.root_path, 'static/profile_pics', picture_fn)
#     form_picture.save(picture_path)
#     print(f"Picture saved to: {picture_path}")  # Debugging print statement
#     return picture_fn

@main.route('/logout')
@login_required
def logout():
    logout_user()
    # Clear all session data
    session.clear()
    flash('You have been logged out successfully.', 'success')
    return redirect(url_for('main.home'))



    
# @main.route('/account', methods=['GET', 'POST'])
# @login_required
# def account():
#     form = UpdateAccountForm()
#     if form.picture.data:
#         profile_img = save_picture(form.picture.data)
#         current_user.profile_img = picture_file
#         db.session.commit()  # Save the new image file name to the database
    
#     # Use a default image if no image file is set
#     profile_img_name = current_user.profile_img if current_user.profile_img else 'default.jpg'
#     print(f"Current image file: {profile_img_name}")  # Debugging print statement
#     profile_img = url_for('static', filename='profile_pics/' + profile_img_name)
    
#     return render_template('account.html', title='Account', profile_img=profile_img, form=form)

@main.route('/account', methods=['GET', 'POST'])
@login_required
def account():
    # Update statuses before fetching bookings
    update_statuses()

    form = UpdateAccountForm()

    if form.picture.data:
        profile_img = save_picture(form.picture.data)
        current_user.profile_img = profile_img
        db.session.commit()  # Save the new image file name to the database

    # Use a default image if no image file is set
    profile_img_name = current_user.profile_img if current_user.profile_img else 'default.jpg'
    profile_img = url_for('static', filename='profile_pics/' + profile_img_name)

    # Fetch bookings for the logged-in traveler
    bookings = (
        db.session.query(Booking)
        .filter_by(user_id=current_user.id)
        .filter(Booking.status.in_([
            BookingStatus.STATUS_UPCOMING.value,
            BookingStatus.STATUS_ONGOING.value,
            BookingStatus.STATUS_COMPLETED.value,
            BookingStatus.STATUS_CANCELLED.value
        ]))  # Ensure the status matches defined statuses
        .options(
            db.joinedload(Booking.selected_package),
            db.joinedload(Booking.assigned_guide).joinedload(TourGuide.user),
        )
        .all()
    )

    # Fetch reviews submitted by the traveler
    reviews = (
        db.session.query(ReviewsRating)
        .filter_by(user_id=current_user.id)
        .all()
    )

    # Fetch completed bookings with no reviews
    to_review = [
        booking for booking in bookings
        if booking.status == BookingStatus.STATUS_COMPLETED.value and not booking.is_reviewed
    ]
    to_review_count = len(to_review)

    # Prepare reviews data for rendering
    reviews_data = []
    for review in reviews:
        tour_guide = TourGuide.query.get(review.tour_guide_id)
        review_image = ReviewImages.query.filter_by(rr_id=review.id).first()

        tour_image_path = url_for('static', filename=f"review_pics/{review_image.img}") if review_image else url_for('static', filename="default_tour_image.jpg")
        guide_profile_path = url_for('static', filename=f"profile_pics/{tour_guide.user.profile_img}") if tour_guide and tour_guide.user.profile_img else url_for('static', filename="default_guide_image.jpg")

        reviews_data.append({
            "guide_name": f"{tour_guide.user.first_name} {tour_guide.user.last_name}" if tour_guide else "Unknown Guide",
            "guide_profile_img": guide_profile_path,
            "tour_image": tour_image_path,
            "rating": review.rating,
            "comment": review.comment,
            "review_date": review.datetime.strftime('%b. %d, %Y'),
        })

    return render_template(
        'account.html',
        title='Account',
        profile_img=profile_img,
        form=form,
        bookings=bookings,
        reviews=reviews_data,
        BookingStatus=BookingStatus,  # Pass BookingStatus to the template
        to_review=to_review,  # Pass the to_review list
        to_review_count=to_review_count  # Pass the count
    )






@main.route('/booking')
def booking():
    return render_template('booking.html')

@main.route('/tourguide_form')
def tourguideform():
    return render_template('tourguide_form.html')

@main.route('/traveler_dashboard')
def traveler_dashboard():
    packages = TourPackage.query.limit(4).all()
    return render_template('traveler_dashboard.html',packages=packages)

@main.route('/tour_package')
def tour_package():
    return render_template('tour_package.html')




@main.route('/view_package/<int:package_id>')
def view_package(package_id):
    try:
        package = TourPackage.query.get_or_404(package_id)
        package_data = {
            "name": package.name,
            "description": package.description,
            "package_img": package.package_img,
            "estimated_prices": [{"description": ep.description, "estimated_price": str(ep.estimated_price)} for ep in package.estimated_prices],
            "inclusions": [{"inclusion": inc.inclusion} for inc in package.inclusions],
            "exclusions": [{"exclusion": exc.exclusion} for exc in package.exclusions],
            "itineraries": [{"title": itin.title, "subtitle": itin.subtitle} for itin in package.itineraries],
        }
        return jsonify(package_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@main.route('/traveler_info', methods=['GET'])
@login_required
def traveler_info():
    user = current_user
    if not user:
        return jsonify({"error": "User not logged in"}), 401

    traveler_info = {
        "name": f"{user.first_name} {user.last_name}",
        "email": user.email,
        "profile_img": url_for('static', filename=f"profile_pics/{user.profile_img}")
    }
    return jsonify(traveler_info)




# ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# def allowed_file(filename):
#     """Check if the uploaded file is allowed based on its extension."""
#     return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# def save_picture(form_picture):
#     """Save the picture to the server and return the filename."""
#     filename = secure_filename(form_picture.filename)
#     filepath = os.path.join(current_app.root_path, 'static/profile_pics', filename)
#     form_picture.save(filepath)
#     return filename
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    """Check if the uploaded file is allowed based on its extension."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_picture(form_picture):
    random_hex = secrets.token_hex(8)
    _, f_ext = os.path.splitext(secure_filename(form_picture.filename))
    filename = f"{random_hex}{f_ext}"
    filepath = os.path.join(current_app.root_path, 'static/profile_pics', filename)
    form_picture.save(filepath)
    return filename

# @main.route('/update_profile_picture', methods=['POST'])
# @login_required
# def update_profile_picture():
#     # Check if a file is part of the request
#     if 'profile_picture' not in request.files:
#         return jsonify({"error": "No file provided"}), 400

#     file = request.files['profile_picture']
    
#     # Validate file type
#     if not allowed_file(file.filename):
#         return jsonify({"error": "File type not allowed"}), 400

#     # Save file and update database
#     try:
#         filename = save_picture(file)
#         current_user.profile_img = filename  # Update the user's profile image
#         db.session.commit()  # Save the change in the database
#         image_url = url_for('static', filename='profile_pics/' + filename)  # Generate the URL for the profile picture
#         return jsonify({"image_url": image_url})  # Return the URL as JSON response
#     except Exception as e:
#         print("Error saving profile picture:", e)
#         return jsonify({"error": "Failed to save profile picture"}), 500

@main.route('/update_profile_picture', methods=['POST'])
@login_required
def update_profile_picture():
    # Check if a file is part of the request
    if 'profile_picture' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['profile_picture']
    
    # Validate file type
    if not allowed_file(file.filename):
        return jsonify({"error": "File type not allowed"}), 400

    # Save file and update database
    try:
        filename = save_picture(file)
        current_user.profile_img = filename  # Update the user's profile image
        db.session.commit()  # Save the change in the database
        image_url = url_for('static', filename='profile_pics/' + filename)  # Generate the URL for the profile picture
        return jsonify({"image_url": image_url})  # Return the URL as JSON response
    except Exception as e:
        print("Error saving profile picture:", e)
        return jsonify({"error": "Failed to save profile picture"}), 500


# @main.route('/get_availability/<int:tour_guide_id>', methods=['GET'])
# def get_availability(tour_guide_id):
#     try:
#         print(f"Fetching availability for tour_guide_id: {tour_guide_id}")
#         availabilities = Availability.query.filter(Availability.tguide_id == tour_guide_id).all()

#         print("Availability records fetched:", availabilities)
#         if not availabilities:
#             print("No availability records found for this tour guide.")

#         data = [
#             {
#                 'date': a.availability_date.strftime('%Y-%m-%d'),
#                 'status': a.status
#             } for a in availabilities
#         ]

#         print("Formatted availability data to return:", data)
#         return jsonify(data)
#     except Exception as e:
#         print("Error in /get_availability route:", e)
#         return jsonify({"error": f"An error occurred: {str(e)}"}), 500






@main.route('/update_password', methods=['POST'])
@login_required
def update_password():
    data = request.get_json()
    new_password = data.get('password')
    print("Received password update request")

    try:
        # Update the user's password (hash it if needed)
        current_user.password = bcrypt.generate_password_hash(new_password).decode('utf-8')
        db.session.commit()
        return jsonify({"success": True})
    except Exception as e:
        print("Error updating password:", e)
        return jsonify({"success": False, "message": "Failed to update password."}), 500
   

    
    
 
 
@main.route('/tour_package/details/<int:package_id>', methods=['GET'])
def get_tour_package_details(package_id):
    try:
        # Fetch package details based on package_id
        package = TourPackage.query.get_or_404(package_id)

        # Prepare the data to return
        package_data = {
            "name": package.name,
            "location": package.location,  # Include location in the response
            "description": package.description,
            "estimated_prices": [
                {"description": price.description, "estimated_price": price.estimated_price}
                for price in package.estimated_prices
            ],
            "inclusions": [
                {"inclusion": inclusion.inclusion} for inclusion in package.inclusions
            ],
            "exclusions": [
                {"exclusion": exclusion.exclusion} for exclusion in package.exclusions
            ],
            "itineraries": [
                {"title": itinerary.title, "subtitle": itinerary.subtitle} for itinerary in package.itineraries
            ],
            "package_img": package.package_img
        }

        return jsonify(package_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@main.route('/update_email', methods=['POST'])
@login_required
def update_email():
    # Check if the current user has the role of a traveler
    if current_user.role != 'traveler':
        return jsonify({'success': False, 'error': 'Unauthorized access.'}), 403

    data = request.get_json()
    new_email = data.get('email')

    # Basic email format validation
    if not new_email or not re.match(r"[^@]+@[^@]+\.[^@]+", new_email):
        return jsonify({'success': False, 'error': 'Invalid email format.'}), 400

    # Check if email is already in use by another user
    existing_user = User.query.filter_by(email=new_email).first()
    if existing_user and existing_user.id != current_user.id:
        return jsonify({'success': False, 'error': 'Email is already in use by another account.'}), 400

    # Update the traveler's email
    try:
        current_user.email = new_email
        db.session.commit()
        return jsonify({'success': True, 'message': 'Email updated successfully.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': 'An error occurred while updating the email.'}), 500
    
@main.route('/submit_review', methods=['POST'])
@login_required
def submit_review():
    try:
        # Retrieve data from the form
        rating = request.form.get('rating', type=float)
        comment = request.form.get('comment')
        tour_guide_id = request.form.get('tour_guide_id', type=int)
        booking_id = request.form.get('booking_id', type=int)
        review_image = request.files.get('review_image')

        # Validate required fields
        if not (rating and comment and tour_guide_id and booking_id):
            return jsonify({"success": False, "message": "Missing required fields."}), 400

        # Create a new review
        new_review = ReviewsRating(
            user_id=current_user.id,
            tour_guide_id=tour_guide_id,
            booking_id=booking_id,
            rating=rating,
            comment=comment
        )

        # Mark the booking as reviewed
        booking = Booking.query.get(booking_id)
        if not booking:
            return jsonify({"success": False, "message": "Booking not found."}), 404
        booking.is_reviewed = True

        # Save the review to the database
        db.session.add(new_review)
        db.session.commit()

        # Save the review image if provided
        if review_image:
            filename = secure_filename(review_image.filename)
            upload_path = os.path.join(current_app.root_path, 'static/review_pics', filename)
            review_image.save(upload_path)

            # Create a ReviewImages entry with the newly assigned review ID
            review_image_entry = ReviewImages(rr_id=new_review.id, img=filename)
            db.session.add(review_image_entry)
            db.session.commit()

        return jsonify({"success": True, "message": "Review submitted successfully."})

    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"An error occurred: {str(e)}"}), 500





@main.route('/my_reviews', methods=['GET'])
@login_required
def my_reviews():
    reviews = ReviewsRating.query.filter_by(user_id=current_user.id).all()
    reviews_data = []

    for review in reviews:
        tour_guide = TourGuide.query.get(review.tour_guide_id)
        tour_package = TourPackage.query.get(review.package_id)
        review_image = ReviewImages.query.filter_by(rr_id=review.id).first()

        reviews_data.append({
            "guide_name": f"{tour_guide.user.first_name} {tour_guide.user.last_name}" if tour_guide else "N/A",
            "package_name": tour_package.name if tour_package else "N/A",
            "rating": review.rating,
            "comment": review.comment,
            "review_date": review.datetime.strftime('%b. %d, %Y'),
            "review_image": f"review_pics/{review_image.img}" if review_image else None,
        })

    return render_template('my_reviews.html', reviews=reviews_data)






@main.route('/traveler_reviews', methods=['GET'])
@login_required
def traveler_reviews():
    try:
        # Fetch reviews made by the current user
        reviews = ReviewsRating.query.filter_by(user_id=current_user.id).all()

        # Prepare data for the template
        reviews_data = []
        for review in reviews:
            review_image = ReviewImages.query.filter_by(rr_id=review.id).first()
            guide = TourGuide.query.get(review.tour_guide_id)
            reviews_data.append({
                "tour_name": review.comment,  # Assuming the comment describes the tour
                "tour_image": url_for('static', filename=f"review_pics/{review_image.img}") if review_image else url_for('static', filename="default.jpg"),
                "rating": review.rating,
                "comment": review.comment,
                "review_date": review.datetime.strftime('%b. %d, %Y'),
                "guide_name": f"{guide.user.first_name} {guide.user.last_name}" if guide else "Unknown Guide",
                "guide_profile_img": url_for('static', filename=f"profile_pics/{guide.user.profile_img}") if guide and guide.user.profile_img else url_for('static', filename="default.jpg"),
            })

        return render_template("traveler_reviews.html", reviews=reviews_data)
    except Exception as e:
        print(f"Error fetching reviews: {e}")
        return jsonify({"error": "An error occurred while fetching reviews"}), 500




