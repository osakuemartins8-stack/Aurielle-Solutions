// Aurielle Solutions - Admin Panel JavaScript

let currentUser = null;

// Check authentication on page load
document.addEventListener('DOMContentLoaded', async function() {
    await checkAuth();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Tab switching
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });

    // Content page selector
    const contentPage = document.getElementById('contentPage');
    if (contentPage) {
        contentPage.addEventListener('change', loadContentForPage);
    }
}

// Authentication
async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
        currentUser = session.user;
        showDashboard();
        loadDashboardData();
    } else {
        showLogin();
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        currentUser = data.user;
        showDashboard();
        loadDashboardData();
    } catch (error) {
        errorEl.textContent = 'Invalid email or password';
        errorEl.style.display = 'block';
    }
}

async function handleLogout() {
    await supabase.auth.signOut();
    currentUser = null;
    showLogin();
}

function showLogin() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminDashboard').style.display = 'none';
}

function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
}

// Tab switching
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // Load data for specific tabs
    if (tabName === 'content') {
        loadContentForPage();
    }
}

// Load dashboard data
async function loadDashboardData() {
    await loadReferrals();
    await loadIntake();
    await loadStats();
}

// Load referrals
async function loadReferrals() {
    const listEl = document.getElementById('referralsList');
    listEl.innerHTML = '<div class="loading">Loading referrals...</div>';
    
    try {
        const { data, error } = await supabase
            .from('referrals')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data.length === 0) {
            listEl.innerHTML = '<div class="empty-state"><p>No referrals yet</p></div>';
            return;
        }
        
        // Count new referrals
        const newCount = data.filter(r => r.status === 'new').length;
        document.getElementById('newReferralsCount').textContent = newCount;
        
        // Display referrals
        listEl.innerHTML = data.map(referral => `
            <div class="submission-card ${referral.status === 'new' ? 'new' : ''}">
                <div class="submission-header">
                    <h3 class="submission-title">${referral.client_first_name} ${referral.client_last_name}</h3>
                    <span class="status-badge ${referral.status}">${referral.status}</span>
                </div>
                <div class="submission-grid">
                    <div class="submission-field">
                        <strong>Agency</strong>
                        <span>${referral.agency_name}</span>
                    </div>
                    <div class="submission-field">
                        <strong>Contact</strong>
                        <span>${referral.agency_contact_name}</span>
                    </div>
                    <div class="submission-field">
                        <strong>Email</strong>
                        <span>${referral.agency_email}</span>
                    </div>
                    <div class="submission-field">
                        <strong>Phone</strong>
                        <span>${referral.agency_phone || 'N/A'}</span>
                    </div>
                    <div class="submission-field">
                        <strong>Client Phone</strong>
                        <span>${referral.client_phone || 'N/A'}</span>
                    </div>
                    <div class="submission-field">
                        <strong>Housing Status</strong>
                        <span>${referral.current_housing_status}</span>
                    </div>
                </div>
                <div class="submission-field">
                    <strong>Services Needed</strong>
                    <span>${referral.services_needed}</span>
                </div>
                ${referral.additional_info ? `
                    <div class="submission-field" style="margin-top: 1rem;">
                        <strong>Additional Info</strong>
                        <span>${referral.additional_info}</span>
                    </div>
                ` : ''}
                <div class="submission-actions">
                    <button class="btn btn-small btn-primary" onclick="updateStatus('referrals', '${referral.id}', 'contacted')">Mark Contacted</button>
                    <button class="btn btn-small btn-secondary" onclick="updateStatus('referrals', '${referral.id}', 'completed')">Mark Completed</button>
                </div>
                <div class="submission-date" style="margin-top: 1rem; text-align: right;">
                    Submitted: ${new Date(referral.created_at).toLocaleString()}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading referrals:', error);
        listEl.innerHTML = '<div class="empty-state"><p>Error loading referrals</p></div>';
    }
}

// Load client intake
async function loadIntake() {
    const listEl = document.getElementById('intakeList');
    listEl.innerHTML = '<div class="loading">Loading requests...</div>';
    
    try {
        const { data, error } = await supabase
            .from('client_intake')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data.length === 0) {
            listEl.innerHTML = '<div class="empty-state"><p>No service requests yet</p></div>';
            return;
        }
        
        // Count new requests
        const newCount = data.filter(r => r.status === 'new').length;
        document.getElementById('newIntakeCount').textContent = newCount;
        
        // Display requests
        listEl.innerHTML = data.map(intake => `
            <div class="submission-card ${intake.status === 'new' ? 'new' : ''}">
                <div class="submission-header">
                    <h3 class="submission-title">${intake.first_name} ${intake.last_name}</h3>
                    <span class="status-badge ${intake.status}">${intake.status}</span>
                </div>
                <div class="submission-grid">
                    <div class="submission-field">
                        <strong>Phone</strong>
                        <span>${intake.phone}</span>
                    </div>
                    <div class="submission-field">
                        <strong>Email</strong>
                        <span>${intake.email || 'N/A'}</span>
                    </div>
                    <div class="submission-field">
                        <strong>Preferred Contact</strong>
                        <span>${intake.safe_contact_method}</span>
                    </div>
                    <div class="submission-field">
                        <strong>Housing Status</strong>
                        <span>${intake.current_housing_status}</span>
                    </div>
                    <div class="submission-field">
                        <strong>Household Size</strong>
                        <span>${intake.household_size || 'N/A'}</span>
                    </div>
                    <div class="submission-field">
                        <strong>Children</strong>
                        <span>${intake.has_children ? 'Yes' : 'No'}</span>
                    </div>
                </div>
                <div class="submission-field">
                    <strong>Housing Needs</strong>
                    <span>${intake.housing_needs}</span>
                </div>
                ${intake.services_interested ? `
                    <div class="submission-field" style="margin-top: 1rem;">
                        <strong>Services Interested In</strong>
                        <span>${intake.services_interested}</span>
                    </div>
                ` : ''}
                ${intake.additional_info ? `
                    <div class="submission-field" style="margin-top: 1rem;">
                        <strong>Additional Info</strong>
                        <span>${intake.additional_info}</span>
                    </div>
                ` : ''}
                <div class="submission-actions">
                    <button class="btn btn-small btn-primary" onclick="updateStatus('client_intake', '${intake.id}', 'contacted')">Mark Contacted</button>
                    <button class="btn btn-small btn-secondary" onclick="updateStatus('client_intake', '${intake.id}', 'completed')">Mark Completed</button>
                </div>
                <div class="submission-date" style="margin-top: 1rem; text-align: right;">
                    Submitted: ${new Date(intake.created_at).toLocaleString()}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading intake:', error);
        listEl.innerHTML = '<div class="empty-state"><p>Error loading requests</p></div>';
    }
}

