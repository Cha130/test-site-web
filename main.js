// ================= INITIALISATION =================
const loginForm = document.getElementById("login-form");
const viewContainer = document.getElementById("view-container");
const menuNav = document.getElementById("menu-nav");
const appScreen = document.getElementById("app-screen");
const loginScreen = document.getElementById("login-screen");
const userTag = document.getElementById("user-tag");

// Types de déchets et couleurs
const wasteTypes = {
    Plastique: "#f1c40f",
    Verre: "#2ecc71",  
    Papier: "#3498db"
};

// Variables globales
let role = null;
let userId = null;

// Chargement auto si "Se souvenir de moi"
window.onload = () => {
    const savedUser = localStorage.getItem("smart_remember_user");
    const savedRole = localStorage.getItem("smart_remember_role");
    if (savedUser && savedRole) {
        role = savedRole;
        userId = savedUser;
        enterApp(role, userId);
    }
};

// Utilisateurs par défaut
if (!localStorage.getItem("smart_users")) {
    localStorage.setItem("smart_users", JSON.stringify([
        { id: "appart101", pass: "1234" },
        { id: "appart102", pass: "abcd" }
    ]));
}

// ================= GESTION CONNEXION =================
loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const userVal = document.getElementById("username").value.trim();
    const passVal = document.getElementById("password").value;
    const remember = document.getElementById("remember").checked;

    let detectedRole = null;

    // Vérification admin
    if (userVal === "admin" && passVal === "admin123") {
        detectedRole = "admin";
    } else {
        const users = JSON.parse(localStorage.getItem("smart_users"));
        const found = users.find(u => u.id === userVal && u.pass === passVal);
        if (found) detectedRole = "resident";
    }

    if (detectedRole) {
        role = detectedRole;
        userId = userVal;

        if (remember) {
            localStorage.setItem("smart_remember_user", userId);
            localStorage.setItem("smart_remember_role", role);
        }
        enterApp(role, userId);
    } else {
        alert("Identifiants invalides.");
    }
});

// ================= TOGGLE PASSWORD =================
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");
togglePassword.addEventListener("click", () => {
    const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
    togglePassword.textContent = type === "password" ? "👁️" : "🙈";
});

// ================= FONCTION ENTER APP =================
function enterApp(userRole, userName) {
    loginScreen.classList.add("hidden");
    appScreen.classList.remove("hidden");

    if (userRole === "admin") {
        userTag.innerText = "👨‍✈️ Admin";
        menuNav.innerHTML = `
            <div onclick="show('bacs')">📊 État des Bacs</div>
            <div onclick="show('users')">👥 Résidents</div>
            <div onclick="showAnnouncements()">📢 Annonces</div>
            <div onclick="show('hist')">📜 Historique</div>
            <div onclick="show('notifications')">🔔 Notifications</div>
            <div onclick="showMessages()">💬 Messagerie</div>
        `;
        show("bacs");
    } else {
        userTag.innerText = "🏠 " + userName;
        menuNav.innerHTML = `
            <div onclick="show('tuto')">📖 Mode d'emploi</div>
            <div onclick="show('hist')">📜 Mon Historique</div>
            <div onclick="showAnnouncements()">📢 Annonces</div>
            <div onclick="showMessages()">💬 Messagerie</div>
        `;
        show("tuto");
    }
}

// ================= VUE DYNAMIQUE =================
function show(page) {
    let html = "";
    switch(page) {
        case "bacs":
            const bins = [
                {name: "Plastique", percent: 82, color: wasteTypes.Plastique},
                {name: "Verre", percent: 45, color: wasteTypes.Verre}, // Corrigé si nécessaire
                {name: "Papier", percent: 15, color: wasteTypes.Papier}
            ];
            html = `<h2>Niveau de remplissage</h2><div class="card">` +
                   bins.map(b => renderBin(b.name, b.percent, b.color)).join('') +
                   `</div>`;
            checkBins(bins);
            break;

        case "users":
            const users = JSON.parse(localStorage.getItem("smart_users"));
            html = `<div style="display:flex; justify-content:space-between; align-items:center">
                        <h2>Résidents</h2>
                        <button onclick="addResident()" style="width:auto">+ Créer</button>
                    </div>
                    <div class="card">` +
                   users.map((u, i) => `
                        <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #eee">
                            <span><strong>${u.id}</strong> (Pass: ${u.pass})</span>
                            <button onclick="deleteUser(${i})" style="width:auto; background:var(--danger); padding:5px 10px">Supprimer</button>
                        </div>`).join('') +
                   `</div>`;
            break;

        case "tuto":
            html = `<h2>Bienvenue</h2><div class="card"><p>Scannez votre badge NFC pour déverrouiller le bac et jetez le déchet devant la caméra pour l'IA.</p></div>`;
            break;

        case "hist":
            const allHistory = JSON.parse(localStorage.getItem("smart_history")) || [];
            if(role === "resident") {
                const userHistory = allHistory.filter(h => h.user === userId);
                html = `<h2>Mon Historique</h2><div class="card">` +
                       userHistory.map(h => `<p>${h.date} ${h.time} - ${h.type}</p>`).join('') +
                       `</div>`;
            } else {
                html = `<h2>Historique Total</h2><div class="card">` +
                       allHistory.map(h => `<p>${h.user} - ${h.date} ${h.time} - ${h.type}</p>`).join('') +
                       `</div>`;
            }
            break;

        case "notifications":
            const notifications = JSON.parse(localStorage.getItem("smart_notifications")) || [];
            html = `<h2>🔔 Notifications</h2><div class="card">` +
                   (notifications.length ? notifications.map(n => `<p>⚠️ Poubelle ${n} ≥ 85%</p>`).join('') : `<p>Aucune notification</p>`) +
                   `</div>`;
            break;
    }
    viewContainer.innerHTML = `<div class="fade-in">${html}</div>`;
}

