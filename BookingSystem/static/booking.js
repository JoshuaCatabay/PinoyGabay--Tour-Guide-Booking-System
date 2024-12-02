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
  
        // Update the rating and total tours display
        const ratingDisplay = `
            <span class="star-icon">★</span>
            <span class="rating-value">${guide.average_rating || 0}</span>
            <span class="review-count">(${guide.review_count || 0})</span>
            <span class="separator">|</span>
            <span class="total-tours">${guide.total_tours || 0} <span class="tours">Tours</span></span>
        `;
  
        // Render the tour guide card
        guideCard.innerHTML = `
            <div class="profile-picture">
                <img src="${guide.profile_picture}" alt="Tour Guide Profile Picture">
            </div>
            <div class="guide-info">
                <h2 class="guide-name">Mabuhay! I Am <span>${guide.name}</span>, Your Friendly Tour Guide</h2>
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