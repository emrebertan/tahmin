// app.js
// ==================== FIREBASE BAĞLANTI AYARLARI ====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const docRef = doc(db, "tahmin_ligi", "veri");
// ==================================================================

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

const LEGACY_USERS = {
    "ÖZGÜR ALTAY": { joinDate: "2026-09-03", isLocked: true, predictions: {"m1": "0", "m2": "0", "m3": "3", "m4": "3", "m5": "0", "m6": "1", "m7": "1", "m8": "3", "m9": "0", "m10": "3", "m11": "3", "m12": "3", "m13": "1", "m14": "0", "m15": "0", "m16": "1"} },
    "YUSUF TOPKAYA": { joinDate: "2026-09-03", isLocked: true, predictions: {"m1": "3", "m2": "0", "m3": "0", "m4": "3", "m5": "1", "m6": "3", "m7": "1", "m8": "0", "m9": "1", "m10": "1", "m11": "3", "m12": "0", "m13": "1", "m14": "3", "m15": "1", "m16": "1"} },
    "BERK BASIHOS": { joinDate: "2026-09-03", isLocked: true, predictions: {"m1": "1", "m2": "0", "m3": "1", "m4": "3", "m5": "1", "m6": "3", "m7": "3", "m8": "0", "m9": "3", "m10": "0", "m11": "3", "m12": "0", "m13": "1", "m14": "3", "m15": "1", "m16": "0"} },
    "EMRE BERTAN": { joinDate: "2026-09-09", isLocked: true, predictions: {"m1": "0", "m2": "0", "m3": "1", "m4": "3", "m5": "0", "m6": "1", "m7": "3", "m8": "0", "m9": "1", "m10": "0", "m11": "3", "m12": "1", "m13": "1", "m14": "3", "m15": "1", "m16": "0"} },
    "İRFAN SOYDAN": { joinDate: "2026-09-10", isLocked: true, predictions: {"m2": "0", "m3": "3", "m4": "3", "m5": "1", "m6": "3", "m7": "1", "m8": "0", "m9": "0", "m10": "0", "m11": "3", "m12": "0", "m13": "1", "m14": "3", "m15": "0", "m16": "0"} }
};

let appData = { users: {}, results: {} };
let currentUser = null;
let isSaving = false;
let statusChartInstance = null;
let teamChartInstance = null;
let leagueChartInstance = null;
let lastLeaderName = null;
const RESULT_LABELS = { "3": "Galibiyet", "1": "Beraberlik", "0": "Mağlubiyet" };

function parseDate(trDate) {
    const [day, month, year] = trDate.split('.');
    return `${year}-${month}-${day}`;
}

function init() {
    setupEventListeners();
    
    onSnapshot(docRef, (docSnap) => {
        const statusEl = document.getElementById('syncStatus');
        statusEl.textContent = "Senkronize";
        statusEl.className = "status-badge status-correct";

        if (docSnap.exists()) {
            appData = docSnap.data();
        } else {
            appData = { users: LEGACY_USERS, results: {} };
            saveDataToFirebase();
        }

        Object.keys(LEGACY_USERS).forEach(name => {
            if (!appData.users[name]) {
                appData.users[name] = LEGACY_USERS[name];
            }
        });

        const userNames = Object.keys(appData.users);
        if (userNames.length > 0) {
            if (!currentUser || !appData.users[currentUser]) {
                currentUser = userNames[0];
            }
        } else {
            currentUser = null;
        }

        updateUserSelect();
        renderAll();
    }, (error) => {
        console.error("Firebase bağlantı hatası:", error);
        const statusEl = document.getElementById('syncStatus');
        statusEl.textContent = "Bağlantı Hatası!";
        statusEl.className = "status-badge status-incorrect";
    });
}

async function saveDataToFirebase() {
    if (isSaving) return;
    isSaving = true;
    try {
        await setDoc(docRef, appData);
    } catch (e) {
        console.error("Kayıt hatası:", e);
    } finally {
        isSaving = false;
    }
}

