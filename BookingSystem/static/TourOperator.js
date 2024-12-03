

console.log('TourOperator.js loaded successfully!');

// Ensure everything runs after DOM is fully loaded
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded.');

    // Sidebar Tab Switching Logic
    const navLinks = document.querySelectorAll('.nav-link');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabPanes.forEach((pane) => pane.classList.remove('active'));
    const activeTab = document.querySelector('.nav-link.active');
    if (activeTab) {
        document.getElementById(activeTab.dataset.tab).classList.add('active');
    }

    navLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach((link) => link.classList.remove('active'));
            tabPanes.forEach((pane) => pane.classList.remove('active'));

            link.classList.add('active');
            document.getElementById(link.dataset.tab).classList.add('active');
        });
    });

    // Logout Modal Logic
    const logoutModal = document.getElementById('logout-modal');
    const confirmLogout = document.getElementById('confirm-logout');
    const cancelLogout = document.getElementById('cancel-logout');

    const logoutTab = document.querySelector('[data-tab="logout"]');
    if (logoutTab) {
        logoutTab.addEventListener('click', () => {
            logoutModal.classList.add('show');
        });
    }

    confirmLogout?.addEventListener('click', () => {
        window.location.href = '{{ url_for("touroperator.logout") }}';
    });

    cancelLogout?.addEventListener('click', () => {
        logoutModal.classList.remove('show');
    });

    // // Booking Tab Switching Logic
    // const bookingTabBtns = document.querySelectorAll('.booking-tab-btn');
    // const bookingCategories = document.querySelectorAll('.booking-category');

    // bookingTabBtns.forEach((btn) => {
    //     btn.addEventListener('click', () => {
    //         bookingTabBtns.forEach((btn) => btn.classList.remove('active'));
    //         btn.classList.add('active');

    //         const status = btn.dataset.status;
    //         bookingCategories.forEach((category) => {
    //             const categoryStatus = category.dataset.status;
    //             category.style.display =
    //                 status === 'all' || categoryStatus === status ? 'block' : 'none';
    //         });
    //     });
    // });














    
    // Functionality for editable fields
    setupEditableSection('name');
    setupEditableSection('email');
    setupEditableSection('contact-number');
    
    function setupEditableSection(fieldId) {
        const editBtn = document.getElementById(`edit-${fieldId}-btn`);
        const saveBtn = document.getElementById(`save-${fieldId}-btn`);
        const input = document.getElementById(fieldId);
    
        editBtn?.addEventListener('click', () => {
            input.disabled = false;
            input.focus();
            editBtn.classList.add('hidden');
            saveBtn.classList.remove('hidden');
        });
    
        saveBtn?.addEventListener('click', () => {
            input.disabled = true;
            editBtn.classList.remove('hidden');
            saveBtn.classList.add('hidden');
        });
    }
    




// Selecting elements
const profilePicOperator = document.getElementById('profile-pic-operator'); // Profile picture element
const changePicBtn = document.getElementById('change-pic-btn'); // Button to change the picture
const uploadPicInput = document.getElementById('upload-pic'); // Hidden file input
const cropperModal = document.getElementById('cropper-modal'); // Modal for cropping
const cropperContainer = document.getElementById('cropper-container'); // Container for the cropper
const cropBtn = document.getElementById('crop-btn'); // Button to apply crop
const closeCropperModal = document.getElementById('close-cropper-modal'); // Button to close the cropper modal
const savePicBtn = document.getElementById('save-pic-btn'); // Button to save the cropped picture

let cropper;

// Ensure "Save" button is hidden on page load
savePicBtn.classList.add('hidden');

// Open the file input when clicking "Change Profile Picture" button
changePicBtn.addEventListener('click', () => {
  uploadPicInput.value = ""; // Reset file input to allow re-selection
  uploadPicInput.click();
});

// Display the cropper modal and initialize the cropper after selecting an image
uploadPicInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement('img');
      img.src = e.target.result;
      img.id = 'crop-image';
      cropperContainer.innerHTML = ''; // Clear previous cropper content
      cropperContainer.appendChild(img);
      cropperModal.classList.remove('hidden'); // Show the modal

      // Destroy existing cropper instance if any, then create a new one
      if (cropper) {
        cropper.destroy();
      }
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

// Apply the crop and preview the cropped image
cropBtn.addEventListener('click', () => {
  if (cropper) {
    const canvas = cropper.getCroppedCanvas({ width: 200, height: 200 });
    if (canvas) {
      const newImageSrc = canvas.toDataURL(); // Get the cropped image data URL
      profilePicOperator.src = newImageSrc; // Update the profile picture preview
      savePicBtn.classList.remove('hidden'); // Show the "Save" button
      cropperModal.classList.add('hidden'); // Hide the modal
    }
  }
});

// Close the cropper modal and destroy the cropper instance
closeCropperModal.addEventListener('click', () => {
  if (cropper) {
    cropper.destroy();
    cropper = null; // Reset cropper instance
  }
  cropperModal.classList.add('hidden'); // Hide the modal
});

// Save the cropped image to the backend
savePicBtn.addEventListener('click', () => {
  if (cropper) {
    cropper.getCroppedCanvas({ width: 200, height: 200 }).toBlob((blob) => {
      const formData = new FormData();
      formData.append('profile_picture', blob, 'profile.jpg');

      fetch('/tourguide/upload_profile_picture', { // Update the endpoint as needed
        method: 'POST',
        body: formData,
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            // Prevent caching issues by appending a timestamp
            const newImageUrl = `${data.url}?t=${new Date().getTime()}`;
            profilePicOperator.src = newImageUrl;
            savePicBtn.classList.add('hidden'); // Hide the save button
            alert('Profile picture updated successfully!');
          } else {
            alert('Failed to save profile picture.');
          }
        })
        .catch(error => {
          console.error('Error uploading image:', error);
          alert('An error occurred while saving the picture.');
        });
    });
  }
});



    // Password Management Logic
    const editPasswordBtn = document.getElementById('edit-password-btn');
    const savePasswordBtn = document.getElementById('save-password-btn');
    const reenterPasswordGroup = document.getElementById('reenter-password-group');
    const newPasswordGroup = document.getElementById('new-password-group');
    const confirmPasswordGroup = document.getElementById('confirm-password-group');

    editPasswordBtn?.addEventListener('click', () => togglePasswordEdit(true));
    savePasswordBtn?.addEventListener('click', () => togglePasswordEdit(false));

    function togglePasswordEdit(isEditing) {
        [reenterPasswordGroup, newPasswordGroup, confirmPasswordGroup].forEach(group => {
            group.classList.toggle('hidden', !isEditing);
        });
        editPasswordBtn.classList.toggle('hidden', isEditing);
        savePasswordBtn.classList.toggle('hidden', !isEditing);
    }
});








