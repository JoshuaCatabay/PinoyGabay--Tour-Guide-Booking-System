from flask import render_template, redirect, url_for, flash, session
from flask_login import login_required, current_user, logout_user
from . import admin
from werkzeug.security import generate_password_hash
from BookingSystem import db, bcrypt
from BookingSystem.Admin_Page.forms import UserTourOperatorForm
from BookingSystem.models import User, TourOperator, send_confirmation_email, TourGuide, Booking, TourPackage
from flask import request
from sqlalchemy.orm import aliased

# Create Tour Operator
@admin.route('/create_operator', methods=['GET', 'POST'])
@login_required
def create_operator():
    form = UserTourOperatorForm()  # Instantiate the form
    if form.validate_on_submit():
        # Hash the password from the form
        hashed_password = bcrypt.generate_password_hash(form.password.data).decode('utf-8')
        
        # Create a new UserTourOperator instance
        new_user = User(
            first_name=form.name.data,
            email=form.email.data,
            password=hashed_password,
            role='touroperator',  # Set role as tour operator
            profile_img='default.png',
        )

        try:
            db.session.add(new_user)
            db.session.commit()
            
            # Create a TourOperator entry linked to the new user
            new_operator = TourOperator(
                user_id=new_user.id,
                contact_num=form.contact_number.data,
                municipal=form.municipal.data,
                tp_active=True,
            )
            db.session.add(new_operator)
            db.session.commit()
            send_confirmation_email(new_user)
            flash('Registration successful! Please confirm your email to complete the process.', 'info')

            # Get the active tab from the form submission
            active_tab = request.form.get('active_tab', 'overview')
            return redirect(url_for('admin.admin_dashboard', active_tab=active_tab))
        except Exception as e:
            db.session.rollback()  # Rollback if there's an error
            flash('An error occurred while creating the account. Please try again.', 'danger')
            print(f"Database error: {e}")  # For debugging, remove in production

    # Get active tab from query parameters (useful if redirected after submission)
    active_tab = request.args.get('active_tab', 'overview')
    return render_template('admin_dashboard.html', form=form, active_tab=active_tab)

# @admin.route('/tour_operator_profile/<int:operator_id>', methods=['GET'])
# @login_required
# def tour_operator_profile(operator_id):
#     # Fetch the user and tour operator details based on operator_id
#     operator = User.query.get_or_404(operator_id)
#     tour_operator = TourOperator.query.filter_by(user_id=operator_id).first_or_404()

#     return render_template('touroperator_dashboard.html',form=form, operator=operator, tour_operator=tour_operator)

@admin.route('/change_status/<int:id>', methods=['POST'])
def change_tour_operator_status(id):
    tour_operator = TourOperator.query.get_or_404(id)

    # Toggle the tp_active status
    tour_operator.tp_active = not tour_operator.tp_active

    # Flash a message based on the new status
    if tour_operator.tp_active:
        flash(f"{tour_operator.user.first_name} has been activated.", "success")
    else:
        flash(f"{tour_operator.user.first_name} has been deactivated.", "success")

    # Commit the change to the database
    db.session.commit()
    
    # Redirect back to the admin dashboard
    return redirect(url_for('admin.admin_dashboard'))







@admin.route('/dashboard')
@login_required
def admin_dashboard():
    if current_user.role == 'admin':
        flash('You do not have permission to access this page.', 'danger')
        return redirect(url_for('main.home'))

        # Fetch total datas
    travelers_count = User.query.filter_by(role='traveler').count()
    tour_operators_count = User.query.filter_by(role='touroperator').count()
    tour_guides_count = User.query.filter_by(role='tourguide').count()
    gen_booking_count = Booking.query.count()

    form = UserTourOperatorForm()
    tour_operators = TourOperator.query.all()
    role_filter = request.args.get('role', '')  # Default is no filter

    if role_filter == 'tourguide':
        operator_user = aliased(User)
        users = db.session.query(
            User.last_name.label('guide_last_name'),
            User.first_name.label('guide_first_name'),
            User.email,
            TourGuide.contact_num,  # Include contact number
            db.func.count(Booking.id).label('total_bookings'),  # Count bookings
            TourGuide.active,
            operator_user.first_name.label('operator_first_name')
        ).join(
            TourGuide, User.id == TourGuide.user_id
        ).join(
            TourOperator, TourGuide.toperator_id == TourOperator.id
        ).join(
            operator_user, TourOperator.user_id == operator_user.id
        ).outerjoin(
            Booking, Booking.tour_guide_id == TourGuide.id
        ).filter(
            User.role == 'tourguide'
        ).group_by(
            User.id, TourGuide.id, operator_user.id
        ).all()

    elif role_filter == 'touroperator':
        # Subquery to count tour guides for each tour operator
        tour_guide_count = db.session.query(
            TourGuide.toperator_id,
            db.func.count(TourGuide.id).label('total_tour_guides')
        ).group_by(TourGuide.toperator_id).subquery()

        # Subquery to count packages for each tour operator
        package_count = db.session.query(
            TourPackage.toperator_id,
            db.func.count(TourPackage.id).label('total_packages')
        ).group_by(TourPackage.toperator_id).subquery()

        # Subquery to count bookings under each tour operator's tour guides
        booking_count = db.session.query(
            TourGuide.toperator_id,
            db.func.count(Booking.id).label('total_bookings')
        ).join(Booking, Booking.tour_guide_id == TourGuide.id).group_by(TourGuide.toperator_id).subquery()

        # Main query to fetch the tour operator details along with the counts
        users = db.session.query(
            User,
            TourOperator.municipal,
            db.func.coalesce(tour_guide_count.c.total_tour_guides, 0).label('total_tour_guides'),
            db.func.coalesce(package_count.c.total_packages, 0).label('total_packages'),
            db.func.coalesce(booking_count.c.total_bookings, 0).label('total_bookings')
        ).join(
            TourOperator, User.id == TourOperator.user_id
        ).outerjoin(
            tour_guide_count, TourOperator.id == tour_guide_count.c.toperator_id
        ).outerjoin(
            package_count, TourOperator.id == package_count.c.toperator_id
        ).outerjoin(
            booking_count, TourOperator.id == booking_count.c.toperator_id
        ).filter(
            User.role == 'touroperator'
        ).all()




    elif role_filter == 'traveler':
        users = db.session.query(
            User,
            db.func.count(Booking.id).label('total_bookings')  # Count bookings
        ).outerjoin(
            Booking, User.id == Booking.user_id
        ).filter(
            User.role == 'traveler'
        ).group_by(
            User.id
        ).all()

    else:
        users = User.query.filter(User.role != 'admin').all()

    return render_template(
        'admin_dashboard.html',
        title='Admin Dashboard',
        form=form,
        tour_operators=tour_operators,
        users=users,
        role_filter=role_filter,
        travelers_count=travelers_count,
        tour_operators_count=tour_operators_count,
        tour_guides_count=tour_guides_count,
        gen_booking_count=gen_booking_count
    )
  # Render the dashboard with the form

@admin.route('/logout')
@login_required  # Ensure user is logged in before logging out
def logout():
    logout_user()
    session.pop('user_id', None) 
    flash('You have been logged out.', 'info')  # Optional: Notify user
    return redirect(url_for('main.home'))
