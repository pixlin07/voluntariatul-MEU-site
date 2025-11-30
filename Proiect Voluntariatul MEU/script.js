// Sistem de utilizatori și date
let users = [];
let currentUser = null;
let events = [];

// Starea filtrelor și sortării
let currentFilters = {
    urgent: false,
    local: false,
    virtual: false,
    showCompleted: false,
    myEvents: false,
    minHours: 0
};

let currentSort = 'recent';

// Elemente DOM
const loginModal = document.getElementById('login-modal');
const app = document.getElementById('app');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const authTabs = document.querySelectorAll('.auth-tab');
const createBtn = document.getElementById('create-btn');
const createModal = document.getElementById('create-modal');
const detailsModal = document.getElementById('details-modal');
const completionModal = document.getElementById('completion-modal');
const closeModalBtn = document.getElementById('close-modal');
const postEventBtn = document.getElementById('post-event');
const eventForm = document.getElementById('event-form');
const feed = document.getElementById('feed');
const detailsContent = document.getElementById('details-content');
const sortSelect = document.getElementById('sort-select');
const activeOpportunities = document.getElementById('active-opportunities');
const totalVolunteers = document.getElementById('total-volunteers');
const logoutBtn = document.getElementById('logout-btn');
const currentUsername = document.getElementById('current-username');
const headerScore = document.getElementById('header-score');

// Elemente scor
const userScore = document.getElementById('user-score');
const totalHours = document.getElementById('total-hours');
const completedEvents = document.getElementById('completed-events');
const createdEvents = document.getElementById('created-events');
const progressFill = document.getElementById('progress-fill');
const nextLevel = document.getElementById('next-level');

// Filtre
const filterUrgent = document.getElementById('filter-urgent');
const filterLocal = document.getElementById('filter-local');
const filterVirtual = document.getElementById('filter-virtual');
const filterShowCompleted = document.getElementById('filter-show-completed');
const filterMyEvents = document.getElementById('filter-my-events');
const filterHours = document.getElementById('filter-hours');

// Inițializare
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    checkAuth();
    setupEventListeners();
    
    // Setează data minimă pentru input-ul de dată la ziua de azi
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('event-date').setAttribute('min', today);
});

// Încarcă datele din localStorage
function loadData() {
    const savedUsers = localStorage.getItem('volunteerUsers');
    const savedEvents = localStorage.getItem('volunteerEvents');
    
    if (savedUsers) {
        users = JSON.parse(savedUsers);
    }
    
    if (savedEvents) {
        events = JSON.parse(savedEvents);
    }
    
    // Date de exemplu dacă nu există utilizatori
    if (users.length === 0) {
        users = [
            {
                id: 1,
                name: "Admin Utilizator",
                username: "admin",
                email: "admin@example.com",
                password: "admin123",
                score: 0,
                totalHours: 0,
                completedEvents: 0,
                createdEvents: 0,
                completedEventIds: []
            }
        ];
        saveUsers();
    }
    
    // Evenimente de exemplu dacă nu există
    if (events.length === 0) {
        events = [
            {
                id: 1,
                title: "Ajutor la curățenia parcului",
                description: "Căutăm voluntari pentru a ne ajuta să curățăm Parcul Central. Vom colecta gunoiul, tufișurile și vom vopsi băncile. Vă așteptăm cu drag!",
                location: "Parcul Central, Cluj-Napoca",
                hours: 4,
                date: "2023-10-15",
                urgent: true,
                virtual: false,
                local: true,
                applicants: 12,
                created: "2023-09-20",
                completed: false,
                authorId: 1,
                authorName: "admin"
            }
        ];
        saveEvents();
    }
}

// Salvează utilizatorii în localStorage
function saveUsers() {
    localStorage.setItem('volunteerUsers', JSON.stringify(users));
}

// Salvează evenimentele în localStorage
function saveEvents() {
    localStorage.setItem('volunteerEvents', JSON.stringify(events));
}

