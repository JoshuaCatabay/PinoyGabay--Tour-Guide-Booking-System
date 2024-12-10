console.log('TourOperator.js loaded successfully!');



// Side Panel


  window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded.');

    // Hamburger Menu Logic
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sideNav = document.querySelector('.side-nav');

    sidebarToggle.addEventListener('click', () => {
      sideNav.classList.toggle('active'); // Toggle the "active" class for mobile view
    });

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

        // Auto-collapse the sidebar when a tab is selected
        if (sideNav.classList.contains('active')) {
          sideNav.classList.remove('active');
        }
      });
    });

    // Logout Modal Logic
    const logoutModal = document.getElementById('logout-modal');
    const confirmLogout = document.getElementById('confirm-logout-btn'); // Updated ID
    const cancelLogout = document.getElementById('cancel-logout-btn'); // Updated ID
    const logoutLink = document.querySelector('.tab-link[href*="logout"]');
    const modalOverlay = document.querySelector('.modal-overlay');

    if (logoutLink) {
      logoutLink.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default logout behavior
        logoutModal.classList.add('show');
      });
    }

    confirmLogout?.addEventListener('click', () => {
      window.location.href = '{{ url_for("main.logout") }}'; // Redirect to logout URL
    });

    cancelLogout?.addEventListener('click', () => {
      logoutModal.classList.remove('show');
    });

    // Close the sidebar when clicking outside (mobile only)
    document.addEventListener('click', (e) => {
      if (
        !sideNav.contains(e.target) &&
        !sidebarToggle.contains(e.target) &&
        sideNav.classList.contains('active')
      ) {
        sideNav.classList.remove('active');
      }
    });
  });


// Side Panel