// Ensure Tour Management Tab Displays on Load
window.addEventListener('DOMContentLoaded', () => {
  
    tabPanes.forEach((pane) => {
      pane.style.display = pane.id === 'tour-management' ? 'block' : 'none';
    });
  });
  
  // Add Tour Guide Modal Logic
  const addTourGuideBtn = document.getElementById('add-tour-guide-btn');
  const tourGuideModal = document.getElementById('tour-guide-modal');
  const closeTourGuideModal = document.getElementById('close-tour-guide-modal');
  
  addTourGuideBtn?.addEventListener('click', () => {
    tourGuideModal.classList.add('show');
  });
  
  closeTourGuideModal?.addEventListener('click', () => {
    tourGuideModal.classList.remove('show');
  });




  
  
// // Open and Close Create Tour Package Modals
// document.getElementById('open-form-btn').addEventListener('click', () => {
//     document.getElementById('form-modal').classList.add('show');
//     document.getElementById('modal-overlay').classList.add('show');
//   });
  
//   document.getElementById('close-form-modal').addEventListener('click', () => {
//     document.getElementById('form-modal').classList.remove('show');
//     document.getElementById('modal-overlay').classList.remove('show');
//   });
  
//   // Open the Details Modal
//   document.getElementById('tour-packages-display').addEventListener('click', (e) => {
//     if (e.target && e.target.classList.contains('view-details-btn')) {
//       document.getElementById('details-modal').classList.add('show');
//       document.getElementById('modal-overlay').classList.add('show');
//     }
//   });
  
//   // Close the Details Modal
//   document.getElementById('close-details-modal').addEventListener('click', () => {
//     document.getElementById('details-modal').classList.remove('show');
//     document.getElementById('modal-overlay').classList.remove('show');
//   });
  
//   // Close any open modal when clicking on the overlay
//   document.getElementById('modal-overlay').addEventListener('click', () => {
//     document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('show'));
//     document.getElementById('modal-overlay').classList.remove('show');
//   });
  
//   // Add and Remove Inclusions/Exclusions
//   document.getElementById('add-inclusion-btn').addEventListener('click', () => {
//     const newInclusion = document.createElement('li');
//     newInclusion.innerHTML = `<input type="text" placeholder="Add inclusion" class="editable-item" />
//                               <button type="button" class="remove-btn">Remove</button>`;
//     document.getElementById('inclusions-list').appendChild(newInclusion);
//   });
  
//   document.getElementById('add-exclusion-btn').addEventListener('click', () => {
//     const newExclusion = document.createElement('li');
//     newExclusion.innerHTML = `<input type="text" placeholder="Add exclusion" class="editable-item" />
//                               <button type="button" class="remove-btn">Remove</button>`;
//     document.getElementById('exclusions-list').appendChild(newExclusion);
//   });
  
//   // Remove an inclusion or exclusion item
//   document.addEventListener('click', (e) => {
//     if (e.target && e.target.classList.contains('remove-btn')) {
//       e.target.parentElement.remove();
//     }
//   });
  




  


// //EMAIL
// const editNameBtn = document.getElementById('edit-name-btn');
// const saveNameBtn = document.getElementById('save-name-btn');
// const nameInput = document.getElementById('name-input');
// const passwordModal = document.getElementById('password-verification-modal');
// const verifyPasswordBtn = document.getElementById('verify-password-btn');
// const cancelVerificationBtn = document.getElementById('cancel-verification-btn');
// const verificationPasswordInput = document.getElementById('verification-password');

// // Show the password verification modal when the pencil button is clicked
// editNameBtn?.addEventListener('click', () => {
//   console.log("Edit button clicked");
//   passwordModal.classList.remove('hidden');
//   verificationPasswordInput.value = '';  // Clear any previous password
//   verificationPasswordInput.focus();  // Focus on the password input
// });

// // Close the modal if the user clicks "Cancel"
// cancelVerificationBtn?.addEventListener('click', () => {
//   console.log("Cancel button clicked");
//   passwordModal.classList.add('hidden');
// });

// // Handle password verification when "Verify" button is clicked
// verifyPasswordBtn?.addEventListener('click', async () => {
//   const password = verificationPasswordInput.value;

//   console.log("Verifying password");

//   try {
//     const response = await fetch('/tourguide/verify-password', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ password })
//     });
    
//     const result = await response.json();
//     if (result.success) {
//       console.log("Password verified successfully");
//       passwordModal.classList.add('hidden');
//       nameInput.disabled = false;
//       nameInput.focus();
//       editNameBtn.classList.add('hidden');
//       saveNameBtn.classList.remove('hidden');
//     } else {
//       alert('Incorrect password, please try again.');
//     }
//   } catch (error) {
//     console.error('Error verifying password:', error);
//     alert('An error occurred. Please try again later.');
//   }
// });

// // Handle saving the new name when the "Save" button is clicked
// saveNameBtn?.addEventListener('click', async () => {
//   const newName = nameInput.value;

//   console.log("Saving new name:", newName);

//   try {
//     const response = await fetch('/tourguide/update_email', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ name: newName })
//     });

//     const result = await response.json();
//     if (result.success) {
//       alert('Name updated successfully!');
//       nameInput.disabled = true;
//       editNameBtn.classList.remove('hidden');
//       saveNameBtn.classList.add('hidden');
//     } else {
//       alert('Failed to update name. Please try again.');
//     }
//   } catch (error) {
//     console.error('Error updating name:', error);
//     alert('An error occurred. Please try again later.');
//   }
// });





