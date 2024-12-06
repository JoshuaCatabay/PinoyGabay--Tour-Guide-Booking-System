// Side Panel Toggles



  // Get elements
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sideNav = document.getElementById('side-nav');
  const navLinks = document.querySelectorAll('.nav-link');
  const tabPanes = document.querySelectorAll('.tab-pane');

  // Logout modal elements
  const logoutModal = document.getElementById('logout-modal');
  const logoutOverlay = document.getElementById('logout-overlay');
  const confirmLogoutBtn = document.getElementById('confirm-logout-btn');
  const cancelLogoutBtn = document.getElementById('cancel-logout-btn');
  const mainContent = document.querySelector('.tab-content'); // The main content area

  // Toggle Sidebar on Mobile
  sidebarToggle?.addEventListener('click', () => {
    sideNav.classList.toggle('active');
  });

  // Handle tab switching and show logout modal
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      const targetTab = link.dataset.tab;

      if (targetTab === 'logout') {
        showLogoutModal(); // Show the logout modal
      } else {
        switchActiveTab(targetTab); // Switch to the clicked tab
      }

      // Close the sidebar if on mobile
      if (window.innerWidth <= 768) {
        sideNav.classList.remove('active');
      }
    });
  });

  // Switch active tabs
  function switchActiveTab(targetTab) {
    navLinks.forEach((link) => link.classList.remove('active'));
    document.querySelector(`[data-tab="${targetTab}"]`).classList.add('active');

    tabPanes.forEach((pane) => {
      pane.style.display = pane.id === targetTab ? 'block' : 'none';
    });
  }

  // Show Logout Modal and Overlay
  function showLogoutModal() {
    logoutModal.classList.add('show');
    logoutOverlay.classList.add('show');
    mainContent.classList.add('blurred'); // Apply blur effect to main content
  }

  // Hide Logout Modal and Remove Overlay
  function hideLogoutModal() {
    logoutModal.classList.remove('show');
    logoutOverlay.classList.remove('show');
    mainContent.classList.remove('blurred'); // Remove blur effect
  }

  // Confirm Logout and Redirect
  confirmLogoutBtn.addEventListener('click', () => {
    window.location.href = 'logout'; // Redirect to homepage
  });

  // Cancel Logout and Close Modal
  cancelLogoutBtn.addEventListener('click', hideLogoutModal);

  // Handle Logout Link Click
  document.querySelector('[data-tab="logout"]').addEventListener('click', (e) => {
    e.preventDefault();
    showLogoutModal();
  });

  // Ensure Profile Tab Displays on Load
  window.addEventListener('DOMContentLoaded', () => {
    tabPanes.forEach((pane) => {
      pane.style.display = pane.id === 'profile' ? 'block' : 'none';
    });
  });



  //






  
