// document.addEventListener('DOMContentLoaded', async () => {
//     const tourGuideId = 1; // Replace this with the dynamic tour guide ID as needed
//     const profilePicElement = document.querySelector('.profile-pic');
//     const guideNameElement = document.querySelector('.h2-guide-name span');
//     const aboutMeElement = document.querySelector('.about-me p');
//     const characteristicsList = document.querySelector('.characteristics-box .checklist');
//     const skillsList = document.querySelector('.skills-box .checklist');
//     const priceLabelElement = document.querySelector('.price-label');

//     try {
//         const response = await fetch('/update_profile_picture/');
//         const data = await response.json();

//         if (data.success) {
//             const profile = data.profile;

//             // Update profile picture
//             profilePicElement.src = profile.profile_picture;

//             // Update guide name
//             guideNameElement.textContent = profile.name;

//             // Update About Me section
//             aboutMeElement.textContent = profile.bio;

//             // Update Characteristics
//             characteristicsList.innerHTML = '';
//             profile.characteristics.forEach(characteristic => {
//                 const li = document.createElement('li');
//                 li.innerHTML = `<span class="checkmark">&#10003;</span> ${characteristic}`;
//                 characteristicsList.appendChild(li);
//             });

//             // Update Skills
//             skillsList.innerHTML = '';
//             profile.skills.forEach(skill => {
//                 const li = document.createElement('li');
//                 li.innerHTML = `<span class="checkmark">&#10003;</span> ${skill}`;
//                 skillsList.appendChild(li);
//             });

//             // Update Price
//             priceLabelElement.textContent = `₱${parseFloat(profile.price).toLocaleString()}`;
//         } else {
//             console.error("Profile not available or inactive:", data.message);
//         }
//     } catch (error) {
//         console.error("Error fetching tour guide profile:", error);
//     }
// });








// // Tourguide Form
// document.addEventListener('DOMContentLoaded', function () {
//   const footerBookBtn = document.getElementById('footer-book-btn');
//   const bookingForm = document.querySelector('.booking-form');
//   const bookingModal = document.getElementById("booking-modal");
//   const thankYouPopup = document.getElementById("thank-you-popup");
//   const closeModalButton = document.getElementById("close-modal");
//   const confirmBookingButton = document.querySelector('.confirm-btn');

//   // Form input fields
//   const dateInput = document.getElementById('date');
//   const tourTypeInput = document.getElementById('tour-type');
//   const travelerQuantityInput = document.getElementById('traveler-quantity');
//   const personalizedTourInput = document.getElementById('personalized');

//   // Modal display fields
//   const modalTourDate = document.getElementById('modal-tour-date');
//   const modalTourType = document.getElementById('modal-tour-type');
//   const modalTravelerQuantity = document.getElementById('modal-traveler-quantity');
//   const modalPersonalizedNotes = document.getElementById('modal-personalized-notes');

//   // Open the modal with form values
//   function openModal() {
//       // Check if required fields are filled
//       if (!dateInput.value) {
//           closeModal(); // Close the modal if it was open
//           alert("Please select a date.");
//           dateInput.focus(); // Redirect user to date input field
//           return; // Stop the function if date is missing
//       }
//       if (!tourTypeInput.value) {
//           closeModal();
//           alert("Please select a tour type.");
//           tourTypeInput.focus();
//           return;
//       }
//       if (!travelerQuantityInput.value) {
//           closeModal();
//           alert("Please enter the number of travelers.");
//           travelerQuantityInput.focus();
//           return;
//       }

//       // Set modal content based on input values
//       modalTourDate.textContent = dateInput.value;
//       modalTourType.textContent = tourTypeInput.options[tourTypeInput.selectedIndex].text;
//       modalTravelerQuantity.textContent = travelerQuantityInput.value;
//       modalPersonalizedNotes.textContent = personalizedTourInput.value || "N/A";

//       bookingModal.style.display = "flex";
//       document.body.style.overflow = "hidden"; // Disable background scrolling
//   }

//   confirmBookingButton.addEventListener('click', openModal);

