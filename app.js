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
let selectedTeam = 'GS';
let saveQueue = Promise.resolve();
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
        statusEl.className = "sync-pill is-connected";

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
        statusEl.className = "sync-pill is-error";
    });
}

async function saveDataToFirebase() {
    const snapshot = JSON.parse(JSON.stringify(appData));
    const write = saveQueue.then(() => setDoc(docRef, snapshot));
    saveQueue = write.catch((e) => console.error("Kayıt hatası:", e));
    try { await write; return true; }
    catch { return false; }
}

function setupEventListeners() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = e.currentTarget.dataset.target;
            
            if(targetId === 'admin') {
                const pass = prompt("Sadece yetkililer sonuç girebilir. Şifrenizi girin:");
                const secret = "000000";
                const userPass = pass || '';
                
                if(userPass !== secret) {
                    alert("Hatalı şifre!");
                    return;
                }
            }

            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            e.currentTarget.classList.add('active');
            document.getElementById(targetId).classList.add('active');
        });
    });

    document.querySelectorAll('[data-open-tab]').forEach(button => {
        button.addEventListener('click', () => openTab(button.dataset.openTab));
    });

    document.getElementById('currentUserSelect').addEventListener('change', (e) => {
        currentUser = e.target.value;
        renderAll();
    });

    document.querySelectorAll('.team-filter').forEach(button => {
        button.addEventListener('click', () => {
            selectedTeam = button.dataset.team;
            document.querySelectorAll('.team-filter').forEach(item => item.classList.toggle('active', item === button));
            renderPredictions();
        });
    });

    document.getElementById('adminSaveBtn').addEventListener('click', async () => {
        const statusSpan = document.getElementById('adminSaveStatus');
        statusSpan.textContent = 'Kaydediliyor...';
        const success = await saveDataToFirebase();
        if (success) {
            statusSpan.textContent = `Kaydedildi ✓ (${new Date().toLocaleTimeString('tr-TR')})`;
            renderAll();
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

function openTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(button => button.classList.toggle('active', button.dataset.target === tabId));
    document.querySelectorAll('.tab-content').forEach(section => section.classList.toggle('active', section.id === tabId));
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

    document.querySelectorAll('.team-filter').forEach(button => button.classList.toggle('active', button.dataset.team === selectedTeam));
}

function renderAll() {
    renderOverview();
    renderLeaderboard();
    renderPredictions();
    renderStatistics();
    renderAdmin();
    renderMatchNightCard();
}

function getUserStats(userName) {
    const user = appData.users[userName];
    if (!user) return { points: 0, correct: 0, incorrect: 0, percentage: 0, totalMatches: MATCH_DATA.length };
    
    let points = 0; let correct = 0; let incorrect = 0; let graded = 0;

    MATCH_DATA.forEach(match => {
        const actualResult = appData.results[match.id];
        const userPrediction = user.predictions ? user.predictions[match.id] : undefined;

        if (actualResult !== undefined && actualResult !== null && actualResult !== "") {
            graded++;
            if (userPrediction !== undefined && userPrediction !== null && userPrediction !== "") {
                if (String(actualResult) === String(userPrediction)) {
                    points += 1; correct++;
                } else { incorrect++; }
            } else { incorrect++; }
        }
    });

    const totalMatches = MATCH_DATA.length;
    const percentage = graded > 0 ? ((correct / graded) * 100).toFixed(0) : 0;

    return { points, correct, incorrect, percentage, totalMatches, graded };
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
                    <option value="3" ${currentPred == "3" ? 'selected' : ''}>Galibiyet</option>
                    <option value="1" ${currentPred == "1" ? 'selected' : ''}>Beraberlik</option>
                    <option value="0" ${currentPred == "0" ? 'selected' : ''}>Mağlubiyet</option>
                </select>
            </div>
            ${generateCommunityBarHTML(match.id)}
        </div>
    `;
}

function renderPredictions() {
    const grid = document.getElementById('predictionsGrid');
    const section = document.getElementById('predictionsTeamSection');
    const title = document.getElementById('predictionsTeamTitle');
    const teamName = selectedTeam === 'GS' ? 'Galatasaray' : 'Fenerbahçe';
    const matches = MATCH_DATA.filter(match => match.team === selectedTeam);
    grid.innerHTML = '';
    title.textContent = `${teamName} maçları`;
    section.classList.toggle('gs-section', selectedTeam === 'GS');
    section.classList.toggle('fb-section', selectedTeam === 'FB');
    document.getElementById('matchFilterCount').textContent = `${matches.length} karşılaşma`;
    const played = matches.filter(match => appData.results[match.id] !== undefined && appData.results[match.id] !== null && appData.results[match.id] !== '').length;
    document.getElementById('teamRecord').textContent = `${played} / ${matches.length} sonuçlandı`;
    
    if (!currentUser || !appData.users[currentUser]) {
        grid.innerHTML = '<p>Kullanıcı seçilmedi.</p>';
        return;
    }
    
    const user = appData.users[currentUser];

    matches.forEach(match => {
        const isUserLocked = user.isLocked === true;
        const hasPrediction = user.predictions && user.predictions[match.id] !== undefined;
        const currentPred = hasPrediction ? user.predictions[match.id] : "";
        const actualResult = appData.results[match.id];

        let lockReason = "";
        if (isUserLocked) {
            lockReason = hasPrediction ? "(Tahminler Sabitlendi)" : "(Geç katıldığı için bu maça tahmin yapmadı)";
        }

        const html = generateMatchCardHTML(match, currentPred, actualResult, isUserLocked, lockReason);
        grid.innerHTML += html;
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
            renderAll();
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
                        <option value="3" ${actualResult == "3" ? 'selected' : ''}>Temsilcimiz kazandı</option>
                        <option value="1" ${actualResult == "1" ? 'selected' : ''}>Berabere</option>
                        <option value="0" ${actualResult == "0" ? 'selected' : ''}>Temsilcimiz kaybetti</option>
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

            if (success) renderAll();
            else renderStatistics();
        });
    });
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function getLeaderboardData() {
    return Object.keys(appData.users || {}).map(name => ({ name, ...getUserStats(name) }))
        .sort((a, b) => b.points - a.points || b.correct - a.correct || a.name.localeCompare(b.name, 'tr'));
}

function renderLeaderboard() {
    const tbody = document.getElementById('leaderboardBody');
    const leaderboardData = getLeaderboardData();
    if (leaderboardData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">Henüz katılımcı bulunmuyor.</td></tr>';
        return;
    }

    const newLeader = leaderboardData[0].points > 0 ? leaderboardData[0].name : null;
    if (lastLeaderName !== null && newLeader !== null && newLeader !== lastLeaderName) triggerConfetti();
    lastLeaderName = newLeader;

    tbody.innerHTML = leaderboardData.map((data, index) => {
        const badges = getUserBadges(data.name).map(badge => `<span class="badge-icon" title="${escapeHTML(badge.label)}: ${escapeHTML(badge.title)}" aria-label="${escapeHTML(badge.label)}">${badge.icon}</span>`).join('') || '<span class="empty-note">—</span>';
        const avatar = escapeHTML(data.name.trim().charAt(0) || '?');
        return `<tr class="${index < 3 ? `rank-${index + 1}` : ''} ${data.name === currentUser ? 'current-player' : ''}">
            <td class="rank-cell">${index < 3 ? ['①', '②', '③'][index] : index + 1}</td>
            <td><div class="player-cell"><span class="avatar">${avatar}</span><span class="player-name">${escapeHTML(data.name)}</span></div></td>
            <td class="points-cell">${data.points}</td><td>${data.correct} / ${data.graded}</td><td class="accuracy-cell">%${data.percentage}</td><td><div class="badge-list">${badges}</div></td>
        </tr>`;
    }).join('');

    document.getElementById('badgeGuide').innerHTML = '<span>🔥 Seri Bozmuyor · 3+ doğru arka arkaya</span><span>🎲 Risk Sever · az seçilen tahmini bildi</span><span>💯 Kusursuz · sonuçlananların hepsi doğru</span>';
}

function renderOverview() {
    const players = getLeaderboardData();
    const resolved = getResolvedMatchesInOrder();
    const correctTotal = players.reduce((sum, player) => sum + player.correct, 0);
    document.getElementById('overviewLeader').textContent = players[0]?.name || '—';
    document.getElementById('overviewLeaderPoints').textContent = `${players[0]?.points || 0} puan`;
    document.getElementById('overviewResolved').textContent = `${resolved.length} / ${MATCH_DATA.length}`;
    document.getElementById('overviewCorrect').textContent = correctTotal;
    document.getElementById('overviewUsers').textContent = players.length;

    const podium = document.getElementById('overviewPodium');
    podium.innerHTML = players.length ? players.slice(0, 3).map((player, index) => {
        const icons = getUserBadges(player.name).map(badge => badge.icon).join(' ');
        return `<div class="podium-row"><span class="podium-rank">${['01', '02', '03'][index]}</span><span class="avatar">${escapeHTML(player.name.trim().charAt(0) || '?')}</span><span class="podium-name">${escapeHTML(player.name)} <span class="podium-badges">${icons}</span></span><span class="podium-points">${player.points} p</span></div>`;
    }).join('') : '<p class="empty-note">Sıralama oluşunca ilk isimler burada görünecek.</p>';

    const recent = resolved.slice().reverse().slice(0, 4);
    document.getElementById('overviewRecent').innerHTML = recent.length ? recent.map(match => `<div class="recent-row"><span><span class="recent-fixture">${escapeHTML(match.home)} – ${escapeHTML(match.away)}</span><span class="recent-date">${match.date}</span></span><span class="recent-result">${RESULT_LABELS[appData.results[match.id]]}</span></div>`).join('') : '<p class="empty-note">İlk maç sonucu girilince burada görünecek.</p>';
}

function getTeamName(team) { return team === 'GS' ? 'Galatasaray' : 'Fenerbahçe'; }

function renderStatistics() {
    const users = Object.keys(appData.users || {});
    const resolved = getResolvedMatchesInOrder();
    const predictions = users.reduce((sum, name) => sum + MATCH_DATA.filter(match => {
        const value = appData.users[name]?.predictions?.[match.id];
        return value !== undefined && value !== null && value !== '';
    }).length, 0);
    const correct = users.reduce((sum, name) => sum + getUserStats(name).correct, 0);
    const graded = resolved.length * users.length;
    const accuracy = graded ? Math.round(correct / graded * 100) : 0;
    document.getElementById('statsResolved').textContent = `${resolved.length} / ${MATCH_DATA.length}`;
    document.getElementById('statsCorrect').textContent = correct;
    document.getElementById('statsAccuracy').textContent = graded ? `%${accuracy}` : '—';
    document.getElementById('statsGraded').textContent = `${graded} değerlendirilen tahmin`;
    document.getElementById('statsPredictions').textContent = predictions;

    const outcomeMarkup = ['GS', 'FB'].map(team => {
        const teamMatches = MATCH_DATA.filter(match => match.team === team);
        const counts = { '3': 0, '1': 0, '0': 0 };
        teamMatches.forEach(match => { if (Object.hasOwn(counts, appData.results[match.id])) counts[appData.results[match.id]]++; });
        const played = Object.values(counts).reduce((sum, count) => sum + count, 0);
        const width = value => played ? `${value / played * 100}%` : '0%';
        return `<div class="outcome-row"><span class="outcome-team ${team.toLowerCase()}">${getTeamName(team)}</span><div class="outcome-track" title="${played} sonuç"><i class="outcome-seg win" style="width:${width(counts['3'])}"></i><i class="outcome-seg draw" style="width:${width(counts['1'])}"></i><i class="outcome-seg loss" style="width:${width(counts['0'])}"></i></div><span class="outcome-total">${played}/${teamMatches.length}</span></div>`;
    }).join('');
    document.getElementById('teamOutcomeStats').innerHTML = `${outcomeMarkup}<div class="outcome-legend"><span><i class="win"></i>Galibiyet</span><span><i class="draw"></i>Beraberlik</span><span><i class="loss"></i>Mağlubiyet</span></div>`;

    const picks = { '3': 0, '1': 0, '0': 0 };
    users.forEach(name => MATCH_DATA.forEach(match => {
        const pick = appData.users[name]?.predictions?.[match.id];
        if (Object.hasOwn(picks, pick)) picks[pick]++;
    }));
    const totalPicks = Object.values(picks).reduce((sum, count) => sum + count, 0);
    const popular = Object.entries(picks).sort((a, b) => b[1] - a[1])[0];
    document.getElementById('communitySummary').innerHTML = totalPicks ? `
        <div class="community-stat"><span>⚽</span><div><strong>${RESULT_LABELS['3']}</strong><small>Takımların kazanacağı yönündeki seçim</small></div><b>%${Math.round(picks['3'] / totalPicks * 100)}</b></div>
        <div class="community-stat"><span>🤝</span><div><strong>${RESULT_LABELS['1']}</strong><small>Beraberlik tahminleri</small></div><b>%${Math.round(picks['1'] / totalPicks * 100)}</b></div>
        <div class="community-stat"><span>🛡</span><div><strong>${RESULT_LABELS['0']}</strong><small>Temsilcilerimizin kaybedeceği yönündeki seçim</small></div><b>%${Math.round(picks['0'] / totalPicks * 100)}</b></div>
        <div class="community-callout">En çok tercih edilen: <strong>${RESULT_LABELS[popular[0]]}</strong> · ${popular[1]} tahmin</div>` : '<p class="empty-note">Kaydedilmiş tahmin bulunmuyor.</p>';

    document.getElementById('formChart').innerHTML = resolved.length ? resolved.slice().reverse().map(match => {
        const dist = getMatchDistribution(match.id);
        const correctPicks = users.filter(name => String(appData.users[name]?.predictions?.[match.id] ?? '') === String(appData.results[match.id])).length;
        const percent = dist.total ? Math.round(correctPicks / dist.total * 100) : 0;
        return `<div class="form-row"><span class="form-fixture" title="${escapeHTML(match.home)} – ${escapeHTML(match.away)}">${escapeHTML(match.home)} – ${escapeHTML(match.away)}</span><div class="form-track"><div class="form-fill" style="width:${percent}%"></div></div><span class="form-count">${correctPicks}/${dist.total}</span></div>`;
    }).join('') : '<p class="empty-note">İlk sonuç girildiğinde maç formu burada oluşacak.</p>';

    const topAccuracy = getLeaderboardData().filter(player => player.graded > 0).sort((a, b) => Number(b.percentage) - Number(a.percentage) || b.points - a.points).slice(0, 5);
    document.getElementById('accuracyLeaders').innerHTML = topAccuracy.length ? topAccuracy.map((player, index) => `<div class="accuracy-row"><span class="podium-rank">${String(index + 1).padStart(2, '0')}</span><span class="avatar">${escapeHTML(player.name.trim().charAt(0) || '?')}</span><span class="accuracy-name">${escapeHTML(player.name)}</span><span class="accuracy-meta">${player.correct}/${player.graded} doğru</span><span class="accuracy-rate">%${player.percentage}</span></div>`).join('') : '<p class="empty-note">Değerlendirilen ilk maçtan sonra isabet sıralaması oluşacak.</p>';
}

function renderMatchNightCard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const unresolved = MATCH_DATA.filter(match => appData.results[match.id] === undefined || appData.results[match.id] === null || appData.results[match.id] === '')
        .sort((a, b) => parseDate(a.date).localeCompare(parseDate(b.date)));
    const nextMatch = unresolved.find(match => new Date(`${parseDate(match.date)}T00:00:00`) >= today) || unresolved[0];
    const fixture = document.getElementById('matchNightFixture');
    const meta = document.getElementById('matchNightMeta');
    const team = document.getElementById('matchNightTeam');
    const countdown = document.getElementById('matchNightCountdown');
    if (!nextMatch) {
        team.textContent = 'SEZON TAMAMLANDI';
        fixture.textContent = 'Bütün maçların sonucu girildi';
        meta.textContent = '2026/27 sezon tablosu son hâlinde.';
        countdown.innerHTML = '<b>✓</b><span>TAMAM</span>';
        return;
    }
    const date = new Date(`${parseDate(nextMatch.date)}T00:00:00`);
    const days = Math.max(0, Math.round((date - today) / 86400000));
    const isPast = date < today;
    team.textContent = `${getTeamName(nextMatch.team).toUpperCase()} · ŞAMPİYONLAR LİGİ`;
    fixture.textContent = `${nextMatch.home}  –  ${nextMatch.away}`;
    meta.textContent = `${date.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })} · ${isPast ? 'Sonuç girişi bekleniyor' : days === 0 ? 'Bugün maç günü' : 'Fikstürde sıradaki maç'}`;
    countdown.innerHTML = `<b>${isPast || days === 0 ? '•' : days}</b><span>${isPast ? 'BEKLİYOR' : days === 0 ? 'BUGÜN' : 'GÜN KALDI'}</span>`;
}

document.addEventListener('DOMContentLoaded', init);
