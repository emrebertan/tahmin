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
let selectedTeam = 'GS';
let saveQueue = Promise.resolve();
let lastLeaderName = null;
const RESULT_LABELS = { "3": "Galibiyet", "1": "Beraberlik", "0": "Mağlubiyet" };
const TEAM_LOGOS = {
    'Sporting': 'https://r2.thesportsdb.com/images/media/team/badge/5hiuk71783137875.png',
    'Galatasaray': 'https://r2.thesportsdb.com/images/media/team/badge/io7jk21767941298.png',
    'Fenerbahçe': 'https://r2.thesportsdb.com/images/media/team/badge/twxxvs1448199691.png',
    'Barcelona': 'https://r2.thesportsdb.com/images/media/team/badge/wq9sir1639406443.png',
    'Lille': 'https://r2.thesportsdb.com/images/media/team/badge/2giize1534005340.png',
    'Stuttgart': 'https://r2.thesportsdb.com/images/media/team/badge/yppyux1473454085.png',
    'Aston Villa': 'https://r2.thesportsdb.com/images/media/team/badge/uwzw561787679026.png',
    'AEK': 'https://r2.thesportsdb.com/images/media/team/badge/4nogst1602773624.png',
    'Feyenoord': 'https://r2.thesportsdb.com/images/media/team/badge/uturtx1473534803.png',
    'PSG': 'https://r2.thesportsdb.com/images/media/team/badge/rwqrrq1473504808.png',
    'Roma': 'https://r2.thesportsdb.com/images/media/team/badge/jwro2s1760820674.png',
    'Slavia Prag': 'https://r2.thesportsdb.com/images/media/team/badge/l7kl4n1759252139.png',
    'Shakhtar': 'https://r2.thesportsdb.com/images/media/team/badge/sqrxsr1421791799.png',
    'LASK': 'https://r2.thesportsdb.com/images/media/team/badge/oox26l1683556395.png',
    'Liverpool': 'https://r2.thesportsdb.com/images/media/team/badge/kfaher1737969724.png',
    'Villarreal': 'https://r2.thesportsdb.com/images/media/team/badge/vrypqy1473503073.png',
    'Atletico Madrid': 'https://r2.thesportsdb.com/images/media/team/badge/0ulh3q1719984315.png'
};

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
            appData = docSnap.data() || { users: {}, results: {} };
        } else {
            appData = { users: LEGACY_USERS, results: {} };
            saveDataToFirebase();
        }

        appData.users ||= {};
        appData.results ||= {};

        Object.keys(LEGACY_USERS).forEach(name => {
            if (!appData.users[name]) {
                appData.users[name] = LEGACY_USERS[name];
            }
        });

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

        if (actualResult !== undefined && actualResult !== null && actualResult !== "" && userPrediction !== undefined && userPrediction !== null && userPrediction !== "") {
            graded++;
            if (String(actualResult) === String(userPrediction)) {
                points += 1; correct++;
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
    if (total === 0) return { win: 0, draw: 0, lose: 0, winPct: 0, drawPct: 0, losePct: 0, total: 0 };
    return {
        win,
        draw,
        lose,
        winPct: Math.round((win / total) * 100),
        drawPct: Math.round((draw / total) * 100),
        losePct: Math.round((lose / total) * 100),
        total
    };
}

function generateCommunityBarHTML(matchId) {
    const dist = getMatchDistribution(matchId);
    if (dist.total === 0) {
        return '<div class="community-pulse"><small>Henüz kayıtlı tahmin yok</small></div>';
    }
    return `
        <div class="community-pulse">
            <small>Katılımcı dağılımı</small>
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

    let maxStreak = 0, currentStreak = 0, currentMissStreak = 0;
    let riskyHit = false;

    resolvedMatches.forEach(match => {
        const actual = appData.results[match.id];
        const pred = user.predictions ? user.predictions[match.id] : undefined;
        if (pred === undefined || pred === null || pred === "") {
            currentStreak = 0;
            currentMissStreak = 0;
            return;
        }
        const isHit = String(pred) === String(actual);

        if (isHit) {
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);
            currentMissStreak = 0;

            const dist = getMatchDistribution(match.id);
            const pctMap = { "3": dist.winPct, "1": dist.drawPct, "0": dist.losePct };
            if (dist.total > 0 && pctMap[String(pred)] <= 30) {
                riskyHit = true;
            }
        } else {
            currentStreak = 0;
            currentMissStreak++;
        }
    });

    if (maxStreak >= 3) {
        badges.push({ icon: '🔥', label: 'Doğru Seri', title: `${maxStreak} maç üst üste doğru tahmin` });
    }
    if (riskyHit) {
        badges.push({ icon: '🎯', label: 'Sürpriz İsabet', title: 'Az tercih edilen bir tahmini doğru bildi' });
    }
    if (currentMissStreak >= 3) {
        badges.push({ icon: '🧊', label: 'Soğuk Seri', title: `Son ${currentMissStreak} değerlendirilmiş tahmin yanlış` });
    }

    const stats = getUserStats(userName);
    if (stats.correct >= 1) {
        badges.push({ icon: '✅', label: 'İlk İsabet', title: 'En az bir doğru tahmin yaptı' });
    }
    if (stats.correct >= 10) {
        badges.push({ icon: '🔟', label: '10 İsabet', title: '10 doğru tahmine ulaştı' });
    }
    if (stats.graded >= 5 && Number(stats.percentage) >= 70) {
        badges.push({ icon: '📈', label: 'Yüksek İsabet', title: `En az 5 tahminde %${stats.percentage} isabet` });
    }
    if (stats.graded > 0 && stats.correct === stats.graded) {
        badges.push({ icon: '💯', label: 'Tam İsabet', title: 'Değerlendirilen tahminlerinin tamamı doğru' });
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

function teamUnitHTML(name) {
    const logo = TEAM_LOGOS[name];
    const initials = name.split(/\s+/).map(part => part[0]).join('').slice(0, 3).toUpperCase();
    return `<div class="team-unit"><span class="team-crest ${logo ? '' : 'no-logo'}"><img src="${logo || ''}" alt="" loading="lazy" onerror="this.onerror=null;this.parentNode.classList.add('no-logo')"><span class="team-initial">${escapeHTML(initials)}</span></span><strong>${escapeHTML(name)}</strong></div>`;
}

function matchTeamsHTML(match) {
    return `<div class="team-pair">${teamUnitHTML(match.home)}<span class="match-versus">VS</span>${teamUnitHTML(match.away)}</div>`;
}

function aggregateMatchCardHTML(match) {
    const result = appData.results[match.id];
    const teamName = getTeamName(match.team);
    const resultMarkup = result !== undefined && result !== null && result !== ''
        ? `<span class="match-result-pill is-final">${escapeHTML(teamName)} · ${escapeHTML(RESULT_LABELS[String(result)] || 'Sonuç girildi')}</span>`
        : '<span class="match-result-pill">Sonuç bekleniyor</span>';
    const dist = getMatchDistribution(match.id);

    return `<article class="match-card match-centre-card">
        <div class="fixture-time"><span>MAÇ ${match.id.slice(1).padStart(2, '0')}</span><strong>${escapeHTML(match.date)}</strong><small>${escapeHTML(teamName)}</small></div>
        <div class="matchup">${matchTeamsHTML(match)}</div>
        <div class="match-insight">${resultMarkup}${generateCommunityBarHTML(match.id)}<div class="vote-counts"><span>${dist.win} galibiyet</span><span>${dist.draw} beraberlik</span><span>${dist.lose} mağlubiyet</span><b>${dist.total} tahmin</b></div></div>
    </article>`;
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
    
    grid.innerHTML = matches.map(aggregateMatchCardHTML).join('');
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
                <div class="match-teams">${matchTeamsHTML(match)}</div>
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

            const hasCorrectPrediction = Object.values(appData.users || {}).some(user => String(user.predictions?.[matchId] ?? '') === String(val) && val !== '');
            if (success && hasCorrectPrediction) {
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
        return `<tr class="${index < 3 ? `rank-${index + 1}` : ''}">
            <td class="rank-cell">${index < 3 ? ['①', '②', '③'][index] : index + 1}</td>
            <td><div class="player-cell"><span class="avatar">${avatar}</span><span class="player-name">${escapeHTML(data.name)}</span></div></td>
            <td class="points-cell">${data.points}</td><td>${data.correct} / ${data.graded}</td><td class="accuracy-cell">%${data.percentage}</td><td><div class="badge-list">${badges}</div></td>
        </tr>`;
    }).join('');

    document.getElementById('badgeGuide').innerHTML = '<span>🔥 Doğru Seri · art arda 3 doğru</span><span>🧊 Soğuk Seri · art arda 3 yanlış</span><span>🎯 Sürpriz İsabet · az seçilen tahmin doğru</span><span>✅ İlk İsabet · en az 1 doğru</span><span>🔟 10 İsabet · 10 doğru tahmin</span><span>📈 Yüksek İsabet · %70 ve en az 5 değerlendirme</span><span>💯 Tam İsabet · değerlendirilenlerin hepsi doğru</span>';
}

function getAggregateStats() {
    const users = Object.values(appData.users || {});
    const stats = { totalPicks: 0, correct: 0, incorrect: 0, pending: 0 };
    users.forEach(user => MATCH_DATA.forEach(match => {
        const pick = user.predictions?.[match.id];
        if (pick === undefined || pick === null || pick === '') return;
        stats.totalPicks++;
        const result = appData.results[match.id];
        if (result === undefined || result === null || result === '') stats.pending++;
        else if (String(pick) === String(result)) stats.correct++;
        else stats.incorrect++;
    }));
    stats.graded = stats.correct + stats.incorrect;
    stats.accuracy = stats.graded ? Math.round(stats.correct / stats.graded * 100) : null;
    return stats;
}

function renderOverview() {
    const players = getLeaderboardData();
    const resolved = getResolvedMatchesInOrder();
    const aggregate = getAggregateStats();
    document.getElementById('overviewTotalPicks').textContent = aggregate.totalPicks;
    document.getElementById('overviewTotalMeta').textContent = `${players.length} katılımcı · ${MATCH_DATA.length} maçlık fikstür`;
    document.getElementById('overviewCorrect').textContent = aggregate.correct;
    document.getElementById('overviewCorrectMeta').textContent = `${aggregate.graded} değerlendirilmiş tahminden`;
    document.getElementById('overviewWrong').textContent = aggregate.incorrect;
    document.getElementById('overviewWrongMeta').textContent = `${aggregate.graded} değerlendirilmiş tahminden`;
    document.getElementById('overviewPending').textContent = aggregate.pending;
    document.getElementById('overviewAccuracyLabel').textContent = aggregate.accuracy === null ? '—' : `%${aggregate.accuracy}`;
    document.getElementById('overviewAccuracyBar').style.width = `${aggregate.accuracy || 0}%`;
    document.getElementById('overviewGradedLabel').textContent = `${aggregate.graded} değerlendirildi · ${aggregate.pending} sonuç bekliyor`;

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
    const aggregate = getAggregateStats();
    document.getElementById('statsResolved').textContent = `${resolved.length} / ${MATCH_DATA.length}`;
    document.getElementById('statsCorrect').textContent = aggregate.correct;
    document.getElementById('statsWrong').textContent = aggregate.incorrect;
    document.getElementById('statsPending').textContent = aggregate.pending;
    document.getElementById('statsAccuracy').textContent = aggregate.accuracy === null ? '—' : `%${aggregate.accuracy}`;
    document.getElementById('statsGraded').textContent = `${aggregate.correct} / ${aggregate.graded} değerlendirilen tahmin`;
    document.getElementById('statsPredictions').textContent = aggregate.totalPicks;

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
        <div class="community-stat"><span>⚽</span><div><strong>Temsilci takım galibiyeti</strong><small>Galatasaray ve Fenerbahçe galibiyeti tahminleri</small></div><b>%${Math.round(picks['3'] / totalPicks * 100)}</b></div>
        <div class="community-stat"><span>🤝</span><div><strong>${RESULT_LABELS['1']}</strong><small>Beraberlik tahminleri</small></div><b>%${Math.round(picks['1'] / totalPicks * 100)}</b></div>
        <div class="community-stat"><span>🛡</span><div><strong>Temsilci takım mağlubiyeti</strong><small>Galatasaray ve Fenerbahçe mağlubiyeti tahminleri</small></div><b>%${Math.round(picks['0'] / totalPicks * 100)}</b></div>
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
