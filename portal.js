document.addEventListener('DOMContentLoaded', () => {

    // --- AUTHENTICATION ---
    const loginOverlay = document.getElementById('login-overlay');
    const appContainer = document.getElementById('app-container');
    const loginBtn = document.getElementById('login-btn');
    const loginPass = document.getElementById('login-password');
    const loginError = document.getElementById('login-error');

    function attemptLogin() {
        if (loginPass.value === 'admin') {
            loginOverlay.style.opacity = '0';
            setTimeout(() => {
                loginOverlay.style.display = 'none';
                appContainer.style.display = 'flex';
                appContainer.classList.add('fade-in');
            }, 300);
        } else {
            loginError.classList.remove('hidden');
        }
    }

    loginBtn.addEventListener('click', attemptLogin);
    loginPass.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') attemptLogin();
    });

    // --- SPA ROUTING ---
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item[data-target]');
    const viewSections = document.querySelectorAll('.view-section');
    const pageTitle = document.getElementById('dyn-title');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            viewSections.forEach(v => v.classList.remove('active'));
            const targetId = item.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');

            pageTitle.innerText = item.innerText.replace(/[^\w\s]/gi, '').trim(); 
        });
    });

    // --- WORKER DATABASE EXPANSION ---
    let workersDB = [
        { id: 'TN-0042', name: 'Rajan K.', pm: 18, spo2: 98, twa: 15, radarX: 50, radarY: 50, hours: 4.5, peakPM: 18, pmHistory: [18] },
        { id: 'TN-0089', name: 'Muthu S.', pm: 24, spo2: 97, twa: 22, radarX: 30, radarY: 70, hours: 3.2, peakPM: 24, pmHistory: [24] },
        { id: 'TN-0103', name: 'Siva P.', pm: 39, spo2: 95, twa: 35, radarX: 80, radarY: 20, hours: 6.1, peakPM: 39, pmHistory: [39] },
        { id: 'TN-0221', name: 'Karthi D.', pm: 65, spo2: 94, twa: 54, radarX: 20, radarY: 40, hours: 7.8, peakPM: 65, pmHistory: [65] },
        { id: 'TN-0554', name: 'Arun M.', pm: 12, spo2: 99, twa: 13, radarX: 60, radarY: 80, hours: 1.5, peakPM: 12, pmHistory: [12] }
    ];

    const workersTableBody = document.getElementById('workers-table-body');
    const globalActive = document.getElementById('global-active');

    function renderWorkersTable() {
        globalActive.innerHTML = `${workersDB.length} <span class="trend up">⚡ Live</span>`;
        workersTableBody.innerHTML = ''; 
        
        workersDB.forEach(w => {
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

            const tr = document.createElement('tr');
            tr.style.backgroundColor = bgCls;
            tr.style.borderBottom = '1px solid var(--border-glass)';
            tr.innerHTML = `
                <td style="padding: 1rem;" class="font-mono">${w.id}</td>
                <td style="padding: 1rem;"><strong>${w.name}</strong></td>
                <td style="padding: 1rem;" class="font-mono">${w.hours.toFixed(2)}</td>
                <td style="padding: 1rem;" class="font-mono ${colorCls}">${Math.round(w.pm)} µg/m³</td>
                <td style="padding: 1rem;">${w.spo2}%</td>
                <td style="padding: 1rem;" class="font-mono">${Math.round(w.twa)} µg/m³</td>
                <td style="padding: 1rem;" class="font-mono ${colorCls}"><strong>${dangerStage}</strong></td>
                <td style="padding: 1rem; text-align: right;">
                    <button class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" onclick="window.endWorkerShift('${w.id}')">End Shift</button>
                </td>
            `;
            workersTableBody.appendChild(tr);
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

        modal.classList.remove('hidden');
    };
    document.getElementById('close-modal').addEventListener('click', () => modal.classList.add('hidden'));

    // --- CHART.JS INITIALIZATION ---
    const ctx = document.getElementById('liveChart')?.getContext('2d');
    let pmChart = null;
    if (ctx) {
        pmChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [], datasets: [{
                    label: 'Fleet Average PM2.5 Stream', data: [],
                    borderColor: '#00e1ff', backgroundColor: 'rgba(0, 225, 255, 0.15)',
                    borderWidth: 2, fill: true, tension: 0.4, pointRadius: 0
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: { x: { display: false }, y: { min: 0, max: 120, grid: { color: 'rgba(255,255,255,0.05)' } } },
                animation: { duration: 0 }, plugins: { legend: { display: false } }
            }
        });
    }

    // --- RADAR MAP RENDERING ---
    const radar = document.getElementById('radar');
    const tt = document.getElementById('radar-tooltip');

    function renderRadar() {
        if(!radar) return;
        document.querySelectorAll('.radar-dot').forEach(el => el.remove());
        
        workersDB.forEach(w => {
            let dot = document.createElement('div');
            dot.className = 'radar-dot';
            
            if (w.pm > 50 || w.twa > 50) dot.classList.add('danger');
            else if (w.pm > 25 || w.twa > 25) dot.classList.add('caution');
            else dot.classList.add('safe');
            
            w.radarX += (Math.random() * 4 - 2);
            w.radarY += (Math.random() * 4 - 2);
            if (w.radarX < 10) w.radarX = 10; if (w.radarX > 90) w.radarX = 90;
            if (w.radarY < 10) w.radarY = 10; if (w.radarY > 90) w.radarY = 90;

            dot.style.left = w.radarX + '%';
            dot.style.top = w.radarY + '%';

            // Radar Click Event
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                tt.classList.remove('hidden');
                document.getElementById('tt-id').innerText = w.id;
                document.getElementById('tt-name').innerText = w.name;
                document.getElementById('tt-pm').innerText = Math.round(w.pm);
                
                const dangerStage = (w.pm > 50 || w.twa > 50) ? 'DANGER' : (w.pm > 25 || w.twa > 25) ? 'CAUTION' : 'SAFE';
                const colorCls = (w.pm > 50 || w.twa > 50) ? 'text-red' : (w.pm > 25 || w.twa > 25) ? 'text-yellow' : 'text-green';
                
                const ttStatus = document.getElementById('tt-status');
                ttStatus.innerText = dangerStage;
                ttStatus.className = colorCls;
                
                // Keep tooltip slightly offset
                tt.style.left = Math.min(w.radarX, 60) + '%';
                tt.style.top = Math.max(w.radarY, 10) + '%';
                
                const btnEnd = document.getElementById('tt-btn-endshift');
                btnEnd.onclick = () => { tt.classList.add('hidden'); window.endWorkerShift(w.id); };
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
                    hours: 0, peakPM: 0, pmHistory: []
                };
                workersDB.push(newW);
                renderWorkersTable();
                renderRadar();

                scanTitle.innerText = "Success: NEW Worker Registered!";
                scanTitle.className = "text-green mb-sm text-center";
                scanData.innerHTML = `
                    <div><p class="text-secondary text-sm">Name</p><p class="font-mono">${newW.name}</p></div>
                    <div><p class="text-secondary text-sm">Assigned ID</p><p class="font-mono">${newW.id}</p></div>
                    <div style="grid-column: span 2"><p class="text-secondary text-sm">Status</p><p class="text-green font-mono">Syncing to cloud...</p></div>
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
            document.querySelector('.sidebar').style.borderRightColor = 'var(--accent-red)';
            triggerAlertSMS("[CRITICAL] SITE WIDE EVACUATION. DUST LEVELS FATAL.");
        } else {
            btnLockdown.innerText = "🚨 INITIATE LOCKDOWN";
            btnLockdown.style.background = 'rgba(255, 59, 48, 0.2)';
            document.querySelector('.sidebar').style.borderRightColor = 'var(--border-glass)';
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
        
        if (rajan.pm > 50 && tickCount % 5 === 0 && !document.body.classList.contains('lockdown-active')) triggerAlertSMS();

        let fleetAvg = workersDB.reduce((sum, w) => sum + w.pm, 0) / workersDB.length;
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

    function triggerAlertSMS(customMsg) {
        totalAlertsFired++;
        elGlobalAlerts.innerText = totalAlertsFired;
        
        const emptyState = elSmsFeed.querySelector('.empty');
        if (emptyState) emptyState.remove();

        const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const bubble = document.createElement('div');
        bubble.className = 'sms-bubble alert';
        
        if (customMsg) {
            bubble.innerHTML = `<strong>⚠️ SYS EMERGENCY ⚠️</strong><br>${customMsg}<br><small>${timeString}</small>`;
            bubble.style.border = '2px solid red';
            bubble.style.background = 'rgba(255, 0, 0, 0.4)';
        } else {
            bubble.innerHTML = `<strong>NovaSafe Alert:</strong><br>Dust level DANGEROUS for ${workersDB[0].name} PM2.5 = ${Math.round(workersDB[0].pm)} µg/m³.<br><small>${timeString}</small>`;
        }
        
        elSmsFeed.appendChild(bubble);
        elSmsFeed.scrollTop = elSmsFeed.scrollHeight; 
    }

    function simulationTick() {
        tickCount++;
        
        // ALL workers drift and record global calculations independently
        workersDB.forEach((w, index) => {
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
