

// Smooth scrolling to sections
  const tabLinks = document.querySelectorAll('.tab-link');

  tabLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetSection = document.querySelector(link.getAttribute('href'));
      window.scrollTo({
        top: targetSection.offsetTop - 150, // Adjust for spacing
        behavior: 'smooth'
      });

      // Set active tab
      tabLinks.forEach(link => link.classList.remove('active'));
      link.classList.add('active');
    });
  });
//  

// Log out
  document.addEventListener('DOMContentLoaded', () => {
    const logoutLink = document.getElementById('logout-link');
    const logoutModal = document.getElementById('logout-modal');
    const cancelLogout = document.getElementById('cancel-logout');

    // Open the modal when "Log Out" is clicked
    logoutLink.addEventListener('click', (event) => {
      event.preventDefault(); // Prevent default link behavior
      logoutModal.classList.add('show');
    });

    // Close the modal when "Cancel" is clicked
    cancelLogout.addEventListener('click', () => {
      logoutModal.classList.remove('show');
    });

    // Close the modal when clicking outside the modal content
    window.addEventListener('click', (event) => {
      if (event.target === logoutModal) {
        logoutModal.classList.remove('show');
      }
    });
  });
//

// Change Profile
  const profilePicNav = document.getElementById('profile-pic-nav'); // Navbar profile picture
  const profilePicPanel = document.getElementById('profile-pic-panel'); // Profile panel picture
  const editPicBtn = document.getElementById('edit-pic-btn');
  const uploadPicInput = document.getElementById('upload-pic');
  const cropperModal = document.getElementById('cropper-modal');
  const cropperContainer = document.getElementById('cropper-container');
  const cropBtn = document.getElementById('crop-btn');
  const closeCropperModal = document.getElementById('close-cropper-modal');

  let cropper;

  // Open file picker when clicking on the edit button
  editPicBtn.addEventListener('click', () => uploadPicInput.click());

  // Open cropper modal after selecting a picture
  uploadPicInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.id = 'crop-image';
        cropperContainer.innerHTML = ''; // Clear previous cropper
        cropperContainer.appendChild(img);
        cropperModal.classList.add('show');

        // Initialize cropper
        if (cropper) cropper.destroy(); // Destroy previous cropper instance
        cropper = new Cropper(img, {
          aspectRatio: 1,
          viewMode: 1,
          movable: true,
          zoomable: true,
          scalable: true,
          cropBoxResizable: true,
        });
      };
      reader.readAsDataURL(file);
    }
  });

  // Crop and upload the image to the backend
  cropBtn.addEventListener('click', async () => {
    const canvas = cropper.getCroppedCanvas({
      width: 150,
      height: 150,
    });

    // Convert the canvas to a blob and send it to the backend
    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append('profile_picture', blob, 'profile.jpg');
      
      try {
        const response = await fetch('/update_profile_picture', {
          method: 'POST',
          body: formData,
        });
      
        if (!response.ok) {
          console.error(`Failed to update profile picture. Status: ${response.status} ${response.statusText}`);
          const errorData = await response.json();
          console.error("Error message from server:", errorData);
            
          // Show error toast
          showToast('Failed to update profile picture.', 'error');
        } else {
          const data = await response.json();
            
          // Update both profile pictures in the navbar and profile panel
          const newImageUrl = `${data.image_url}?timestamp=${new Date().getTime()}`; // Append timestamp to avoid caching issues
          profilePicNav.src = newImageUrl;
          profilePicPanel.src = newImageUrl;
      
          // Show success toast
          showToast('Profile picture updated successfully!', 'success');
        }
      } catch (error) {
        console.error("Error uploading profile picture:", error);
          
        // Show error toast
        showToast('An error occurred while uploading the profile picture.', 'error');
      }
      
      // Close the cropper modal
      cropperModal.classList.remove('show');
    });
    
  });

  // Close cropper modal
  closeCropperModal.addEventListener('click', () => {
    cropperModal.classList.remove('show');
  });
