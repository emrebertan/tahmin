const MATCH_DATA = [
    { id: 'm1', home: 'Sporting', away: 'Galatasaray', date: '09.09.2026', team: 'GS' },
    { id: 'm2', home: 'Galatasaray', away: 'Barcelona', date: '13.10.2026', team: 'GS' },
    { id: 'm3', home: 'Lille', away: 'Galatasaray', date: '21.10.2026', team: 'GS' },
    { id: 'm4', home: 'Galatasaray', away: 'Stuttgart', date: '03.11.2026', team: 'GS' },
    { id: 'm5', home: 'Galatasaray', away: 'Aston Villa', date: '24.11.2026', team: 'GS' },
    { id: 'm6', home: 'AEK', away: 'Galatasaray', date: '08.12.2026', team: 'GS' },
    { id: 'm7', home: 'Galatasaray', away: 'Feyenoord', date: '19.01.2027', team: 'GS' },
    { id: 'm8', home: 'PSG', away: 'Galatasaray', date: '27.01.2027', team: 'GS' },
    { id: 'm9', home: 'Fenerbahçe', away: 'Roma', date: '10.09.2026', team: 'FB' },
    { id: 'm10', home: 'Aston Villa', away: 'Fenerbahçe', date: '14.10.2026', team: 'FB' },
    { id: 'm11', home: 'Fenerbahçe', away: 'Slavia Prag', date: '20.10.2026', team: 'FB' },
    { id: 'm12', home: 'Fenerbahçe', away: 'Liverpool', date: '04.11.2026', team: 'FB' },
    { id: 'm13', home: 'Shakhtar', away: 'Fenerbahçe', date: '25.11.2026', team: 'FB' },
    { id: 'm14', home: 'LASK', away: 'Fenerbahçe', date: '09.12.2026', team: 'FB' },
    { id: 'm15', home: 'Fenerbahçe', away: 'Villarreal', date: '20.01.2027', team: 'FB' },
    { id: 'm16', home: 'Atletico Madrid', away: 'Fenerbahçe', date: '27.01.2027', team: 'FB' }
];

const STORAGE_KEY = 'avrupa_tahmin_ligi_data';

const LEGACY_USERS = {
    "ÖZGÜR ALTAY": { joinDate: "2026-09-03", isLocked: true, predictions: {"m1": "0", "m2": "0", "m3": "3", "m4": "3", "m5": "0", "m6": "1", "m7": "1", "m8": "3", "m9": "0", "m10": "3", "m11": "3", "m12": "3", "m13": "1", "m14": "0", "m15": "0", "m16": "1"} },
    "YUSUF TOPKAYA": { joinDate: "2026-09-03", isLocked: true, predictions: {"m1": "3", "m2": "0", "m3": "0", "m4": "3", "m5": "1", "m6": "3", "m7": "1", "m8": "0", "m9": "1", "m10": "1", "m11": "3", "m12": "0", "m13": "1", "m14": "3", "m15": "1", "m16": "1"} },
    "BERK BASIHOS": { joinDate: "2026-09-03", isLocked: true, predictions: {"m1": "1", "m2": "0", "m3": "1", "m4": "3", "m5": "1", "m6": "3", "m7": "3", "m8": "0", "m9": "3", "m10": "0", "m11": "3", "m12": "0", "m13": "1", "m14": "3", "m15": "1", "m16": "0"} },
    "EMRE BERTAN": { joinDate: "2026-09-09", isLocked: true, predictions: {"m1": "0", "m2": "0", "m3": "1", "m4": "3", "m5": "0", "m6": "1", "m7": "3", "m8": "0", "m9": "1", "m10": "0", "m11": "3", "m12": "1", "m13": "1", "m14": "3", "m15": "1", "m16": "0"} }
};

let appData = { users: {}, results: {} };
let currentUser = null;

function parseDate(trDate) {
    const [day, month, year] = trDate.split('.');
    return `${year}-${month}-${day}`;
}

function getTodayIso() {
    const d = new Date();
    const tzOffset = d.getTimezoneOffset() * 60000;
    return (new Date(d - tzOffset)).toISOString().slice(0, 10);
}

function init() {
    loadData();
    setupEventListeners();
    updateUserSelect();
    renderAll();
}