// Tour Management



  // Notification

  document.addEventListener('DOMContentLoaded', () => {
    const OPERATOR_NOTIFICATIONS_URL = '/notifications/operator';
    const operatorNotificationList = document.getElementById('operator-notification-list');
    const operatorNotificationCount = document.getElementById('operator-notification-count');
  
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
          operatorNotificationCount.textContent = '(0)'; // Update count to 0
        } else {
          operatorNotificationCount.textContent = `(${data.notifications.length})`; // Update count dynamically
          data.notifications.forEach(notification => {
            const li = document.createElement('li');
            li.classList.add('notification-item');
            li.setAttribute('data-id', notification.id);
  
            li.innerHTML = `
              <div>
                ${notification.message} <span class="timestamp">${formatTime(notification.created_at)}</span>
              </div>
            `;
  
            operatorNotificationList.appendChild(li);
          });
        }
      } catch (error) {
        console.error('Error fetching operator notifications:', error);
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
  
        if (operatorNotificationList.children.length === 0) {
          operatorNotificationList.innerHTML = '<li class="notification-item">No new notifications</li>';
        }
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    });
  
    // Fetch notifications on page load
    fetchOperatorNotifications();
  });



  // Booking Toggle Category

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



  // Booking Modal
  // Bookings
  document.addEventListener('DOMContentLoaded', function () {
    // Modal elements
    const modal = document.getElementById('booking-details-modal');
    const modalLoader = document.getElementById('modal-loader');
    const modalDetails = document.getElementById('modal-details');
    const modalStatus = document.getElementById('modal-status');
    const closeModalButton = document.querySelector('.primary-btn'); 
    const xCloseButton = document.querySelector('.x-btn'); 

    // Function to fetch and display booking details
    async function fetchAndDisplayBookingDetails(bookingId) {
      console.log('Fetching details for booking ID:', bookingId);

      // Reset modal state
      modalLoader.style.display = 'block';
      modalDetails.classList.add('hidden');
      modal.classList.add('show'); 
      modal.classList.remove('hidden'); 
      document.body.style.overflow = 'hidden';

      try {
        const response = await fetch(`/booking/details/${bookingId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch booking details: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Booking details fetched:', data);

        // Populate and style status
        modalStatus.textContent = data.status;
        modalStatus.className = 'status-circle'; 
        
        switch (data.status.toLowerCase()) {
          case 'upcoming':
            modalStatus.classList.add('status-label', 'upcoming');
            break;
          case 'ongoing':
            modalStatus.classList.add('status-label', 'ongoing');
            break;
          case 'completed':
            modalStatus.classList.add('status-label', 'completed');
            break;
          case 'cancelled':
            modalStatus.classList.add('status-label', 'cancelled');
            break;
          default:
            modalStatus.classList.add('status-label');
            break;
        }

        // Populate modal content
        document.getElementById('modal-traveler-name').textContent = data.traveler.name;
        document.getElementById('modal-tour-guide-name').textContent = data.tour_guide.name;
        document.getElementById('modal-tour-guide-number').textContent = data.tour_guide.contact;
        document.getElementById('modal-tour-date').textContent = `${data.date_start} - ${data.date_end}`;
        document.getElementById('modal-traveler-quantity').textContent = data.traveler_quantity;
        document.getElementById('modal-tour-guide-price').textContent = `₱${data.price}`;
        document.getElementById('modal-special-notes').textContent = data.special_notes;

        const packageData = data.package;
        document.getElementById('modal-tour-image').src = `/static/${packageData.package_img || "default.jpg"}`;
        document.getElementById('modal-package-title').textContent = packageData.name;
        document.getElementById('modal-package-location').innerHTML = `<span class="location-icon">&#x1F4CD;</span> ${packageData.location || "Location not provided"}`;
        document.getElementById('modal-package-description').textContent = packageData.description;

        const priceList = document.getElementById('modal-price-list');
        priceList.innerHTML = '';
        packageData.estimated_prices.forEach(price => {
          const li = document.createElement('li');
          li.innerHTML = `<span class="price-icon">💰</span> ${price.description}: ₱${price.estimated_price}`;
          priceList.appendChild(li);
        });

        const inclusionsList = document.getElementById('modal-inclusions-list');
        inclusionsList.innerHTML = '';
        packageData.inclusions.forEach(inclusion => {
          const li = document.createElement('li');
          li.innerHTML = `<span class="checkmark">&#10003;</span> ${inclusion.inclusion}`;
          inclusionsList.appendChild(li);
        });

        const exclusionsList = document.getElementById('modal-exclusions-list');
        exclusionsList.innerHTML = '';
        packageData.exclusions.forEach(exclusion => {
          const li = document.createElement('li');
          li.innerHTML = `<span class="crossmark">&#10007;</span> ${exclusion.exclusion}`;
          exclusionsList.appendChild(li);
        });

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

        modalLoader.style.display = 'none';
        modalDetails.classList.remove('hidden');
        console.log('Modal content populated successfully.');
      } catch (error) {
        console.error('Error loading booking details:', error);
        modalLoader.style.display = 'none';
        alert('Failed to load booking details. Please try again.');
      }
    }

    // Event listeners for booking cards
    document.querySelectorAll('.view-booking').forEach(button => {
      button.addEventListener('click', function () {
        const bookingId = this.id.split('-').pop(); 
        fetchAndDisplayBookingDetails(bookingId);
      });
    });

    // Function to close the modal
    function closeModal() {
      modal.classList.remove('show');
      modal.classList.add('hidden');
      document.body.style.overflow = 'auto';
    }

    if (closeModalButton) {
      closeModalButton.addEventListener('click', closeModal);
    }
    if (xCloseButton) {
      xCloseButton.addEventListener('click', closeModal);
    }

    console.log('Event listeners attached to Close and X buttons.');
  });




  //  Reviews Filter by Guide

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


  // Traveler Review Container

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

  
// 




//  Manage Municipality


  // Tour Package Creation

  // Create Tour Package

  document.addEventListener('DOMContentLoaded', function () {
    const formModal = document.getElementById('form-modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const formTitle = document.querySelector('#form-modal h3');
    const submitButton = document.querySelector('#tour-package-form button[type="submit"]');
    const tourPackageForm = document.getElementById('tour-package-form');

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

    // Validate Form Fields
    tourPackageForm.addEventListener('submit', (e) => {
      e.preventDefault(); // Prevent the form from submitting if validation fails

      let isValid = true;

      // Validate all inputs in the form
      const allInputs = tourPackageForm.querySelectorAll('.editable-item');
      allInputs.forEach((input) => {
        if (!input.value.trim()) {
          isValid = false;
          input.classList.add('is-invalid');
          input.setCustomValidity('This field cannot be empty.');
          input.reportValidity();
        } else {
          input.classList.remove('is-invalid');
          input.setCustomValidity('');
        }
      });

      // Validate Price Fields for Numerical Values
      const priceFields = tourPackageForm.querySelectorAll('.price-field');
      priceFields.forEach((priceInput) => {
        if (isNaN(priceInput.value.trim()) || priceInput.value.trim() === '') {
          isValid = false;
          priceInput.classList.add('is-invalid');
          priceInput.setCustomValidity('Price must be a numerical value.');
          priceInput.reportValidity();
        } else {
          priceInput.classList.remove('is-invalid');
          priceInput.setCustomValidity('');
        }
      });

      // Submit the form if all inputs are valid
      if (isValid) {
        const submitButtonText = submitButton.textContent.trim().toLowerCase(); // Get the text of the submit button

        if (submitButtonText === 'create') {
          showToast('Tour package created successfully!', 'success');
        } else if (submitButtonText === 'save') {
          showToast('Tour package edited successfully!', 'success');
        }

        // Submit the form after showing the toast
        setTimeout(() => {
          tourPackageForm.submit();
        }, 300); // Allow 500ms for the toast to appear before submitting
      }
    });


    // Remove validation message as the user types
    tourPackageForm.addEventListener('input', (e) => {
      e.target.classList.remove('is-invalid');
      e.target.setCustomValidity('');
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


  // View Package

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
            priceItem.textContent = `💰  ${price.description}: ₱${price.estimated_price}`;
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
              <div class="timeline-content">
                <strong>${item.title}:</strong> 
                <p> ${item.subtitle} </p>
              </div>`;
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


  // Edit Package

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

  // Delete Package

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

    deleteButton.onclick = () => {
      // Show the confirmation modal
      showConfirmationModal(
        'Are you sure you want to delete this package?',
        async () => {
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

              // Close the tour details modal
              const modal = document.getElementById('tour-details-modal');
              if (modal) {
                modal.classList.remove('show');
                const modalOverlay = document.getElementById('modal-overlay');
                if (modalOverlay) modalOverlay.classList.remove('show');
              }

              // Show a toast message for successful deletion
              showToast('Package deleted successfully!', 'success');
            } else {
              const errorMessage = await deleteResponse.json();
              showToast(errorMessage.error || 'Failed to delete the package. Please try again.', 'error');
            }
          } catch (err) {
            console.error('Error deleting package:', err);
            showToast('An error occurred while deleting the package. Please try again.', 'error');
          }
        }
      );
    };
  }



//








// Tour Guide Management


  
  window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded.');
  
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
    [closeTourGuideModal, tourGuideModalOverlay].forEach((element) => {
      if (element && tourGuideModalWrapper) {
        element.addEventListener('click', () => {
          tourGuideModalWrapper.classList.remove('show');
        });
      }
    });
  
    const tourGuideForm = document.getElementById('tour-guide-form');
  
    if (tourGuideForm) {
      tourGuideForm.addEventListener('input', (e) => {
        e.target.setCustomValidity('');
        e.target.reportValidity();
      });
  
      tourGuideForm.addEventListener('submit', (e) => {
        e.preventDefault();
  
        const firstNameInput = tourGuideForm.querySelector('input[name="fname"]');
        const lastNameInput = tourGuideForm.querySelector('input[name="lname"]');
        const emailInput = tourGuideForm.querySelector('input[name="email"]');
        const contactNumberInput = tourGuideForm.querySelector('input[name="contact_number"]');
        const passwordInput = tourGuideForm.querySelector('input[name="password"]');
        const confirmPasswordInput = tourGuideForm.querySelector('input[name="confirm_password"]');
  
        let isValid = true;
  
        // First Name Validation
        if (!isValidName(firstNameInput.value)) {
          isValid = false;
          firstNameInput.setCustomValidity('First name must only contain letters.');
        } else {
          firstNameInput.setCustomValidity('');
        }
  
        // Last Name Validation
        if (!isValidName(lastNameInput.value)) {
          isValid = false;
          lastNameInput.setCustomValidity('Last name must only contain letters.');
        } else {
          lastNameInput.setCustomValidity('');
        }
  
        // Email Validation (format only)
        if (!isValidEmail(emailInput.value)) {
          isValid = false;
          emailInput.setCustomValidity('Enter a valid email address.');
        } else {
          emailInput.setCustomValidity('');
        }
  
        // Contact Number Validation
        if (!isValidContactNumber(contactNumberInput.value)) {
          isValid = false;
          contactNumberInput.setCustomValidity('Contact number must be 11 digits.');
        } else {
          contactNumberInput.setCustomValidity('');
        }
  
        // Password Validation
        const passwordValidation = isValidPassword(passwordInput.value);
        if (passwordValidation) {
          isValid = false;
          passwordInput.setCustomValidity(passwordValidation);
        } else {
          passwordInput.setCustomValidity('');
        }
  
        // Confirm Password Validation
        if (passwordInput.value !== confirmPasswordInput.value) {
          isValid = false;
          confirmPasswordInput.setCustomValidity('Passwords do not match.');
        } else {
          confirmPasswordInput.setCustomValidity('');
        }
  
        // Report all validity states
        firstNameInput.reportValidity();
        lastNameInput.reportValidity();
        emailInput.reportValidity();
        contactNumberInput.reportValidity();
        passwordInput.reportValidity();
        confirmPasswordInput.reportValidity();
  
        // Submit form if valid
        if (isValid) {
          showToast('Tour guide account created successfully! Check email for verification.', 'success');

          // Submit the form after showing the toast
          setTimeout(() => {
            tourGuideForm.submit();
          }, 300); // Allow 500ms for the toast to appear before submitting
        }
      });
    }
  
    function isValidName(name) {
      return /^[A-Za-z\s]+$/.test(name);
    }
  
    function isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
  
    function isValidContactNumber(contactNumber) {
      return /^\d{11}$/.test(contactNumber);
    }
  
    function isValidPassword(password) {
      if (password.length < 8) return 'Password must be at least 8 characters long.';
      if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
      if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.';
      if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Password must contain at least one special character.';
      return '';
    }
  });
  



  // View Guide Profile

  function redirectToProfile(guideId) {
    if (guideId) {
      window.location.href = `/tourguide/profile/${guideId}`;
    } else {
      console.error("Guide ID is missing.");
    }
  }


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


  document.addEventListener('DOMContentLoaded', () => {
    // Event delegation for status buttons
    document.addEventListener('click', async (e) => {
      if (e.target && e.target.classList.contains('status-btn')) {
        e.preventDefault(); // Prevent default button behavior
        
        // Retrieve data attributes from the clicked button
        const guideId = e.target.getAttribute('data-guide-id');
        const guideName = e.target.getAttribute('data-guide-name');
        const currentAction = e.target.textContent.trim(); // Get button text (Activate/Deactivate)
        
        // Open the confirmation modal
        showConfirmationModal(
          `Are you sure you want to ${currentAction.toLowerCase()} the account for ${guideName}?`,
          async () => {
            try {
              // Send the toggle request to the server
              const response = await fetch(`/touroperator/toggle_account_status/${guideId}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
              });
  
              // Handle the server response
              if (response.ok) {
                const result = await response.json();
                showToast(result.message || `${guideName}'s account has been ${currentAction.toLowerCase()}d.`, 'success');
                
                // Update the button text and style dynamically
                e.target.textContent = currentAction === 'Activate Account' ? 'Deactivate Account' : 'Activate Account';
                e.target.classList.toggle('deactivate', currentAction === 'Activate Account');
              } else {
                const error = await response.json();
                showToast(error.message || 'Failed to update the account status. Please try again.', 'error');
              }
            } catch (error) {
              console.error('Error toggling account status:', error);
              showToast('An error occurred while processing your request. Please try again.', 'error');
            }
          }
        );
      }
    });
  });
  

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