//




// My Tours Toggles Function
  const toggleButtons = document.querySelectorAll('.toggle-btn');
  const tourCards = document.querySelectorAll('.tour-card');

  // Function to update counts
  function updateCounts() {
    const counts = {
      all: tourCards.length,
      upcoming: 0,
      ongoing: 0,
      completed: 0,
      cancelled: 0,
    };

    // Count each status
    tourCards.forEach((card) => {
      const cardStatus = card.dataset.status;
      if (counts[cardStatus] !== undefined) {
        counts[cardStatus]++;
      }
    });

    // Update counts in the buttons
    toggleButtons.forEach((button) => {
      const status = button.dataset.status;
      const countElement = button.querySelector('.count');
      if (status in counts) {
        countElement.textContent = `(${counts[status]})`;
      }
    });
  }

  // Initialize layout on load
  window.addEventListener('DOMContentLoaded', () => {
    toggleButtons[0].click(); // Simulate a click to trigger layout adjustment
    updateCounts(); // Update counts on load
  });

  // Toggle visibility based on category
  toggleButtons.forEach((button) => {
    button.addEventListener('click', () => {
      toggleButtons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');

      const status = button.dataset.status;

      // Show/Hide cards based on the selected status
      tourCards.forEach((card) => {
        const cardStatus = card.dataset.status;
        card.style.display =
          status === 'all' || cardStatus === status ? 'block' : 'none';
      });
    });
  });
//



//Bookings

  document.addEventListener('DOMContentLoaded', function () {
    
    // Modal elements
    const modal = document.getElementById('booking-details-modal');
    const modalLoader = document.getElementById('modal-loader');
    const modalDetails = document.getElementById('modal-details');
    const modalStatus = document.getElementById('modal-status'); // Add this
    const closeModalButton = document.getElementById('close-booking-modal');

    // Function to fetch and display booking details
    async function fetchAndDisplayBookingDetails(bookingId) {
      console.log('Fetching details for booking ID:', bookingId); // Debugging log

      // Reset modal state
      modalLoader.style.display = 'block';
      modalDetails.classList.add('hidden');
      modal.classList.add('show'); // Show modal
      modal.classList.remove('hidden'); // Ensure it's visible
      document.body.style.overflow = 'hidden';

      try {
        // Fetch booking details
        const response = await fetch(`/booking/details/${bookingId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch booking details: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Booking details fetched:', data); // Debugging log

        // Populate modal with booking details
        modalStatus.textContent = data.status; // Display status
        document.getElementById('modal-traveler-name').textContent = data.traveler.name;
        document.getElementById('modal-tour-guide-name').textContent = data.tour_guide.name;
        document.getElementById('modal-tour-guide-number').textContent = data.tour_guide.contact;
        document.getElementById('modal-tour-date').textContent = `${data.date_start} - ${data.date_end}`;
        document.getElementById('modal-traveler-quantity').textContent = data.traveler_quantity;
        document.getElementById('modal-tour-guide-price').textContent = `₱${data.price}`;
        document.getElementById('modal-special-notes').textContent = data.special_notes;

        // Populate package details
        const packageData = data.package;
        document.getElementById('modal-tour-image').src = `/static/${packageData.package_img || "default.jpg"}`;
        document.getElementById('modal-package-title').textContent = packageData.name;
        document.getElementById('modal-package-location').textContent = packageData.location || "Location not provided";
        document.getElementById('modal-package-description').textContent = packageData.description;


        // Populate estimated prices
        const priceList = document.getElementById('modal-price-list');
        priceList.innerHTML = '';
        packageData.estimated_prices.forEach(price => {
          const li = document.createElement('li');
          li.innerHTML = `<span class="price-icon">💰</span> ${price.description}: ₱${price.estimated_price}`;
          priceList.appendChild(li);
        });

        // Populate inclusions
        const inclusionsList = document.getElementById('modal-inclusions-list');
        inclusionsList.innerHTML = '';
        packageData.inclusions.forEach(inclusion => {
          const li = document.createElement('li');
          li.innerHTML = `<span class="checkmark">&#10003;</span> ${inclusion.inclusion}`;
          inclusionsList.appendChild(li);
        });

        // Populate exclusions
        const exclusionsList = document.getElementById('modal-exclusions-list');
        exclusionsList.innerHTML = '';
        packageData.exclusions.forEach(exclusion => {
          const li = document.createElement('li');
          li.innerHTML = `<span class="crossmark">&#10007;</span> ${exclusion.exclusion}`;
          exclusionsList.appendChild(li);
        });

        // Populate itineraries
        const itineraryList = document.getElementById('modal-itinerary-list');
        itineraryList.innerHTML = '';
        packageData.itineraries.forEach(itinerary => {
          const li = document.createElement('li');
          li.innerHTML = `
            <span class="timeline-dot"></span>
            <div class="timeline-content">
              <strong>${itinerary.title}</strong>
              <p>${itinerary.subtitle}</p>
            </div>`;
          itineraryList.appendChild(li);
        });


          // Show modal content
          modalLoader.style.display = 'none';
          modalDetails.classList.remove('hidden');
          console.log('Modal content populated successfully.'); // Debugging log
        } catch (error) {
          console.error('Error loading booking details:', error);
          modalLoader.style.display = 'none';
          alert('Failed to load booking details. Please try again.');
        }
      }

      // Add event listeners to booking cards
      document.querySelectorAll('.view-booking').forEach(button => {
        button.addEventListener('click', function () {
          const bookingId = this.id.split('-').pop(); // Extract the booking ID from the button ID
          fetchAndDisplayBookingDetails(bookingId);
        });
      });

      // Close modal
      closeModalButton.addEventListener('click', function () {
        modal.classList.remove('show');
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
      });
  });

  
  // Show Booking modal logic
  const bookingModal = document.getElementById('booking-modal');
  const bookingInfo = document.getElementById('booking-info');
  const closeBookingModal = document.getElementById('close-booking-modal');

  function openBookingDetails(details) {
    bookingInfo.textContent = details;
    bookingModal.classList.add('show');
  }

  closeBookingModal.addEventListener('click', () => {
    bookingModal.classList.remove('show');
  });