// Elements
// Elements EMAIL and Contact number and PASSWORD
document.addEventListener('DOMContentLoaded', function () {
  // Elements
  const guideEditEmailBtn = document.getElementById('guide-edit-email-btn');
  const guideEditContactBtn = document.getElementById('guide-edit-contact-btn');
  const guideEditPasswordBtn = document.getElementById('guide-edit-password-btn'); // Pencil icon for password change
  const guidePasswordModal = document.getElementById('guide-password-confirm-modal'); // Password verification modal
  const guideChangePasswordModal = document.getElementById('guide-change-password-modal'); // Change password modal
  const guideChangeEmailModal = document.getElementById('guide-change-email-modal'); // Change email modal
  const guideChangeContactModal = document.getElementById('guide-change-contact-modal'); // Change contact modal
  const guidePasswordCancelBtn = document.getElementById('guide-password-cancel-btn');
  const guidePasswordConfirmBtn = document.getElementById('guide-password-confirm-btn');
  const verifyPasswordInput = document.getElementById('guide-confirm-password-input');
  const newPasswordInput = document.getElementById('guide-new-password');
  const confirmNewPasswordInput = document.getElementById('guide-confirm-new-password');
  const guideCancelPasswordBtn = document.getElementById('guide-cancel-password-btn');
  const guideSavePasswordBtn = document.getElementById('guide-save-password-btn');
  const emailInput = document.getElementById('email');
  const guideSaveEmailBtn = document.getElementById('guide-save-email-btn');
  const guideCancelEmailBtn = document.getElementById('guide-cancel-email-btn');
  const contactNumberInput = document.getElementById('contact-number');
  const guideNewContactInput = document.getElementById('guide-new-contact-input');
  const guideSaveContactBtn = document.getElementById('guide-save-contact-btn');
  const guideCancelContactBtn = document.getElementById('guide-cancel-contact-btn');
  const modalOverlay = document.getElementById('modal-overlay');

  let activeAction = ''; // Track the current action: 'email', 'contact', or 'password'

  // Validation Functions
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function isValidPassword(password) {
    if (password.length < 8) return 'Password must be at least 8 characters long.';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Password must contain at least one special character.';
    return ''; // Valid password
  }

  function isValidContactNumber(contactNumber) {
    const contactRegex = /^\d{11}$/;
    return contactRegex.test(contactNumber);
  }

  // Open the password confirmation modal with overlay
  function openGuidePasswordModal(action) {
    activeAction = action;
    guidePasswordModal.classList.add('show');
    modalOverlay.classList.add('show');
  }

  // Close the password modal
  function closeGuidePasswordModal() {
    guidePasswordModal.classList.remove('show');
    modalOverlay.classList.remove('show');
    verifyPasswordInput.value = ''; // Clear password input field
  }

  // Open the specific modal based on action
  function openActionModal() {
    if (activeAction === 'email') {
      guideChangeEmailModal.classList.add('show');
    } else if (activeAction === 'contact') {
      guideChangeContactModal.classList.add('show');
    } else if (activeAction === 'password') {
      guideChangePasswordModal.classList.add('show');
    }
    modalOverlay.classList.add('show');
  }

  // Close all action modals
  function closeActionModals() {
    guideChangeEmailModal.classList.remove('show');
    guideChangeContactModal.classList.remove('show');
    guideChangePasswordModal.classList.remove('show');
    modalOverlay.classList.remove('show');
    newPasswordInput.value = '';
    confirmNewPasswordInput.value = '';
  }

  // Open the password verification modal
  guideEditEmailBtn.addEventListener('click', () => openGuidePasswordModal('email'));
  guideEditContactBtn.addEventListener('click', () => openGuidePasswordModal('contact'));
  guideEditPasswordBtn.addEventListener('click', () => openGuidePasswordModal('password'));

  // Close the password verification modal
  guidePasswordCancelBtn.addEventListener('click', closeGuidePasswordModal);

  // Verify password and open the appropriate modal
  guidePasswordConfirmBtn.addEventListener('click', async () => {
    const password = verifyPasswordInput.value.trim();

    try {
      const response = await fetch('/tourguide/verify_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();

      if (result.success) {
        closeGuidePasswordModal();
        alert('Password verified successfully!');
        openActionModal();
      } else {
        alert(result.message || 'Password verification failed. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying password:', error);
      alert('There was an error verifying your password. Please try again.');
    }
  });

  // Save the updated email
  guideSaveEmailBtn.addEventListener('click', async () => {
    const newEmail = document.getElementById('guide-new-email-input').value.trim();

    if (!isValidEmail(newEmail)) {
      alert('Invalid email format. Please include "@" and a valid domain.');
      return;
    }

    try {
      const response = await fetch('/tourguide/update_email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail }),
      });

      const result = await response.json();

      if (result.success) {
        emailInput.value = newEmail;
        closeActionModals();
        alert('Email updated successfully!');
      } else {
        alert(result.message || 'Failed to update email.');
      }
    } catch (error) {
      console.error('Error updating email:', error);
      alert('There was an error processing your request. Please try again.');
    }
  });

  // Save the updated contact number
  guideSaveContactBtn.addEventListener('click', async () => {
    const newContact = guideNewContactInput.value.trim();

    if (!isValidContactNumber(newContact)) {
      alert('Contact number must be exactly 11 digits.');
      return;
    }

    try {
      const response = await fetch('/touroperator/update_contact_number', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact_number: newContact }),
      });

      const result = await response.json();

      if (result.success) {
        contactNumberInput.value = newContact;
        closeActionModals();
        alert('Contact number updated successfully!');
      } else {
        alert(result.message || 'Failed to update contact number.');
      }
    } catch (error) {
      console.error('Error updating contact number:', error);
      alert('There was an error processing your request. Please try again.');
    }
  });

  // Save the new password
  guideSavePasswordBtn.addEventListener('click', async () => {
    const newPassword = newPasswordInput.value.trim();
    const confirmNewPassword = confirmNewPasswordInput.value.trim();

    if (!newPassword || !confirmNewPassword) {
      alert('Please fill out all password fields.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      alert('Passwords do not match.');
      return;
    }
    const passwordError = isValidPassword(newPassword);
    if (passwordError) {
      alert(passwordError);
      return;
    }

    try {
      const response = await fetch('/tourguide/update_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_password: newPassword }),
      });

      const result = await response.json();

      if (result.success) {
        alert('Password changed successfully!');
        closeActionModals();
      } else {
        alert(result.message || 'Failed to update password.');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      alert('There was an error processing your request. Please try again.');
    }
  });
});










// Confirm password and open the appropriate modal for editing
document.addEventListener('DOMContentLoaded', function () {
  // Select the elements
  const guidePasswordConfirmBtn = document.getElementById('guide-password-confirm-btn');
  const guideConfirmPasswordInput = document.getElementById('guide-confirm-password-input');

  if (!guidePasswordConfirmBtn || !guideConfirmPasswordInput) {
      console.error('One or more elements not found.');
      return;
  }

  let guideActiveAction = ''; // Define this variable somewhere in scope to track action

  // Add event listener
  guidePasswordConfirmBtn.addEventListener('click', () => {
      // if (guideConfirmPasswordInput.value === 'password123') { // Replace 'password123' with actual logic to validate the password
      //     closeGuideModal();
      //     if (guideActiveAction === 'email') {
      //         openGuideChangeEmailModal();
      //     } else if (guideActiveAction === 'password') {
      //         openGuideChangePasswordModal();
      //     } else if (guideActiveAction === 'contact') {
      //         openGuideChangeContactModal();
      //     }
      // } else {
      //     alert('Incorrect password. Please try again.');
      // }
  });

  function closeGuideModal() {
      // Your function to close the password confirmation modal
      console.log('Closing password modal');
      // Actual code to close the modal goes here
  }

  function openGuideChangeEmailModal() {
      // Function to open the email change modal
      console.log('Opening email change modal');
      // Code to open the email modal goes here
  }

  function openGuideChangePasswordModal() {
      // Function to open the password change modal
      console.log('Opening password change modal');
      // Code to open the password modal goes here
  }

  function openGuideChangeContactModal() {
      // Function to open the contact change modal
      console.log('Opening contact change modal');
      // Code to open the contact modal goes here
  }
});






