function setupEventListeners() {
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

    document.getElementById('currentUserSelect').addEventListener('change', (e) => {
        currentUser = e.target.value;
        renderAll();
    });

    document.querySelectorAll('.stats-toggle-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const view = e.target.dataset.statsView;
            document.querySelectorAll('.stats-toggle-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.stats-view').forEach(v => v.classList.remove('active'));
            e.target.classList.add('active');
            document.getElementById(view === 'general' ? 'generalStatsView' : 'individualStatsView').classList.add('active');
        });
    });

    document.getElementById('h2hUserA').addEventListener('change', renderH2H);
    document.getElementById('h2hUserB').addEventListener('change', renderH2H);

    document.getElementById('adminSaveBtn').addEventListener('click', async () => {
        const statusSpan = document.getElementById('adminSaveStatus');
        statusSpan.textContent = 'Kaydediliyor...';
        const success = await saveDataToFirebase();
        if (success) {
            statusSpan.textContent = `Kaydedildi ✓ (${new Date().toLocaleTimeString('tr-TR')})`;
        } else {
            statusSpan.textContent = 'Kayıt başarısız!';
            alert("Değişiklikler Firebase'e kaydedilemedi. İnternet bağlantınızı ve Firebase proje ayarlarını kontrol edin.");
        }
    });

    document.getElementById('exportBtn').addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appData));
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", "tahmin_ligi_yedek.json");
        dlAnchorElem.click();
    });
}

function updateUserSelect() {
    const select = document.getElementById('currentUserSelect');
    select.innerHTML = '';
    
    const userNames = Object.keys(appData.users).sort();
    if (userNames.length === 0) {
        select.innerHTML = '<option value="">Kullanıcı Yok</option>';
        select.disabled = true;
        populateH2HSelects(userNames);
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

    populateH2HSelects(userNames);
}

function populateH2HSelects(userNames) {
    const selectA = document.getElementById('h2hUserA');
    const selectB = document.getElementById('h2hUserB');
    const prevA = selectA.value;
    const prevB = selectB.value;
    selectA.innerHTML = '';
    selectB.innerHTML = '';

    if (userNames.length === 0) {
        selectA.innerHTML = '<option value="">Kullanıcı Yok</option>';
        selectB.innerHTML = '<option value="">Kullanıcı Yok</option>';
        selectA.disabled = true;
        selectB.disabled = true;
        return;
    }

    selectA.disabled = false;
    selectB.disabled = false;
    userNames.forEach(name => {
        selectA.appendChild(new Option(name, name));
        selectB.appendChild(new Option(name, name));
    });

    selectA.value = userNames.includes(prevA) ? prevA : userNames[0];
    selectB.value = userNames.includes(prevB) ? prevB : (userNames[1] || userNames[0]);
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
        document.getElementById('statGsPoints').textContent = '-';
        document.getElementById('statFbPoints').textContent = '-';
        document.getElementById('statsDetailBody').innerHTML = '';
    }
    renderAdmin();
    renderH2H();
}