//


// Cancel Boking

  document.addEventListener('DOMContentLoaded', function () {
    // Modal elements
    const modalCancelButton = document.getElementById('modal-cancel-booking-btn');
    const modal = document.getElementById('booking-details-modal');

    // Add event listeners to Cancel buttons in the cards
    document.querySelectorAll('.cancel-booking-btn').forEach(button => {
      button.addEventListener('click', function () {
          const bookingId = this.dataset.id;

          // Show confirmation modal
          showConfirmationModal('Are you sure you want to cancel this booking?', async () => {
              try {
                  const response = await fetch(`/booking/cancel/${bookingId}`, { method: 'POST' });
                  const result = await response.json();

                  if (response.ok) {
                      showToast(result.message, 'success'); // Show success toast
                      location.reload(); // Refresh the page to reflect changes
                  } else {
                      showToast(result.error || 'Failed to cancel the booking.', 'error'); // Show error toast
                  }
              } catch (error) {
                  console.error('Error cancelling booking:', error);
                  showToast('An error occurred while cancelling the booking.', 'error'); // Show error toast
              }
          });
      });
    });


    // Handle showing the Cancel button in the modal dynamically
    async function fetchAndDisplayBookingDetails(bookingId) {
        try {
            const response = await fetch(`/booking/details/${bookingId}`);
            const data = await response.json();

            // Show or hide the Cancel button in the modal
            if (data.status === 'upcoming') {
                modalCancelButton.classList.remove('hidden');
                modalCancelButton.dataset.id = bookingId;
            } else {
                modalCancelButton.classList.add('hidden');
            }
        } catch (error) {
            console.error('Error fetching booking details:', error);
        }
    }

    // Cancel button in modal
    modalCancelButton.addEventListener('click', async function () {
        const bookingId = this.dataset.id;

        if (!confirm('Are you sure you want to cancel this booking?')) return;

        try {
            const response = await fetch(`/booking/cancel/${bookingId}`, { method: 'POST' });
            const result = await response.json();

            if (response.ok) {
                alert(result.message);
                modal.classList.add('hidden'); // Close modal after cancellation
                location.reload(); // Refresh the page to reflect changes
            } else {
                alert(result.error || 'Failed to cancel the booking.');
            }
        } catch (error) {
            console.error('Error cancelling booking:', error);
            alert('An error occurred while cancelling the booking.');
        }
    });
  });
