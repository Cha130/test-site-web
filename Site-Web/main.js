const loginForm = document.getElementById('login-form');
const viewContainer = document.getElementById('view-container');
const menuNav = document.getElementById('menu-nav');
const appScreen = document.getElementById('app-screen');
const loginScreen = document.getElementById('login-screen');

// GESTION CONNEXION
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('username').value.toLowerCase();
    
    loginScreen.classList.add('hidden');
    appScreen.classList.remove('hidden');

    if (user === 'admin' || user === 'gardien') {
        setupGardien();
    } else {
        setupResident();
    }
});

function setupGardien() {
    document.getElementById('user-tag').innerText = "👨‍✈️ Gardien (Admin)";
    menuNav.innerHTML = `
        <div onclick="show('bacs')">📊 État des Bacs</div>
        <div onclick="show('notifs')">🔔 Notifications</div>
        <div onclick="show('chat')">💬 Messages</div>
        <div onclick="show('users')">👥 Gestion Résidents</div>
        <div onclick="show('hist-all')">📜 Historique Global</div>
        <div onclick="show('ads-admin')">📢 Publier Annonce</div>
    `;
    show('bacs');
}

function setupResident() {
    document.getElementById('user-tag').innerText = "🏠 Résident";
    menuNav.innerHTML = `
        <div onclick="show('tuto')">🏠 Accueil (Tuto)</div>
        <div onclick="show('my-hist')">📉 Mon Historique</div>
        <div onclick="show('chat')">💬 Message Gardien</div>
        <div onclick="show('ads-view')">📢 Annonces</div>
    `;
    show('tuto');
}

// FONCTION D'AFFICHAGE AVEC ANIMATION
function show(page) {
    let html = "";
    // On retire l'animation pour la relancer
    viewContainer.classList.remove('fade-in');
    void viewContainer.offsetWidth; // Force le refresh du navigateur

    switch(page) {
        case 'tuto':
            html = `<div class="card"><h2>Comment ça marche ?</h2>
                    <p>🔵 <b>Étape 1 :</b> Badgez sur le lecteur NFC.</p>
                    <p>🔵 <b>Étape 2 :</b> Présentez votre déchet à la caméra.</p>
                    <p>🔵 <b>Étape 3 :</b> Déposez dans le bac qui s'ouvre.</p></div>`;
            break;
        case 'bacs':
            html = `<h2>État des poubelles</h2>
                    <div class="card">
                        <p>🟡 Plastique : <b>82%</b></p>
                        <p>🔵 Papier : <b>45%</b></p>
                        <p>🟢 Verre : <b>10%</b></p>
                    </div>`;
            break;
        case 'users':
            html = `<h2>Gestion des comptes</h2>
                    <div class="card">
                        <button onclick="alert('Formulaire de création')">+ Créer un Résident</button>
                        <hr>
                        <p>Liste des résidents : 15 actifs</p>
                    </div>`;
            break;
        case 'hist-all':
            html = `<h2>Historique Global</h2>
                    <div class="card">
                        <table>
                            <tr><th>Heure</th><th>Foyer</th><th>Nom</th><th>Déchet</th></tr>
                            <tr><td>14:32</td><td>Foyer 05</td><td>Lucas</td><td>Plastique</td></tr>
                        </table>
                    </div>`;
            break;
        case 'ads-admin':
            html = `<h2>Envoyer une annonce</h2>
                    <div class="card">
                        <textarea placeholder="Message aux résidents..." style="width:100%; height:100px;"></textarea>
                        <button style="margin-top:10px">Diffuser l'annonce</button>
                    </div>`;
            break;
        default:
            html = `<div class="card">Section en cours de développement...</div>`;
    }

    viewContainer.innerHTML = html;
    viewContainer.classList.add('fade-in');
}

function logout() {
    location.reload();
}