// Save new email
document.addEventListener('DOMContentLoaded', function () {
  // Select the guideSaveEmailBtn element
  const guideSaveEmailBtn = document.getElementById('guide-save-email-btn');
  const guideNewEmailInput = document.getElementById('guide-new-email-input');
  
  if (!guideSaveEmailBtn || !guideNewEmailInput) {
      console.error('Element not found in the DOM.');
      return;
  }

  // Add event listener for the save button
  guideSaveEmailBtn.addEventListener('click', () => {
      const newEmail = guideNewEmailInput.value;
      alert(`New email saved: ${newEmail}`);
      closeGuideModal(); // Ensure this function is defined
  });
});

// Example function to close the modal (make sure this function is defined in your script)
function closeGuideModal() {
  const modal = document.getElementById('guide-change-email-modal');
  if (modal) {
      modal.classList.add('hidden');
  }
}













// Save new password
document.addEventListener('DOMContentLoaded', function () {
  // Select the elements
  const guideSavePasswordBtn = document.getElementById('guide-save-password-btn');
  const newPasswordInput = document.getElementById('guide-new-password');
  const confirmNewPasswordInput = document.getElementById('guide-confirm-new-password');

  // Check if elements exist before adding event listeners
  if (!guideSavePasswordBtn || !newPasswordInput || !confirmNewPasswordInput) {
      console.error('One or more elements not found in the DOM.');
      return;
  }

  // Add event listener for the save password button
  guideSavePasswordBtn.addEventListener('click', () => {
      const newPassword = newPasswordInput.value;
      const confirmPassword = confirmNewPasswordInput.value;

      if (newPassword === confirmPassword) {
          alert('Password changed successfully!');
          closeGuideModal(); // Ensure this function is defined
      } else {
          alert('Passwords do not match.');
      }
  });
});

// Example function to close the modal (make sure this function is defined in your script)
function closeGuideModal() {
  const modal = document.getElementById('guide-change-password-modal');
  if (modal) {
      modal.classList.add('hidden');
  }
}














// Save new contact number



// Cancel and close modal actions
document.addEventListener('DOMContentLoaded', function () {
  // Get elements
  const guidePasswordCancelBtn = document.getElementById('guide-password-cancel-btn');
  const guideCancelEmailBtn = document.getElementById('guide-cancel-email-btn');
  const guideCancelPasswordBtn = document.getElementById('guide-cancel-password-btn');
  const guideCancelContactBtn = document.getElementById('guide-cancel-contact-btn');
  const modalOverlay = document.getElementById('modal-overlay');
  
  // Check if elements exist before adding event listeners
  if (!guidePasswordCancelBtn || !guideCancelEmailBtn || !guideCancelPasswordBtn || !modalOverlay) {
      console.error('One or more elements are missing from the DOM');
      return;
  }

  // Add event listeners to close modals
  guidePasswordCancelBtn.addEventListener('click', closeGuideModal);
  guideCancelEmailBtn.addEventListener('click', closeGuideModal);
  guideCancelPasswordBtn.addEventListener('click', closeGuideModal);
  guideCancelContactBtn?.addEventListener('click', closeGuideModal); // Optional chaining for guideCancelContactBtn

  // Functions to open modals
  function openGuidePasswordModal() {
      document.getElementById('guide-password-confirm-modal').classList.add('show');
      modalOverlay.classList.add('show');
  }

  function openGuideChangeEmailModal() {
      document.getElementById('guide-change-email-modal').classList.add('show');
      modalOverlay.classList.add('show');
  }

  function openGuideChangePasswordModal() {
      document.getElementById('guide-change-password-modal').classList.add('show');
      modalOverlay.classList.add('show');
  }

  function openGuideChangeContactModal() {
      document.getElementById('guide-change-contact-modal').classList.add('show');
      modalOverlay.classList.add('show');
  }

  // Function to close all modals and overlay
  function closeGuideModal() {
      document.querySelectorAll('.modal.show').forEach(modal => modal.classList.remove('show'));
      modalOverlay.classList.remove('show');
      document.getElementById('guide-confirm-password-input').value = ''; // Reset password input
  }
});








//CURRENT PASSWORD 


// Function to open the booking details modal and populate it with data
// Example of placing openBookingDetails in the tour guide dashboard JavaScript

// Function to open the booking details modal and populate it with data
function openBookingDetails(bookingId) {
  console.log("Fetching booking details for ID:", bookingId);  // Debugging log
  fetch(`/tourguide/get_booking_details/${bookingId}`)
      .then(response => {
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
      })
      .then(booking => {
          console.log("Received booking data:", booking);  // Debugging log
          document.getElementById("modal-traveler-name").textContent = booking.travelerName;
          document.getElementById("modal-tour-guide-name").textContent = booking.tourGuideName;
          document.getElementById("modal-tour-guide-number").textContent = booking.tourGuideNumber;
          document.getElementById("modal-tour-package").textContent = booking.tourType;
          document.getElementById("modal-tour-date").textContent = `${booking.date_start} - ${booking.date_end}`;
          document.getElementById("modal-traveler-quantity").textContent = booking.traveler_quantity;

          document.getElementById("booking-modal").classList.remove("hidden");
      })
      .catch(error => console.error("Error loading booking details:", error));
}


// Function to close the booking details modal
function closeBookingDetailsModal() {
  document.getElementById("booking-modal").classList.add("hidden");
}