//







// My Reviews


  // Submit Reviews

  document.addEventListener('DOMContentLoaded', () => {
    const reviewModal = document.getElementById('review-modal');
    const closeReviewModal = document.getElementById('close-review-modal');
    const reviewForm = document.getElementById('review-form');
    const starRating = document.querySelectorAll('.star');
    let selectedRating = 0;

    // Attach click event to all review buttons
    document.querySelectorAll('.review-btn').forEach((btn) => {
      btn.addEventListener('click', function () {
        const bookingId = btn.dataset.bookingId;
        const guideId = btn.dataset.guideId;
        const tourName = btn.dataset.tour;

        // Populate modal fields
        document.getElementById('review-tour-name').textContent = tourName;
        document.getElementById('tour-guide-id').value = guideId;
        document.getElementById('booking-id').value = bookingId;

        // Show modal
        reviewModal.classList.remove('hidden');
        reviewModal.classList.add('show');
      });
    });

    // Close Review Modal
    closeReviewModal.addEventListener('click', () => {
      reviewModal.classList.add('hidden');
      reviewModal.classList.remove('show');
    });

    // Handle Star Rating
    starRating.forEach((star, index) => {
      star.addEventListener('click', () => {
        selectedRating = index + 1;
        starRating.forEach((s, i) => s.classList.toggle('active', i <= index));
      });
    });

    // Submit Review Form
    reviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (selectedRating === 0) {
        showToast('Please select a star rating.', 'error'); // Error toast
        return;
      }

      const tourGuideId = document.getElementById('tour-guide-id').value;
      const bookingId = document.getElementById('booking-id').value;
      const comment = document.getElementById('review-text').value;
      const reviewImage = document.getElementById('review-image').files[0];
      const formData = new FormData();
      formData.append('rating', selectedRating);
      formData.append('comment', comment);
      formData.append('tour_guide_id', tourGuideId);
      formData.append('booking_id', bookingId);
      if (reviewImage) formData.append('review_image', reviewImage);

      try {
        const response = await fetch('/submit_review', { method: 'POST', body: formData });
        const data = await response.json();
        if (data.success) {
          showToast(data.message, 'success'); // Success toast

          // Update the review button dynamically
          const reviewButton = document.querySelector(`.review-btn[data-booking-id="${bookingId}"]`);
          if (reviewButton) {
            reviewButton.classList.replace('review-btn', 'reviewed-btn');
            reviewButton.textContent = 'Reviewed';
            reviewButton.disabled = true;
          }

          // Close modal
          reviewModal.classList.add('hidden');
          reviewModal.classList.remove('show');
        } else {
          showToast(`Error submitting review: ${data.message}`, 'error'); // Error toast
        }
      } catch (error) {
        console.error('Error submitting review:', error);
        showToast('An error occurred while submitting the review. Please try again.', 'error'); // Error toast
      }
    });
  });



  // Reviews Container
  // Review Cards Hide Function
  const toggleReviewsBtn = document.getElementById('toggle-reviews');
  const reviewsContainer = document.getElementById('reviews-container');

  // Toggle Reviews Visibility
  toggleReviewsBtn.addEventListener('click', () => {
    reviewsContainer.classList.toggle('hidden');

    // Change icon based on visibility
    toggleReviewsBtn.innerHTML = 
      reviewsContainer.classList.contains('hidden') ? '&#128584;' : '&#128065;';
  });