// Setup event listeners
function setupEventListeners() {
    // Auth tabs
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            switchAuthTab(tabName);
        });
    });

    // Login form
    loginForm.addEventListener('submit', handleLogin);

    // Register form
    registerForm.addEventListener('submit', handleRegister);

    // Logout
    logoutBtn.addEventListener('click', handleLogout);

    // Filtre
    filterUrgent.addEventListener('change', (e) => {
        currentFilters.urgent = e.target.checked;
        renderEvents();
    });

    filterLocal.addEventListener('change', (e) => {
        currentFilters.local = e.target.checked;
        renderEvents();
    });

    filterVirtual.addEventListener('change', (e) => {
        currentFilters.virtual = e.target.checked;
        renderEvents();
    });

    filterShowCompleted.addEventListener('change', (e) => {
        currentFilters.showCompleted = e.target.checked;
        renderEvents();
    });

    filterMyEvents.addEventListener('change', (e) => {
        currentFilters.myEvents = e.target.checked;
        renderEvents();
    });

    filterHours.addEventListener('input', (e) => {
        currentFilters.minHours = parseInt(e.target.value) || 0;
        renderEvents();
    });

    // Sortare
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderEvents();
    });

    // Creare anunț
    createBtn.addEventListener('click', () => {
        createModal.classList.remove('hidden');
    });

    closeModalBtn.addEventListener('click', () => {
        createModal.classList.add('hidden');
    });

    // Închide modaluri
    window.addEventListener('click', (e) => {
        if (e.target === createModal) {
            createModal.classList.add('hidden');
        }
        if (e.target === detailsModal) {
            detailsModal.classList.add('hidden');
        }
        if (e.target === completionModal) {
            completionModal.classList.add('hidden');
        }
    });

    // Formular eveniment
    eventForm.addEventListener('submit', handleCreateEvent);
}

// Schimbă tab-urile de auth
function switchAuthTab(tabName) {
    authTabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-tab') === tabName) {
            tab.classList.add('active');
        }
    });

    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });

    document.getElementById(`${tabName}-form`).classList.add('active');
}

// Verifică autentificarea
function checkAuth() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showApp();
    } else {
        showLogin();
    }
}

// Afișează aplicația
function showApp() {
    loginModal.classList.add('hidden');
    app.classList.remove('hidden');
    currentUsername.textContent = currentUser.username;
    updateUserDisplay();
    renderEvents();
    updateStats();
}

// Afișează login-ul
function showLogin() {
    loginModal.classList.remove('hidden');
    app.classList.add('hidden');
}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showApp();
        loginForm.reset();
    } else {
        alert('Nume utilizator sau parolă incorectă!');
    }
}

// Handle register
function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    // Validări
    if (password !== confirmPassword) {
        alert('Parolele nu coincid!');
        return;
    }
    
    if (users.find(u => u.username === username)) {
        alert('Numele de utilizator este deja folosit!');
        return;
    }
    
    if (users.find(u => u.email === email)) {
        alert('Adresa de email este deja înregistrată!');
        return;
    }
    
    // Creează utilizator nou
    const newUser = {
        id: users.length + 1,
        name,
        username,
        email,
        password,
        score: 0,
        totalHours: 0,
        completedEvents: 0,
        createdEvents: 0,
        completedEventIds: []
    };
    
    users.push(newUser);
    saveUsers();
    
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    showApp();
    registerForm.reset();
    alert('Cont creat cu succes! Bine ai venit!');
}

// Handle logout
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showLogin();
}

// Handle create event
function handleCreateEvent(e) {
    e.preventDefault();
    
    const title = document.getElementById('event-title').value;
    const description = document.getElementById('event-desc').value;
    const location = document.getElementById('event-location').value;
    const hours = parseInt(document.getElementById('event-hours').value);
    const date = document.getElementById('event-date').value;
    const urgent = document.getElementById('event-urgent').checked;
    const virtual = document.getElementById('event-virtual').checked;
    
    if (title && description && location && hours && date) {
        const newEvent = {
            id: events.length + 1,
            title,
            description,
            location,
            hours,
            date,
            urgent,
            virtual,
            local: location.toLowerCase().includes('cluj'),
            applicants: 0,
            created: new Date().toISOString().split('T')[0],
            completed: false,
            authorId: currentUser.id,
            authorName: currentUser.username
        };
        
        events.unshift(newEvent);
        
        // Actualizează statisticile utilizatorului
        currentUser.createdEvents += 1;
        updateUserData();
        
        renderEvents();
        updateStats();
        createModal.classList.add('hidden');
        eventForm.reset();
    } else {
        alert('Te rugăm să completezi toate câmpurile!');
    }
}