// ALERT ACCOUNT CREATION
// Ensure everything runs after DOM is fully loaded
window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded.');

  // --- Toast Notification Logic ---
  const showToast = (message, type = 'success') => {
      const toastWrapper = document.getElementById('toast-wrapper');
      if (!toastWrapper) return;

      // Create toast element
      const toast = document.createElement('div');
      toast.className = `custom-toast ${type}`;
      toast.innerText = message;

      // Append toast to the wrapper
      toastWrapper.appendChild(toast);

      // Auto-remove toast after 5 seconds
      setTimeout(() => {
          toast.remove();
      }, 5000);
  };

  // --- Modal Logic for Adding a Tour Guide ---
  const addTourGuideBtn = document.getElementById('add-tour-guide-btn');
  const tourGuideModalWrapper = document.getElementById('tour-guide-modal');
  const closeTourGuideModal = document.getElementById('close-tour-guide-modal');
  const tourGuideModalOverlay = document.getElementById('tour-guide-overlay');

  // Open Modal
  if (addTourGuideBtn && tourGuideModalWrapper) {
      addTourGuideBtn.addEventListener('click', () => {
          tourGuideModalWrapper.classList.add('show');
      });
  }

  // Close Modal
  [closeTourGuideModal, tourGuideModalOverlay].forEach(element => {
      if (element && tourGuideModalWrapper) {
          element.addEventListener('click', () => {
              tourGuideModalWrapper.classList.remove('show');
          });
      }
  });

  

  // --- Form Submission Logic ---
  const tourGuideForm = document.getElementById('tour-guide-form');

  if (tourGuideForm) {
      tourGuideForm.addEventListener('submit', (e) => {
          e.preventDefault(); // Prevent default form submission for custom handling

          // Fetch the tour guide's first and last names from the form inputs
          const firstNameInput = tourGuideForm.querySelector('input[name="fname"]');
          const lastNameInput = tourGuideForm.querySelector('input[name="lname"]');
          const firstName = firstNameInput ? firstNameInput.value : "Tour";
          const lastName = lastNameInput ? lastNameInput.value : "Guide";

          // Show success toast message
          showToast(`Tour Guide Account Created Successfully! Welcome, ${firstName} ${lastName}!`, 'success');

          // Close the modal
          tourGuideModalWrapper.classList.remove('show');

          // Submit the form programmatically
          tourGuideForm.submit();
      });
  }
});