function loadData() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try { appData = JSON.parse(stored); } 
        catch (e) { console.error("Veri okuma hatası", e); }
    }
    
    if (!appData.users) appData.users = {};
    Object.keys(LEGACY_USERS).forEach(name => {
        appData.users[name] = LEGACY_USERS[name];
    });

    if (!appData.results) appData.results = {};
    saveData();

    const userNames = Object.keys(appData.users);
    if (userNames.length > 0) {
        if (!currentUser || !appData.users[currentUser]) currentUser = userNames[0];
    } else {
        currentUser = null;
    }
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

function setupEventListeners() {
    // Sekmeler arası geçiş
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = e.target.dataset.target;
            
            if(targetId === 'admin') {
                const pass = prompt("Sadece yetkililer sonuç girebilir. Şifrenizi girin:");
                const secret = "117-103-114-97-115-305-112-32-98-117-108-100-117-121-115-97-110-32-104-101-108-97-108-32-111-108-115-117-110";
                const userPass = pass ? pass.split('').map(c => c.charCodeAt(0)).join('-') : '';
                
                if(userPass !== secret) {
                    alert("Hatalı şifre!");
                    return;
                }
            }

            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            e.target.classList.add('active');
            document.getElementById(targetId).classList.add('active');
            renderAll();
        });
    });

    // Modal İşlemleri
    const modal = document.getElementById("newUserModal");
    const openModalBtn = document.getElementById("openNewUserModalBtn");
    const closeModalBtn = document.querySelector(".close-modal");

    openModalBtn.addEventListener('click', () => {
        document.getElementById('modalUserName').value = '';
        renderNewUserModalMatches();
        modal.style.display = "block";
    });

    closeModalBtn.addEventListener('click', () => { modal.style.display = "none"; });
    window.addEventListener('click', (e) => { if (e.target == modal) modal.style.display = "none"; });

    // Yeni Kullanıcı Formu Submit
    document.getElementById('fullAddUserForm').addEventListener('submit', (e) => {
        e.preventDefault();
        let name = document.getElementById('modalUserName').value.trim().toLocaleUpperCase('tr-TR');
        
        if (name === "") return;
        if (appData.users[name]) { alert("Bu isim zaten kayıtlı!"); return; }

        let newPredictions = {};
        document.querySelectorAll('.modal-pred-select').forEach(select => {
            if (select.value !== "") {
                newPredictions[select.dataset.matchId] = select.value;
            }
        });

        appData.users[name] = {
            joinDate: getTodayIso(),
            isLocked: false,
            predictions: newPredictions
        };
        
        saveData();
        currentUser = name;
        updateUserSelect();
        renderAll();
        
        modal.style.display = "none";
        
        // Tahminlerim sekmesine yönlendir
        document.querySelector('[data-target="predictions"]').click();
    });

    document.getElementById('currentUserSelect').addEventListener('change', (e) => {
        currentUser = e.target.value;
        renderAll();
    });

    // Veri Yönetimi
    document.getElementById('exportBtn').addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appData));
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", "tahmin_ligi_yedek.json");
        dlAnchorElem.click();
    });

    document.getElementById('importFile').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const importedData = JSON.parse(event.target.result);
                if (importedData.users && importedData.results) {
                    appData = importedData;
                    saveData();
                    loadData();
                    updateUserSelect();
                    renderAll();
                    alert("Veriler başarıyla içe aktarıldı.");
                } else { alert("Geçersiz dosya formatı."); }
            } catch (err) { alert("Dosya okunurken hata oluştu."); }
        };
        reader.readAsText(file);
        e.target.value = '';
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
        if (confirm("Tüm verileri sıfırlamak istediğinize emin misiniz? (Geçmiş kayıtlı 4 kişinin tahminleri korunur.)")) {
            localStorage.removeItem(STORAGE_KEY);
            appData = { users: {}, results: {} };
            currentUser = null;
            loadData();
            updateUserSelect();
            renderAll();
            document.querySelector('[data-target="leaderboard"]').click();
        }
    });
}

function updateUserSelect() {
    const select = document.getElementById('currentUserSelect');
    select.innerHTML = '';
    
    const userNames = Object.keys(appData.users).sort();
    if (userNames.length === 0) {
        select.innerHTML = '<option value="">Kullanıcı Yok</option>';
        select.disabled = true;
        return;
    }
    
    select.disabled = false;
    userNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        if (name === currentUser) option.selected = true;
        select.appendChild(option);
    });
}

