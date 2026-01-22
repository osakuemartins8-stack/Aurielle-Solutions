// Aurielle Solutions - Forms JavaScript

// Referral Form Handler
const referralForm = document.getElementById('referralForm');
if (referralForm) {
    referralForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate form
        if (!validateReferralForm()) {
            return;
        }
        
        // Get form data
        const formData = {
            agency_name: document.getElementById('agencyName').value,
            agency_contact_name: document.getElementById('agencyContactName').value,
            agency_email: document.getElementById('agencyEmail').value,
            agency_phone: document.getElementById('agencyPhone').value,
            client_first_name: document.getElementById('clientFirstName').value,
            client_last_name: document.getElementById('clientLastName').value,
            client_dob: document.getElementById('clientDOB').value || null,
            client_phone: document.getElementById('clientPhone').value || null,
            client_email: document.getElementById('clientEmail').value || null,
            current_housing_status: document.getElementById('housingStatus').value,
            services_needed: document.getElementById('servicesNeeded').value,
            additional_info: document.getElementById('additionalInfo').value || null,
            consent_given: document.getElementById('consent').checked,
            status: 'new'
        };
        
        // Submit to Supabase
        try {
            const submitButton = referralForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Submitting...';
            
            const { data, error } = await supabase
                .from('referrals')
                .insert([formData]);
            
            if (error) throw error;
            
            // Show success message
            document.getElementById('referralSuccess').style.display = 'block';
            referralForm.reset();
            
            // Scroll to success message
            document.getElementById('referralSuccess').scrollIntoView({ behavior: 'smooth' });
            
            submitButton.disabled = false;
            submitButton.textContent = 'Submit Referral';
        } catch (error) {
            console.error('Error submitting referral:', error);
            alert('There was an error submitting your referral. Please try again or contact us directly.');
            const submitButton = referralForm.querySelector('button[type="submit"]');
            submitButton.disabled = false;
            submitButton.textContent = 'Submit Referral';
        }
    });
}

// Client Intake Form Handler
const intakeForm = document.getElementById('intakeForm');
if (intakeForm) {
    intakeForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate form
        if (!validateIntakeForm()) {
            return;
        }
        
        // Get selected services
        const servicesCheckboxes = document.querySelectorAll('input[name="services"]:checked');
        const services = Array.from(servicesCheckboxes).map(cb => cb.value).join(', ');
        
        // Get form data
        const formData = {
            first_name: document.getElementById('firstName').value,
            last_name: document.getElementById('lastName').value,
            dob: document.getElementById('dob').value || null,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value || null,
            safe_contact_method: document.getElementById('safeContact').value,
            current_housing_status: document.getElementById('currentHousingStatus').value,
            housing_needs: document.getElementById('housingNeeds').value,
            household_size: document.getElementById('householdSize').value ? parseInt(document.getElementById('householdSize').value) : null,
            has_children: document.getElementById('hasChildren').value === 'yes',
            income_range: document.getElementById('incomeRange').value || null,
            employment_status: document.getElementById('employmentStatus').value || null,
            services_interested: services || null,
            additional_info: document.getElementById('additionalInfo').value || null,
            consent_given: document.getElementById('consent').checked,
            status: 'new'
        };
        
        // Submit to Supabase
        try {
            const submitButton = intakeForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Submitting...';
            
            const { data, error } = await supabase
                .from('client_intake')
                .insert([formData]);
            
            if (error) throw error;
            
            // Show success message
            document.getElementById('intakeSuccess').style.display = 'block';
            intakeForm.reset();
            
            // Scroll to success message
            document.getElementById('intakeSuccess').scrollIntoView({ behavior: 'smooth' });
            
            submitButton.disabled = false;
            submitButton.textContent = 'Submit Request';
        } catch (error) {
            console.error('Error submitting intake:', error);
            alert('There was an error submitting your request. Please try again or contact us directly.');
            const submitButton = intakeForm.querySelector('button[type="submit"]');
            submitButton.disabled = false;
            submitButton.textContent = 'Submit Request';
        }
    });
}

// Validation Functions
function validateReferralForm() {
    let isValid = true;
    
    // Agency Name
    const agencyName = document.getElementById('agencyName');
    if (!agencyName.value.trim()) {
        showError(agencyName, 'Please enter your agency name');
        isValid = false;
    }
    
    // Agency Contact Name
    const agencyContactName = document.getElementById('agencyContactName');
    if (!agencyContactName.value.trim()) {
        showError(agencyContactName, 'Please enter your name');
        isValid = false;
    }
    
    // Agency Email
    const agencyEmail = document.getElementById('agencyEmail');
    if (!validateEmail(agencyEmail.value)) {
        showError(agencyEmail, 'Please enter a valid email address');
        isValid = false;
    }
    
    // Agency Phone
    const agencyPhone = document.getElementById('agencyPhone');
    if (!validatePhone(agencyPhone.value)) {
        showError(agencyPhone, 'Please enter a valid phone number');
        isValid = false;
    }
    
    // Client First Name
    const clientFirstName = document.getElementById('clientFirstName');
    if (!clientFirstName.value.trim()) {
        showError(clientFirstName, 'Required field');
        isValid = false;
    }
    
    // Client Last Name
    const clientLastName = document.getElementById('clientLastName');
    if (!clientLastName.value.trim()) {
        showError(clientLastName, 'Required field');
        isValid = false;
    }
    
    // Housing Status
    const housingStatus = document.getElementById('housingStatus');
    if (!housingStatus.value) {
        showError(housingStatus, 'Please select housing status');
        isValid = false;
    }
    
    // Services Needed
    const servicesNeeded = document.getElementById('servicesNeeded');
    if (!servicesNeeded.value.trim()) {
        showError(servicesNeeded, 'Please describe services needed');
        isValid = false;
    }
    
    // Consent
    const consent = document.getElementById('consent');
    if (!consent.checked) {
        showError(consent.parentElement, 'Consent is required to submit referral');
        isValid = false;
    }
    
    return isValid;
}

function validateIntakeForm() {
    let isValid = true;
    
    // First Name
    const firstName = document.getElementById('firstName');
    if (!firstName.value.trim()) {
        showError(firstName, 'Please enter your first name');
        isValid = false;
    }
    
    // Last Name
    const lastName = document.getElementById('lastName');
    if (!lastName.value.trim()) {
        showError(lastName, 'Please enter your last name');
        isValid = false;
    }
    
    // Phone
    const phone = document.getElementById('phone');
    if (!validatePhone(phone.value)) {
        showError(phone, 'Please enter a valid phone number');
        isValid = false;
    }
    
    // Email (optional but must be valid if provided)
    const email = document.getElementById('email');
    if (email.value && !validateEmail(email.value)) {
        showError(email, 'Please enter a valid email address');
        isValid = false;
    }
    
    // Safe Contact Method
    const safeContact = document.getElementById('safeContact');
    if (!safeContact.value) {
        showError(safeContact, 'Please select a contact method');
        isValid = false;
    }
    
    // Current Housing Status
    const currentHousingStatus = document.getElementById('currentHousingStatus');
    if (!currentHousingStatus.value) {
        showError(currentHousingStatus, 'Please select your housing status');
        isValid = false;
    }
    
    // Housing Needs
    const housingNeeds = document.getElementById('housingNeeds');
    if (!housingNeeds.value.trim()) {
        showError(housingNeeds, 'Please describe your needs');
        isValid = false;
    }
    
    // Consent
    const consent = document.getElementById('consent');
    if (!consent.checked) {
        showError(consent.parentElement, 'Consent is required to submit');
        isValid = false;
    }
    
    return isValid;
}