document.addEventListener('DOMContentLoaded', function () {
  const formModal = document.getElementById('form-modal');
  const modalOverlay = document.getElementById('modal-overlay');
  const formTitle = document.querySelector('#form-modal h3');
  const submitButton = document.querySelector('#tour-package-form button[type="submit"]');

  // Open "Add Package" Modal
  document.getElementById('open-form-btn').addEventListener('click', () => {
    resetForm(); // Clear form fields before opening
    formTitle.textContent = 'Create Tour Package';
    submitButton.textContent = 'Create'; // Set button to "Create"
    formModal.classList.add('show');
    modalOverlay.classList.add('show');
  });

  // Close Modal
  document.getElementById('close-form-modal').addEventListener('click', () => {
    formModal.classList.remove('show');
    modalOverlay.classList.remove('show');
  });

  // Add Dynamic Estimated Price Fields
  document.getElementById('add-estimated-price-btn').addEventListener('click', function () {
    const list = document.getElementById('estimated-price-list');
    const newItem = document.createElement('li');
    newItem.innerHTML = `
      <input type="text" name="estimated_price_description[]" placeholder="Description" class="editable-item" />
      <input type="text" name="estimated_price_value[]" placeholder="Price" class="editable-item" />
      <button type="button" class="remove-btn">Remove</button>`;
    list.appendChild(newItem);
  });

  // Add Dynamic Inclusions Fields
  document.getElementById('add-inclusion-btn').addEventListener('click', function () {
    const list = document.getElementById('inclusions-list');
    const newItem = document.createElement('li');
    newItem.innerHTML = `
      <input type="text" name="inclusions[]" placeholder="Add inclusion" class="editable-item" />
      <button type="button" class="remove-btn">Remove</button>`;
    list.appendChild(newItem);
  });

  // Add Dynamic Exclusions Fields
  document.getElementById('add-exclusion-btn').addEventListener('click', function () {
    const list = document.getElementById('exclusions-list');
    const newItem = document.createElement('li');
    newItem.innerHTML = `
      <input type="text" name="exclusions[]" placeholder="Add exclusion" class="editable-item" />
      <button type="button" class="remove-btn">Remove</button>`;
    list.appendChild(newItem);
  });

  // Add Dynamic Itinerary Fields
  document.getElementById('add-itinerary-btn').addEventListener('click', function () {
    const list = document.getElementById('itinerary-list');
    const newItem = document.createElement('li');
    newItem.innerHTML = `
      <input type="text" name="itinerary_title[]" placeholder="Title" class="editable-item" />
      <input type="text" name="itinerary_subtitle[]" placeholder="Subtitle" class="editable-item" />
      <button type="button" class="remove-btn">Remove</button>`;
    list.appendChild(newItem);
  });

  // Remove Dynamic Items
  document.addEventListener('click', function (e) {
    if (e.target && e.target.classList.contains('remove-btn')) {
      e.target.parentElement.remove();
    }
  });

  // Open Edit Form with Existing Data
  document.querySelectorAll('.edit-package').forEach(button => {
    button.addEventListener('click', async function () {
      const packageId = this.getAttribute('data-package-id'); // Get package ID
      formTitle.textContent = 'Edit Tour Package'; // Change modal title
      submitButton.textContent = 'Save'; // Change button to "Save"
      formModal.classList.add('show');
      modalOverlay.classList.add('show');

      try {
        const response = await fetch(`/touroperator/get_tour_package/${packageId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch package details.');
        }
        const data = await response.json();

        // Populate form fields with fetched data
        populateEditForm(data, packageId);
      } catch (error) {
        console.error('Error loading package details for edit:', error);
        alert('Failed to load package details.');
      }
    });
  });

  // Function to Populate Form with Package Data
  function populateEditForm(data, packageId) {
    document.getElementById('package-name').value = data.name || '';
    document.getElementById('description').value = data.description || '';
    document.getElementById('location').value = data.location || '';
    document.getElementById('image-upload').value = ''; // Leave file input empty for new uploads
    document.getElementById('tour-package-form').action = `/touroperator/edit_tour_package/${packageId}`; // Set form action dynamically

    populateDynamicList('estimated-price-list', data.estimated_prices, 'description', 'estimated_price', ['Description', 'Price']);
    populateDynamicList('inclusions-list', data.inclusions, 'inclusion', null, ['Inclusion']);
    populateDynamicList('exclusions-list', data.exclusions, 'exclusion', null, ['Exclusion']);
    populateDynamicList('itinerary-list', data.itineraries, 'title', 'subtitle', ['Title', 'Subtitle']);
  }

  // Populate Dynamic List Fields
  function populateDynamicList(listId, items, key1, key2, placeholders) {
    const list = document.getElementById(listId);
    list.innerHTML = '';
    items.forEach(item => {
      const listItem = document.createElement('li');
      listItem.innerHTML = `
        <input type="text" name="${listId}[]" value="${item[key1]}" placeholder="${placeholders[0]}" class="editable-item" />
        ${key2 ? `<input type="text" name="${listId}[]" value="${item[key2]}" placeholder="${placeholders[1]}" class="editable-item" />` : ''}
        <button type="button" class="remove-btn">Remove</button>`;
      list.appendChild(listItem);
    });
  }

  // Reset Form Fields for "Add Package"
  function resetForm() {
    document.getElementById('tour-package-form').reset();
    document.getElementById('location').value = ''; // Reset location field
    document.getElementById('estimated-price-list').innerHTML = `
      <li>
        <input type="text" name="estimated_price_description[]" placeholder="Description" class="editable-item" />
        <input type="text" name="estimated_price_value[]" placeholder="Price" class="editable-item" />
        <button type="button" class="remove-btn">Remove</button>
      </li>`;
    document.getElementById('inclusions-list').innerHTML = `
      <li>
        <input type="text" name="inclusions[]" placeholder="Add inclusion" class="editable-item" />
        <button type="button" class="remove-btn">Remove</button>
      </li>`;
    document.getElementById('exclusions-list').innerHTML = `
      <li>
        <input type="text" name="exclusions[]" placeholder="Add exclusion" class="editable-item" />
        <button type="button" class="remove-btn">Remove</button>
      </li>`;
    document.getElementById('itinerary-list').innerHTML = `
      <li>
        <input type="text" name="itinerary_title[]" placeholder="Title" class="editable-item" />
        <input type="text" name="itinerary_subtitle[]" placeholder="Subtitle" class="editable-item" />
        <button type="button" class="remove-btn">Remove</button>
      </li>`;
    document.getElementById('tour-package-form').action = '/touroperator/create_tour_package'; // Reset form action
  }
});







document.addEventListener('DOMContentLoaded', function () {
  // Open "View Package" Modal
  document.querySelectorAll('.view-package').forEach(button => {
    button.addEventListener('click', async function () {
      const packageId = this.getAttribute('data-package-id'); // Get the package ID

      try {
        // Fetch the package details from the server
        const response = await fetch(`/touroperator/get_tour_package/${packageId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch package details.");
        }
        const data = await response.json();

        // Populate Modal Content
        const modal = document.getElementById('tour-details-modal');
        modal.querySelector('.modal-header-image').src = data.package_img
          ? `/static/${data.package_img}`
          : '/static/default.jpg';
        modal.querySelector('.modal-title').textContent = data.name || 'Unnamed Package';
        modal.querySelector('.description').textContent = data.description || 'No description provided';

        // Populate Location
        const locationContainer = modal.querySelector('.location');
        if (locationContainer) {
          locationContainer.textContent = data.location || 'Location not specified';
        }

        // Populate Estimated Prices
        const priceList = modal.querySelector('.price-list');
        priceList.innerHTML = '';
        data.estimated_prices.forEach(price => {
          const priceItem = document.createElement('li');
          priceItem.textContent = `${price.description}: ₱${price.estimated_price}`;
          priceList.appendChild(priceItem);
        });

        // Populate Inclusions
        const inclusionsList = modal.querySelector('.inclusions-list');
        inclusionsList.innerHTML = '';
        data.inclusions.forEach(inclusion => {
          const inclusionItem = document.createElement('li');
          inclusionItem.innerHTML = `<span class="checkmark">&#10003;</span> ${inclusion.inclusion}`;
          inclusionsList.appendChild(inclusionItem);
        });

        // Populate Exclusions
        const exclusionsList = modal.querySelector('.exclusions-list');
        exclusionsList.innerHTML = '';
        data.exclusions.forEach(exclusion => {
          const exclusionItem = document.createElement('li');
          exclusionItem.innerHTML = `<span class="crossmark">&#10007;</span> ${exclusion.exclusion}`;
          exclusionsList.appendChild(exclusionItem);
        });

        // Populate Itinerary
        const itineraryList = modal.querySelector('.itinerary-list');
        itineraryList.innerHTML = '';
        data.itineraries.forEach(item => {
          const itineraryItem = document.createElement('li');
          itineraryItem.innerHTML = `
            <span class="timeline-dot"></span>
            <div class="timeline-content"><strong>${item.title}:</strong> ${item.subtitle}</div>`;
          itineraryList.appendChild(itineraryItem);
        });

        // Show Modal
        modal.classList.add('show');
        document.getElementById('modal-overlay').classList.add('show');

        // Populate delete functionality
        addDeleteFunctionality(packageId);

        // Attach "Edit" functionality
        const editButton = document.getElementById('edit-package');
        editButton.onclick = function () {
          openEditForm(packageId, data); // Pass package ID and details to the form
          modal.classList.remove('show'); // Close the view modal
        };

      } catch (error) {
        console.error("Failed to load package details:", error);
        alert('Could not load package details. Please try again.');
      }
    });
  });

  // Close Modal
  const closeModal = () => {
    document.getElementById('tour-details-modal').classList.remove('show');
    document.getElementById('modal-overlay').classList.remove('show');
  };
  document.getElementById('close-modal').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', closeModal);
});





// Open and Populate Edit Form
function openEditForm(packageId, data) {
  const formModal = document.getElementById('form-modal');
  const modalOverlay = document.getElementById('modal-overlay');

  // Populate form fields with package data
  document.getElementById('package-name').value = data.name || '';
  document.getElementById('description').value = data.description || '';
  document.getElementById('location').value = data.location || ''; // Populate location

  // Leave file input empty for the user to upload a new file if needed
  document.getElementById('image-upload').value = '';

  // Populate Estimated Prices
  const priceList = document.getElementById('estimated-price-list');
  priceList.innerHTML = '';
  data.estimated_prices.forEach(price => {
    const priceItem = document.createElement('li');
    priceItem.innerHTML = `
      <input type="text" name="estimated_price_description[]" value="${price.description}" placeholder="Description" class="editable-item" />
      <input type="text" name="estimated_price_value[]" value="${price.estimated_price}" placeholder="Price" class="editable-item" />
      <button type="button" class="remove-btn">Remove</button>`;
    priceList.appendChild(priceItem);
  });

  // Populate Inclusions
  const inclusionsList = document.getElementById('inclusions-list');
  inclusionsList.innerHTML = '';
  data.inclusions.forEach(inclusion => {
    const inclusionItem = document.createElement('li');
    inclusionItem.innerHTML = `
      <input type="text" name="inclusions[]" value="${inclusion.inclusion}" class="editable-item" />
      <button type="button" class="remove-btn">Remove</button>`;
    inclusionsList.appendChild(inclusionItem);
  });

  // Populate Exclusions
  const exclusionsList = document.getElementById('exclusions-list');
  exclusionsList.innerHTML = '';
  data.exclusions.forEach(exclusion => {
    const exclusionItem = document.createElement('li');
    exclusionItem.innerHTML = `
      <input type="text" name="exclusions[]" value="${exclusion.exclusion}" class="editable-item" />
      <button type="button" class="remove-btn">Remove</button>`;
    exclusionsList.appendChild(exclusionItem);
  });

  // Populate Itinerary
  const itineraryList = document.getElementById('itinerary-list');
  itineraryList.innerHTML = '';
  data.itineraries.forEach(item => {
    const itineraryItem = document.createElement('li');
    itineraryItem.innerHTML = `
      <input type="text" name="itinerary_title[]" value="${item.title}" class="editable-item" />
      <input type="text" name="itinerary_subtitle[]" value="${item.subtitle}" class="editable-item" />
      <button type="button" class="remove-btn">Remove</button>`;
    itineraryList.appendChild(itineraryItem);
  });

  // Change form action for editing
  document.getElementById('tour-package-form').action = `/touroperator/edit_tour_package/${packageId}`;

  // Change the button text to "Save"
  const submitButton = document.querySelector('#tour-package-form button[type="submit"]');
  submitButton.textContent = 'Save';

  // Show the form modal
  formModal.classList.add('show');
  modalOverlay.classList.add('show');
}




/**
 * Add functionality to the "Delete" button.
 * @param {Number} packageId - The ID of the package to delete.
 */
function addDeleteFunctionality(packageId) {
  const deleteButton = document.getElementById('delete-package');

  // Ensure the delete button exists
  if (!deleteButton) {
    console.error('Delete button not found!');
    return;
  }

  deleteButton.onclick = async () => {
    const confirmDelete = confirm('Are you sure you want to delete this package?');
    if (confirmDelete) {
      try {
        // Send DELETE request to the server
        const deleteResponse = await fetch(`/touroperator/delete_tour_package/${packageId}`, {
          method: 'DELETE',
        });

        if (deleteResponse.ok) {
          // Remove the package card from the UI
          const packageCard = document.querySelector(`[data-package-id="${packageId}"]`);
          if (packageCard) {
            packageCard.closest('.card').remove(); // Adjust selector if the card structure differs
          } else {
            console.warn(`Package card with ID ${packageId} not found.`);
          }

          // Close the modal
          closeModal();

          alert('Package deleted successfully.');
        } else {
          const errorMessage = await deleteResponse.json();
          alert(errorMessage.error || 'Failed to delete the package. Please try again.');
        }
      } catch (err) {
        console.error('Error deleting package:', err);
        alert('An error occurred while deleting the package.');
      }
    }
  };
}

/**
 * Close the modal by removing the "show" class.
 */
function closeModal() {
  document.getElementById('tour-details-modal').classList.remove('show');
  document.getElementById('modal-overlay').classList.remove('show');
}


/**
 * Close the modal by removing the "show" class.
 */
function closeModal() {
  document.getElementById('tour-details-modal').classList.remove('show');
  document.getElementById('modal-overlay').classList.remove('show');
}



document.addEventListener('DOMContentLoaded', async () => {
  const reviewsContainer = document.getElementById('traveler-reviews');
  const paginationControls = document.getElementById('pagination-controls');
  const reviewsHeader = document.querySelector('.reviews-header .total-reviews');
  const tourGuideId = reviewsContainer.dataset.tourGuideId; // Use this for the API call
  const reviewsPerPage = 2; // Reviews per page
  let currentPage = 1;

  // Fetch paginated reviews from the server
  const fetchReviews = async (page = 1) => {
      const response = await fetch(`/reviews?tour_guide_id=${tourGuideId}&page=${page}&per_page=${reviewsPerPage}`);
      return await response.json();
  };

  // Render Pagination Controls
  const renderPagination = (currentPage, totalPages) => {
      paginationControls.innerHTML = '';
      if (totalPages <= 1) return;

      // Previous Button
      const prev = document.createElement('a');
      prev.innerHTML = '&lt;';
      prev.className = currentPage === 1 ? 'disabled' : '';
      prev.href = '#';
      prev.addEventListener('click', (event) => {
          event.preventDefault();
          if (currentPage > 1) loadReviews(currentPage - 1);
      });
      paginationControls.appendChild(prev);

      // Page Numbers with "..." for skipped pages
      const maxVisiblePages = 3;
      const renderPageNumbers = () => {
          const pages = [];
          for (let i = 1; i <= totalPages; i++) {
              if (
                  i === 1 || 
                  i === totalPages || 
                  (i >= currentPage - 1 && i <= currentPage + 1)
              ) {
                  pages.push(i);
              } else if (
                  pages[pages.length - 1] !== '...'
              ) {
                  pages.push('...');
              }
          }
          return pages;
      };

      renderPageNumbers().forEach((page) => {
          if (page === '...') {
              const dots = document.createElement('span');
              dots.innerHTML = '...';
              dots.className = 'pagination-ellipsis';
              paginationControls.appendChild(dots);
          } else {
              const pageLink = document.createElement('a');
              pageLink.innerHTML = page;
              pageLink.className = currentPage === page ? 'active' : '';
              pageLink.href = '#';
              pageLink.addEventListener('click', (event) => {
                  event.preventDefault();
                  loadReviews(page);
              });
              paginationControls.appendChild(pageLink);
          }
      });

      // Next Button
      const next = document.createElement('a');
      next.innerHTML = '&gt;';
      next.className = currentPage === totalPages ? 'disabled' : '';
      next.href = '#';
      next.addEventListener('click', (event) => {
          event.preventDefault();
          if (currentPage < totalPages) loadReviews(currentPage + 1);
      });
      paginationControls.appendChild(next);
  };

  // Load Reviews and Update UI
  const loadReviews = async (page) => {
      const { html, total_reviews, total_pages } = await fetchReviews(page);

      reviewsContainer.innerHTML = html;

      // Update total reviews count and pagination
      currentPage = page;
      reviewsHeader.textContent = `(${total_reviews})`;
      renderPagination(page, total_pages);

      // Ensure the page doesn't scroll
      reviewsContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // Initial Load
  loadReviews(currentPage);
});


document.addEventListener('DOMContentLoaded', function () {
  const filterDropdown = document.getElementById('tour-guide-filter');
  const reviewsContainer = document.querySelector('.reviews-grid');
  const paginationContainer = document.querySelector('.pagination-container');

  const fetchFilteredReviews = async (tourGuideId = '') => {
    try {
      const response = await fetch(`/dashboard?tour_guide_id=${tourGuideId}`);
      const data = await response.json();

      // Update reviews grid
      reviewsContainer.innerHTML = '';
      data.reviews.forEach(review => {
        const reviewCard = `
          <div class="review-card">
            <img src="${review.tour_image}" alt="Tour Picture" class="tour-image" />
            <div class="review-content">
              <div class="traveler-info">
                <img src="${review.traveler_profile}" alt="Traveler Picture" class="traveler-pic" />
                <div class="traveler-details">
                  <h3>${review.traveler_name}</h3>
                  <p class="tour-name">Tour Package</p>
                  <div class="ratings"><p>${review.rating} ★</p></div>
                </div>
              </div>
              <p class="review-text">${review.comment}</p>
              <div class="review-footer">
                <p class="review-date">${review.review_date}</p>
                <p class="toured-by">Toured by: <span class="tour-guide-name">${review.tour_guide_name}</span></p>
              </div>
            </div>
          </div>
        `;
        reviewsContainer.innerHTML += reviewCard;
      });

      // Update pagination
      paginationContainer.innerHTML = ''; // Update as needed based on pagination logic
    } catch (error) {
      console.error('Failed to fetch filtered reviews:', error);
    }
  };

  filterDropdown.addEventListener('change', (e) => {
    const selectedTourGuideId = e.target.value;
    fetchFilteredReviews(selectedTourGuideId);
  });
});


document.addEventListener('DOMContentLoaded', () => {
  const filterDropdown = document.getElementById('tour-guide-filter');

  filterDropdown.addEventListener('change', () => {
    const selectedTourGuideId = filterDropdown.value;
    const urlParams = new URLSearchParams(window.location.search);

    if (selectedTourGuideId) {
      urlParams.set('tour_guide_id', selectedTourGuideId);
    } else {
      urlParams.delete('tour_guide_id');
    }

    urlParams.set('page', 1); // Reset to the first page when filtering
    window.location.search = urlParams.toString(); // Refresh the page with the new query params
  });
});



document.addEventListener('DOMContentLoaded', () => {
  const toggleButtons = document.querySelectorAll('.toggle-btn');
  const bookingRows = document.querySelectorAll('.booking-row');

  // Update counts
  function updateCounts() {
    const counts = {
      all: bookingRows.length,
      upcoming: 0,
      ongoing: 0,
      completed: 0,
      cancelled: 0,
    };

    bookingRows.forEach((row) => {
      const status = row.dataset.status;
      if (counts[status] !== undefined) {
        counts[status]++;
      }
    });

    toggleButtons.forEach((button) => {
      const status = button.dataset.status;
      const countElement = button.querySelector('.count');
      if (status in counts) {
        countElement.textContent = `(${counts[status]})`;
      }
    });
  }

  // Filter rows by status
  toggleButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const status = button.dataset.status;

      // Toggle active class
      toggleButtons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');

      // Show/hide rows
      bookingRows.forEach((row) => {
        row.style.display =
          status === 'all' || row.dataset.status === status ? '' : 'none';
      });
    });
  });

  updateCounts();
});










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