// Actualizează datele utilizatorului
function updateUserData() {
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        saveUsers();
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateUserDisplay();
    }
}

// Actualizează afișajul utilizatorului
function updateUserDisplay() {
    userScore.textContent = currentUser.score;
    totalHours.textContent = currentUser.totalHours;
    completedEvents.textContent = currentUser.completedEvents;
    createdEvents.textContent = currentUser.createdEvents;
    headerScore.textContent = `${currentUser.score} puncte`;
    
    // Calculează progresul pentru următorul nivel
    const currentLevel = Math.floor(currentUser.score / 50) * 50;
    const nextLevelPoints = currentLevel + 50;
    const progress = ((currentUser.score - currentLevel) / 50) * 100;
    
    progressFill.style.width = `${progress}%`;
    nextLevel.textContent = nextLevelPoints;
}

// Funcția de filtrare
function filterEvents(events) {
    return events.filter(event => {
        const isCompleted = currentUser.completedEventIds.includes(event.id);
        const isOwner = event.authorId === currentUser.id;
        
        // Filtru doar anunțurile mele
        if (currentFilters.myEvents && !isOwner) return false;
        
        // Dacă nu arătăm activitățile finalizate și aceasta este finalizată, o excludem
        if (!currentFilters.showCompleted && isCompleted) return false;
        
        // Filtru urgent
        if (currentFilters.urgent && !event.urgent) return false;
        
        // Filtru local
        if (currentFilters.local && !event.local) return false;
        
        // Filtru virtual
        if (currentFilters.virtual && !event.virtual) return false;
        
        // Filtru ore minime
        if (currentFilters.minHours > 0 && event.hours < currentFilters.minHours) return false;
        
        return true;
    });
}

// Funcția de sortare
function sortEvents(events) {
    const sortedEvents = [...events];
    
    switch (currentSort) {
        case 'recent':
            return sortedEvents.sort((a, b) => new Date(b.created) - new Date(a.created));
        case 'popular':
            return sortedEvents.sort((a, b) => b.applicants - a.applicants);
        case 'hours':
            return sortedEvents.sort((a, b) => b.hours - a.hours);
        case 'urgent':
            return sortedEvents.sort((a, b) => {
                if (a.urgent && !b.urgent) return -1;
                if (!a.urgent && b.urgent) return 1;
                return new Date(b.created) - new Date(a.created);
            });
        default:
            return sortedEvents;
    }
}

// Afișează detaliile unui eveniment
function showEventDetails(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    const isCompleted = currentUser.completedEventIds.includes(event.id);
    const isOwner = event.authorId === currentUser.id;
    
    detailsContent.innerHTML = `
        <h2>${event.title}</h2>
        <div class="event-meta">
            <div class="meta-item">
                <span>📍</span>
                <span>${event.location}</span>
            </div>
            <div class="meta-item">
                <span>⏱️</span>
                <span>${event.hours} ore credit</span>
            </div>
            <div class="meta-item">
                <span>📅</span>
                <span>${formatDate(event.date)}</span>
            </div>
            <div class="meta-item">
                <span>👤</span>
                <span>Postat de: <strong>${event.authorName}</strong></span>
            </div>
            ${event.urgent ? '<div class="card-badge urgent">URGENT</div>' : ''}
            ${event.virtual ? '<div class="card-badge virtual">VIRTUAL</div>' : ''}
            ${isCompleted ? '<div class="card-badge" style="background: #51cf66;">FINALIZAT</div>' : ''}
            ${isOwner ? '<div class="card-badge owner">ANUNȚUL TĂU</div>' : ''}
        </div>
        <div class="event-description">
            <h3>Descriere</h3>
            <p>${event.description}</p>
        </div>
        <div class="applicants">
            <strong>${event.applicants}</strong> persoane au aplicat deja
        </div>
        <div class="modal-actions">
            ${!isCompleted && !isOwner ? `<button class="btn-primary" id="complete-btn">Marchează ca finalizat</button>` : ''}
            ${isOwner ? `<button class="btn-secondary" id="delete-btn">Șterge anunț</button>` : ''}
            <button class="btn-secondary" id="close-details">Închide</button>
        </div>
    `;
    
    detailsModal.classList.remove('hidden');
    
    document.getElementById('close-details').addEventListener('click', () => {
        detailsModal.classList.add('hidden');
    });
    
    if (!isCompleted && !isOwner) {
        document.getElementById('complete-btn').addEventListener('click', () => {
            completeEvent(event);
        });
    }
    
    if (isOwner) {
        document.getElementById('delete-btn').addEventListener('click', () => {
            deleteEvent(event.id);
        });
    }
}

