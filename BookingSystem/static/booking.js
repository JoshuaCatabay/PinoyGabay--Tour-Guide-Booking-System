


document.addEventListener('DOMContentLoaded', async () => {

  const tourGuideList = document.getElementById('tour-guide-list');

  // Function to check if the user is authenticated
  async function checkAuthentication() {
    try {
      const response = await fetch('/check-login-status'); // Backend endpoint to check login
      const result = await response.json();
      return result.logged_in; // Returns true if the user is logged in
    } catch (error) {
      console.error('Error checking authentication status:', error);
      return false; // Assume not logged in if there's an error
    }
  }

  try {
    // Fetch active tour guides
    const response = await fetch('/tourguide/active_tourguides');
    const guides = await response.json();

    // Check if the user is authenticated
    const isAuthenticated = await checkAuthentication();
    guides.forEach(guide => {
      const guideCard = document.createElement('div');
      guideCard.className = 'tour-guide-card';
    
      // Rating and Tour Details
      const ratingDisplay = `
        <span class="star-icon">★</span>
        <span class="rating-value">${guide.average_rating || 0}</span>
        <span class="review-count">(${guide.review_count || 0})</span>
        <span class="separator">|</span>
        <span class="total-tours">${guide.total_tours || 0} <span class="tours">Tours</span></span>
      `;
    
      // Tour Guide Card Template
      guideCard.innerHTML = `
        <div class="profile-picture">
          <img src="${guide.profile_picture}" alt="Tour Guide Profile Picture">
        </div>
    
        <div class="guide-info">
          <h2 class="guide-name">Mabuhay! I am <span>${guide.name}</span>, Your Friendly Tour Guide</h2>
              
          <div class="ratings">
            ${ratingDisplay}
          </div>
              
          <p class="price">Starting Price: ₱${parseFloat(guide.price).toLocaleString()}</p>
                
          <a href="/tourguide/profile/${guide.id}">
            <button class="book-btn">Book Now</button>
          </a>
        </div>
      `;
    
      tourGuideList.appendChild(guideCard);
    });
    
    // Attach click event to "Book Now" buttons
    document.querySelectorAll('.book-btn').forEach(button => {
      button.addEventListener('click', async (event) => {
        const guideId = event.target.getAttribute('data-guide-id');
        if (isAuthenticated) {
          // Redirect authenticated users to the tour guide form
          window.location.href = `/tourguide/profile/${guideId}`;
        } else {
          // Redirect unauthenticated users to the tour guide form with a prompt
          window.location.href = '/tourguide_form';
        }
      });
    });

  } catch (error) {
    console.error("Error fetching tour guides:", error);

  }

});





document.addEventListener('DOMContentLoaded', () => {
  const NOTIFICATIONS_URL = '/notifications';
  const notificationBell = document.getElementById('notification-bell');
  const notificationDropdown = document.getElementById('notification-dropdown');
  const notificationCount = document.querySelector('.notification-count');
  const notificationList = document.getElementById('notification-list');
  
  // Fetch notifications
  async function fetchNotifications() {
    try {
      const response = await fetch(`${NOTIFICATIONS_URL}/`);
      if (!response.ok) throw new Error('Failed to fetch notifications');
  
      const data = await response.json();
      console.log("Fetched Notifications:", data); // Debugging fetched notifications
  
      notificationList.innerHTML = ''; // Clear old notifications
  
      if (!data.notifications || data.notifications.length === 0) {
        notificationList.innerHTML = '<li class="notification-item">No new notifications</li>';
      } else {
        data.notifications.forEach(notification => {
          const li = document.createElement('li');
          li.classList.add('notification-item');
          li.setAttribute('data-id', notification.id);
          li.innerHTML = `
            <span>${notification.message}</span>
            <small>${notification.created_at}</small>
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
      notificationCount.textContent = data.count || 0; // Update count display
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
  
      notificationItem.remove(); // Remove the notification from the list
  
      // Update count
      const count = parseInt(notificationCount.textContent, 10);
      notificationCount.textContent = Math.max(count - 1, 0); // Ensure count doesn't go below 0
  
      // Display "No new notifications" if list is empty
      if (notificationList.children.length === 0) {
        notificationList.innerHTML = '<li class="notification-item">No new notifications</li>';
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  });
  
  // Fetch notification count on page load
  fetchNotificationCount();
  
  })