document.addEventListener('DOMContentLoaded', () => {
  const OPERATOR_NOTIFICATIONS_URL = '/notifications/operator';
  const operatorNotificationList = document.getElementById('operator-notification-list');
  const operatorNotificationCount = document.getElementById('operator-notification-count');

  // Fetch operator notifications
  async function fetchOperatorNotifications() {
    try {
      const response = await fetch(OPERATOR_NOTIFICATIONS_URL);
      if (!response.ok) throw new Error('Failed to fetch operator notifications');

      const data = await response.json();
      console.log('Fetched Operator Notifications:', data);

      operatorNotificationList.innerHTML = ''; // Clear old notifications

      if (data.notifications.length === 0) {
        operatorNotificationList.innerHTML = '<li class="notification-item">No new notifications</li>';
        operatorNotificationCount.textContent = `(0)`; // Update count to 0
      } else {
        operatorNotificationCount.textContent = `(${data.notifications.length})`; // Update count dynamically
        data.notifications.forEach(notification => {
          operatorNotificationList.innerHTML += `
            <li class="notification-item clickable" data-id="${notification.id}">
              <div>
                ${notification.message} <span class="timestamp">${notification.created_at}</span>
              </div>
            </li>
          `;
        });
      }
    } catch (error) {
      console.error('Error fetching operator notifications:', error);
    }
  }

  // Fetch notification count
  async function fetchOperatorNotificationCount() {
    try {
      const response = await fetch(`${OPERATOR_NOTIFICATIONS_URL}/count`);
      if (!response.ok) throw new Error('Failed to fetch operator notification count');

      const data = await response.json();
      operatorNotificationCount.textContent = `(${data.count || 0})`;
    } catch (error) {
      console.error('Error fetching operator notification count:', error);
    }
  }

  // Mark notification as read when clicking the notification
  operatorNotificationList.addEventListener('click', async (e) => {
    const notificationItem = e.target.closest('.notification-item');
    if (!notificationItem) return;

    const notificationId = notificationItem.getAttribute('data-id');
    try {
      const response = await fetch(`${OPERATOR_NOTIFICATIONS_URL}/mark_as_read/${notificationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to mark notification as read');

      notificationItem.remove(); // Remove the notification from the list

      // Update the count
      const count = parseInt(operatorNotificationCount.textContent.replace(/[()]/g, ''), 10);
      operatorNotificationCount.textContent = `(${Math.max(count - 1, 0)})`;

      // Display "No new notifications" if the list is empty
      if (operatorNotificationList.children.length === 0) {
        operatorNotificationList.innerHTML = '<li class="notification-item">No new notifications</li>';
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  });

  // Fetch notifications and count on page load
  fetchOperatorNotifications();
  fetchOperatorNotificationCount();
});


function redirectToProfile(guideId) {
  if (guideId) {
    window.location.href = `/tourguide/profile/${guideId}`;
  } else {
    console.error("Guide ID is missing.");
  }
}


// Deactivated Account Modal
// Function to close the modal and redirect to the main page
function closeCustomModal(event) {
  event.preventDefault(); // Prevent default behavior of the click

  // Hide the modal
  document.getElementById("deactivationCustomModal").style.display = "none";

  // Redirect to the main page
  window.location.href = "/"; // Replace "/" with the correct URL if needed
}

// Wait for the DOM to load before running the script
document.addEventListener("DOMContentLoaded", () => {
  // Check the data attribute to see if the modal should be shown
  const modal = document.getElementById("deactivationCustomModal");
  const showModal = modal.getAttribute("data-show-modal");

  if (showModal === "true") {
      modal.style.display = "flex";
  }
});



// Guide Vertical MEnu
function toggleDropdownMenu(iconElement) {
  const dropdown = iconElement.closest('.dropdown');
  dropdown.classList.toggle('show');
}

// Close dropdown if clicked outside
document.addEventListener('click', (event) => {
  const dropdowns = document.querySelectorAll('.dropdown.show');
  dropdowns.forEach((dropdown) => {
    if (!dropdown.contains(event.target)) {
      dropdown.classList.remove('show');
    }
  });
});




