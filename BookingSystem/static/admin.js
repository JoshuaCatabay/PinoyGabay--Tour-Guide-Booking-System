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

    // --- Form Submission Logic ---
    const operatorForm = document.getElementById('operator-form');

    if (operatorForm) {
        operatorForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent default form submission for custom handling

            // Fetch the operator's name from the form input
            const operatorNameInput = operatorForm.querySelector('input[name="name"]');
            const operatorName = operatorNameInput ? operatorNameInput.value : "Tour Operator";

            // Show success toast message with the operator's name
            showToast(`Tour Operator Account Created Successfully! Welcome, ${operatorName}!`, 'success');

            // Close the modal
            operatorModalWrapper.classList.remove('show');

            // Submit the form programmatically
            setTimeout(() => {
                operatorForm.submit(); // Delay the submission to mimic alert effect
            }, 300); // Half-second delay to ensure toast is displayed
        });
    }
    })

    if (operatorForm) {
        operatorForm.addEventListener("submit", (e) => {
            e.preventDefault(); // Prevent default form submission

            // Fetch password and confirm password inputs
            const passwordInput = operatorForm.querySelector('input[name="password"]');
            const confirmPasswordInput = operatorForm.querySelector('input[name="confirm_password"]');
            const operatorNameInput = operatorForm.querySelector('input[name="name"]');

            const password = passwordInput ? passwordInput.value.trim() : "";
            const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value.trim() : "";
            const operatorName = operatorNameInput ? operatorNameInput.value.trim() : "Tour Operator";

            // Validate the form
            let errorMessage = "";

            // Password validation rules
            if (!password || !confirmPassword) {
                errorMessage = "Password and Confirm Password fields cannot be empty.";
            } else if (password !== confirmPassword) {
                errorMessage = "Passwords do not match. Please try again.";
            } else if (password.length < 8) {
                errorMessage = "Password must be at least 8 characters long.";
            } else if (!/[A-Z]/.test(password)) {
                errorMessage = "Password must contain at least one uppercase letter.";
            } else if (!/[a-z]/.test(password)) {
                errorMessage = "Password must contain at least one lowercase letter.";
            } else if (!/[0-9]/.test(password)) {
                errorMessage = "Password must contain at least one number.";
            }

            if (errorMessage) {
                alert(errorMessage);
                if (passwordInput) passwordInput.focus();
                return; // Stop further execution if validation fails
            }

            // If validation passes, show success alert
            alert(`Tour Operator Account Created Successfully! Welcome, ${operatorName}!`);

            // Close the modal
            operatorModalWrapper.classList.remove("show");

            // Programmatically submit the form after a short delay
            setTimeout(() => {
                operatorForm.submit();
            }, 500); // Half-second delay to mimic alert effect
        });
    }