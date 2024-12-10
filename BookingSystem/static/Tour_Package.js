document.addEventListener('DOMContentLoaded', () => {
    const viewPackageBtn = document.getElementById('view-package-btn');
    const modal = document.getElementById('tour-package-modal');
    const overlay = document.getElementById('modal-overlay');
    const closeModalBtn = document.getElementById('close-modal');

    viewPackageBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
        overlay.classList.remove('hidden');
    });

    closeModalBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        overlay.classList.add('hidden');
    });

    overlay.addEventListener('click', () => {
        modal.classList.add('hidden');
        overlay.classList.add('hidden');
    });
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
    
    
    
    
    