// ================= HELPERS =================
function renderBin(name, percent, color) {
    return `<div class="bin-item">
                <div style="display:flex; justify-content:space-between; font-size:0.9rem">
                    <span>${name}</span><span>${percent}%</span>
                </div>
                <div class="progress-bar"><div class="progress-fill" style="width:${percent}%; background:${color}"></div></div>
            </div>`;
}

function addResident() {
    const id = prompt("ID du résident :");
    const pass = prompt("Mot de passe :");
    if(id && pass) {
        const users = JSON.parse(localStorage.getItem("smart_users"));
        users.push({ id, pass });
        localStorage.setItem("smart_users", JSON.stringify(users));
        show("users");
    }
}

function deleteUser(index) {
    if(confirm("Supprimer ?")) {
        const users = JSON.parse(localStorage.getItem("smart_users"));
        users.splice(index,1);
        localStorage.setItem("smart_users", JSON.stringify(users));
        show("users");
    }
}

function logout() {
    localStorage.removeItem("smart_remember_user");
    localStorage.removeItem("smart_remember_role");
    location.reload();
}

// ================= HISTORIQUE =================
function logWaste(userId, type) {
    const history = JSON.parse(localStorage.getItem("smart_history")) || [];
    const now = new Date();
    history.push({
        user: userId,
        type: type,
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString()
    });
    localStorage.setItem("smart_history", JSON.stringify(history));
}

// ================= NOTIFICATIONS =================
function checkBins(bins) {
    const notifications = JSON.parse(localStorage.getItem("smart_notifications")) || [];
    bins.forEach(bin => {
        if(bin.percent >= 85 && !notifications.includes(bin.name)) {
            notifications.push(bin.name);
            alert(`⚠️ Attention ! La poubelle ${bin.name} est presque pleine (${bin.percent}%)`);
        }
    });
    localStorage.setItem("smart_notifications", JSON.stringify(notifications));
}

// ================= ANNOUNCEMENTS =================
function showAnnouncements() {
    const announcements = JSON.parse(localStorage.getItem("smart_announcements")) || [];
    let html = `<h2>📢 Annonces</h2><div class="card">`;
    announcements.forEach(a => html += `<p>${a.date} - ${a.text}</p>`);
    if(role === "admin") html += `<hr><button onclick="addAnnouncement()">+ Ajouter une annonce</button>`;
    html += `</div>`;
    viewContainer.innerHTML = `<div class="fade-in">${html}</div>`;
}

function addAnnouncement() {
    const msg = prompt("Message de l'annonce :");
    if(msg) {
        const announcements = JSON.parse(localStorage.getItem("smart_announcements")) || [];
        announcements.push({ text: msg, date: new Date().toLocaleString() });
        localStorage.setItem("smart_announcements", JSON.stringify(announcements));
        showAnnouncements();
    }
}

// ================= SCAN NFC/IA SIMULATION =================
function scanWaste() {
    const type = prompt("Type de déchet (Plastique, Verre, Papier) :");
    if(wasteTypes[type]) {
        logWaste(userId, type);
        alert(`✅ ${type} jeté, poubelle ouverte !`);
    } else {
        alert("❌ Type de déchet inconnu.");
    }
}

// ================= MESSAGERIE =================
function sendMessage(from, to, text) {
    const messages = JSON.parse(localStorage.getItem("smart_messages")) || [];
    messages.push({from, to, text, date: new Date().toLocaleString()});
    localStorage.setItem("smart_messages", JSON.stringify(messages));
}

function showMessages() {
    const allMessages = JSON.parse(localStorage.getItem("smart_messages")) || [];
    let html = `<h2>💬 Messagerie</h2><div class="card" style="max-height:400px; overflow-y:auto;">`;

    if(role === "resident") {
        const conv = allMessages.filter(m => m.from === userId || m.to === userId);
        conv.forEach(m => html += `<p><strong>${m.from}</strong> (${m.date}): ${m.text}</p>`);
        html += `<hr><input type="text" id="msg-input" placeholder="Écrire un message..." style="width:80%; padding:8px;">
                 <button onclick="sendResidentMessage()">Envoyer</button>`;
    } else { // admin
        const residents = JSON.parse(localStorage.getItem("smart_users")).map(u => u.id);
        residents.forEach(res => {
            html += `<h4>${res}</h4>`;
            const conv = allMessages.filter(m => m.from === res || m.to === res);
            conv.forEach(m => html += `<p><strong>${m.from}</strong> (${m.date}): ${m.text}</p>`);
            html += `<input type="text" id="msg-input-${res}" placeholder="Répondre à ${res}" style="width:70%; padding:6px;">
                     <button onclick="sendAdminMessage('${res}')">Envoyer</button><hr>`;
        });
    }

    html += `</div>`;
    viewContainer.innerHTML = `<div class="fade-in">${html}</div>`;
}

function sendResidentMessage() {
    const input = document.getElementById("msg-input");
    const text = input.value.trim();
    if(text) {
        sendMessage(userId, "admin", text);
        input.value = "";
        showMessages();
    }
}

function sendAdminMessage(residentId) {
    const input = document.getElementById(`msg-input-${residentId}`);
    const text = input.value.trim();
    if(text) {
        sendMessage("admin", residentId, text);
        input.value = "";
        showMessages();
    }
}