//







//Account Settings
  // Change Password and Email
  document.addEventListener('DOMContentLoaded', function () {
    // Elements
    const editEmailBtn = document.getElementById('edit-email-btn');
    const editPasswordBtn = document.getElementById('edit-password-btn');
    const passwordConfirmModal = document.getElementById('password-confirm-modal');
    const confirmPasswordInput = document.getElementById('confirm-password-input');
    const passwordConfirmBtn = document.getElementById('password-confirm-btn');
    const passwordCancelBtn = document.getElementById('password-cancel-btn');
    const changeEmailModal = document.getElementById('change-email-modal');
    const changePasswordModal = document.getElementById('change-password-modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const saveEmailBtn = document.getElementById('save-email-btn');
    const cancelEmailBtn = document.getElementById('cancel-email-btn');
    const savePasswordBtn = document.getElementById('save-password-btn');
    const cancelPasswordBtn = document.getElementById('cancel-password-btn');
    const currentEmailInput = document.getElementById('current-email'); // Displayed email field
    const currentPasswordInput = document.getElementById('current-password'); // Displayed password field
  
    let activeAction = ''; // To track current action ('email' or 'password')
  
    // Function to validate email
    function isValidEmail(email) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        return 'Invalid email format. Please include "@" and a valid domain.';
      }
      return ''; // Valid email
    }
  
    // Function to validate password
    function isValidPassword(password) {
      if (password.length < 8) return 'Password must be at least 8 characters long.';
      if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
      if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.';
      if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Password must contain at least one special character.';
      return ''; // Valid password
    }
  
    // Open the password confirmation modal
    editEmailBtn.addEventListener('click', () => {
      activeAction = 'email';
      openPasswordModal();
    });
  
    editPasswordBtn.addEventListener('click', () => {
      activeAction = 'password';
      openPasswordModal();
    });
  
    // Confirm password and open the appropriate modal
    passwordConfirmBtn.addEventListener('click', async () => {
      const enteredPassword = confirmPasswordInput.value.trim();

      // Show loading feedback
      passwordConfirmBtn.textContent = 'Verifying...';
      passwordConfirmBtn.disabled = true;

      try {
        const response = await fetch('/tourguide/verify_password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: enteredPassword }),
        });

        const result = await response.json();

        if (result.success) {
          closeModal(); // Close password confirmation modal

          // Show success toast
          showToast('Password verified successfully!', 'success');

          if (activeAction === 'email') {
            openChangeEmailModal();
          } else if (activeAction === 'password') {
            openChangePasswordModal();
          }
        } else {
          showToast(result.message || 'Incorrect password. Please try again.', 'error'); // Error toast
        }
      } catch (error) {
        console.error('Error verifying password:', error);
        showToast('An error occurred while verifying the password. Please try again.', 'error'); // Error toast
      } finally {
        passwordConfirmBtn.textContent = 'Confirm';
        passwordConfirmBtn.disabled = false;
      }
    });
  
    // Save new email
    saveEmailBtn.addEventListener('click', async () => {
      const newEmail = document.getElementById('new-email-input').value.trim();

      // Validate the email format
      const emailValidationError = isValidEmail(newEmail);
      if (emailValidationError) {
        showToast(emailValidationError, 'error'); // Validation error toast
        return; // Stop execution if email is invalid
      }

      try {
        saveEmailBtn.textContent = 'Saving...';
        saveEmailBtn.disabled = true;

        const response = await fetch('/tourguide/update_email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: newEmail }),
        });

        const result = await response.json();

        if (result.success) {
          showToast('Email updated successfully!', 'success'); // Success toast
          currentEmailInput.value = newEmail; // Update displayed email immediately
          closeModal();
        } else {
          showToast(result.message || 'Failed to update email.', 'error'); // Error toast
        }
      } catch (error) {
        console.error('Error updating email:', error);
        showToast('An error occurred. Please try again.', 'error'); // Error toast
      } finally {
        saveEmailBtn.textContent = 'Save Email';
        saveEmailBtn.disabled = false;
      }
    });
  
    // Save new password
    savePasswordBtn.addEventListener('click', async () => {
      const newPassword = document.getElementById('new-password').value.trim();
      const confirmNewPassword = document.getElementById('confirm-new-password').value.trim();

      if (newPassword !== confirmNewPassword) {
        showToast('Passwords do not match. Please try again.', 'error'); // Error toast
        return;
      }

      // Validate the password strength
      const passwordValidationError = isValidPassword(newPassword);
      if (passwordValidationError) {
        showToast(passwordValidationError, 'error'); // Validation error toast
        return; // Stop execution if password is invalid
      }

      try {
        savePasswordBtn.textContent = 'Saving...';
        savePasswordBtn.disabled = true;

        const response = await fetch('/update_password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: newPassword }),
        });

        const result = await response.json();

        if (result.success) {
          showToast('Password updated successfully!', 'success'); // Success toast
          closeModal();
        } else {
          showToast(result.message || 'Failed to update password.', 'error'); // Error toast
        }
      } catch (error) {
        console.error('Error updating password:', error);
        showToast('An error occurred. Please try again.', 'error'); // Error toast
      } finally {
        savePasswordBtn.textContent = 'Save Password';
        savePasswordBtn.disabled = false;
      }
    });
  
    // Cancel button handlers
    passwordCancelBtn.addEventListener('click', closeModal);
    cancelEmailBtn.addEventListener('click', closeModal);
    cancelPasswordBtn.addEventListener('click', closeModal);
  
    // Helper functions to open and close modals
    function openPasswordModal() {
      passwordConfirmModal.classList.add('show');
      modalOverlay.classList.add('show');
    }
  
    function openChangeEmailModal() {
      changeEmailModal.classList.add('show');
      modalOverlay.classList.add('show');
    }
  
    function openChangePasswordModal() {
      changePasswordModal.classList.add('show');
      modalOverlay.classList.add('show');
    }
  
    function closeModal() {
      document.querySelectorAll('.modal').forEach((modal) => modal.classList.remove('show'));
      modalOverlay.classList.remove('show');
      confirmPasswordInput.value = ''; // Clear password input
    }
  });
  



  
