// Aurielle Solutions - Main JavaScript

// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileToggle = document.getElementById('mobileToggle');
    const mainNav = document.getElementById('mainNav');
    
    if (mobileToggle && mainNav) {
        mobileToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!mobileToggle.contains(event.target) && !mainNav.contains(event.target)) {
                mainNav.classList.remove('active');
            }
        });
    }
    
    // Load dynamic content from Supabase
    loadPageContent();
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Load page content from Supabase
async function loadPageContent() {
    if (typeof supabase === 'undefined') {
        console.log('Supabase not configured yet');
        return;
    }
    
    try {
        const currentPage = getCurrentPage();
        
        // Fetch content for current page
        const { data, error } = await supabase
            .from('site_content')
            .select('*')
            .eq('page', currentPage)
            .order('display_order', { ascending: true });
        
        if (error) throw error;
        
        // Update page elements with content from database
        if (data && data.length > 0) {
            data.forEach(item => {
                const element = document.getElementById(item.section);
                if (element) {
                    if (item.content_type === 'text') {
                        element.textContent = item.content;
                    } else if (item.content_type === 'html') {
                        element.innerHTML = item.content;
                    } else if (item.content_type === 'image' && item.image_url) {
                        element.src = item.image_url;
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error loading page content:', error);
    }
}

// Get current page name
function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop().replace('.html', '') || 'index';
    return page;
}

// Form validation helper
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\d\s\-\(\)]+$/;
    return phone.length >= 10 && re.test(phone);
}

// Show error message
function showError(element, message) {
    const errorElement = element.nextElementSibling;
    if (errorElement && errorElement.classList.contains('form-error')) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
    element.style.borderColor = 'var(--color-error)';
}

// Clear error message
function clearError(element) {
    const errorElement = element.nextElementSibling;
    if (errorElement && errorElement.classList.contains('form-error')) {
        errorElement.style.display = 'none';
    }
    element.style.borderColor = 'var(--color-gray-light)';
}

// Add input listeners to clear errors on focus
document.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(input => {
    input.addEventListener('focus', function() {
        clearError(this);
    });
});