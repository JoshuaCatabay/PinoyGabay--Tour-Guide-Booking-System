console.log('Admin Dashboard Loaded Successfully!');

// Ensure everything runs after DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded.");

    // --- Sidebar Toggle Logic ---
    const sidebarToggle = document.querySelector('.btn-sidebar-toggle');
    const sideNav = document.querySelector('.side-nav');

    if (sidebarToggle && sideNav) {
        sidebarToggle.addEventListener('click', () => {
            sideNav.classList.toggle('active');
        });
    }

    // --- Tab Switching Logic ---
    const navLinks = document.querySelectorAll('.nav-link');
    const tabPanes = document.querySelectorAll('.tab-pane');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default anchor behavior

            // Remove 'active' class from all links and tabs
            navLinks.forEach(link => link.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            // Activate clicked link and its corresponding tab pane
            link.classList.add('active');
            const targetTab = document.getElementById(link.dataset.tab);
            if (targetTab) targetTab.classList.add('active');

            // Close sidebar on smaller screens after switching tabs
            if (window.innerWidth < 768) {
                sideNav.classList.remove('active');
            }
        });
    });

    // Ensure the correct tab is shown on page load
    const activeLink = document.querySelector('.nav-link.active');
    if (activeLink) {
        const targetTab = document.getElementById(activeLink.dataset.tab);
        if (targetTab) targetTab.classList.add('active');
    }

    // --- Modal Logic ---
    const addOperatorBtn = document.getElementById('add-operator-btn');
    const operatorModalWrapper = document.getElementById('operator-modal-wrapper');
    const closeOperatorModal = document.getElementById('close-operator-modal');
    const modalOverlay = document.getElementById('modal-overlay');

    // Open Modal
    if (addOperatorBtn && operatorModalWrapper) {
        addOperatorBtn.addEventListener('click', () => {
            operatorModalWrapper.classList.add('show');
        });
    }

    // Close Modal
    [closeOperatorModal, modalOverlay].forEach(element => {
        if (element && operatorModalWrapper) {
            element.addEventListener('click', () => {
                operatorModalWrapper.classList.remove('show');
            });
        }
    });




// Wait for DOM Content to load
window.addEventListener("DOMContentLoaded", () => {
    // --- Modal Logic ---
    const addOperatorBtn = document.getElementById("add-operator-btn");
    const operatorModalWrapper = document.getElementById("operator-modal-wrapper");
    const closeOperatorModal = document.getElementById("close-operator-modal");
    const modalOverlay = document.getElementById("modal-overlay");
  
    // Open Modal
    if (addOperatorBtn && operatorModalWrapper) {
      addOperatorBtn.addEventListener("click", () => {
        operatorModalWrapper.classList.add("show");
      });
    }
  
    // Close Modal
    [closeOperatorModal, modalOverlay].forEach((element) => {
      if (element && operatorModalWrapper) {
        element.addEventListener("click", () => {
          operatorModalWrapper.classList.remove("show");
        });
      }
    });
  
    // --- Form Validation and Submission ---
    const operatorForm = document.getElementById("operator-form");
  
    if (operatorForm) {
      operatorForm.addEventListener("submit", (e) => {
        e.preventDefault(); // Prevent default form submission
  
        // Fetch form fields
        const nameInput = operatorForm.querySelector('input[name="name"]');
        const municipalInput = operatorForm.querySelector('input[name="municipal"]');
        const emailInput = operatorForm.querySelector('input[name="email"]');
        const contactNumberInput = operatorForm.querySelector(
          'input[name="contact_number"]'
        );
        const passwordInput = operatorForm.querySelector('input[name="password"]');
        const confirmPasswordInput = operatorForm.querySelector(
          'input[name="confirm_password"]'
        );
  
        let isValid = true;
  
        // --- Validation Logic ---
        if (!isValidName(nameInput.value)) {
          isValid = false;
          showToast("Name must only contain letters.", "error");
          nameInput.focus();
          return;
        }
  
        if (!isValidName(municipalInput.value)) {
          isValid = false;
          showToast("Municipal must only contain letters.", "error");
          municipalInput.focus();
          return;
        }
  
        if (!isValidEmail(emailInput.value)) {
          isValid = false;
          showToast("Enter a valid email address.", "error");
          emailInput.focus();
          return;
        }
  
        if (!isValidContactNumber(contactNumberInput.value)) {
          isValid = false;
          showToast("Contact number must be 11 digits.", "error");
          contactNumberInput.focus();
          return;
        }
  
        const passwordValidation = isValidPassword(passwordInput.value);
        if (passwordValidation) {
          isValid = false;
          showToast(passwordValidation, "error");
          passwordInput.focus();
          return;
        }
  
        if (passwordInput.value !== confirmPasswordInput.value) {
          isValid = false;
          showToast("Passwords do not match.", "error");
          confirmPasswordInput.focus();
          return;
        }
  
        // --- Form Submission ---
        if (isValid) {
          showToast(
            `Tour Operator Account Created Successfully! Check email for verification!`,
            "success"
          );
  
          // Close the modal
          operatorModalWrapper.classList.remove("show");
  
          // Submit the form programmatically
          setTimeout(() => {
            operatorForm.submit();
          }, 300); // Allow time for the toast to show
        }
      });
    }
  
    // --- Validation Functions ---
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
      if (password.length < 8)
        return "Password must be at least 8 characters long.";
      if (!/[A-Z]/.test(password))
        return "Password must contain at least one uppercase letter.";
      if (!/[a-z]/.test(password))
        return "Password must contain at least one lowercase letter.";
      if (!/[0-9]/.test(password))
        return "Password must contain at least one number.";
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
        return "Password must contain at least one special character.";
      return "";
    }
  });
}  )






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