// Finalizează un eveniment
function completeEvent(event) {
    // Adaugă scorul
    currentUser.score += event.hours;
    currentUser.totalHours += event.hours;
    currentUser.completedEvents += 1;
    currentUser.completedEventIds.push(event.id);
    
    // Actualizează datele
    updateUserData();
    
    // Afișează modalul de confirmare
    showCompletionModal(event);
    
    // Închide modalul de detalii
    detailsModal.classList.add('hidden');
    
    // Re-renderează evenimentele
    renderEvents();
}

// Șterge un eveniment
function deleteEvent(eventId) {
    if (confirm('Sigur vrei să ștergi acest anunț?')) {
        events = events.filter(e => e.id !== eventId);
        saveEvents();
        detailsModal.classList.add('hidden');
        renderEvents();
        updateStats();
    }
}

// Afișează modalul de finalizare
function showCompletionModal(event) {
    document.getElementById('completed-event-title').textContent = event.title;
    document.getElementById('earned-points').textContent = event.hours;
    document.getElementById('earned-hours').textContent = event.hours;
    
    completionModal.classList.remove('hidden');
    
    document.getElementById('confirm-completion').addEventListener('click', () => {
        completionModal.classList.add('hidden');
    });
}

// Formatează data
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ro-RO', options);
}

// Actualizează statisticile
function updateStats() {
    const filteredEvents = filterEvents(events);
    const activeEvents = filteredEvents.filter(event => !currentUser.completedEventIds.includes(event.id));
    activeOpportunities.textContent = activeEvents.length;
    
    // Calculează totalul voluntarilor
    totalVolunteers.textContent = users.length;
}

// Randarea evenimentelor
function renderEvents() {
    feed.innerHTML = '';
    
    let filteredEvents = filterEvents(events);
    let sortedEvents = sortEvents(filteredEvents);
    
    // Filtrează evenimentele finalizate dacă nu sunt setate să fie afișate
    if (!currentFilters.showCompleted) {
        sortedEvents = sortedEvents.filter(event => !currentUser.completedEventIds.includes(event.id));
    }
    
    if (sortedEvents.length === 0) {
        feed.innerHTML = `
            <div class="no-events">
                <h3>Nu s-au găsit oportunități</h3>
                <p>${currentFilters.showCompleted ? 'Nu ai activități finalizate încă.' : 'Încearcă să modifici filtrele sau să creezi un nou anunț.'}</p>
            </div>
        `;
        return;
    }
    
    sortedEvents.forEach(event => {
        const isCompleted = currentUser.completedEventIds.includes(event.id);
        const isOwner = event.authorId === currentUser.id;
        
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            ${isCompleted ? '<div class="completed-badge">FINALIZAT</div>' : ''}
            ${isOwner ? '<div class="completed-badge" style="background: #ffa502;">ANUNȚUL TĂU</div>' : ''}
            <div class="card-header">
                <div>
                    <h3>${event.title}</h3>
                    <div class="card-author">
                        Postat de: <span class="author-name">${event.authorName}</span>
                    </div>
                </div>
                <div>
                    ${event.urgent ? '<span class="card-badge urgent">URGENT</span>' : ''}
                    ${event.virtual ? '<span class="card-badge virtual">VIRTUAL</span>' : ''}
                </div>
            </div>
            <p>${event.description.substring(0, 100)}...</p>
            <div class="card-meta">
                <div class="meta-item">
                    <span>📍</span>
                    <span>${event.location}</span>
                </div>
                <div class="meta-item">
                    <span>⏱️</span>
                    <span>${event.hours} ore</span>
                </div>
                <div class="meta-item">
                    <span>📅</span>
                    <span>${formatDate(event.date)}</span>
                </div>
            </div>
            <div class="applicants">
                <strong>${event.applicants}</strong> persoane au aplicat
            </div>
        `;
        
        card.addEventListener('click', () => {
            showEventDetails(event.id);
        });
        
        feed.appendChild(card);
    });
    
    updateStats();
}