// Toast and confirmation Modal



  function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    
    // Create a new toast element
    const toast = document.createElement('div');
    toast.classList.add('toast', type);
    toast.textContent = message;

    // Append the toast to the container
    toastContainer.appendChild(toast);

    // Remove the toast after a few seconds
    setTimeout(() => {
      toast.remove();
    }, 4000); 
  }


  function showConfirmationModal(message, onConfirm) {
    const modal = document.getElementById('confirmation-modal');
    const confirmMessage = document.getElementById('confirmation-message');
    const confirmYes = document.getElementById('confirm-yes');
    const confirmNo = document.getElementById('confirm-no');
    const modalOverlay = document.querySelector('.modal-overlay');

    // Set the confirmation message
    confirmMessage.textContent = message;

    // Adjust z-index for overlay
    modalOverlay.classList.add('hidden'); // Temporarily hide overlay blur
    modal.classList.remove('hidden'); // Show the confirmation modal

    // Event listeners
    const handleConfirm = () => {
      onConfirm();
      closeModal();
    };

    const closeModal = () => {
      modalOverlay.classList.remove('hidden'); // Restore overlay blur
      modal.classList.add('hidden');
      confirmYes.removeEventListener('click', handleConfirm);
      confirmNo.removeEventListener('click', closeModal);
    };

    confirmYes.addEventListener('click', handleConfirm);
    confirmNo.addEventListener('click', closeModal);
  }


// 