// Update submission status
async function updateStatus(table, id, status) {
    try {
        const { error } = await supabase
            .from(table)
            .update({ status: status })
            .eq('id', id);
        
        if (error) throw error;
        
        // Reload data
        if (table === 'referrals') {
            await loadReferrals();
        } else {
            await loadIntake();
        }
    } catch (error) {
        console.error('Error updating status:', error);
        alert('Error updating status');
    }
}

// Load stats
async function loadStats() {
    try {
        const { data: referrals } = await supabase
            .from('referrals')
            .select('id');
        
        const { data: intake } = await supabase
            .from('client_intake')
            .select('id');
        
        document.getElementById('totalReferrals').textContent = referrals?.length || 0;
        document.getElementById('totalIntake').textContent = intake?.length || 0;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Content management
async function loadContentForPage() {
    const page = document.getElementById('contentPage').value;
    const fieldsEl = document.getElementById('contentFields');
    
    fieldsEl.innerHTML = '<div class="loading">Loading content...</div>';
    
    try {
        const { data, error } = await supabase
            .from('site_content')
            .select('*')
            .eq('page', page)
            .order('display_order', { ascending: true });
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
            fieldsEl.innerHTML = `
                <div class="empty-state">
                    <p>No editable content found for this page yet.</p>
                    <p style="font-size: 0.875rem; margin-top: 1rem;">
                        Content will appear here once you add records to the site_content table in Supabase.
                    </p>
                </div>
            `;
            return;
        }
        
        fieldsEl.innerHTML = data.map(item => `
            <div class="content-field">
                <div class="content-field-header">
                    <span class="content-field-title">${item.section}</span>
                    <span style="font-size: 0.75rem; color: var(--color-gray);">${item.content_type}</span>
                </div>
                ${item.content_type === 'text' || item.content_type === 'html' ? `
                    <textarea class="form-textarea" id="content_${item.id}" rows="4">${item.content || ''}</textarea>
                    <button class="btn btn-small btn-primary" style="margin-top: 0.5rem;" onclick="saveContent('${item.id}')">Save</button>
                ` : item.content_type === 'image' ? `
                    <input type="text" class="form-input" id="content_${item.id}" value="${item.image_url || ''}" placeholder="Image URL">
                    <button class="btn btn-small btn-primary" style="margin-top: 0.5rem;" onclick="saveContent('${item.id}', true)">Save</button>
                ` : ''}
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading content:', error);
        fieldsEl.innerHTML = '<div class="empty-state"><p>Error loading content</p></div>';
    }
}

// Save content
async function saveContent(id, isImage = false) {
    const input = document.getElementById(`content_${id}`);
    const value = input.value;
    
    try {
        const updateData = isImage ? { image_url: value } : { content: value };
        
        const { error } = await supabase
            .from('site_content')
            .update(updateData)
            .eq('id', id);
        
        if (error) throw error;
        
        alert('Content saved successfully!');
    } catch (error) {
        console.error('Error saving content:', error);
        alert('Error saving content');
    }
}

// Save settings
async function saveSettings() {
    alert('Settings saved! (This is a demo - implement full save functionality as needed)');
}