//   // Close Modal Function
//   function closeModal() {
//       bookingModal.style.display = "none"; // Hide the modal
//       document.body.style.overflow = "auto"; // Enable background scrolling
//   }

//   // Attach event listener to close button
//   closeModalButton.addEventListener('click', closeModal);

//   // Show Thank You Popup After Confirming Booking
//   function showThankYouMessage() {
//       closeModal(); // Close the booking modal
//       thankYouPopup.style.display = "flex"; // Show thank you popup

//       // Hide the popup automatically after 3 seconds
//       setTimeout(() => {
//           thankYouPopup.style.display = "none";
//       }, 3000);
//   }

//   // Optional: Close Modal by Clicking Outside of It
//   window.onclick = function (event) {
//       if (event.target === bookingModal) {
//           closeModal();
//       }
//   };
// });


















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
  const modalTourGuideNumber = document.getElementById('modal-tour-guide-number');
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
          modalTourGuideNumber.textContent = contactData.contact_number;
          modalTourGuidePrice.textContent = `₱${contactData.price.toFixed(2)}`;
      } catch (error) {
          console.error('Error fetching tour guide contact and price:', error);
          modalTourGuideName.textContent = "Unavailable";
          modalTourGuideNumber.textContent = "Unavailable";
          modalTourGuidePrice.textContent = "Unavailable";
      }
  }

  // Populate Modal on "Book Now"
  confirmBookingButton.addEventListener('click', async function () {
      const dateValue = datePicker.value;
      const tourPackageId = tourPackageSelect.value;
      const travelerQuantity = document.getElementById('traveler-quantity').value;
      const specialNotes = document.getElementById('personalized').value;

      if (!dateValue) {
          alert("Please select a date or date range.");
          datePicker.focus();
          return;
      }
      if (!tourPackageId) {
          alert("Please select a tour package.");
          tourPackageSelect.focus();
          return;
      }

      try {
    // Fetch Package Details
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

    // Populate location
    const modalPackageLocation = document.getElementById('modal-package-location');
    modalPackageLocation.textContent = packageData.location || "Location not provided";

    // Populate estimated prices
    modalPriceList.innerHTML = '';
    packageData.estimated_prices.forEach(price => {
        const li = document.createElement('li');
        li.textContent = `${price.description}: ₱${price.estimated_price}`;
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
              li.innerHTML = `<span class="timeline-dot"></span>
                              <div class="timeline-content">
                                  <strong>${itinerary.title}:</strong> ${itinerary.subtitle}
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
          alert("Failed to load booking details. Please try again.");
      }
  });

  // Close modal
  closeModalButton.addEventListener('click', function () {
      bookingModal.classList.remove('show');
      document.body.style.overflow = "auto";
  });

  const modalConfirmButton = document.getElementById('confirm-booking-modal');
  modalConfirmButton.addEventListener('click', async function () {
      const dateRange = datePicker.value.split(" → "); // Extract start and end dates
      const tourPackageId = tourPackageSelect.value;
      const travelerQuantity = document.getElementById('traveler-quantity').value;
      const specialNotes = document.getElementById('personalized').value || '';
      const price = modalTourGuidePrice.textContent.replace('₱', '').trim();
  
      try {
          // Validate date range
          if (dateRange.length < 1 || !dateRange[0]) {
              alert("Please select a valid date or date range.");
              datePicker.focus();
              return;
          }
  
          const dateStart = dateRange[0]; // Start date
          const dateEnd = dateRange[1] || dateStart; // End date (same as start if no range selected)
  
          // Calculate duration in days (inclusive)
          const durationInDays = Math.ceil(
              (new Date(dateEnd) - new Date(dateStart)) / (1000 * 60 * 60 * 24)
          ) + 1; // Add 1 to include both start and end days
  
          console.log("Date Start:", dateStart);
          console.log("Date End:", dateEnd);
          console.log("Duration (days):", durationInDays);
  
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
  
          console.log("Booking data payload:", bookingData); // Debugging
  
          // Send booking data to the backend
          const response = await fetch('/booking/create_booking', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(bookingData),
          });
  
          console.log("Response status:", response.status);
  
          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to create booking.');
          }
  
          const responseData = await response.json();
          console.log('Booking created:', responseData);
  
          // Close modal and show thank-you popup
          bookingModal.classList.remove('show');
          document.body.style.overflow = 'auto';
          thankYouPopup.style.display = 'flex';
          setTimeout(() => {
              thankYouPopup.style.display = 'none';
          }, 3000);
      } catch (error) {
          console.error('Error confirming booking:', error);
          alert('Failed to confirm booking. Please try again.');
      }
  });
  
  

  

  // Cancel booking
  const modalCancelButton = document.getElementById('cancel-booking-modal');
  modalCancelButton.addEventListener('click', function () {
      bookingModal.classList.remove('show');
      document.body.style.overflow = "auto";
  });
});










// document.addEventListener('DOMContentLoaded', async function () {
//     const datePicker = document.getElementById('date-picker');
//     const confirmBookingButton = document.getElementById('confirm-booking-btn');
//     const bookingModal = document.getElementById('booking-modal');
//     const thankYouPopup = document.getElementById('thank-you-popup');
//     const closeModalButton = document.getElementById('close-booking-modal');
//     const tourPackageSelect = document.getElementById('tour-package-select');
//     const tourGuideId = document.querySelector('[data-tour-guide-id]').getAttribute('data-tour-guide-id');

//     // Modal elements
//     const modalTravelerName = document.getElementById('modal-traveler-name');
//     const modalTourGuideName = document.getElementById('modal-tour-guide-name');
//     const modalTourGuideNumber = document.getElementById('modal-tour-guide-number');
//     const modalTourGuidePrice = document.getElementById('modal-tour-guide-price');
//     const modalTourDate = document.getElementById('modal-tour-date');
//     const modalTravelerQuantity = document.getElementById('modal-traveler-quantity');
//     const modalSpecialNotes = document.getElementById('modal-special-notes');
//     const modalTourImage = document.getElementById('modal-tour-image');
//     const modalPackageTitle = document.getElementById('modal-package-title');
//     const modalPackageDescription = document.getElementById('modal-package-description');
//     const modalPriceList = document.getElementById('modal-price-list');
//     const modalInclusionsList = document.getElementById('modal-inclusions-list');
//     const modalExclusionsList = document.getElementById('modal-exclusions-list');
//     const modalItineraryList = document.getElementById('modal-itinerary-list');

//     // Initialize date picker with tour guide availability
//     async function initializeDatePicker() {
//         try {
//             const response = await fetch(`/tourguide/get_availability/${tourGuideId}`);
//             if (!response.ok) throw new Error('Failed to fetch availability.');
//             const availabilityData = await response.json();
//             const availableDates = availabilityData
//                 .filter(entry => entry.status === 'available')
//                 .map(entry => entry.date);

//             flatpickr(datePicker, {
//                 mode: "range",
//                 dateFormat: "Y-m-d",
//                 altInput: true,
//                 altFormat: "M. j, Y",
//                 minDate: "today",
//                 enable: availableDates,
//                 locale: { rangeSeparator: " → " },
//                 onChange: function (selectedDates, dateStr) {
//                     console.log("Selected Dates:", selectedDates);
//                     console.log("Formatted Dates:", dateStr);
//                 },
//             });
//         } catch (error) {
//             console.error('Error initializing date picker:', error);
//         }
//     }

//     await initializeDatePicker();

//     // Fetch traveler information
//     async function fetchTravelerInfo() {
//         try {
//             const response = await fetch('/traveler_info');
//             if (!response.ok) throw new Error('Failed to fetch traveler information.');
//             const travelerData = await response.json();
//             modalTravelerName.textContent = travelerData.name;
//         } catch (error) {
//             console.error('Error fetching traveler info:', error);
//             modalTravelerName.textContent = "Unavailable";
//         }
//     }

//     // Fetch tour guide contact information and price
//     async function fetchTourGuideContactAndPrice() {
//         try {
//             const response = await fetch(`/tourguide/get_contact/${tourGuideId}`);
//             if (!response.ok) throw new Error('Failed to fetch tour guide contact and price.');
//             const contactData = await response.json();
//             modalTourGuideName.textContent = contactData.name;
//             modalTourGuideNumber.textContent = contactData.contact_number;
//             modalTourGuidePrice.textContent = `₱${contactData.price.toFixed(2)}`;
//         } catch (error) {
//             console.error('Error fetching tour guide contact and price:', error);
//             modalTourGuideName.textContent = "Unavailable";
//             modalTourGuideNumber.textContent = "Unavailable";
//             modalTourGuidePrice.textContent = "Unavailable";
//         }
//     }

//     // Populate modal on "Book Now"
//     confirmBookingButton.addEventListener('click', async function () {
//         const dateValue = datePicker.value;
//         const tourPackageId = tourPackageSelect.value;
//         const travelerQuantity = document.getElementById('traveler-quantity').value;
//         const specialNotes = document.getElementById('personalized').value;

//         if (!dateValue || !tourPackageId || !travelerQuantity) {
//             alert("Please fill all required fields.");
//             return;
//         }

//         try {
//             // Fetch package details
//             const packageDetailsResponse = await fetch(`/tour_package/details/${tourPackageId}`);
//             if (!packageDetailsResponse.ok) throw new Error("Failed to fetch package details.");
//             const packageData = await packageDetailsResponse.json();

//             // Populate modal
//             modalTourDate.textContent = dateValue;
//             modalTravelerQuantity.textContent = travelerQuantity;
//             modalSpecialNotes.textContent = specialNotes || "N/A";
//             modalTourImage.src = `/static/${packageData.package_img || "default.jpg"}`;
//             modalPackageTitle.textContent = packageData.name;
//             modalPackageDescription.textContent = packageData.description;

//             modalPriceList.innerHTML = '';
//             packageData.estimated_prices.forEach(price => {
//                 const li = document.createElement('li');
//                 li.textContent = `${price.description}: ₱${price.estimated_price}`;
//                 modalPriceList.appendChild(li);
//             });

//             modalInclusionsList.innerHTML = '';
//             packageData.inclusions.forEach(inclusion => {
//                 const li = document.createElement('li');
//                 li.innerHTML = `<span class="checkmark">&#10003;</span> ${inclusion.inclusion}`;
//                 modalInclusionsList.appendChild(li);
//             });

//             modalExclusionsList.innerHTML = '';
//             packageData.exclusions.forEach(exclusion => {
//                 const li = document.createElement('li');
//                 li.innerHTML = `<span class="crossmark">&#10007;</span> ${exclusion.exclusion}`;
//                 modalExclusionsList.appendChild(li);
//             });

//             modalItineraryList.innerHTML = '';
//             packageData.itineraries.forEach(itinerary => {
//                 const li = document.createElement('li');
//                 li.innerHTML = `<span class="timeline-dot"></span>
//                                 <div class="timeline-content">
//                                     <strong>${itinerary.title}:</strong> ${itinerary.subtitle}
//                                 </div>`;
//                 modalItineraryList.appendChild(li);
//             });

//             await fetchTravelerInfo();
//             await fetchTourGuideContactAndPrice();

//             // Show modal
//             bookingModal.classList.add('show');
//             document.body.style.overflow = "hidden";
//         } catch (error) {
//             console.error("Error populating modal:", error);
//             alert("Failed to load booking details.");
//         }
//     });

//     // Close modal
//     closeModalButton.addEventListener('click', function () {
//         bookingModal.classList.remove('show');
//         document.body.style.overflow = "auto";
//     });

//     // Confirm booking
//     const modalConfirmButton = document.getElementById('confirm-booking-modal');
//     modalConfirmButton.addEventListener('click', async function () {
//         // Booking process logic
//     });

//     // Cancel booking
//     const modalCancelButton = document.getElementById('cancel-booking-modal');
//     modalCancelButton.addEventListener('click', function () {
//         bookingModal.classList.remove('show');
//         document.body.style.overflow = "auto";
//     });
// });


































// document.addEventListener("DOMContentLoaded", function () {
//     const modalConfirmButton = document.getElementById('confirm-booking-modal');

//     modalConfirmButton.addEventListener('click', async function () {
//         const tourGuideId = document.querySelector('[data-tour-guide-id]').getAttribute('data-tour-guide-id');
//         const tourPackageId = document.getElementById('tour-package-select').value;
//         const travelerQuantity = document.getElementById('traveler-quantity').value;
//         const specialNotes = document.getElementById('personalized').value || '';
//         const dateStart = document.getElementById('date-picker').value;

//         try {
//             const response = await fetch('/booking/create', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     tour_guide_id: tourGuideId,
//                     package_id: tourPackageId,
//                     traveler_quantity: travelerQuantity,
//                     special_notes: specialNotes,
//                     date_start: dateStart
//                 })
//             });

//             const result = await response.json();
//             if (response.ok) {
//                 alert(result.message);
//                 location.reload(); // Reload to show the updated bookings
//             } else {
//                 alert(result.error || "Failed to create booking.");
//             }
//         } catch (error) {
//             console.error("Error confirming booking:", error);
//         }
//     });
// });

// document.addEventListener('DOMContentLoaded', async function () {
//     const datePicker = document.getElementById('date-picker');
//     const confirmBookingButton = document.getElementById('confirm-booking-btn');
//     const bookingModal = document.getElementById('booking-modal');
//     const thankYouPopup = document.getElementById('thank-you-popup');
//     const closeModalButton = document.getElementById('close-booking-modal');
//     const tourPackageSelect = document.getElementById('tour-package-select');
//     const tourGuideId = document.querySelector('[data-tour-guide-id]').getAttribute('data-tour-guide-id');

//     // Modal elements
//     const modalTravelerName = document.getElementById('modal-traveler-name');
//     const modalTourGuideName = document.getElementById('modal-tour-guide-name');
//     const modalTourGuideNumber = document.getElementById('modal-tour-guide-number');
//     const modalTourDate = document.getElementById('modal-tour-date');
//     const modalTravelerQuantity = document.getElementById('modal-traveler-quantity');
//     const modalSpecialNotes = document.getElementById('modal-special-notes');
//     const modalTourImage = document.getElementById('modal-tour-image');
//     const modalPackageTitle = document.getElementById('modal-package-title');
//     const modalPackageDescription = document.getElementById('modal-package-description');
//     const modalPriceList = document.getElementById('modal-price-list');
//     const modalInclusionsList = document.getElementById('modal-inclusions-list');
//     const modalExclusionsList = document.getElementById('modal-exclusions-list');
//     const modalItineraryList = document.getElementById('modal-itinerary-list');

//     const modalConfirmButton = document.createElement('button');
//     modalConfirmButton.id = 'confirm-booking-modal';
//     modalConfirmButton.textContent = 'Confirm Booking';
//     modalConfirmButton.className = 'primary-btn';

//     const modalCancelButton = document.createElement('button');
//     modalCancelButton.id = 'cancel-booking-modal';
//     modalCancelButton.textContent = 'Cancel';
//     modalCancelButton.className = 'secondary-btn';

//     bookingModal.querySelector('.modal-content').appendChild(modalConfirmButton);
//     bookingModal.querySelector('.modal-content').appendChild(modalCancelButton);

//     if (!tourGuideId) {
//         console.error("Tour Guide ID not found.");
//         return;
//     }

//     // Fetch and initialize tour guide availability
//     try {
//         const availabilityResponse = await fetch(`/tourguide/get_availability/${tourGuideId}`);
//         if (!availabilityResponse.ok) throw new Error(`Failed to fetch availability for Tour Guide ID: ${tourGuideId}`);
//         const availabilityData = await availabilityResponse.json();

//         const availableDates = availabilityData
//             .filter(entry => entry.status === 'available')
//             .map(entry => entry.date);

//         flatpickr(datePicker, {
//             mode: "range",
//             dateFormat: "Y-m-d",
//             altInput: true,
//             altFormat: "M. j, Y",
//             minDate: "today",
//             enable: availableDates,
//             locale: {
//                 rangeSeparator: " → ",
//             },
//         });
//     } catch (error) {
//         console.error("Error fetching availability:", error);
//     }

//     // Populate tour packages for the selected guide
//     try {
//         const packageResponse = await fetch(`/api/tour_guide/${tourGuideId}/packages`);
//         if (!packageResponse.ok) throw new Error('Failed to fetch tour packages.');
//         const packageData = await packageResponse.json();

//         tourPackageSelect.innerHTML = '<option value="" disabled selected>Select Tour Package</option>';
//         packageData.tour_packages.forEach(pkg => {
//             const option = document.createElement('option');
//             option.value = pkg.id;
//             option.textContent = pkg.name;
//             tourPackageSelect.appendChild(option);
//         });
//     } catch (error) {
//         console.error('Error fetching tour packages:', error);
//     }

//     // Show confirmation modal with details
//     confirmBookingButton.addEventListener('click', async function () {
//         const dateValue = datePicker.value;
//         const tourPackageId = tourPackageSelect.value;
//         const travelerQuantity = document.getElementById('traveler-quantity').value;
//         const specialNotes = document.getElementById('personalized').value;

//         if (!dateValue) {
//             alert("Please select a date or date range.");
//             datePicker.focus();
//             return;
//         }
//         if (!tourPackageId) {
//             alert("Please select a tour package.");
//             tourPackageSelect.focus();
//             return;
//         }

//         try {
//             const packageDetailsResponse = await fetch(`/tour_package/details/${tourPackageId}`);
//             if (!packageDetailsResponse.ok) throw new Error("Failed to fetch package details.");
//             const packageData = await packageDetailsResponse.json();

//             // Populate modal with booking details
//             modalTravelerName.textContent = "John Doe"; // Replace with actual traveler name from session/user data
//             modalTourGuideName.textContent = document.getElementById('full-name').textContent;
//             modalTourGuideNumber.textContent = "09223550501"; // Replace with actual guide number
//             modalTourDate.textContent = dateValue;
//             modalTravelerQuantity.textContent = travelerQuantity;
//             modalSpecialNotes.textContent = specialNotes || "N/A";

//             // Populate package details
//             modalTourImage.src = `/static/${packageData.package_img || "default.jpg"}`;
//             modalPackageTitle.textContent = packageData.name;
//             modalPackageDescription.textContent = packageData.description;

//             modalPriceList.innerHTML = '';
//             packageData.estimated_prices.forEach(price => {
//                 const li = document.createElement('li');
//                 li.textContent = `${price.description}: ₱${price.estimated_price}`;
//                 modalPriceList.appendChild(li);
//             });

//             modalInclusionsList.innerHTML = '';
//             packageData.inclusions.forEach(inclusion => {
//                 const li = document.createElement('li');
//                 li.innerHTML = `<span class="checkmark">&#10003;</span> ${inclusion.inclusion}`;
//                 modalInclusionsList.appendChild(li);
//             });

//             modalExclusionsList.innerHTML = '';
//             packageData.exclusions.forEach(exclusion => {
//                 const li = document.createElement('li');
//                 li.innerHTML = `<span class="crossmark">&#10007;</span> ${exclusion.exclusion}`;
//                 modalExclusionsList.appendChild(li);
//             });

//             modalItineraryList.innerHTML = '';
//             packageData.itineraries.forEach(itinerary => {
//                 const li = document.createElement('li');
//                 li.innerHTML = `<span class="timeline-dot"></span>
//                                 <div class="timeline-content">
//                                     <strong>${itinerary.title}:</strong> ${itinerary.subtitle}
//                                 </div>`;
//                 modalItineraryList.appendChild(li);
//             });

//             bookingModal.classList.add('show');
//             document.body.style.overflow = "hidden";
//         } catch (error) {
//             console.error("Error fetching package details or showing modal:", error);
//         }
//     });

//     // Close modal
//     closeModalButton.addEventListener('click', function () {
//         bookingModal.classList.remove('show');
//         document.body.style.overflow = "auto";
//     });

//     // Confirm booking and show thank-you popup
//     modalConfirmButton.addEventListener('click', function () {
//         bookingModal.classList.remove('show');
//         document.body.style.overflow = "auto";
//         thankYouPopup.style.display = "flex";
//         setTimeout(() => {
//             thankYouPopup.style.display = "none";
//         }, 3000);
//     });

//     // Cancel booking
//     modalCancelButton.addEventListener('click', function () {
//         bookingModal.classList.remove('show');
//         document.body.style.overflow = "auto";
//     });
// });

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

      // Filter available dates from the response
      const availableDates = availabilityData
          .filter(entry => entry.status === 'available')
          .map(entry => entry.date);

      // Initialize the Flatpickr date picker with only the available dates enabled
      flatpickr(datePicker, {
          mode: "range", // Allows range selection
          dateFormat: "Y-m-d", // Format for submission
          altInput: true, // Enables an alternative display format
          altFormat: "M. j, Y", // Readable format for users
          minDate: "today", // Disable past dates
          enable: availableDates, // Restrict selection to available dates
          locale: {
              rangeSeparator: " → ", // Separator between start and end dates
          },
          onChange: function (selectedDates, dateStr, instance) {
              // Date selection validation
              if (selectedDates.length === 2) {
                  const startDate = selectedDates[0];
                  const endDate = selectedDates[1];

                  console.log("Start Date:", startDate);
                  console.log("End Date:", endDate);

                  if (startDate > endDate) {
                      alert("Invalid date range. End date cannot be before start date.");
                      instance.clear(); // Clear the selection
                  }
              } else if (selectedDates.length === 1) {
                  console.log("Single-day booking selected:", selectedDates[0]);
              }
          }
      });
  } catch (error) {
      console.error("Error fetching or processing availability data:", error);
  }
});


// document.addEventListener('DOMContentLoaded', () => {
//     const bookingModal = document.getElementById('booking-modal');
//     const closeBookingModalBtn = document.getElementById('close-booking-modal');

//     const openModal = async () => {
//       const travelerName = 'John Doe'; // Replace with logged-in traveler details
//       const dateInput = document.getElementById('date').value;
//       const tourTypeInput = document.getElementById('tour-type').value;
//       const travelerQuantity = document.getElementById('traveler-quantity').value;
//       const personalizedNotes = document.getElementById('personalized').value;

//       const tourGuideId = window.location.pathname.split('/').pop(); // Extract ID from URL

//       try {
//         // Fetch tour guide and tour package details
//         const guideResponse = await fetch(`/tourguide/profile/${tourGuideId}`);
//         const guideData = await guideResponse.json();

//         const packageResponse = await fetch(`/tour_package/details/${tourTypeInput}`);
//         const packageData = await packageResponse.json();

//         // Populate Traveler Info
//         document.getElementById('modal-traveler-name').textContent = travelerName;
//         document.getElementById('modal-tour-guide-name').textContent = guideData.name;
//         document.getElementById('modal-tour-guide-number').textContent = guideData.contact_number;
//         document.getElementById('modal-tour-date').textContent = dateInput;
//         document.getElementById('modal-traveler-quantity').textContent = travelerQuantity;
//         document.getElementById('modal-special-notes').textContent = personalizedNotes || 'N/A';

//         // Populate Package Details
//         document.getElementById('modal-tour-image').src = `/static/${packageData.package_img}`;
//         document.getElementById('modal-package-title').textContent = packageData.name;
//         document.getElementById('modal-package-location').textContent = packageData.location || 'Location not provided';
//         document.getElementById('modal-package-description').textContent = packageData.description;

//         // Estimated Prices
//         const priceList = document.getElementById('modal-price-list');
//         priceList.innerHTML = '';
//         packageData.estimated_prices.forEach(price => {
//           const li = document.createElement('li');
//           li.textContent = `${price.description}: $${price.estimated_price}`;
//           priceList.appendChild(li);
//         });

//         // Inclusions
//         const inclusionsList = document.getElementById('modal-inclusions-list');
//         inclusionsList.innerHTML = '';
//         packageData.inclusions.forEach(inclusion => {
//           const li = document.createElement('li');
//           li.innerHTML = `<span class="checkmark">&#10003;</span> ${inclusion}`;
//           inclusionsList.appendChild(li);
//         });

//         // Exclusions
//         const exclusionsList = document.getElementById('modal-exclusions-list');
//         exclusionsList.innerHTML = '';
//         packageData.exclusions.forEach(exclusion => {
//           const li = document.createElement('li');
//           li.innerHTML = `<span class="crossmark">&#10007;</span> ${exclusion}`;
//           exclusionsList.appendChild(li);
//         });

//         // Itinerary
//         const itineraryList = document.getElementById('modal-itinerary-list');
//         itineraryList.innerHTML = '';
//         packageData.itinerary.forEach(item => {
//           const li = document.createElement('li');
//           li.innerHTML = `
//             <span class="timeline-dot"></span>
//             <div class="timeline-content">
//               <strong>${item.title}:</strong>
//               <p>${item.subtitle}</p>
//             </div>`;
//           itineraryList.appendChild(li);
//         });

//         // Show the modal
//         bookingModal.classList.add('show');
//       } catch (error) {
//         console.error('Error fetching booking details:', error);
//         alert('Failed to load booking details. Please try again.');
//       }
//     };

//     const closeModal = () => {
//       bookingModal.classList.remove('show');
//     };

//     // Attach event listeners
//     document.querySelector('.confirm-btn').addEventListener('click', openModal);
//     closeBookingModalBtn.addEventListener('click', closeModal);
//   });






// //  Traveler Calendar
// document.addEventListener('DOMContentLoaded', async function () {
//   const dateInput = document.getElementById('date');
//   const tourGuideId = 31 // Replace with actual ID or set dynamically based on selection

//   if (!dateInput) {
//       console.error("Date input field not found for Flatpickr initialization.");
//       return;
//   }

//   try {
//       const response = await fetch(`/tourguide/get_availability/${tourGuideId}`);
//       if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

//       const availabilityData = await response.json();
//       console.log("Fetched availability data:", availabilityData);

//       const availableDates = availabilityData
//           .filter(entry => entry.status === 'available')
//           .map(entry => entry.date);

//       flatpickr(dateInput, {
//           dateFormat: 'Y-m-d',
//           minDate: "today",
//           enable: availableDates,
//           onDayCreate: function (dObj, dStr, fp, dayElem) {
//               const dateStr = dayElem.dateObj.toISOString().split('T')[0];
//               if (availableDates.includes(dateStr)) {
//                   dayElem.style.backgroundColor = '#4ecdc4';
//                   dayElem.style.color = 'white';
//                   dayElem.style.borderRadius = '50%';
//               }
//           }
//       });
//   } catch (error) {
//       console.error('Error fetching availability:', error);
//   }
// });


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




// document.addEventListener('DOMContentLoaded', function () {
//     const tourGuideId = document.getElementById('tour-guide-id').value; // Hidden field containing tour guide ID
//     const tourPackageSelect = document.getElementById('tour-package-select');

//     fetch(`/api/tour_guide/${tourGuideId}/packages`) // New API endpoint for packages
//         .then(response => response.json())
//         .then(data => {
//             // Populate dropdown
//             tourPackageSelect.innerHTML = '<option value="" disabled selected>Select Tour Package</option>';
//             data.tour_packages.forEach(package => {
//                 const option = document.createElement('option');
//                 option.value = package.id;
//                 option.textContent = package.name;
//                 tourPackageSelect.appendChild(option);
//             });
//         })
//         .catch(error => console.error('Error fetching tour packages:', error));
// });



// document.addEventListener('DOMContentLoaded', function () {
//     const datePicker = document.getElementById('date-picker');

//     flatpickr(datePicker, {
//         mode: "range", // Use "single" for single date or "range" for date range
//         dateFormat: "Y-m-d", // This is the value sent to the server
//         altInput: true, // Enables an alternative input display
//         altFormat: "M. j, Y", // Format for display in the input
//         minDate: "today", // Disable past dates
//         defaultDate: null, // Optional: Pre-fill dates
//         locale: {
//             rangeSeparator: " → ", // Replaces "to" with an arrow
//         },
//         onChange: function(selectedDates, dateStr, instance) {
//             console.log("Selected Dates:", selectedDates);
//             console.log("Formatted Date(s):", dateStr); // This will still be in "Y-m-d" format
//         },
//     });
// });
