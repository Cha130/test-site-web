const loginForm = document.getElementById('login-form');
const viewContainer = document.getElementById('view-container');
const menuNav = document.getElementById('menu-nav');
const appScreen = document.getElementById('app-screen');
const loginScreen = document.getElementById('login-screen');

// === AJOUT AUTOMATIQUE DE RÉSIDENTS TEST ===
// On place ce bloc juste après la déclaration des constantes
if (!localStorage.getItem('smart_users')) {
    const testResidents = [
        { id: 'appart101', pass: '1234' },
        { id: 'appart102', pass: 'abcd' }
    ];
    localStorage.setItem('smart_users', JSON.stringify(testResidents));
}

// --- CONNEXION ---
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const userVal = document.getElementById('username').value.toLowerCase();
    const passVal = document.getElementById('password').value;

    // 1. Identification Admin / Gardien
    if ((userVal === 'admin' || userVal === 'gardien') && passVal === 'admin123') {
        enterApp('admin');
        return;
    }

    // 2. Identification Résidents
    const users = JSON.parse(localStorage.getItem('smart_users')) || [];
    const user = users.find(u => u.id.toLowerCase() === userVal && u.pass === passVal);

    if (user) {
        enterApp('resident', user.id);
    } else {
        alert("Identifiants incorrects ou compte non autorisé.");
    }
});

function enterApp(role, userId = "") {
    loginScreen.classList.add('hidden');
    appScreen.classList.remove('hidden');
    
    if (role === 'admin') {
        setupGardien();
    } else {
        setupResident(userId);
    }
}

// --- LOGIQUE ADMIN (Création de comptes) ---
function addResident() {
    const id = prompt("Identifiant du résident (ex: appartement102) :");
    if (!id) return;
    const pass = prompt("Définir son mot de passe :");
    if (!pass) return;

    let users = JSON.parse(localStorage.getItem('smart_users')) || [];
    users.push({ id, pass });
    localStorage.setItem('smart_users', JSON.stringify(users));
    
    alert("Compte résident activé !");
    show('users'); // Actualise la liste
}

function deleteUser(index) {
    if(confirm("Supprimer l'accès de ce résident ?")) {
        let users = JSON.parse(localStorage.getItem('smart_users')) || [];
        users.splice(index, 1);
        localStorage.setItem('smart_users', JSON.stringify(users));
        show('users');
    }
}

// --- INTERFACES ---
function setupGardien() {
    document.getElementById('user-tag').innerText = "👨‍✈️ Admin Gardien";
    menuNav.innerHTML = `
        <div onclick="show('bacs')">📊 État des Bacs</div>
        <div onclick="show('users')">👥 Gestion Résidents</div>
        <div onclick="show('ads')">📢 Publier Annonce</div>
    `;
    show('bacs');
}

function setupResident(userId) {
    document.getElementById('user-tag').innerText = `🏠 Résident : ${userId}`;
    menuNav.innerHTML = `
        <div onclick="show('tuto')">📖 Mode d'emploi</div>
        <div onclick="show('my-hist')">📉 Mon Historique</div>
        <div onclick="show('chat')">💬 Contacter Admin</div>
    `;
    show('tuto');
}

// --- SYSTÈME D'ONGLETS ---
function show(page) {
    let html = "";
    viewContainer.classList.remove('fade-in');
    void viewContainer.offsetWidth; // Reset animation

    switch(page) {
        case 'bacs':
            html = `<h2>Suivi des conteneurs</h2>
                    <div class="card">
                        <div class="bin-container">
                            <span>🟡 Plastique : 82%</span>
                            <div class="progress-bar"><div class="progress-fill" style="width:82%; background:#f1c40f"></div></div>
                        </div>
                        <div class="bin-container">
                            <span>🔵 Papier : 45%</span>
                            <div class="progress-bar"><div class="progress-fill" style="width:45%; background:#3498db"></div></div>
                        </div>
                    </div>`;
            break;

        case 'users':
            const users = JSON.parse(localStorage.getItem('smart_users')) || [];
            html = `<h2>Gestion des Accès</h2>
                    <div class="card">
                        <button onclick="addResident()" style="margin-bottom:15px;">+ Créer un nouveau compte</button>
                        <table style="width:100%; text-align:left; border-collapse:collapse;">
                            <tr style="border-bottom:1px solid #ddd;"><th>Identifiant</th><th>Action</th></tr>
                            ${users.map((u, i) => `
                                <tr>
                                    <td style="padding:10px 0;">${u.id}</td>
                                    <td><button onclick="deleteUser(${i})" style="background:#e74c3c; width:auto; padding:5px 10px;">Révoquer</button></td>
                                </tr>`).join('')}
                        </table>
                        ${users.length === 0 ? "<p>Aucun résident créé.</p>" : ""}
                    </div>`;
            break;

        case 'tuto':
    html = `<h2>Bienvenue dans votre espace</h2>
        <div class="card">
            <h3>Comment utiliser le bac intelligent ?</h3>
            <p>1. Approchez votre badge du lecteur pour déverrouiller le bac.</p>
            <p>2. Montrez le déchet à la caméra : le bon bac s'ouvrira automatiquement 🟡 Plastique – 🔵 Papier – 🟢 Verre.</p>
            <p>3. Le bac se referme après 15 secondes.</p>
            <p>4. Vous pouvez consulter vos déchets dans l'onglet <b>"Mon Historique"</b> du menu.</p>
            <p>5. En cas de problème, contactez l'administrateur à cette adresse : <b>contact.smartcontainer@gmail.com</b></p>
        </div>`;
break;

        default:
            html = `<div class="card">Cette section est en cours de configuration.</div>`;
    }

    viewContainer.innerHTML = html;
    viewContainer.classList.add('fade-in');
}

function logout() { location.reload(); }