function renderAll() {
    renderLeaderboard();
    if (currentUser) {
        renderPredictions();
        renderStats();
    } else {
        document.getElementById('gsPredictionsGrid').innerHTML = '<p>Kullanıcı seçilmedi.</p>';
        document.getElementById('fbPredictionsGrid').innerHTML = '';
        document.getElementById('statTotalPoints').textContent = '-';
        document.getElementById('statCorrect').textContent = '-';
        document.getElementById('statIncorrect').textContent = '-';
        document.getElementById('statPercentage').textContent = '-';
    }
    renderAdmin();
}

function getUserStats(userName) {
    const user = appData.users[userName];
    let points = 0; let correct = 0; let incorrect = 0; let totalFinished = 0;

    MATCH_DATA.forEach(match => {
        const actualResult = appData.results[match.id];
        const userPrediction = user.predictions[match.id];

        if (actualResult !== undefined && actualResult !== null && actualResult !== "") {
            totalFinished++;
            if (userPrediction !== undefined && userPrediction !== null && userPrediction !== "") {
                if (String(actualResult) === String(userPrediction)) {
                    points += 1; correct++;
                } else { incorrect++; }
            } else { incorrect++; }
        }
    });

    const totalMatches = MATCH_DATA.length;
    const percentage = totalMatches > 0 ? ((correct / totalMatches) * 100).toFixed(0) : 0;

    return { points, correct, incorrect, percentage, totalMatches };
}

function generateMatchCardHTML(match, currentPred, actualResult, isLocked, lockReason, isModal = false) {
    let statusHtml = '';
    if (!isModal) {
        if (actualResult !== undefined && actualResult !== null && actualResult !== "") {
            if (String(currentPred) === String(actualResult)) {
                statusHtml = '<span class="status-badge status-correct">Doğru (+1)</span>';
            } else {
                statusHtml = '<span class="status-badge status-incorrect">Yanlış (0)</span>';
            }
        } else if (currentPred !== "") {
            statusHtml = '<span class="status-badge status-pending">Bekleniyor</span>';
        }
    }

    const selectClass = isModal ? 'modal-pred-select' : 'prediction-select';

    return `
        <div class="match-card ${isLocked ? 'locked' : ''}">
            <div class="match-header">
                <span>${match.date} <small style="color:var(--error-color); display:block;">${lockReason}</small></span>
                ${statusHtml}
            </div>
            <div class="match-teams">
                ${match.home} - ${match.away}
            </div>
            <div class="match-control">
                <select data-match-id="${match.id}" ${isLocked ? 'disabled' : ''} class="${selectClass}">
                    <option value="" disabled ${currentPred === "" ? 'selected' : ''}>Tahmin Seçin</option>
                    <option value="3" ${currentPred == "3" ? 'selected' : ''}>Galibiyet (3 Puan)</option>
                    <option value="1" ${currentPred == "1" ? 'selected' : ''}>Beraberlik (1 Puan)</option>
                    <option value="0" ${currentPred == "0" ? 'selected' : ''}>Mağlubiyet (0 Puan)</option>
                </select>
            </div>
        </div>
    `;
}

function renderNewUserModalMatches() {
    const gsGrid = document.getElementById('modalGsGrid');
    const fbGrid = document.getElementById('modalFbGrid');
    gsGrid.innerHTML = ''; fbGrid.innerHTML = '';
    const today = getTodayIso();

    MATCH_DATA.forEach(match => {
        const matchIsoDate = parseDate(match.date);
        const isPastMatch = today > matchIsoDate;
        let lockReason = isPastMatch ? "(Süre doldu)" : "";
        
        const html = generateMatchCardHTML(match, "", "", isPastMatch, lockReason, true);
        
        if (match.team === 'GS') gsGrid.innerHTML += html;
        else fbGrid.innerHTML += html;
    });
}

