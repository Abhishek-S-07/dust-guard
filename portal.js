document.addEventListener('DOMContentLoaded', () => {

    // --- AUTHENTICATION ---
    const loginOverlay = document.getElementById('login-overlay');
    const appContainer = document.getElementById('app-container');
    const loginBtn = document.getElementById('login-btn');
    const loginPass = document.getElementById('login-password');
    const loginError = document.getElementById('login-error');

    function attemptLogin() {
        if (loginPass.value === 'admin') {
            loginOverlay.classList.add('hidden');
            setTimeout(() => {
                loginOverlay.style.display = 'none';
                
                // Show dashboard elements
                document.querySelectorAll('.portal-only').forEach(el => {
                    el.style.display = (el.tagName === 'DIV' || el.tagName === 'SECTION') ? 'flex' : 'inline-block';
                    if (el.classList.contains('nav-item')) el.style.display = 'flex';
                });
                document.getElementById('login-profile').classList.remove('hidden');
                document.getElementById('btn-launch-portal').style.display = 'none';
                
                // Navigate to Overview
                document.querySelector('[data-target="view-overview"]').click();
            }, 600);
        } else {
            loginError.classList.remove('hidden');
        }
    }

    loginBtn.addEventListener('click', attemptLogin);
    loginPass.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') attemptLogin();
    });

    document.getElementById('btn-launch-portal').addEventListener('click', () => {
        loginOverlay.style.display = 'flex';
        loginOverlay.classList.remove('hidden');
        loginPass.focus();
    });

    // --- SPA ROUTING ---
    const navItems = document.querySelectorAll('.topbar-nav .nav-item[data-target]');
    const viewSections = document.querySelectorAll('.view-section');
    const pageTitle = document.getElementById('dyn-title');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-target');
            
            // Toggle dashboard-only elements based on current view
            const isDashboardView = ['view-overview', 'view-scanner', 'view-active-shifts', 'view-directory', 'view-fleet', 'view-map'].includes(targetId);
            const statsBar = document.querySelector('.persistent-stats-bar');
            if (statsBar) {
                statsBar.style.display = isDashboardView ? 'flex' : 'none';
            }

            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            viewSections.forEach(v => v.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');

            if (pageTitle) pageTitle.innerText = item.innerText.replace(/[^\w\s]/gi, '').trim(); 
        });
    });

    // --- WORKER DATABASE EXPANSION ---
    let workersDB = [
        { id: 'TN-0042', name: 'Rajan K.', pm: 18, spo2: 98, twa: 15, radarX: 50, radarY: 50, hours: 4.5, peakPM: 18, pmHistory: [18], isActive: true, 
          bio: 'Senior Driller with over 12 years of experience in high-dust environments. Habitual respirator user.', blood: 'O+', exp: '12y', health: 'Excellent' },
        { id: 'TN-0089', name: 'Muthu S.', pm: 24, spo2: 97, twa: 22, radarX: 30, radarY: 70, hours: 3.2, peakPM: 24, pmHistory: [24], isActive: true,
          bio: 'Junior technician specializing in heavy machinery maintenance. High lung capacity recorded in latest check.', blood: 'A+', exp: '3y', health: 'Good' },
        { id: 'TN-0103', name: 'Siva P.', pm: 39, spo2: 95, twa: 35, radarX: 80, radarY: 20, hours: 6.1, peakPM: 39, pmHistory: [39], isActive: true,
          bio: 'Safety lead for Sector Beta. Known for strict adherence to silica dust protocols.', blood: 'B+', exp: '8y', health: 'Cleared' },
        { id: 'TN-0221', name: 'Karthi D.', pm: 65, spo2: 94, twa: 54, radarX: 20, radarY: 40, hours: 7.8, peakPM: 65, pmHistory: [65], isActive: true,
          bio: 'Heavy loader operator. Monitoring required for historical dust sensitivity.', blood: 'O-', exp: '15y', health: 'Caution' },
        { id: 'TN-0554', name: 'Arun M.', pm: 12, spo2: 99, twa: 13, radarX: 60, radarY: 80, hours: 1.5, peakPM: 12, pmHistory: [12], isActive: true,
          bio: 'Newly joined excavating apprentice. Freshly certified for all NovaSafe breathing apparatus.', blood: 'AB+', exp: '1y', health: 'Excellent' },
        { id: 'TN-0899', name: 'Vijay R.', pm: 0, spo2: 0, twa: 0, radarX: 0, radarY: 0, hours: 0, peakPM: 0, pmHistory: [], isActive: false,
          bio: 'Quarry foreman. Oversees all sector operations from the command center.', blood: 'A-', exp: '20y', health: 'Excellent' }
    ];

    const activeWorkersTableBody = document.getElementById('active-workers-table-body');
    const registeredWorkersTableBody = document.getElementById('registered-workers-table-body');
    const globalActive = document.getElementById('global-active');

    function renderWorkersTable() {
        let activeWorkersCount = workersDB.filter(w => w.isActive).length;
        globalActive.innerHTML = `${activeWorkersCount} <span class="trend up">⚡ Live</span>`;
        activeWorkersTableBody.innerHTML = ''; 
        registeredWorkersTableBody.innerHTML = '';
        
        workersDB.forEach(w => {
            // Calculate danger stage for active workers
            let dangerStage = 'SAFE';
            let colorCls = 'text-green';
            let bgCls = 'rgba(52, 199, 89, 0.05)';
            
            if (w.pm > 50 || w.twa > 50) {
                dangerStage = 'DANGER ⚠️';
                colorCls = 'text-red';
                bgCls = 'rgba(255, 59, 48, 0.1)';
            } else if (w.pm > 25 || w.twa > 25) {
                dangerStage = 'CAUTION';
                colorCls = 'text-yellow';
                bgCls = 'rgba(255, 204, 0, 0.05)';
            }

            // Always add to Registered Table
            const trReg = document.createElement('tr');
            trReg.innerHTML = `
                <td class="font-mono">${w.id}</td>
                <td><strong>${w.name}</strong></td>
                <td class="${w.isActive ? 'text-green' : 'text-secondary'}">${w.isActive ? 'On-Shift' : 'Off-Shift'}</td>
                <td class="text-right">
                    <button class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" onclick="window.viewWorkerProfile('${w.id}')">Profile</button>
                </td>
            `;
            registeredWorkersTableBody.appendChild(trReg);

            // If active, add to Active Table
            if (w.isActive) {
                const trAct = document.createElement('tr');
                if (dangerStage.includes('DANGER')) trAct.style.background = 'rgba(255, 59, 48, 0.08)';
                else if (dangerStage === 'CAUTION') trAct.style.background = 'rgba(255, 204, 0, 0.04)';

                trAct.innerHTML = `
                    <td class="font-mono">${w.id}</td>
                    <td><strong>${w.name}</strong></td>
                    <td class="font-mono">${w.hours.toFixed(2)}</td>
                    <td class="font-mono ${colorCls}">${Math.round(w.pm)} µg/m³</td>
                    <td>${w.spo2}%</td>
                    <td class="font-mono">${Math.round(w.twa)} µg/m³</td>
                    <td class="font-mono ${colorCls}"><span class="tag-status">${dangerStage}</span></td>
                    <td class="text-right">
                        <button class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" onclick="window.endWorkerShift('${w.id}')">End Shift</button>
                    </td>
                `;
                activeWorkersTableBody.appendChild(trAct);
            }
        });
    }

    // --- REPORT GENERATION (End Shift Modal) ---
    const modal = document.getElementById('shift-modal');
    window.endWorkerShift = function(workerId) {
        const w = workersDB.find(x => x.id === workerId);
        if (!w) return;

        document.getElementById('report-date').innerText = new Date().toLocaleDateString();
        document.getElementById('r-name').innerText = w.name;
        document.getElementById('r-id').innerText = w.id;
        document.getElementById('r-hours').innerText = w.hours.toFixed(2);
        
        document.getElementById('r-peak').innerText = Math.round(w.peakPM);
        document.getElementById('r-twa').innerText = Math.round(w.twa);
        document.getElementById('r-spo2').innerText = `${w.spo2}%`;
        
        // Randomize alert numbers based on how dangerous they were to simulate reality
        const simAlerts = (w.twa > 50) ? Math.floor(Math.random() * 5) + 2 : (w.twa > 25) ? 1 : 0;
        document.getElementById('r-alerts').innerText = simAlerts;
        
        const elStatus = document.getElementById('r-status');
        const elRecom = document.getElementById('r-recommendation');
        
        if (w.twa > 50) {
            elStatus.innerText = "EXCEEDED ⚠️";
            elStatus.className = "warning";
            elRecom.innerHTML = "Exposure dangerous.<br>Visit immediate PHC.";
            elRecom.style.color = "var(--accent-red)";
        } else if (w.twa > 25) {
            elStatus.innerText = "CAUTION ⚠️";
            elStatus.className = "text-yellow";
            elRecom.innerHTML = "Close to limits.<br>Check respirator seal.";
            elRecom.style.color = "var(--accent-yellow)";
        } else {
            elStatus.innerText = "SAFE ✅";
            elStatus.className = "text-green";
            elRecom.innerHTML = "Within safe legal limits.";
            elRecom.style.color = "var(--accent-green)";
        }

        w.isActive = false;
        renderWorkersTable();
        renderRadar();
        window.closeRadarDetail && window.closeRadarDetail();
        modal.classList.remove('hidden');
    };
    document.getElementById('close-modal').addEventListener('click', () => modal.classList.add('hidden'));

    // --- WORKER PROFILE MODAL ---
    window.viewWorkerProfile = function(workerId) {
        const w = workersDB.find(x => x.id === workerId);
        if (!w) return;

        // Build & inject a profile modal
        const existing = document.getElementById('profile-modal');
        if (existing) existing.remove();

        const stage = (w.pm > 50 || w.twa > 50) ? 'DANGER' : (w.pm > 25 || w.twa > 25) ? 'CAUTION' : 'SAFE';
        const stageColor = { DANGER: '#ff3b30', CAUTION: '#ffcc00', SAFE: '#34c759' }[stage];
        const statusIcon = { DANGER: '🔴', CAUTION: '🟡', SAFE: '🟢' }[stage];
        const shiftStatus = w.isActive ? '🟢 Currently On-Shift' : '⚫ Off-Shift';

        const m = document.createElement('div');
        m.id = 'profile-modal';
        m.className = 'modal';
        m.innerHTML = `
            <div class="modal-content card-glass bordered profile-modal-body">
                <div class="modal-header flex space-between align-center mb-md">
                    <h2 class="highlight-cyan">Worker Profile (Bio)</h2>
                    <button class="close-btn" onclick="document.getElementById('profile-modal').remove()">✖</button>
                </div>
                <div class="profile-hero">
                    <div class="avatar-large" style="font-size:3.5rem; width:80px; height:80px;">👨🏽‍🏭</div>
                    <div>
                        <h2>${w.name}</h2>
                        <p class="font-mono highlight-cyan">${w.id}</p>
                        <p class="text-secondary text-sm mt-sm">${shiftStatus}</p>
                    </div>
                    <div class="profile-status-badge" style="background:${stageColor}22; border:1px solid ${stageColor}; color:${stageColor};">
                        ${statusIcon} ${stage}
                    </div>
                </div>

                <!-- BIOGRAPHICAL SECTION -->
                <div class="profile-bio-section mt-md">
                    <h4 class="mb-sm text-secondary uppercase text-xs">Biographical Narrative</h4>
                    <p class="text-sm line-height-md mb-md">${w.bio || 'No biographical data available for this personnel.'}</p>
                </div>

                <div class="profile-stats grid layout-3-col">
                    <div class="profile-stat">
                        <p class="label">Experience</p>
                        <h3>${w.exp || 'N/A'}</h3>
                    </div>
                    <div class="profile-stat">
                        <p class="label">Blood Group</p>
                        <h3>${w.blood || 'Unknown'}</h3>
                    </div>
                    <div class="profile-stat">
                        <p class="label">Health Status</p>
                        <h3>${w.health || 'Stable'}</h3>
                    </div>
                </div>

                <div class="profile-stats grid layout-2-col mt-md">
                   <div class="profile-stat">
                        <p class="label">Base Location</p>
                        <h3>Sector B-7</h3>
                    </div>
                    <div class="profile-stat">
                        <p class="label">Total Experience</p>
                        <h3>${w.exp || 'N/A'}</h3>
                    </div>
                </div>

                <div class="twa-bar-section mt-md">
                    <div class="flex space-between">
                        <p class="label">Cumulative Exposure Alert Threshold</p>
                        <p class="font-mono text-sm">${Math.min(Math.round((w.twa/50)*100),100)}%</p>
                    </div>
                    <div class="progress-bar-container mt-sm">
                        <div class="progress-bar ${w.twa>50?'red':w.twa>25?'yellow':'green'}"
                             style="width:${Math.min((w.twa/50)*100,100)}%"></div>
                    </div>
                </div>

                ${w.isActive ? `<button class="btn btn-primary w-full mt-md" onclick="document.getElementById('profile-modal').remove(); window.endWorkerShift('${w.id}')">Emergency Shift Termination</button>` : `<p class="text-secondary text-center mt-md text-sm">Personnel currently off-duty.</p>`}
            </div>
        `;
        document.body.appendChild(m);
        // Click backdrop to close
        m.addEventListener('click', (e) => { if (e.target === m) m.remove(); });
    };

    // --- CHART.JS INITIALIZATION ---
    const ctx = document.getElementById('liveChart')?.getContext('2d');
    let pmChart = null;
    if (ctx) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(0, 225, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 225, 255, 0.0)');

        pmChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [], datasets: [{
                    label: 'Fleet Average PM2.5 Stream', data: [],
                    borderColor: '#00e1ff', backgroundColor: gradient,
                    borderWidth: 3, fill: true, tension: 0.4, 
                    pointRadius: 0, pointHitRadius: 10,
                    borderCapStyle: 'round'
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: { 
                    x: { display: false }, 
                    y: { 
                        min: 0, max: 120, 
                        grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
                        ticks: { color: 'rgba(255,255,255,0.3)', font: { family: 'Space Mono' } }
                    } 
                },
                animation: { duration: 800, easing: 'easeOutQuart' }, 
                plugins: { legend: { display: false } }
            }
        });
    }

    // --- RADAR MAP RENDERING ---
    const radar = document.getElementById('radar');
    let selectedWorkerId = null;

    window.closeRadarDetail = function() {
        selectedWorkerId = null;
        document.querySelectorAll('.radar-dot.selected').forEach(d => d.classList.remove('selected'));
        document.getElementById('radar-empty').classList.remove('hidden');
        document.getElementById('radar-worker-info').classList.add('hidden');
    };

    function showRadarDetail(w) {
        selectedWorkerId = w.id;
        const stage = (w.pm > 50 || w.twa > 50) ? 'DANGER' : (w.pm > 25 || w.twa > 25) ? 'CAUTION' : 'SAFE';
        const stageColorMap = { DANGER: '#ff3b30', CAUTION: '#ffcc00', SAFE: '#34c759' };
        const barColorMap  = { DANGER: 'red', CAUTION: 'yellow', SAFE: 'green' };
        const twaPercent = Math.min((w.twa / 50) * 100, 100);

        document.getElementById('d-name').innerText    = w.name;
        document.getElementById('d-id').innerText      = w.id;
        document.getElementById('d-pm').innerHTML      = `${Math.round(w.pm)} <span class="unit">µg/m³</span>`;
        document.getElementById('d-twa').innerHTML     = `${Math.round(w.twa)} <span class="unit">µg/m³</span>`;
        document.getElementById('d-spo2').innerHTML    = `${w.spo2} <span class="unit">%</span>`;
        document.getElementById('d-hours').innerHTML   = `${w.hours.toFixed(1)} <span class="unit">hrs</span>`;
        document.getElementById('d-twa-pct').innerText = `${Math.round(twaPercent)}%`;

        const bar = document.getElementById('d-twa-bar');
        bar.style.width = twaPercent + '%';
        bar.className = `progress-bar ${barColorMap[stage]}`;

        const badge = document.getElementById('d-badge');
        badge.innerText = stage;
        badge.style.background = stageColorMap[stage] + '22';
        badge.style.borderColor = stageColorMap[stage];
        badge.style.color = stageColorMap[stage];

        document.getElementById('d-btn-endshift').onclick = () => window.endWorkerShift(w.id);

        document.getElementById('radar-empty').classList.add('hidden');
        document.getElementById('radar-worker-info').classList.remove('hidden');
    }

    // Close detail when clicking radar background
    radar && radar.addEventListener('click', (e) => {
        if (!e.target.classList.contains('radar-dot')) window.closeRadarDetail();
    });

    function renderRadar() {
        if (!radar) return;
        const activeCount = workersDB.filter(w => w.isActive).length;
        const countEl = document.getElementById('radar-worker-count');
        if (countEl) countEl.innerText = activeCount;

        document.querySelectorAll('.radar-dot').forEach(el => el.remove());

        workersDB.forEach(w => {
            if (!w.isActive) return;

            const dot = document.createElement('div');
            dot.className = 'radar-dot';
            dot.title = '';

            if (w.pm > 50 || w.twa > 50) dot.classList.add('danger');
            else if (w.pm > 25 || w.twa > 25) dot.classList.add('caution');
            else dot.classList.add('safe');

            w.radarX += (Math.random() * 4 - 2);
            w.radarY += (Math.random() * 4 - 2);
            if (w.radarX < 10) w.radarX = 10; if (w.radarX > 90) w.radarX = 90;
            if (w.radarY < 10) w.radarY = 10; if (w.radarY > 90) w.radarY = 90;

            dot.style.left = w.radarX + '%';
            dot.style.top  = w.radarY + '%';

            // Restore selected state if same worker
            if (w.id === selectedWorkerId) {
                dot.classList.add('selected');
                showRadarDetail(w); // keep detail panel live
            }

            // CLICK ONLY — populate side panel
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.radar-dot.selected').forEach(d => d.classList.remove('selected'));
                dot.classList.add('selected');
                showRadarDetail(w);
            });

            radar.appendChild(dot);
        });

    }

    // --- SCANNER INTERACTION ---
    const mockBadge = document.getElementById('mock-badge');
    const scanResult = document.getElementById('scan-result');
    const scanTitle = document.getElementById('scan-title');
    const scanData = document.getElementById('scan-data');
    const waves = document.querySelectorAll('.badge-nfc-waves .wave');
    const badgePm = document.getElementById('badge-pm');
    const btnAddMode = document.getElementById('btn-add-scan-mode');
    
    let isAddMode = false;
    let newWorkerNames = ['Velu T.', 'Kumar L.', 'Devi K.', 'Ramesh A.', 'Babu V.'];

    btnAddMode.addEventListener('click', () => {
        isAddMode = !isAddMode;
        if (isAddMode) {
            btnAddMode.classList.replace('btn-secondary', 'btn-primary');
            btnAddMode.innerText = "Scanning to Register... (Hover over badge)";
        } else {
            btnAddMode.classList.replace('btn-primary', 'btn-secondary');
            btnAddMode.innerText = "➕ Add Worker Mode";
        }
    });

    mockBadge.addEventListener('mouseenter', () => {
        waves.forEach(w => w.classList.add('animate-wave'));
        
        mockBadge.scanTimeout = setTimeout(() => {
            scanResult.classList.remove('hidden');
            scanResult.classList.add('fade-in');
            badgePm.innerText = "SCAN: OK";
            badgePm.style.color = "var(--accent-cyan)";
            mockBadge.classList.add('glow');

            if (isAddMode) {
                let generatedId = 'TN-' + Math.floor(1000 + Math.random() * 9000);
                let generatedName = newWorkerNames[Math.floor(Math.random() * newWorkerNames.length)];
                let newW = {
                    id: generatedId, name: generatedName,
                    pm: Math.random() * 40 + 10, spo2: Math.floor(95 + Math.random() * 5), twa: Math.random() * 30 + 10,
                    radarX: 10 + Math.random() * 80, radarY:  10 + Math.random() * 80,
                    hours: 0, peakPM: 0, pmHistory: [], isActive: true,
                    bio: 'Newly registered personnel. Pending full medical clearance and history sync.',
                    blood: 'Pending', exp: 'New', health: 'Scanning'
                };
                workersDB.push(newW);
                renderWorkersTable();
                renderRadar();

                scanTitle.innerText = "Success: NEW Worker Registered!";
                scanTitle.className = "text-green mb-sm text-center";
                scanData.innerHTML = `
                    <div><p class="text-secondary text-sm">Name</p><p class="font-mono">${newW.name}</p></div>
                    <div><p class="text-secondary text-sm">Assigned ID</p><p class="font-mono">${newW.id}</p></div>
                    <div class="full-width"><p class="text-secondary text-sm">Status</p><p class="text-green font-mono">Syncing to cloud...</p></div>
                `;
                isAddMode = false;
                btnAddMode.classList.replace('btn-primary', 'btn-secondary');
                btnAddMode.innerText = "➕ Add Worker Mode";

            } else {
                scanTitle.innerText = "Success: Worker Authenticated";
                scanTitle.className = "highlight-cyan mb-sm text-center";
                scanData.innerHTML = `
                    <div><p class="text-secondary text-sm">Name</p><p class="font-mono">Rajan K.</p></div>
                    <div><p class="text-secondary text-sm">ID</p><p class="font-mono">TN-0042</p></div>
                    <div><p class="text-secondary text-sm">Cumulative Exposure</p><p class="font-mono">827 hrs</p></div>
                    <div><p class="text-secondary text-sm">Health Status</p><p class="font-mono text-green">Cleared for work</p></div>
                `;
            }
        }, 1200);
    });

    mockBadge.addEventListener('mouseleave', () => {
        waves.forEach(w => w.classList.remove('animate-wave'));
        clearTimeout(mockBadge.scanTimeout);
        badgePm.innerText = "PM2.5: --";
        mockBadge.classList.remove('glow');
    });

    // --- GLOBAL LOCKDOWN ---
    const btnLockdown = document.getElementById('btn-lockdown');
    btnLockdown.addEventListener('click', () => {
        document.body.classList.toggle('lockdown-active');
        if (document.body.classList.contains('lockdown-active')) {
            btnLockdown.innerText = "🛑 CANCEL LOCKDOWN";
            btnLockdown.style.background = 'black';
            document.querySelector('.top-navbar').style.borderBottomColor = 'var(--accent-red)';
            triggerAlertSMS("[CRITICAL] SITE WIDE EVACUATION. DUST LEVELS FATAL.", workersDB[0].id);
        } else {
            btnLockdown.innerText = "🚨 LOCKDOWN";
            btnLockdown.style.background = 'rgba(255, 59, 48, 0.15)';
            document.querySelector('.top-navbar').style.borderBottomColor = 'var(--border-glass)';
        }
    });

    // --- OVERVIEW ENGINE ---
    let tickCount = 0; 
    let isDustSpike = false;
    let totalAlertsFired = 0;

    const elPm = document.getElementById('live-pm');
    const elTwa = document.getElementById('live-twa');
    const elSpo2 = document.getElementById('live-spo2');
    const elLed = document.getElementById('live-led').querySelector('.led');
    const elLedStatusText = document.getElementById('led-status-text');
    const elTwaBar = document.getElementById('twa-bar');
    const elGlobalAlerts = document.getElementById('global-alerts');
    const elSmsFeed = document.getElementById('sms-feed');
    const elGlobalAvg = document.getElementById('global-avg');

    function updateVisuals() {
        // Tracker box bound to Rajan (0)
        let rajan = workersDB[0];
        elPm.innerHTML = `${Math.round(rajan.pm)} <span class="unit">µg/m³</span>`;
        elTwa.innerHTML = `${Math.round(rajan.twa)} <span class="unit">µg/m³</span>`;
        elSpo2.innerText = `${rajan.spo2}%`;

        let colorClass = 'green'; let statusText = 'SAFE';
        if (rajan.pm > 50) { colorClass = 'red'; statusText = 'DANGER!'; } 
        else if (rajan.pm > 25) { colorClass = 'yellow'; statusText = 'CAUTION'; }

        elLed.className = `led ${colorClass}`;
        elLedStatusText.innerText = statusText;
        elLedStatusText.className = `text-${colorClass}`;

        let twaPercent = (rajan.twa / 100) * 100;
        if (twaPercent > 100) twaPercent = 100;
        elTwaBar.style.width = `${twaPercent}%`;
        elTwaBar.className = 'progress-bar';
        if (rajan.twa > 50) elTwaBar.classList.add('red');
        else if (rajan.twa > 25) elTwaBar.classList.add('yellow');
        else elTwaBar.classList.add('green');
        
        if (rajan.pm > 50 && tickCount % 5 === 0 && !document.body.classList.contains('lockdown-active')) triggerAlertSMS(null, rajan.id);

        let activeWorkers = workersDB.filter(w => w.isActive);
        let fleetAvg = activeWorkers.length > 0 ? activeWorkers.reduce((sum, w) => sum + w.pm, 0) / activeWorkers.length : 0;
        elGlobalAvg.innerText = Math.round(fleetAvg) + " µg";

        renderWorkersTable();
        renderRadar();

        if (pmChart) {
            pmChart.data.labels.push(""); 
            pmChart.data.datasets[0].data.push(fleetAvg);
            if (pmChart.data.labels.length > 25) {
                pmChart.data.labels.shift();
                pmChart.data.datasets[0].data.shift();
            }
            pmChart.update();
        }
    }

    function triggerAlertSMS(customMsg, workerId) {
        totalAlertsFired++;
        elGlobalAlerts.innerText = totalAlertsFired;
        
        const emptyState = elSmsFeed.querySelector('.empty');
        if (emptyState) emptyState.remove();

        const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const bubble = document.createElement('div');
        bubble.className = 'sms-bubble alert clickable-alert';
        
        // Use provided workerId or default to Rajan (workersDB[0]) for the logic
        const wId = workerId || workersDB[0].id;
        const wObj = workersDB.find(w => w.id === wId) || workersDB[0];

        if (customMsg) {
            bubble.innerHTML = `<strong>⚠️ SYS EMERGENCY ⚠️</strong><br>${customMsg}<br><small>${timeString} • Click to View</small>`;
            bubble.style.border = '2px solid red';
            bubble.style.background = 'rgba(255, 0, 0, 0.4)';
        } else {
            bubble.innerHTML = `<strong>NovaSafe Alert:</strong><br>Dust level DANGEROUS for ${wObj.name}. PM2.5: ${Math.round(wObj.pm)} µg/m³.<br><small>${timeString} • Click to View Profile</small>`;
        }
        
        // Add click listener to open profile
        bubble.addEventListener('click', () => {
            window.viewWorkerProfile(wId);
        });

        elSmsFeed.appendChild(bubble);
        elSmsFeed.scrollTop = elSmsFeed.scrollHeight; 
    }

    function simulationTick() {
        tickCount++;
        
        // ALL workers drift and record global calculations independently
        workersDB.forEach((w, index) => {
            if (!w.isActive) return;

            // Hours increment slightly assuming real-time is sped up
            w.hours += 0.01;

            if (index === 0 && isDustSpike) {
                w.pm = Math.min(450, w.pm + (Math.random() * 80 + 20));
                if (Math.random() > 0.7 && w.spo2 > 93) w.spo2 -= 1;
            } else {
                w.pm += (Math.random() * 8) - 4; // drift +- 4
                if (w.pm < 5) w.pm = 5;
                if (index === 0 && w.pm < 20 && Math.random() > 0.5 && w.spo2 < 98) w.spo2 += 1;
            }

            // Track individual Peaks and TWAs
            if (w.pm > w.peakPM) w.peakPM = w.pm;

            w.pmHistory.push(w.pm);
            if (w.pmHistory.length > 480) w.pmHistory.shift(); 
            w.twa = w.pmHistory.reduce((a, b) => a + b, 0) / w.pmHistory.length;
        });

        updateVisuals();
    }

    let simInterval = setInterval(simulationTick, 2000);

    // End Shift
    const btnSpike = document.getElementById('btn-trigger-dust');
    btnSpike.addEventListener('click', () => {
        isDustSpike = !isDustSpike;
        if (isDustSpike) {
            btnSpike.innerText = "Stop Drilling";
            btnSpike.classList.replace('btn-secondary', 'btn-primary');
            btnSpike.style.background = 'var(--accent-red)';
            btnSpike.style.boxShadow = 'none';
        } else {
            btnSpike.innerText = "Simulate Dust Spike";
            btnSpike.classList.replace('btn-primary', 'btn-secondary');
            btnSpike.style.background = '';
        }
        simulationTick();
    });

});