// Profile Section



  // Editable About Me Section
  document.addEventListener('DOMContentLoaded', async function () {
    // About Me Section Elements
    const editAboutBtn = document.getElementById('edit-about-btn');
    const saveAboutBtn = document.getElementById('save-about-btn');
    const aboutText = document.getElementById('about-text');

    // Load existing data from server on page load
    async function loadInitialData() {
      try {
        const response = await fetch('/tourguide/get_profile_data');
        const data = await response.json();

        if (data.success) {
          const profileData = data.profile_data;
          
          // Populate initial data
          if (profileData.about_me) aboutText.value = profileData.about_me;
          if (profileData.characteristics) updateDisplayList(document.getElementById('characteristics-list'), profileData.characteristics);
          if (profileData.skills) updateDisplayList(document.getElementById('skills-list'), profileData.skills);
        } else {
          console.error('Failed to load initial data:', data.message);
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    }

    loadInitialData();

  // Toggle About Me Edit Mode
  editAboutBtn.addEventListener('click', () => toggleEdit(aboutText, editAboutBtn, saveAboutBtn));

  saveAboutBtn.addEventListener('click', async () => {
    const updatedBio = aboutText.value;
    if (!updatedBio.trim()) {
      showToast('Please enter text for "About Me"', 'error'); // Error toast
      return;
    }
    try {
      const response = await fetch('/tourguide/update_about_me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio: updatedBio })
      });
      const result = await response.json();
      if (result.success) {
        showToast('About Me updated successfully!', 'success'); // Success toast
      } else {
        showToast('Failed to update About Me.', 'error'); // Error toast
      }
    } catch (error) {
      console.error('Error saving About Me:', error);
      showToast('An error occurred. Please try again.', 'error'); // Error toast
    }
    toggleEdit(aboutText, editAboutBtn, saveAboutBtn, false);
  });


  // Why Choose Me

  function toggleEdit(input, editBtn, saveBtn, isEditing = true) {
    input.disabled = !isEditing;
    editBtn.classList.toggle('hidden', isEditing);
    saveBtn.classList.toggle('hidden', !isEditing);
    if (isEditing) input.focus();
  }

  // Characteristics and Skills Sections
  function setupEditableList(editBtn, saveBtn, addBtn, list, saveFunction) {
    editBtn.addEventListener('click', () => toggleListEdit(list, true, addBtn, editBtn, saveBtn));
    saveBtn.addEventListener('click', async () => {
      await saveFunction();
      toggleListEdit(list, false, addBtn, editBtn, saveBtn);
    });

    addBtn.addEventListener('click', () => {
      const newItem = createEditableListItem();
      list.appendChild(newItem);
      newItem.querySelector('.editable').focus();
    });
  }

  // Usage in createEditableListItem
  function createEditableListItem(text = 'New Item') {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="checkmark">&#10003;</span>
      <span class="editable" contenteditable="true">${text}</span>
      <button class="remove-btn">&#8722;</button>
    `;
    li.querySelector('.remove-btn').addEventListener('click', () => {
      showConfirmationModal("Are you sure you want to remove this item?", () => {
        li.remove();
      });
    });
    return li;
  }

  function toggleListEdit(list, isEditing, addBtn, editBtn, saveBtn) {
    Array.from(list.children).forEach((li) => {
      const editableElement = li.querySelector('.editable');
      const removeBtn = li.querySelector('.remove-btn');
      editableElement.contentEditable = isEditing;
      removeBtn.classList.toggle('hidden', !isEditing);
    });
    addBtn.classList.toggle('hidden', !isEditing);
    editBtn.classList.toggle('hidden', isEditing);
    saveBtn.classList.toggle('hidden', !isEditing);
  }
  async function saveCharacteristics() {
    const characteristics = Array.from(document.querySelectorAll('#characteristics-list .editable')).map(item => item.textContent.trim());
    if (characteristics.some(item => !item)) {
      showToast("Please ensure all characteristics have content.", 'error'); // Error toast
      return;
    }
    try {
      const response = await fetch('/tourguide/update_characteristics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characteristics })
      });
      const result = await response.json();
      if (result.success) {
        showToast('Characteristics updated successfully!', 'success'); // Success toast
        updateDisplayList(document.getElementById('characteristics-list'), characteristics);
      } else {
        showToast('Failed to update Characteristics. Please try again.', 'error'); // Error toast
      }
    } catch (error) {
      console.error('Error saving Characteristics:', error);
      showToast('An error occurred. Please try again.', 'error'); // Error toast
    }
  }
  
  async function saveSkills() {
    const skills = Array.from(document.querySelectorAll('#skills-list .editable')).map(item => item.textContent.trim());
    if (skills.some(item => !item)) {
      showToast("Please ensure all skills have content.", 'error'); // Error toast
      return;
    }
    try {
      const response = await fetch('/tourguide/update_skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills })
      });
      const result = await response.json();
      if (result.success) {
        showToast('Skills updated successfully!', 'success'); // Success toast
        updateDisplayList(document.getElementById('skills-list'), skills);
      } else {
        showToast('Failed to update Skills. Please try again.', 'error'); // Error toast
      }
    } catch (error) {
      console.error('Error saving Skills:', error);
      showToast('An error occurred. Please try again.', 'error'); // Error toast
    }
  }
  
  function updateDisplayList(listElement, items) {
    listElement.innerHTML = '';
    items.forEach(item => {
      const li = createEditableListItem(item);
      li.querySelector('.editable').contentEditable = 'false';
      li.querySelector('.remove-btn').classList.add('hidden');
      listElement.appendChild(li);
    });
  }

  // Initialize Editable Lists with Save Functions
  setupEditableList(
    document.getElementById('edit-char-btn'),
    document.getElementById('save-char-btn'),
    document.getElementById('add-char-btn'),
    document.getElementById('characteristics-list'),
    saveCharacteristics
  );

  setupEditableList(
    document.getElementById('edit-skills-btn'),
    document.getElementById('save-skills-btn'),
    document.getElementById('add-skills-btn'),
    document.getElementById('skills-list'),
    saveSkills
  );
  });


  // Reviews
  
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





// My Bookings Section
    


  // Notification Function
  document.addEventListener('DOMContentLoaded', () => {
    const NOTIFICATIONS_URL = '/notifications';
    const notificationList = document.getElementById('notification-list');
    const notificationCount = document.getElementById('notification-count');

    // Fetch notifications
    async function fetchNotifications() {
      try {
        const response = await fetch(`${NOTIFICATIONS_URL}/`);
        if (!response.ok) throw new Error('Failed to fetch notifications');
    
        const data = await response.json();
        console.log('Fetched Notifications:', data); // Debugging
    
        notificationList.innerHTML = ''; // Clear old notifications
    
        if (data.notifications.length === 0) {
          notificationList.innerHTML = '<li class="notification-item">No new notifications</li>';
        } else {
          data.notifications.forEach(notification => {
            console.log(`Processing Notification: ${notification.message}`); // Debugging
    
            notificationList.innerHTML += `
              <li class="notification-item" data-id="${notification.id}">
                ${notification.message}
                <button class="notification-btn" onclick="viewNotificationDetails('Booking #${notification.id}')">View</button>
              </li>
            `;
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
        const count = data.count || 0;
        notificationCount.textContent = `(${count})`;
      } catch (error) {
        console.error('Error fetching notification count:', error);
      }
    }

    // Event delegation for marking notifications as read
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

        notificationItem.remove(); // Remove from the list
        const count = parseInt(notificationCount.textContent.replace(/[()]/g, ''), 10);
        notificationCount.textContent = `(${Math.max(count - 1, 0)})`;

        // Display "No new notifications" if list is empty
        if (notificationList.children.length === 0) {
          notificationList.innerHTML = '<li class="notification-item">No new notifications</li>';
        }
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    });

    // Fetch notifications and count on page load
    fetchNotifications();
    fetchNotificationCount();

    // Placeholder function for the "View" button
    window.viewNotificationDetails = (detail) => {
      alert(`View details for: ${detail}`);
    };
  });

      
  // Booking Category Toggle
  const toggleButtons = document.querySelectorAll('.toggle-btn');
  const tourCards = document.querySelectorAll('.tour-card');

  // Function to update category counts
  function updateCounts() {
    const counts = {
      all: tourCards.length,
      upcoming: 0,
      ongoing: 0,
      completed: 0,
      cancelled: 0,
    };

    tourCards.forEach((card) => {
      const status = card.dataset.status;
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

  // Function to toggle categories
  function toggleCategory() {
    toggleButtons.forEach((button) => {
      button.addEventListener('click', () => {
        toggleButtons.forEach((btn) => btn.classList.remove('active'));
        button.classList.add('active');

        const status = button.dataset.status;

        tourCards.forEach((card) => {
          const cardStatus = card.dataset.status;
          card.style.display =
            status === 'all' || cardStatus === status ? 'block' : 'none';
        });
      });
    });
  }

  // Initialize counts and toggles on page load
  window.addEventListener('DOMContentLoaded', () => {
    updateCounts();
    toggleCategory();
  });


  // Bookings
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


  // Complete Booking
  async function handleCompleteBooking() {
    const completeButtons = document.querySelectorAll('.complete-booking-btn');
  
    completeButtons.forEach((button) => {
      button.addEventListener('click', async () => {
        const bookingId = button.dataset.id;
  
        try {
          const response = await fetch(`/booking/complete/${bookingId}`, {
            method: 'POST',
          });
  
          if (response.ok) {
            const data = await response.json();
            alert(data.message);
  
            // Update the card's status
            const card = document.querySelector(`.tour-card[data-id="${bookingId}"]`);
            if (card) {
              card.dataset.status = 'completed';
              card.querySelector('.status-label').textContent = 'Completed';
              card.querySelector('.status-label').classList.remove('ongoing');
              card.querySelector('.status-label').classList.add('completed');
  
              // Remove the "Mark as Completed" button
              const completeButton = card.querySelector('.complete-booking-btn');
              if (completeButton) completeButton.remove();
  
              updateCounts(); // Refresh counts
            } else {
              console.error(`Card for booking ID ${bookingId} not found.`);
            }
          } else {
            const errorData = await response.json();
            alert(errorData.error || 'Failed to complete the booking.');
          }
        } catch (err) {
          console.error('Error completing booking:', err);
          alert('An error occurred. Please try again.');
        }
      });
    });
  }
  
  // Initialize complete booking functionality
  document.addEventListener('DOMContentLoaded', () => {
    handleCompleteBooking();
  });
  


// 





// Calendar & Availability

    
  // Calendar Function
  document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('availability-calendar');
    const editAvailabilityBtn = document.getElementById('edit-availability');
    const markAvailableBtn = document.getElementById('mark-available');
    const markUnavailableBtn = document.getElementById('mark-unavailable');
    const resetCalendarBtn = document.getElementById('reset-calendar');
    const saveAvailabilityBtn = document.getElementById('save-availability');

    let isEditing = false;
    let activeStatus = null; // "available" or "unavailable"

    // Initialize FullCalendar
    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      selectable: true,
      selectOverlap: false,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      },
      events: [], // Fetched dynamically

      select: function (info) {
        if (isEditing) {
          if (activeStatus) {
            toggleEventStatus(info.startStr, activeStatus);
          } else {
            showToast('Please select "Mark Available" or "Mark Unavailable" first.', 'error');
          }
        } else {
          showToast('Enable edit mode to mark availability.', 'error');
        }
        calendar.unselect();
      },
      eventClick: function (info) {
        if (isEditing && info.event.extendedProps.status !== 'booked') {
          info.event.remove();
        } else if (info.event.extendedProps.status === 'booked') {
          alert('This date is booked and cannot be changed.');
        }
      },
    });

    calendar.render();

    // Helper: Toggle between available/unavailable
    function toggleEventStatus(date, status) {
      const event = calendar.getEvents().find(event => event.startStr === date);
      if (event) {
        if (event.extendedProps.status !== 'booked') {
          event.remove();
        }
      } else {
        const title = status === 'available' ? 'Available' : 'Unavailable';
        const color = status === 'available' ? '#4ecdc4' : '#e63946';
        calendar.addEvent({
          title: title,
          start: date,
          allDay: true,
          backgroundColor: color,
          textColor: 'white',
          extendedProps: { status: status },
        });
      }
    }

    // Load availability from the server
    function loadAvailability() {
      fetch('/tourguide/get_availability')
        .then(response => response.json())
        .then(data => {
          calendar.getEvents().forEach(event => event.remove());
          data.forEach(entry => {
              calendar.addEvent({
                  title: entry.status === 'available' ? 'Available' : entry.status === 'booked' ? 'Booked' : 'Unavailable',
                  start: entry.date,
                  allDay: true,
                  backgroundColor: entry.status === 'available' ? '#4ecdc4' : entry.status === 'booked' ? '#1a535c' : '#e63946',
                  textColor: 'white',
                  extendedProps: { status: entry.status },
              });
          });
        })
      .catch(error => console.error('Error loading availability:', error));
    }


    // Save availability to the server
    async function saveAvailability() {
      try {
        const events = calendar.getEvents().map(event => ({
          date: event.startStr,
          status: event.extendedProps.status,
        }));

        const response = await fetch('/tourguide/set_availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(events),
        });

        if (!response.ok) throw new Error('Failed to save availability.');

        showToast('Availability saved successfully!', 'success'); // Show success toast
        loadAvailability();
      } catch (error) {
        console.error(error);
        showToast('Failed to save availability. Please try again.', 'error'); // Show error toast
      }
    }

    // Reset calendar and delete all availability from the database
    async function resetAvailability() {
      // Show confirmation modal
      showConfirmationModal('Are you sure you want to reset all availability?', async () => {
        try {
          const response = await fetch('/tourguide/reset_availability', { method: 'DELETE' });

          if (!response.ok) throw new Error('Failed to reset availability.');

          showToast('Availability reset successfully!', 'success'); // Show success toast
          loadAvailability(); // Reload availability to ensure booked dates remain
        } catch (error) {
          console.error(error);
          showToast('Failed to reset availability. Please try again.', 'error'); // Show error toast
        }
      });
    }

    // Attach event listeners
    editAvailabilityBtn.addEventListener('click', () => {
      isEditing = !isEditing;
      toggleEditButtons(isEditing);
    });

    function toggleEditButtons(isEditing) {
      markAvailableBtn.classList.toggle('hidden', !isEditing);
      markUnavailableBtn.classList.toggle('hidden', !isEditing);
      resetCalendarBtn.classList.toggle('hidden', !isEditing);
      saveAvailabilityBtn.classList.toggle('hidden', !isEditing);
      editAvailabilityBtn.textContent = isEditing ? 'Exit Edit Mode' : 'Edit Availability';
      activeStatus = null; // Reset active status when exiting edit mode
    }

    // Set active status to "available"
    markAvailableBtn.addEventListener('click', () => {
      activeStatus = 'available';
      showToast('Click on dates to mark them as available.', 'success');
    });

    // Set active status to "unavailable"
    markUnavailableBtn.addEventListener('click', () => {
      activeStatus = 'unavailable';
      showToast('Click on dates to mark them as unavailable.', 'error');
    });

    // Attach reset functionality
    resetCalendarBtn.addEventListener('click', resetAvailability);

    // Save availability
    saveAvailabilityBtn.addEventListener('click', saveAvailability);

    // Initial load
    loadAvailability();
    
  });



// 





// Account



  // Profile Picture Cropper Modal Logic
  const profileOverview = document.getElementById('tourguide-profile-overview');
  if (profileOverview) {
    const changePicBtn = profileOverview.querySelector('#change-pic-btn');
    const uploadPicInput = profileOverview.querySelector('#upload-pic');
    const profilePic = profileOverview.querySelector('#profile-pic');
    const cropperModal = profileOverview.querySelector('#cropper-modal');
    const cropperContainer = profileOverview.querySelector('#cropper-container');
    const cropAndSaveBtn = profileOverview.querySelector('#crop-and-save-btn');
    const closeCropperBtn = profileOverview.querySelector('#close-cropper-modal');
    let cropper;

    // Open file input on button click
    changePicBtn.addEventListener('click', () => uploadPicInput.click());

    // Show cropper modal on image selection
    uploadPicInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = document.createElement('img');
          img.src = e.target.result;
          img.id = 'crop-image';
          cropperContainer.innerHTML = ''; // Clear previous image
          cropperContainer.appendChild(img);
          cropperModal.classList.add('show'); // Show the cropper modal

          // Destroy previous cropper instance if it exists and create a new one
          if (cropper) cropper.destroy();
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

    // Crop and save profile picture
    cropAndSaveBtn.addEventListener('click', () => {
      cropper.getCroppedCanvas({ width: 200, height: 200 }).toBlob((blob) => {
        const formData = new FormData();
        formData.append('profile_picture', blob);

        console.log("Uploading cropped profile picture...");

        fetch('/tourguide/upload_profile_picture', {
          method: 'POST',
          body: formData
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            profilePic.src = `${data.url}?t=${new Date().getTime()}`;
            cropperModal.classList.remove('show');
            showToast('Profile picture saved successfully!', 'success'); // Replace console log
          } else {
            showToast('Failed to save profile picture.', 'error');
          }
        })
        .catch(error => {
          console.error('Error uploading image:', error);
          showToast('An error occurred while saving the picture.', 'error');
        });
      });
    });

    // Close cropper modal
    closeCropperBtn.addEventListener('click', () => {
      cropperModal.classList.remove('show');
    });
  }


  // Price Editing Logic
  const editPriceBtn = document.getElementById('edit-price-btn');
  const savePriceBtn = document.getElementById('save-price-btn');
  const priceDisplay = document.getElementById('tour-price');
  const priceInput = document.getElementById('price-input');

  // Enable Price Editing
  editPriceBtn.addEventListener('click', () => {
    // Hide the display and show the input for editing
    priceDisplay.classList.add('hidden');
    priceInput.classList.remove('hidden');
    priceInput.value = parseFloat(priceDisplay.textContent.replace('₱', '').replace(/,/g, '')); // Populate input, remove commas
    editPriceBtn.classList.add('hidden');
    savePriceBtn.classList.remove('hidden');
  });

  // Save Edited Price and Send to Backend
  savePriceBtn.addEventListener('click', async () => {
    const newPrice = parseFloat(priceInput.value);

    // Validate that the input is a positive number
    if (isNaN(newPrice) || newPrice <= 0) {
      showToast('Please enter a valid price.', 'error'); // Show error toast
      return;
    }

    // Update the displayed price in the UI
    priceDisplay.textContent = `₱${newPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    priceDisplay.classList.remove('hidden');
    priceInput.classList.add('hidden');
    editPriceBtn.classList.remove('hidden');
    savePriceBtn.classList.add('hidden');

    // Send the updated price to the backend
    try {
      const response = await fetch('/tourguide/update_price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ price: newPrice.toFixed(2) })
      });

      const result = await response.json();

      if (!result.success) {
        // Show error toast if saving fails
        showToast('Failed to save price. Please try again.', 'error');
        // Revert display if saving failed
        const originalPrice = parseFloat(priceDisplay.getAttribute('data-original-price'));
        priceDisplay.textContent = `₱${originalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      } else {
        // Show success toast
        showToast('Price updated successfully!', 'success');
        // Update original price attribute on success
        priceDisplay.setAttribute('data-original-price', newPrice.toFixed(2));
      }
    } catch (error) {
      console.error('Error saving price:', error);
      // Show error toast for any unexpected errors
      showToast('An error occurred while saving the price. Please try again.', 'error');
    }
  });


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

    // Open the password verification modal
    guideEditEmailBtn.addEventListener('click', () => openGuidePasswordModal('email'));
    guideEditContactBtn.addEventListener('click', () => openGuidePasswordModal('contact'));
    guideEditPasswordBtn.addEventListener('click', () => openGuidePasswordModal('password'));

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
          showToast('Password verified. You can now proceed.', 'success'); // Show success toast
          openActionModal(); // Open the modal for the intended action
        } else {
          // Show confirmation modal if the password is incorrect
          showConfirmationModal(
            'Incorrect Password. Would you still want to proceed?',
            () => {
              // Callback to re-enter the password
              verifyPasswordInput.value = ''; // Clear the input
            }
          );
        }
      } catch (error) {
        showToast('An error occurred while verifying the password. Please try again.', 'error'); // Show error toast
        console.error('Error verifying password:', error);
      }
    });



    // Save the updated email to the backend
    guideSaveEmailBtn.addEventListener('click', async () => {
      const newEmail = document.getElementById('guide-new-email-input').value.trim();

      // Validate the email before making the fetch request
      const emailValidationError = isValidEmail(newEmail);
      if (emailValidationError) {
        showToast(emailValidationError, 'error'); // Show error toast
        return;
      }

      try {
        guideSaveEmailBtn.disabled = true; // Prevent multiple submissions
        const response = await fetch('/tourguide/update_email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: newEmail }),
        });

        const result = await response.json();

        if (result.success) {
          emailInput.value = newEmail; // Update displayed email
          closeActionModals(); // Close modal
          showToast('New email saved successfully!', 'success'); // Show success toast
        } else {
          showToast(result.message || 'Failed to update email. Please try again.', 'error'); // Show error toast
        }
      } catch (error) {
        console.error('Error updating email:', error);
        showToast('There was an error processing your request. Please try again.', 'error'); // Show error toast
      } finally {
        guideSaveEmailBtn.disabled = false;
      }
    });


    // Save the updated contact number to the backend
    guideSaveContactBtn.addEventListener('click', async () => {
      const newContactNumber = guideNewContactInput.value.trim();

      // Validate the contact number
      if (!newContactNumber || !/^\d{11}$/.test(newContactNumber)) {
        showToast('Contact number must be exactly 11 digits.', 'error'); // Show error toast
        return; // Stop further execution
      }

      try {
        const response = await fetch('/tourguide/update_contact_number', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contact_number: newContactNumber }),
        });

        const result = await response.json();

        if (result.success) {
          contactNumberInput.value = newContactNumber; // Update displayed contact number
          closeActionModals(); // Close any open modal or UI
          showToast('Contact number updated successfully!', 'success'); // Show success toast
        } else {
          showToast(result.message || 'Failed to update contact number. Please try again.', 'error'); // Show error toast
        }
      } catch (error) {
        console.error('Error updating contact number:', error);
        showToast('There was an error processing your request. Please try again.', 'error'); // Show error toast
      }
    });


    // Save the new password to the backend
    guideSavePasswordBtn.addEventListener('click', async () => {
      const newPassword = newPasswordInput.value.trim();
      const confirmNewPassword = confirmNewPasswordInput.value.trim();

      // Validate input fields
      if (!newPassword || !confirmNewPassword) {
        showToast('Please fill out all password fields.', 'error'); // Show error toast
        return;
      }
      if (newPassword !== confirmNewPassword) {
        showToast('New passwords do not match.', 'error'); // Show error toast
        return;
      }

      // Validate password strength
      const passwordValidationError = isValidPassword(newPassword);
      if (passwordValidationError) {
        showToast(passwordValidationError, 'error'); // Show error toast
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
          showToast('Password updated successfully!', 'success'); // Show success toast
          closeActionModals(); // Close any open modal or UI
        } else {
          showToast(result.message || 'Failed to update password. Please try again.', 'error'); // Show error toast
        }
      } catch (error) {
        showToast('There was an error processing your request. Please try again.', 'error'); // Show error toast
      }
    });


    // Helper functions
    function openGuidePasswordModal(action) {
      activeAction = action;
      guidePasswordModal.classList.add('show');
      modalOverlay.classList.add('show');
    }

    function closeGuidePasswordModal() {
      guidePasswordModal.classList.remove('show');
      modalOverlay.classList.remove('show');
      verifyPasswordInput.value = '';
    }

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

    function closeActionModals() {
      guideChangeEmailModal.classList.remove('show');
      guideChangeContactModal.classList.remove('show');
      guideChangePasswordModal.classList.remove('show');
      modalOverlay.classList.remove('show');
    }

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
    guideCancelContactBtn.addEventListener('click', closeGuideModal); 

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


  // Elements for Profile Activation Modal
  document.addEventListener('DOMContentLoaded', async function () {
    const profileToggle = document.getElementById('profile-toggle');
    const toggleStatus = document.getElementById('toggle-status');

    // Fetch and update the initial status of the profile on page load
    await getProfileStatus();

    // Open modal when attempting to activate profile
    profileToggle.addEventListener('click', () => {
      if (toggleStatus.textContent === 'Inactive') {
        showConfirmationModal(
          'Are you sure you want to activate your profile?',
          async () => {
            const success = await activateProfile();
            if (success) {
              profileToggle.classList.add('active');
              toggleStatus.textContent = 'Active';
              showToast('Profile activated successfully!', 'success');
            } else {
              showToast('Profile activation failed. Please ensure all required fields are complete.', 'error');
            }
          }
        );
      } else {
        showConfirmationModal(
          'Are you sure you want to deactivate your profile?',
          async () => {
            const success = await deactivateProfile();
            if (success) {
              profileToggle.classList.remove('active');
              toggleStatus.textContent = 'Inactive';
              showToast('Profile deactivated successfully!', 'success');
            } else {
              showToast('Profile deactivation failed.', 'error');
            }
          }
        );
      }
    });

    // Activate profile in the backend
    async function activateProfile() {
      try {
        const response = await fetch('/tourguide/activate_profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const result = await response.json();
        if (!result.success) {
          return false;
        }
        return true;
      } catch (error) {
        showToast('An error occurred while activating the profile.', 'error');
        return false;
      }
    }

    // Deactivate profile in the backend
    async function deactivateProfile() {
      try {
        const response = await fetch('/tourguide/deactivate_profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const result = await response.json();
        if (!result.success) {
          return false;
        }
        return true;
      } catch (error) {
        showToast('An error occurred while deactivating the profile.', 'error');
        return false;
      }
    }

    // Fetch the profile status from the backend on page load
    async function getProfileStatus() {
      try {
        const response = await fetch('/tourguide/get_profile_status');
        const result = await response.json();
        if (result.active) {
          profileToggle.classList.add('active');
          toggleStatus.textContent = 'Active';
        } else {
          profileToggle.classList.remove('active');
          toggleStatus.textContent = 'Inactive';
        }
      } catch (error) {
        showToast('An error occurred while fetching profile status.', 'error');
      }
    }
  });



// 





// Account Deactivated



  // Function to close the modal and redirect to the main page
  function closeTGModal(event) {
    event.preventDefault();
    // Hide the modal
    document.getElementById('tgDeactivationModal').style.display = 'none';
    // Redirect to the main page
    window.location.href = "/"; // Replace "/" with the correct URL if needed
  }
  // Wait for the DOM to load before running the script
  document.addEventListener("DOMContentLoaded", () => {
    // Check the data attribute to see if the modal should be shown
    const modal = document.getElementById("tgDeactivationModal");
    const showModal = modal.getAttribute("data-show-modal");
    if (showModal === "true") {
        modal.style.display = "flex";
    }
  });


  // Function to close the modal and redirect to the main page
  function closeTGAccountStatusModal(event) {
    event.preventDefault(); // Prevent default behavior of the click

    // Hide the modal
    document.getElementById("tgAccountStatusModal").style.display = "none";

    // Redirect to the main page
    window.location.href = "logout"; // Replace "/" with the correct URL if needed
  }

  // Wait for the DOM to load before running the script
  document.addEventListener("DOMContentLoaded", () => {
    // Check the data attribute to see if the modal should be shown
    const accountStatusModal = document.getElementById("tgAccountStatusModal");
    const showAccountStatus = accountStatusModal.getAttribute("data-show-account-status");

    if (showAccountStatus === "true") {
        accountStatusModal.style.display = "flex";
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



// 



// // Confirm password and open the appropriate modal for editing
// document.addEventListener('DOMContentLoaded', function () {
//   // Select the elements
//   const guidePasswordConfirmBtn = document.getElementById('guide-password-confirm-btn');
//   const guideConfirmPasswordInput = document.getElementById('guide-confirm-password-input');

//   if (!guidePasswordConfirmBtn || !guideConfirmPasswordInput) {
//       console.error('One or more elements not found.');
//       return;
//   }

//   let guideActiveAction = ''; // Define this variable somewhere in scope to track action

//   // Add event listener
//   guidePasswordConfirmBtn.addEventListener('click', () => {
//       // if (guideConfirmPasswordInput.value === 'password123') { // Replace 'password123' with actual logic to validate the password
//       //     closeGuideModal();
//       //     if (guideActiveAction === 'email') {
//       //         openGuideChangeEmailModal();
//       //     } else if (guideActiveAction === 'password') {
//       //         openGuideChangePasswordModal();
//       //     } else if (guideActiveAction === 'contact') {
//       //         openGuideChangeContactModal();
//       //     }
//       // } else {
//       //     alert('Incorrect password. Please try again.');
//       // }
//   });

//   function closeGuideModal() {
//       // Your function to close the password confirmation modal
//       console.log('Closing password modal');
//       // Actual code to close the modal goes here
//   }

//   function openGuideChangeEmailModal() {
//       // Function to open the email change modal
//       console.log('Opening email change modal');
//       // Code to open the email modal goes here
//   }

//   function openGuideChangePasswordModal() {
//       // Function to open the password change modal
//       console.log('Opening password change modal');
//       // Code to open the password modal goes here
//   }

//   function openGuideChangeContactModal() {
//       // Function to open the contact change modal
//       console.log('Opening contact change modal');
//       // Code to open the contact modal goes here
//   }
// });



// // Save new email
// document.addEventListener('DOMContentLoaded', function () {
//   // Select the guideSaveEmailBtn element
//   const guideSaveEmailBtn = document.getElementById('guide-save-email-btn');
//   const guideNewEmailInput = document.getElementById('guide-new-email-input');
  
//   if (!guideSaveEmailBtn || !guideNewEmailInput) {
//       console.error('Element not found in the DOM.');
//       return;
//   }

//   // Add event listener for the save button
//   guideSaveEmailBtn.addEventListener('click', () => {
//       const newEmail = guideNewEmailInput.value;
//       alert(`New email saved: ${newEmail}`);
//       closeGuideModal(); // Ensure this function is defined
//   });
// });

// // Example function to close the modal (make sure this function is defined in your script)
// function closeGuideModal() {
//   const modal = document.getElementById('guide-change-email-modal');
//   if (modal) {
//       modal.classList.add('hidden');
//   }
// }



// // Save new password
// document.addEventListener('DOMContentLoaded', function () {
//   // Select the elements
//   const guideSavePasswordBtn = document.getElementById('guide-save-password-btn');
//   const newPasswordInput = document.getElementById('guide-new-password');
//   const confirmNewPasswordInput = document.getElementById('guide-confirm-new-password');

//   // Check if elements exist before adding event listeners
//   if (!guideSavePasswordBtn || !newPasswordInput || !confirmNewPasswordInput) {
//       console.error('One or more elements not found in the DOM.');
//       return;
//   }

//   // Add event listener for the save password button
//   guideSavePasswordBtn.addEventListener('click', () => {
//       const newPassword = newPasswordInput.value;
//       const confirmPassword = confirmNewPasswordInput.value;

//       if (newPassword === confirmPassword) {
//           alert('Password changed successfully!');
//           closeGuideModal(); // Ensure this function is defined
//       } else {
//           alert('Passwords do not match.');
//       }
//   });
// });

// // Example function to close the modal (make sure this function is defined in your script)
// function closeGuideModal() {
//   const modal = document.getElementById('guide-change-password-modal');
//   if (modal) {
//       modal.classList.add('hidden');
//   }
// }


// // Save new contact number


//CURRENT PASSWORD 


// }


// // Function to handle "Mark as Completed"
// function handleCompleteBooking() {
//   const completeButtons = document.querySelectorAll('.complete-booking-btn');

//   completeButtons.forEach((button) => {
//     button.addEventListener('click', async () => {
//       const bookingId = button.dataset.id;

//       try {
//         const response = await fetch(`/booking/complete/${bookingId}`, {
//           method: 'POST',
//         });

//         if (response.ok) {
//           const data = await response.json();
//           alert(data.message);

//           // Update booking status to completed
//           const card = document.querySelector(`.tour-card[data-id="${bookingId}"]`);
//           if (card) {
//             card.dataset.status = 'completed';
//             card.querySelector('.status-label').textContent = 'Completed';
//             card.querySelector('.tour-status').textContent = 'Completed';

//             // Hide the "Mark as Completed" button
//             const completeButton = card.querySelector('.complete-booking-btn');
//             if (completeButton) {
//               completeButton.style.display = 'none';
//             }

//             // Update counts
//             updateCounts();
//           } else {
//             console.error(`Card for booking ID ${bookingId} not found.`);
//           }
//         } else {
//           const errorData = await response.json();
//           alert(errorData.error || 'Failed to complete the booking.');
//         }
//       } catch (err) {
//         console.error('Error completing booking:', err);
//         alert('An error occurred. Please try again.');
//       }
//     });
//   });
// }

// // Initialize functionality
// document.addEventListener('DOMContentLoaded', () => {
//   toggleCategory();
//   updateCounts();
//   handleCompleteBooking();
// });