function getUserStats(userName) {
    const user = appData.users[userName];
    if (!user) return { points: 0, correct: 0, incorrect: 0, percentage: 0, totalMatches: MATCH_DATA.length };
    
    let points = 0; let correct = 0; let incorrect = 0;

    MATCH_DATA.forEach(match => {
        const actualResult = appData.results[match.id];
        const userPrediction = user.predictions ? user.predictions[match.id] : undefined;

        if (actualResult !== undefined && actualResult !== null && actualResult !== "") {
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

function getUserTeamPoints(userName, team) {
    const user = appData.users[userName];
    if (!user) return 0;
    let points = 0;
    MATCH_DATA.filter(match => match.team === team).forEach(match => {
        const actualResult = appData.results[match.id];
        const userPrediction = user.predictions ? user.predictions[match.id] : undefined;
        if (actualResult !== undefined && actualResult !== null && actualResult !== "" &&
            userPrediction !== undefined && userPrediction !== null && userPrediction !== "" &&
            String(actualResult) === String(userPrediction)) {
            points += 1;
        }
    });
    return points;
}

function getMatchDistribution(matchId) {
    const users = Object.values(appData.users || {});
    let win = 0, draw = 0, lose = 0, total = 0;
    users.forEach(user => {
        const pred = user.predictions ? user.predictions[matchId] : undefined;
        if (pred === "3") { win++; total++; }
        else if (pred === "1") { draw++; total++; }
        else if (pred === "0") { lose++; total++; }
    });
    if (total === 0) return { winPct: 0, drawPct: 0, losePct: 0, total: 0 };
    return {
        winPct: Math.round((win / total) * 100),
        drawPct: Math.round((draw / total) * 100),
        losePct: Math.round((lose / total) * 100),
        total
    };
}

function generateCommunityBarHTML(matchId) {
    const dist = getMatchDistribution(matchId);
    if (dist.total === 0) {
        return '<div class="community-pulse"><small>Topluluk Nabızı: Henüz tahmin yok</small></div>';
    }
    return `
        <div class="community-pulse">
            <small>Topluluk Nabızı (${dist.total} tahmin)</small>
            <div class="pulse-bar">
                <div class="pulse-seg pulse-win" style="width:${dist.winPct}%" title="Galibiyet %${dist.winPct}"></div>
                <div class="pulse-seg pulse-draw" style="width:${dist.drawPct}%" title="Beraberlik %${dist.drawPct}"></div>
                <div class="pulse-seg pulse-lose" style="width:${dist.losePct}%" title="Mağlubiyet %${dist.losePct}"></div>
            </div>
            <div class="pulse-legend">
                <span><i class="dot dot-win"></i>%${dist.winPct} Gal.</span>
                <span><i class="dot dot-draw"></i>%${dist.drawPct} Ber.</span>
                <span><i class="dot dot-lose"></i>%${dist.losePct} Mağ.</span>
            </div>
        </div>
    `;
}

function getResolvedMatchesInOrder() {
    return MATCH_DATA
        .filter(match => appData.results[match.id] !== undefined && appData.results[match.id] !== null && appData.results[match.id] !== "")
        .slice()
        .sort((a, b) => parseDate(a.date).localeCompare(parseDate(b.date)));
}

function getUserBadges(userName) {
    const user = appData.users[userName];
    const badges = [];
    if (!user) return badges;

    const resolvedMatches = getResolvedMatchesInOrder();
    if (resolvedMatches.length === 0) return badges;

    let maxStreak = 0, currentStreak = 0;
    let riskyHit = false;

    resolvedMatches.forEach(match => {
        const actual = appData.results[match.id];
        const pred = user.predictions ? user.predictions[match.id] : undefined;
        const isHit = pred !== undefined && pred !== null && pred !== "" && String(pred) === String(actual);

        if (isHit) {
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);

            const dist = getMatchDistribution(match.id);
            const pctMap = { "3": dist.winPct, "1": dist.drawPct, "0": dist.losePct };
            if (dist.total > 0 && pctMap[String(pred)] <= 30) {
                riskyHit = true;
            }
        } else {
            currentStreak = 0;
        }
    });

    if (maxStreak >= 3) {
        badges.push({ icon: '🔥', label: 'Seri Bozmuyor', title: `${maxStreak} maç üst üste doğru bildi` });
    }
    if (riskyHit) {
        badges.push({ icon: '🎲', label: 'Risk Sever', title: 'Ligin az tercih ettiği zor bir tahmini tuttu' });
    }

    const stats = getUserStats(userName);
    if (stats.correct === resolvedMatches.length && stats.incorrect === 0) {
        badges.push({ icon: '💯', label: 'Kusursuz', title: 'Sonuçlanan tüm maçları doğru bildi' });
    }

    return badges;
}

function triggerConfetti() {
    const colors = ['#6c5ce7', '#00cec9', '#00b894', '#fbc531', '#e1b12c', '#ff7675'];
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);

    for (let i = 0; i < 60; i++) {
        const piece = document.createElement('span');
        piece.className = 'confetti-piece';
        piece.style.left = `${Math.random() * 100}vw`;
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDuration = `${2 + Math.random() * 1.5}s`;
        piece.style.animationDelay = `${Math.random() * 0.4}s`;
        container.appendChild(piece);
    }

    setTimeout(() => container.remove(), 4000);
}

function generateMatchCardHTML(match, currentPred, actualResult, isLocked, lockReason) {
    let statusHtml = '';
    if (actualResult !== undefined && actualResult !== null && actualResult !== "") {
        if (String(currentPred) === String(actualResult)) {
            statusHtml = '<span class="status-badge status-correct">Doğru (+1)</span>';
        } else {
            statusHtml = '<span class="status-badge status-incorrect">Yanlış (0)</span>';
        }
    } else if (currentPred !== "") {
        statusHtml = '<span class="status-badge status-pending">Bekleniyor</span>';
    }

    return `
        <div class="match-card ${isLocked ? 'locked' : ''}">
            <div class="match-header">
                <span>${match.date} <small style="color:var(--error-color); display:block;">${lockReason}</small></span>
                ${statusHtml}
            </div>
            <div class="match-teams">${match.home} - ${match.away}</div>
            <div class="match-control">
                <select data-match-id="${match.id}" ${isLocked ? 'disabled' : ''} class="prediction-select">
                    <option value="" disabled ${currentPred === "" ? 'selected' : ''}>Tahmin Seçin</option>
                    <option value="3" ${currentPred == "3" ? 'selected' : ''}>Galibiyet (3 Puan)</option>
                    <option value="1" ${currentPred == "1" ? 'selected' : ''}>Beraberlik (1 Puan)</option>
                    <option value="0" ${currentPred == "0" ? 'selected' : ''}>Mağlubiyet (0 Puan)</option>
                </select>
            </div>
            ${generateCommunityBarHTML(match.id)}
        </div>
    `;
}

function renderPredictions() {
    const gsGrid = document.getElementById('gsPredictionsGrid');
    const fbGrid = document.getElementById('fbPredictionsGrid');
    gsGrid.innerHTML = ''; fbGrid.innerHTML = '';
    
    if (!currentUser || !appData.users[currentUser]) return;
    
    const user = appData.users[currentUser];

    MATCH_DATA.forEach(match => {
        const isUserLocked = user.isLocked === true;
        const hasPrediction = user.predictions && user.predictions[match.id] !== undefined;
        const currentPred = hasPrediction ? user.predictions[match.id] : "";
        const actualResult = appData.results[match.id];

        let lockReason = "";
        if (isUserLocked) {
            lockReason = hasPrediction ? "(Tahminler Sabitlendi)" : "(Geç katıldığı için bu maça tahmin yapmadı)";
        }

        const html = generateMatchCardHTML(match, currentPred, actualResult, isUserLocked, lockReason);
        if (match.team === 'GS') gsGrid.innerHTML += html;
        else fbGrid.innerHTML += html;
    });

    document.querySelectorAll('.prediction-select').forEach(select => {
        select.addEventListener('change', async (e) => {
            const matchId = e.target.dataset.matchId;
            if (!appData.users[currentUser].predictions) {
                appData.users[currentUser].predictions = {};
            }
            appData.users[currentUser].predictions[matchId] = e.target.value;
            const success = await saveDataToFirebase();
            if (!success) {
                alert("Tahminin Firebase'e kaydedilemedi! İnternet bağlantını kontrol edip tekrar dene.");
            }
            renderStats();
            renderLeaderboard();
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
                ${generateCommunityBarHTML(match.id)}
            </div>
        `;
        if (match.team === 'GS') gsGrid.innerHTML += html;
        else fbGrid.innerHTML += html;
    });

    document.querySelectorAll('.admin-select').forEach(select => {
        select.addEventListener('change', async (e) => {
            const matchId = e.target.dataset.matchId;
            const val = e.target.value;
            if (val === "") delete appData.results[matchId];
            else appData.results[matchId] = val;

            const success = await saveDataToFirebase();
            if (!success) {
                alert("Sonuç Firebase'e kaydedilemedi! İnternet bağlantınızı kontrol edip 'Değişiklikleri Firebase'e Kaydet' butonuyla tekrar deneyin.");
            }

            const viewerPrediction = currentUser && appData.users[currentUser] && appData.users[currentUser].predictions
                ? appData.users[currentUser].predictions[matchId]
                : undefined;
            if (success && val !== "" && viewerPrediction !== undefined && String(viewerPrediction) === String(val)) {
                triggerConfetti();
            }

            renderLeaderboard();
        });
    });
}

function renderLeaderboard() {
    const tbody = document.getElementById('leaderboardBody');
    tbody.innerHTML = '';
    const userNames = Object.keys(appData.users || {});
    
    if (userNames.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">Kayıtlı kullanıcı yok.</td></tr>';
        return;
    }

    const leaderboardData = userNames.map(name => { return { name, ...getUserStats(name) }; });
    leaderboardData.sort((a, b) => b.points - a.points || b.correct - a.correct || a.name.localeCompare(b.name));

    const newLeader = leaderboardData[0].points > 0 ? leaderboardData[0].name : null;
    if (lastLeaderName !== null && newLeader !== null && newLeader !== lastLeaderName) {
        triggerConfetti();
    }
    lastLeaderName = newLeader;

    leaderboardData.forEach((data, index) => {
        const tr = document.createElement('tr');
        let rankStr = index + 1;
        if (index === 0) rankStr = '🥇 1';
        if (index === 1) rankStr = '🥈 2';
        if (index === 2) rankStr = '🥉 3';

        if (index < 3) tr.classList.add(`rank-${index + 1}`);

        const badgesHtml = getUserBadges(data.name)
            .map(b => `<span class="badge-icon" title="${b.label}: ${b.title}">${b.icon}</span>`)
            .join('');

        tr.innerHTML = `
            <td>${rankStr}</td>
            <td><strong>${data.name}</strong>${badgesHtml}</td>
            <td>${data.points}</td>
            <td>${data.correct}/${data.totalMatches}</td>
            <td>%${data.percentage}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderStats() {
    if (!currentUser || !appData.users[currentUser]) return;
    document.getElementById('statsUserName').textContent = `${currentUser} İstatistikleri`;
    const stats = getUserStats(currentUser);
    document.getElementById('statTotalPoints').textContent = stats.points;
    document.getElementById('statCorrect').textContent = stats.correct;
    document.getElementById('statIncorrect').textContent = stats.incorrect;
    document.getElementById('statPercentage').textContent = `%${stats.percentage}`;

    const gsPoints = getUserTeamPoints(currentUser, 'GS');
    const fbPoints = getUserTeamPoints(currentUser, 'FB');
    document.getElementById('statGsPoints').textContent = gsPoints;
    document.getElementById('statFbPoints').textContent = fbPoints;

    renderStatsDetailTable();
    renderStatsCharts(stats, gsPoints, fbPoints);
}

function renderStatsDetailTable() {
    const tbody = document.getElementById('statsDetailBody');
    tbody.innerHTML = '';
    const user = appData.users[currentUser];

    MATCH_DATA.forEach(match => {
        const actualResult = appData.results[match.id];
        const userPrediction = user.predictions ? user.predictions[match.id] : undefined;
        const hasResult = actualResult !== undefined && actualResult !== null && actualResult !== "";
        const hasPrediction = userPrediction !== undefined && userPrediction !== null && userPrediction !== "";

        let statusHtml = '<span class="status-badge status-pending">Bekleniyor</span>';
        if (hasResult && hasPrediction) {
            statusHtml = String(actualResult) === String(userPrediction)
                ? '<span class="status-badge status-correct">Doğru (+1)</span>'
                : '<span class="status-badge status-incorrect">Yanlış</span>';
        } else if (hasResult && !hasPrediction) {
            statusHtml = '<span class="status-badge status-incorrect">Tahmin Yok</span>';
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${match.home} - ${match.away}</td>
            <td>${match.date}</td>
            <td>${hasPrediction ? RESULT_LABELS[userPrediction] : '-'}</td>
            <td>${hasResult ? RESULT_LABELS[actualResult] : '-'}</td>
            <td>${statusHtml}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderStatsCharts(stats, gsPoints, fbPoints) {
    const statusCtx = document.getElementById('statusChart');
    const teamCtx = document.getElementById('teamChart');
    const leagueCtx = document.getElementById('leagueChart');
    if (!statusCtx || !teamCtx || !leagueCtx || typeof Chart === 'undefined') return;

    const pendingCount = stats.totalMatches - stats.correct - stats.incorrect;

    if (statusChartInstance) statusChartInstance.destroy();
    statusChartInstance = new Chart(statusCtx, {
        type: 'doughnut',
        data: {
            labels: ['Doğru', 'Yanlış', 'Bekleniyor'],
            datasets: [{ data: [stats.correct, stats.incorrect, pendingCount], backgroundColor: ['#00b894', '#ff7675', '#6c5ce7'] }]
        },
        options: { maintainAspectRatio: false, plugins: { legend: { labels: { color: '#a4b0be' } } } }
    });

    if (teamChartInstance) teamChartInstance.destroy();
    teamChartInstance = new Chart(teamCtx, {
        type: 'bar',
        data: {
            labels: ['Galatasaray', 'Fenerbahçe'],
            datasets: [{ label: 'Puan', data: [gsPoints, fbPoints], backgroundColor: ['#e1b12c', '#fbc531'] }]
        },
        options: {
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, ticks: { color: '#a4b0be' } }, x: { ticks: { color: '#a4b0be' } } },
            plugins: { legend: { display: false } }
        }
    });

    const userNames = Object.keys(appData.users || {});
    const leagueData = userNames
        .map(name => ({ name, points: getUserStats(name).points }))
        .sort((a, b) => b.points - a.points);

    if (leagueChartInstance) leagueChartInstance.destroy();
    leagueChartInstance = new Chart(leagueCtx, {
        type: 'bar',
        data: {
            labels: leagueData.map(d => d.name),
            datasets: [{ label: 'Puan', data: leagueData.map(d => d.points), backgroundColor: '#6c5ce7' }]
        },
        options: {
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: { x: { beginAtZero: true, ticks: { color: '#a4b0be' } }, y: { ticks: { color: '#a4b0be' } } },
            plugins: { legend: { display: false } }
        }
    });
}

function renderH2H() {
    const tbody = document.getElementById('h2hBody');
    const selectA = document.getElementById('h2hUserA');
    const selectB = document.getElementById('h2hUserB');
    if (!tbody || !selectA || !selectB) return;

    const userA = selectA.value;
    const userB = selectB.value;
    document.getElementById('h2hUserAHeader').textContent = userA || 'Kullanıcı A';
    document.getElementById('h2hUserBHeader').textContent = userB || 'Kullanıcı B';

    tbody.innerHTML = '';
    if (!userA || !userB || !appData.users[userA] || !appData.users[userB]) {
        tbody.innerHTML = '<tr><td colspan="5">Karşılaştırmak için iki kullanıcı seçin.</td></tr>';
        return;
    }

    MATCH_DATA.forEach(match => {
        const predA = appData.users[userA].predictions ? appData.users[userA].predictions[match.id] : undefined;
        const predB = appData.users[userB].predictions ? appData.users[userB].predictions[match.id] : undefined;
        const actualResult = appData.results[match.id];
        const hasA = predA !== undefined && predA !== null && predA !== "";
        const hasB = predB !== undefined && predB !== null && predB !== "";

        let statusHtml = '<span class="status-badge status-pending">Eksik Tahmin</span>';
        if (hasA && hasB) {
            statusHtml = String(predA) === String(predB)
                ? '<span class="h2h-match">Aynı ✓</span>'
                : '<span class="h2h-diff">Farklı ✗</span>';
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${match.home} - ${match.away}</td>
            <td>${hasA ? RESULT_LABELS[predA] : '-'}</td>
            <td>${hasB ? RESULT_LABELS[predB] : '-'}</td>
            <td>${actualResult !== undefined && actualResult !== null && actualResult !== "" ? RESULT_LABELS[actualResult] : '-'}</td>
            <td>${statusHtml}</td>
        `;
        tbody.appendChild(tr);
    });
}

document.addEventListener('DOMContentLoaded', init);