// 





//  Account Section


    // Cropper 
    // Selecting elements
    const profilePicOperator = document.getElementById('profile-pic-operator'); 
    const changePicBtn = document.getElementById('change-pic-btn'); 
    const uploadPicInput = document.getElementById('upload-pic'); 
    const cropperModal = document.getElementById('cropper-modal');
    const cropperContainer = document.getElementById('cropper-container');
    const cropBtn = document.getElementById('crop-btn'); 
    const closeCropperModal = document.getElementById('close-cropper-modal'); 
    const savePicBtn = document.getElementById('save-pic-btn'); 

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
          cropperContainer.innerHTML = ''; 
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
      
               
                showToast('Profile picture updated successfully!', 'success');
              } else {
                
                showToast('Failed to save profile picture.', 'error');
              }
            })
            .catch(error => {
              console.error('Error uploading image:', error);
              
              showToast('An error occurred while saving the picture.', 'error');
            });
        });
      }
    });




  // Change Credentials

  // Elements
  // Elements EMAIL and Contact number and PASSWORD
  document.addEventListener('DOMContentLoaded', function () {
    // Elements
    const guideEditEmailBtn = document.getElementById('guide-edit-email-btn');
    const guideEditContactBtn = document.getElementById('guide-edit-contact-btn');
    const guideEditPasswordBtn = document.getElementById('guide-edit-password-btn'); 
    const guidePasswordModal = document.getElementById('guide-password-confirm-modal'); 
    const guideChangePasswordModal = document.getElementById('guide-change-password-modal'); 
    const guideChangeEmailModal = document.getElementById('guide-change-email-modal'); 
    const guideChangeContactModal = document.getElementById('guide-change-contact-modal'); 
    const guidePasswordCancelBtn = document.getElementById('guide-password-cancel-btn');
    const guidePasswordConfirmBtn = document.getElementById('guide-password-confirm-btn');
    const verifyPasswordInput = document.getElementById('guide-confirm-password-input');
    const newPasswordInput = document.getElementById('guide-new-password');
    const confirmNewPasswordInput = document.getElementById('guide-confirm-new-password');
    const guideSavePasswordBtn = document.getElementById('guide-save-password-btn');
    const emailInput = document.getElementById('email');
    const guideSaveEmailBtn = document.getElementById('guide-save-email-btn');
    const contactNumberInput = document.getElementById('contact-number');
    const guideNewContactInput = document.getElementById('guide-new-contact-input');
    const guideSaveContactBtn = document.getElementById('guide-save-contact-btn');
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
          
          // Show success toast message
          showToast('Password verified successfully!', 'success');
          
          openActionModal();
        } else {
          // Show error toast message
          showToast(result.message || 'Password verification failed. Please try again.', 'error');
        }
        } catch (error) {
          console.error('Error verifying password:', error);
          
          // Show error toast message
          showToast('There was an error verifying your password. Please try again.', 'error');
        }
        
    });

    // Save the updated email
    guideSaveEmailBtn.addEventListener('click', async () => {
      const newEmail = document.getElementById('guide-new-email-input').value.trim();

      if (!isValidEmail(newEmail)) {
        showToast('Invalid email format. Please include "@" and a valid domain.', 'error');
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
          showToast('Email updated successfully!', 'success');
        } else {
          showToast(result.message || 'Failed to update email.', 'error');
        }
      } catch (error) {
        console.error('Error updating email:', error);
        showToast('There was an error processing your request. Please try again.', 'error');
      }
    });

    // Save the updated contact number
    guideSaveContactBtn.addEventListener('click', async () => {
      const newContact = guideNewContactInput.value.trim();

      if (!isValidContactNumber(newContact)) {
        showToast('Contact number must be exactly 11 digits.', 'error');
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
          showToast('Contact number updated successfully!', 'success');
        } else {
          showToast(result.message || 'Failed to update contact number.', 'error');
        }
      } catch (error) {
        console.error('Error updating contact number:', error);
        showToast('There was an error processing your request. Please try again.', 'error');
      }
    });

    // Save the new password
    guideSavePasswordBtn.addEventListener('click', async () => {
      const newPassword = newPasswordInput.value.trim();
      const confirmNewPassword = confirmNewPasswordInput.value.trim();

      if (!newPassword || !confirmNewPassword) {
        showToast('Please fill out all password fields.', 'error');
        return;
      }
      if (newPassword !== confirmNewPassword) {
        showToast('Passwords do not match.', 'error');
        return;
      }
      const passwordError = isValidPassword(newPassword);
      if (passwordError) {
        showToast(passwordError, 'error');
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
          closeActionModals();
          showToast('Password changed successfully!', 'success');
        } else {
          showToast(result.message || 'Failed to update password.', 'error');
        }
      } catch (error) {
        console.error('Error updating password:', error);
        showToast('There was an error processing your request. Please try again.', 'error');
      }
    });
  });


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


