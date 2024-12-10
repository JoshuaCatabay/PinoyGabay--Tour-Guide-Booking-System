


//  Notification

document.addEventListener('DOMContentLoaded', () => {
  const NOTIFICATIONS_URL = '/notifications';
  const notificationBell = document.getElementById('notification-bell');
  const notificationDropdown = document.getElementById('notification-dropdown');
  const notificationCount = document.querySelector('.notification-count');
  const notificationList = document.getElementById('notification-list');

  // Helper function to adjust timezone to Asia/Manila manually
  function formatTime(utcTime) {
    const date = new Date(utcTime);

    // Shift time to Asia/Manila timezone (UTC+8)
    const utcOffset = 8 * 60; // Manila is UTC+8 in minutes
    const localTime = new Date(date.getTime() + utcOffset * 60 * 1000);

    return localTime.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  // Fetch notifications
  async function fetchNotifications() {
    try {
      const response = await fetch(`${NOTIFICATIONS_URL}/`);
      if (!response.ok) throw new Error('Failed to fetch notifications');
    
      const data = await response.json();
      console.log("Fetched Notifications:", data);
    
      notificationList.innerHTML = ''; // Clear the previous list

      if (!data.notifications || data.notifications.length === 0) {
        notificationList.innerHTML = '<li class="notification-item">No new notifications</li>';
      } else {
        data.notifications.forEach(notification => {
          const li = document.createElement('li');
          li.classList.add('notification-item');
          li.setAttribute('data-id', notification.id);

          li.innerHTML = `
            <span>${notification.message}</span>
            <small>${formatTime(notification.created_at)}</small>
          `;
          notificationList.appendChild(li);
        });
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }

  // Fetch notification count
  async function fetchNotificationCount() {
    try {
      const response = await fetch(`${NOTIFICATIONS_URL}/count`);
      if (!response.ok) throw new Error('Failed to fetch notification count');
    
      const data = await response.json();
      notificationCount.textContent = data.count || 0; // Update the visible count
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  }

  // Toggle dropdown visibility
  notificationBell.addEventListener('click', async (e) => {
    e.stopPropagation();
    notificationDropdown.classList.toggle('hidden');
    notificationDropdown.style.display = notificationDropdown.classList.contains('hidden') ? 'none' : 'block';
    
    if (!notificationDropdown.classList.contains('hidden')) {
      await fetchNotifications();
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!notificationDropdown.contains(e.target) && e.target !== notificationBell) {
      notificationDropdown.classList.add('hidden');
      notificationDropdown.style.display = 'none';
    }
  });

  // Mark notification as read
  notificationList.addEventListener('click', async (e) => {
    const notificationItem = e.target.closest('.notification-item');
    if (!notificationItem) return;

    const notificationId = notificationItem.getAttribute('data-id');
    try {
      const response = await fetch(`${NOTIFICATIONS_URL}/mark_as_read/${notificationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to mark notification as read');
    
      notificationItem.remove(); // Remove the item from UI
      const count = parseInt(notificationCount.textContent, 10);
      notificationCount.textContent = Math.max(count - 1, 0); // Update UI notification count safely
    
      if (notificationList.children.length === 0) {
        notificationList.innerHTML = '<li class="notification-item">No new notifications</li>';
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  });

  // Fetch notification count when page is loaded
  fetchNotificationCount();
});




// 





// Reviews Section

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
              oadReviews(page);
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



// 




// Date Picker connected to Tour Guide Availability


  document.addEventListener('DOMContentLoaded', async function () {
    const datePicker = document.getElementById('date-picker');

    // Function to extract the tour guide ID from the URL
    function getTourGuideIdFromPath() {
      const pathParts = window.location.pathname.split('/');
      return pathParts[pathParts.length - 1];
    }

    const tourGuideId = getTourGuideIdFromPath();

    if (!tourGuideId) {
      console.error("Tour Guide ID not found in URL path.");
      return;
    }

    if (!datePicker) {
      console.error("Date picker input element not found.");
      return;
    }

    try {
      // Fetch availability data from the server
      const response = await fetch(`/tourguide/get_availability/${tourGuideId}`);
      if (!response.ok) throw new Error(`Failed to fetch availability for Tour Guide ID: ${tourGuideId}`);
        
      const availabilityData = await response.json();
      console.log("Availability Data:", availabilityData);

      // Filter available and booked dates from the response
      const availableDates = availabilityData
        .filter(entry => entry.status === 'available')
        .map(entry => entry.date);

      const bookedDates = availabilityData
        .filter(entry => entry.status === 'booked')
        .map(entry => entry.date);

      console.log("Available Dates:", availableDates);
      console.log("Booked Dates:", bookedDates);

      // Initialize the Flatpickr date picker
      flatpickr(datePicker, {
        mode: "range", // Allows range selection
        dateFormat: "Y-m-d", // Format for submission
        altInput: true, // Enables an alternative display format
        altFormat: "M. j, Y", // Readable format for users
        minDate: "today", // Disable past dates
        enable: availableDates, // Restrict selection to only available dates

        locale: {
          rangeSeparator: " → ", // Separator between start and end dates
        },
            
        onChange: function (selectedDates, dateStr, instance) {
              
          // Date selection validation
          const selectedDateStrings = selectedDates.map(date => date.toISOString().split('T')[1]);

          console.log("Selected Dates:", selectedDateStrings);

          // Check if any selected date is already booked
          const invalidDates = selectedDateStrings.filter(date => bookedDates.includes(date));

          if (invalidDates.length > 1) {
            showToast("The following dates are already booked and cannot be selected: ${invalidDates.join(', ')}", "error");
            instance.clear(); // Clear the selection
            return;
          }

          // Handle valid date range
          if (selectedDates.length === 2) {
            const startDate = selectedDates[0];
            const endDate = selectedDates[1];

            console.log("Start Date:", startDate);
            console.log("End Date:", endDate);

            if (startDate > endDate) {
              showToast("Invalid date range. End date cannot be before start date.");
              instance.clear(); // Clear the selection
             }
          }
        }
      });

    } catch (error) {

      console.error("Error fetching or processing availability data:", error);

    }
  });


// 




// Confirmation Modal


  document.addEventListener('DOMContentLoaded', async function () {
    const datePicker = document.getElementById('date-picker');
    const confirmBookingButton = document.getElementById('confirm-booking-btn');
    const bookingModal = document.getElementById('booking-modal');
    const thankYouPopup = document.getElementById('thank-you-popup');
    const closeModalButton = document.getElementById('close-booking-modal');
    const tourPackageSelect = document.getElementById('tour-package-select');
    const tourGuideId = document.querySelector('[data-tour-guide-id]').getAttribute('data-tour-guide-id');

    // Modal elements
    const modalTravelerName = document.getElementById('modal-traveler-name');
    const modalTourGuideName = document.getElementById('modal-tour-guide-name');
    // const modalTourGuideNumber = document.getElementById('modal-tour-guide-number');
    const modalTourGuidePrice = document.getElementById('modal-tour-guide-price'); // Added for price
    const modalTourDate = document.getElementById('modal-tour-date');
    const modalTravelerQuantity = document.getElementById('modal-traveler-quantity');
    const modalSpecialNotes = document.getElementById('modal-special-notes');
    const modalTourImage = document.getElementById('modal-tour-image');
    const modalPackageTitle = document.getElementById('modal-package-title');
    const modalPackageDescription = document.getElementById('modal-package-description');
    const modalPriceList = document.getElementById('modal-price-list');
    const modalInclusionsList = document.getElementById('modal-inclusions-list');
    const modalExclusionsList = document.getElementById('modal-exclusions-list');
    const modalItineraryList = document.getElementById('modal-itinerary-list');

    // Function to check if the user is authenticated
    async function checkAuthentication() {
      try {
        const response = await fetch('/check-login-status');
        const result = await response.json();
        return result.logged_in; // Returns true if the user is logged in
      } catch (error) {
        console.error('Error checking authentication status:', error);
        return false; // Assume not logged in if there's an error
      }
    }

    // Fetch Traveler Information
    async function fetchTravelerInfo() {
      try {
        const response = await fetch('/traveler_info');
        if (!response.ok) throw new Error('Failed to fetch traveler information.');
        const travelerData = await response.json();
        modalTravelerName.textContent = travelerData.name;
      } catch (error) {
        console.error('Error fetching traveler info:', error);
        modalTravelerName.textContent = "Unavailable";
      }
    }

    // Fetch Tour Guide Contact Information and Price
    async function fetchTourGuideContactAndPrice() {
      try {
        const response = await fetch(`/tourguide/get_contact/${tourGuideId}`);
        if (!response.ok) throw new Error('Failed to fetch tour guide contact and price.');
        const contactData = await response.json();

        // Populate contact information and price
        modalTourGuideName.textContent = contactData.name;
        // modalTourGuideNumber.textContent = contactData.contact_number;
        modalTourGuidePrice.textContent = `₱${contactData.price.toFixed(2)}`;
      } catch (error) {
        console.error('Error fetching tour guide contact and price:', error);
        modalTourGuideName.textContent = "Unavailable";
        // modalTourGuideNumber.textContent = "Unavailable";
        modalTourGuidePrice.textContent = "Unavailable";
      }
    }

    // Populate Modal on "Book Now"
    confirmBookingButton.addEventListener('click', async function () {
      const isAuthenticated = await checkAuthentication(); // Check if the user is logged in

      if (!isAuthenticated) {
        // Redirect unauthenticated users to the signup page
        window.location.href =  "/traveler_register";
        return; // Stop execution here
      }

      const dateValue = datePicker.value;
      const tourPackageId = tourPackageSelect.value;
      const travelerQuantity = document.getElementById('traveler-quantity').value;
      const specialNotes = document.getElementById('personalized').value;

      if (!dateValue) {
        showToast("Please select a date or date range.", "error");
        datePicker.focus();
        return;
      }
      if (!tourPackageId) {
        showToast("Please select a tour package.", "error");
        tourPackageSelect.focus();
        return;
      }

      try {
        const packageDetailsResponse = await fetch(`/tour_package/details/${tourPackageId}`);
        if (!packageDetailsResponse.ok) throw new Error("Failed to fetch package details.");
        const packageData = await packageDetailsResponse.json();

        // Populate modal with package and booking details
        modalTourDate.textContent = dateValue;
        modalTravelerQuantity.textContent = travelerQuantity;
        modalSpecialNotes.textContent = specialNotes || "N/A";

        modalTourImage.src = `/static/${packageData.package_img || "default.jpg"}`;
        modalPackageTitle.textContent = packageData.name;
        modalPackageDescription.textContent = packageData.description;

        // Populate location with icon
        const locationElement = document.getElementById('modal-package-location');
        locationElement.innerHTML = `<span class="location-icon">&#x1F4CD;</span> ${packageData.location || "Location not provided"}`;


        // Populate estimated prices
        modalPriceList.innerHTML = '';
        packageData.estimated_prices.forEach(price => {
          const li = document.createElement('li');
          li.innerHTML = `<span class="price-icon">💰</span> ${price.description}: ₱${price.estimated_price}`;
          modalPriceList.appendChild(li);
        });

        // Populate inclusions
        modalInclusionsList.innerHTML = '';
        packageData.inclusions.forEach(inclusion => {
          const li = document.createElement('li');
          li.innerHTML = `<span class="checkmark">&#10003;</span> ${inclusion.inclusion}`;
          modalInclusionsList.appendChild(li);
        });

        // Populate exclusions
        modalExclusionsList.innerHTML = '';
        packageData.exclusions.forEach(exclusion => {
          const li = document.createElement('li');
          li.innerHTML = `<span class="crossmark">&#10007;</span> ${exclusion.exclusion}`;
          modalExclusionsList.appendChild(li);
        });

        // Populate itinerary
        modalItineraryList.innerHTML = '';
        packageData.itineraries.forEach(itinerary => {
          const li = document.createElement('li');
          li.innerHTML = 
          `<span class="timeline-dot"></span>
          <div class="timeline-content">
            <strong>${itinerary.title}:</strong> 
            <p>${itinerary.subtitle}<p>
          </div>`;
          modalItineraryList.appendChild(li);
        });

        // Fetch Traveler and Tour Guide Info (with price)
        await fetchTravelerInfo();
        await fetchTourGuideContactAndPrice();

        // Show modal
        bookingModal.classList.add('show');
        document.body.style.overflow = "hidden";
      } catch (error) {
        console.error("Error populating modal:", error);
        showToast("Failed to load booking details. Please try again.");
      }
    });

    // Close modal
    closeModalButton.addEventListener('click', function () {
      bookingModal.classList.remove('show');
      document.body.style.overflow = "auto";
    });

    const modalConfirmButton = document.getElementById('confirm-booking-modal');
    modalConfirmButton.addEventListener('click', async function () {
      const dateRange = datePicker.value.split(" → ");
      const tourPackageId = tourPackageSelect.value;
      const travelerQuantity = document.getElementById('traveler-quantity').value;
      const specialNotes = document.getElementById('personalized').value || '';
      const price = modalTourGuidePrice.textContent.replace('₱', '').trim();

      try {
        if (dateRange.length < 1 || !dateRange[0]) {
          showToast("Please select a valid date or date range.", "error");
          datePicker.focus();
          return;
        }

        const dateStart = dateRange[0];
        const dateEnd = dateRange[1] || dateStart;

        const durationInDays = Math.ceil((new Date(dateEnd) - new Date(dateStart)) / (1000 * 60 * 60 * 24)) + 1;

        const bookingData = {
          tour_guide_id: tourGuideId,
          package_id: tourPackageId,
          date_start: dateStart,
          date_end: dateEnd,
          traveler_quantity: travelerQuantity,
          special_notes: specialNotes,
          price: parseFloat(price),
          duration: durationInDays,
        };

        const response = await fetch('/booking/create_booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create booking.');
        }

        const responseData = await response.json();
        console.log('Booking created:', responseData);

        bookingModal.classList.remove('show');
        document.body.style.overflow = 'auto';
        thankYouPopup.style.display = 'flex';
        setTimeout(() => {
          thankYouPopup.style.display = 'none';
        }, 3000);
      } catch (error) {
        console.error('Error confirming booking:', error);
        showToast("Failed to confirm booking. Please try again.", "error");
      }
    });

    const modalCancelButton = document.getElementById('cancel-booking-modal');
    modalCancelButton.addEventListener('click', function () {
      bookingModal.classList.remove('show');
      document.body.style.overflow = "auto";
    });
  });




// 


  // Book Footer
  document.addEventListener('DOMContentLoaded', () => {
    const footerBookingBar = document.getElementById('footer-booking-bar');
    const bookingForm = document.querySelector('.booking-form');
    const footerBookBtn = document.getElementById('footer-book-btn');

    // Function to hide footer when booking form is visible
    function checkBookingFormVisibility() {
      const bookingFormRect = bookingForm.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Check if the booking form is visible
      if (bookingFormRect.top < viewportHeight && bookingFormRect.bottom > 0) {
        footerBookingBar.classList.add('hide'); // Hide the footer
      } else {
        footerBookingBar.classList.remove('hide'); // Show the footer
      }
    }

    // Scroll to booking form when footer button is clicked
    footerBookBtn.addEventListener('click', (e) => {
      e.preventDefault();
      bookingForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // Event listeners for visibility check
    window.addEventListener('scroll', checkBookingFormVisibility);
    window.addEventListener('resize', checkBookingFormVisibility);

    // Trigger the initial visibility check
    checkBookingFormVisibility();
  });


// 







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