function renderPredictions() {
    const gsGrid = document.getElementById('gsPredictionsGrid');
    const fbGrid = document.getElementById('fbPredictionsGrid');
    gsGrid.innerHTML = ''; fbGrid.innerHTML = '';
    
    if (!currentUser) return;
    
    const user = appData.users[currentUser];
    const today = getTodayIso();

    MATCH_DATA.forEach(match => {
        const matchIsoDate = parseDate(match.date);
        const isPastMatch = today > matchIsoDate;
        const isJoinedLate = user.joinDate > matchIsoDate;
        const isUserLocked = user.isLocked === true;
        
        const locked = isPastMatch || isJoinedLate || isUserLocked;
        const currentPred = user.predictions[match.id] !== undefined ? user.predictions[match.id] : "";
        const actualResult = appData.results[match.id];
        
        let lockReason = "";
        if (isUserLocked) lockReason = "(Tahminler Sabitlendi)";
        else if (isJoinedLate) lockReason = "(Kayıt tarihinden önce)";
        else if (isPastMatch) lockReason = "(Süre doldu)";

        const html = generateMatchCardHTML(match, currentPred, actualResult, locked, lockReason, false);
        
        if (match.team === 'GS') gsGrid.innerHTML += html;
        else fbGrid.innerHTML += html;
    });

    document.querySelectorAll('.prediction-select').forEach(select => {
        select.addEventListener('change', (e) => {
            const matchId = e.target.dataset.matchId;
            appData.users[currentUser].predictions[matchId] = e.target.value;
            saveData();
            renderStats();
            renderLeaderboard();
            
            // Seçim yapılınca ufak bir efekt eklenebilir
            const card = e.target.closest('.match-card');
            card.style.borderColor = 'var(--primary-color)';
            setTimeout(() => card.style.borderColor = 'var(--border-color)', 500);
        });
    });
}

function renderAdmin() {
    const gsGrid = document.getElementById('gsAdminGrid');
    const fbGrid = document.getElementById('fbAdminGrid');
    gsGrid.innerHTML = ''; fbGrid.innerHTML = '';

    MATCH_DATA.forEach(match => {
        const actualResult = appData.results[match.id] !== undefined ? appData.results[match.id] : "";

        const html = `
            <div class="match-card">
                <div class="match-header">
                    <span>${match.date}</span>
                    <span class="status-badge" style="background-color: var(--primary-color); color: white;">Admin</span>
                </div>
                <div class="match-teams">${match.home} - ${match.away}</div>
                <div class="match-control">
                    <select data-match-id="${match.id}" class="admin-select" style="border-color: var(--primary-color);">
                        <option value="" ${actualResult === "" ? 'selected' : ''}>Sonuç Girilmedi</option>
                        <option value="3" ${actualResult == "3" ? 'selected' : ''}>Temsilcimiz Kazandı (3 Puan)</option>
                        <option value="1" ${actualResult == "1" ? 'selected' : ''}>Berabere (1 Puan)</option>
                        <option value="0" ${actualResult == "0" ? 'selected' : ''}>Temsilcimiz Kaybetti (0 Puan)</option>
                    </select>
                </div>
            </div>
        `;
        
        if (match.team === 'GS') gsGrid.innerHTML += html;
        else fbGrid.innerHTML += html;
    });

    document.querySelectorAll('.admin-select').forEach(select => {
        select.addEventListener('change', (e) => {
            const matchId = e.target.dataset.matchId;
            const val = e.target.value;
            if (val === "") delete appData.results[matchId];
            else appData.results[matchId] = val;
            saveData();
            renderLeaderboard();
        });
    });
}

function renderLeaderboard() {
    const tbody = document.getElementById('leaderboardBody');
    tbody.innerHTML = '';
    const userNames = Object.keys(appData.users);
    
    if (userNames.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">Kayıtlı kullanıcı yok.</td></tr>';
        return;
    }

    const leaderboardData = userNames.map(name => { return { name, ...getUserStats(name) }; });
    leaderboardData.sort((a, b) => b.points - a.points || b.correct - a.correct || a.name.localeCompare(b.name));

    leaderboardData.forEach((data, index) => {
        const tr = document.createElement('tr');
        let rankStr = index + 1;
        if (index === 0) rankStr = '🥇 1';
        if (index === 1) rankStr = '🥈 2';
        if (index === 2) rankStr = '🥉 3';

        if (index < 3) tr.classList.add(`rank-${index + 1}`);

        tr.innerHTML = `
            <td>${rankStr}</td>
            <td><strong>${data.name}</strong></td>
            <td>${data.points}</td>
            <td>${data.correct}/${data.totalMatches}</td>
            <td>%${data.percentage}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderStats() {
    if (!currentUser) return;
    document.getElementById('statsUserName').textContent = `${currentUser} İstatistikleri`;
    const stats = getUserStats(currentUser);
    document.getElementById('statTotalPoints').textContent = stats.points;
    document.getElementById('statCorrect').textContent = stats.correct;
    document.getElementById('statIncorrect').textContent = stats.incorrect;
    document.getElementById('statPercentage').textContent = `%${stats.percentage}`;
}

document.addEventListener('DOMContentLoaded', init);
