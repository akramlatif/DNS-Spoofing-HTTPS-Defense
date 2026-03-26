/* ============================================================
   DNS Spoofing Lab — Interactive JavaScript
   ============================================================ */

'use strict';

// ─────────────────────────────────────────────
//  NAVIGATION
// ─────────────────────────────────────────────
function showSection(id, btn) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('sec-' + id).classList.add('active');
  btn.classList.add('active');
}

// ─────────────────────────────────────────────
//  TERMINAL TYPEWRITER ENGINE
// ─────────────────────────────────────────────
const COLOR_MAP = {
  '$':  'prompt',
  '#':  'comment',
  '!':  'error',
  '~':  'warn',
  '+':  'success',
  '@':  'info',
  ' ':  'output',
};

/**
 * Typewrite a sequence of lines into `element`.
 * Each line is an object: { type, text, delay }
 *   type  : 'prompt'|'cmd'|'output'|'error'|'warn'|'success'|'info'|'comment'|'blank'
 *   text  : string to display
 *   delay : ms gap BEFORE this line starts
 */
function typewriteLines(elementId, lines, onComplete) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.innerHTML = '';

  let cursor = document.createElement('span');
  cursor.className = 'cursor';

  let lineIdx = 0;

  function nextLine() {
    if (lineIdx >= lines.length) {
      cursor.remove();
      if (onComplete) onComplete();
      return;
    }

    const line  = lines[lineIdx++];
    const delay = line.delay || 0;

    setTimeout(() => {
      if (line.type === 'blank') {
        el.appendChild(document.createTextNode('\n'));
        nextLine();
        return;
      }

      if (line.type === 'prompt+cmd') {
        // Combined prompt + command on one line, char-by-char
        const span = document.createElement('span');
        span.className = 'prompt';
        el.appendChild(span);

        const cmdSpan = document.createElement('span');
        cmdSpan.className = 'cmd';
        el.appendChild(cmdSpan);
        el.appendChild(cursor);

        const full = line.prompt + line.text;
        let ci = 0;
        const typing = setInterval(() => {
          if (ci < line.prompt.length) {
            span.textContent += full[ci];
          } else {
            cmdSpan.textContent += full[ci];
          }
          ci++;
          if (ci >= full.length) {
            clearInterval(typing);
            el.appendChild(document.createTextNode('\n'));
            cursor.remove();
            el.appendChild(cursor);
            nextLine();
          }
        }, 28);
        return;
      }

      // Instant output lines
      const span = document.createElement('span');
      span.className = line.type || 'output';
      span.textContent = line.text;
      el.removeChild(cursor);
      el.appendChild(span);
      el.appendChild(document.createTextNode('\n'));
      el.appendChild(cursor);
      nextLine();

    }, delay);
  }

  nextLine();
}

// ─────────────────────────────────────────────
//  SECTION 2 — ATTACK LOGS
// ─────────────────────────────────────────────
let attackPlayed = false;

function playAttackLogs() {
  if (attackPlayed) return;
  attackPlayed = true;

  document.getElementById('btn-play-attack').disabled = true;
  document.getElementById('btn-play-attack').textContent = '● Playing…';

  // Terminal 1: spoof_hosts
  const t1 = [
    { type: 'prompt+cmd', prompt: 'attacker@kali:~$ ', text: 'echo "192.168.1.50  test.local" > spoof_hosts.txt', delay: 200 },
    { type: 'prompt+cmd', prompt: 'attacker@kali:~$ ', text: 'cat spoof_hosts.txt', delay: 800 },
    { type: 'success',    text: '192.168.1.50  test.local', delay: 500 },
    { type: 'comment',    text: '# Spoof table created — mapping test.local → attacker IP', delay: 300 },
  ];

  typewriteLines('term-attack-1', t1, () => {
    // Terminal 2: web server
    const t2 = [
      { type: 'prompt+cmd', prompt: 'attacker@kali:~$ ', text: 'mkdir web_root && cd web_root', delay: 400 },
      { type: 'prompt+cmd', prompt: 'attacker@kali:~/web_root$ ', text: 'echo "<html><body><h1>WARNING: Spoofed Site</h1></body></html>" > index.html', delay: 900 },
      { type: 'prompt+cmd', prompt: 'attacker@kali:~/web_root$ ', text: 'python3 -m http.server 80', delay: 700 },
      { type: 'info',        text: 'Serving HTTP on 0.0.0.0 port 80 (http://0.0.0.0:80/) ...', delay: 600 },
      { type: 'comment',     text: '# Malicious web server is now live on port 80', delay: 300 },
    ];

    typewriteLines('term-attack-2', t2, () => {
      // Terminal 3: dnsspoof + victim hit
      const t3 = [
        { type: 'prompt+cmd', prompt: 'attacker@kali:~$ ', text: 'sudo dnsspoof -i eth0 -f spoof_hosts.txt', delay: 500 },
        { type: 'info',        text: 'dnsspoof: listening on eth0 [udp dst port 53 and not src 192.168.1.50]', delay: 700 },
        { type: 'blank',       delay: 600 },
        { type: 'warn',        text: '192.168.1.10.53421 > 8.8.8.8.53: [udp size 512] A? test.local', delay: 1200 },
        { type: 'error',       text: '192.168.1.10.53421 > 8.8.8.8.53: test.local A 192.168.1.50  ← SPOOFED', delay: 400 },
        { type: 'warn',        text: '192.168.1.10.53422 > 8.8.8.8.53: [udp size 512] A? test.local', delay: 1000 },
        { type: 'error',       text: '192.168.1.10.53422 > 8.8.8.8.53: test.local A 192.168.1.50  ← SPOOFED', delay: 400 },
        { type: 'blank',       delay: 500 },
        { type: 'comment',     text: '# Victim connected to our server:', delay: 400 },
        { type: 'success',     text: '192.168.1.10 - - [25/Mar/2026 14:32:01] "GET / HTTP/1.1" 200 -', delay: 500 },
        { type: 'output',      text: '192.168.1.10 - - [25/Mar/2026 14:32:01] "GET /favicon.ico HTTP/1.1" 404 -', delay: 300 },
      ];

      typewriteLines('term-attack-3', t3, () => {
        // Show spoofed page preview
        document.getElementById('spoofed-preview').style.display = 'block';
        document.getElementById('spoofed-preview').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        document.getElementById('btn-play-attack').textContent = '✓ Complete';
      });
    });
  });
}

function resetAttack() {
  attackPlayed = false;
  ['term-attack-1','term-attack-2','term-attack-3'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '&nbsp;';
  });
  document.getElementById('spoofed-preview').style.display = 'none';
  const btn = document.getElementById('btn-play-attack');
  btn.disabled = false;
  btn.textContent = '▶ Play Attack Logs';
}

// ─────────────────────────────────────────────
//  SECTION 3 — VICTIM LOGS
// ─────────────────────────────────────────────
let victimPlayed = false;

function playVictimLogs() {
  if (victimPlayed) return;
  victimPlayed = true;

  document.getElementById('btn-play-victim').disabled = true;
  document.getElementById('btn-play-victim').textContent = '● Playing…';

  // Ping terminal
  const pingLines = [
    { type: 'prompt+cmd', prompt: 'C:\\Users\\victim> ', text: 'ping test.local', delay: 200 },
    { type: 'blank',       delay: 400 },
    { type: 'error',       text: 'Pinging test.local [192.168.1.50] with 32 bytes of data:', delay: 700 },
    { type: 'error',       text: 'Reply from 192.168.1.50: bytes=32 time<1ms TTL=64', delay: 900 },
    { type: 'error',       text: 'Reply from 192.168.1.50: bytes=32 time<1ms TTL=64', delay: 600 },
    { type: 'error',       text: 'Reply from 192.168.1.50: bytes=32 time<1ms TTL=64', delay: 600 },
    { type: 'error',       text: 'Reply from 192.168.1.50: bytes=32 time<1ms TTL=64', delay: 600 },
    { type: 'blank',       delay: 300 },
    { type: 'output',      text: 'Ping statistics for 192.168.1.50:', delay: 200 },
    { type: 'output',      text: '    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)', delay: 200 },
    { type: 'output',      text: 'Approximate round trip times in milli-seconds:', delay: 200 },
    { type: 'warn',        text: '    Minimum = 0ms, Maximum = 0ms, Average = 0ms', delay: 200 },
  ];

  // Browser console terminal
  const browserLines = [
    { type: 'info',    text: '[Network Tab - Developer Tools]', delay: 400 },
    { type: 'blank',   delay: 300 },
    { type: 'output',  text: 'Request URL: http://test.local/', delay: 800 },
    { type: 'output',  text: 'Request Method: GET', delay: 300 },
    { type: 'error',   text: 'Status Code: 200 OK', delay: 300 },
    { type: 'error',   text: 'Remote Address: 192.168.1.50:80  ← ATTACKER!', delay: 300 },
    { type: 'output',  text: 'Referrer Policy: strict-origin-when-cross-origin', delay: 300 },
    { type: 'blank',   delay: 200 },
    { type: 'info',    text: 'Response Headers:', delay: 200 },
    { type: 'output',  text: '    Content-Type: text/html', delay: 200 },
    { type: 'output',  text: '    Server: SimpleHTTP/0.6 Python/3.11.2', delay: 200 },
    { type: 'warn',    text: '    Date: Wed, 25 Mar 2026 14:32:01 GMT', delay: 200 },
  ];

  let pingDone = false, browserDone = false;

  function checkBothDone() {
    if (pingDone && browserDone) {
      document.getElementById('victim-obs').style.display = 'block';
      document.getElementById('victim-obs').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      document.getElementById('btn-play-victim').textContent = '✓ Complete';
    }
  }

  typewriteLines('term-victim-ping', pingLines, () => { pingDone = true; checkBothDone(); });
  typewriteLines('term-victim-browser', browserLines, () => { browserDone = true; checkBothDone(); });
}

function resetVictim() {
  victimPlayed = false;
  ['term-victim-ping','term-victim-browser'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '&nbsp;';
  });
  document.getElementById('victim-obs').style.display = 'none';
  const btn = document.getElementById('btn-play-victim');
  btn.disabled = false;
  btn.textContent = '▶ View Victim Logs';
}

// ─────────────────────────────────────────────
//  SECTION 4 — TABS & STEP CHECKLIST
// ─────────────────────────────────────────────
function showTab(id, btn) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + id).classList.add('active');
  btn.classList.add('active');
}

function toggleStep(item) {
  item.classList.toggle('done');
  const check = item.querySelector('.step-check');
  check.textContent = item.classList.contains('done') ? '✓' : check.getAttribute('data-num') || check.textContent;
}

function checkAllSteps(listId) {
  document.querySelectorAll('#' + listId + ' .step-item').forEach((item, i) => {
    item.classList.add('done');
    item.querySelector('.step-check').textContent = '✓';
  });
}

function resetSteps(listId) {
  document.querySelectorAll('#' + listId + ' .step-item').forEach((item, i) => {
    item.classList.remove('done');
    item.querySelector('.step-check').textContent = String(i + 1);
  });
}

// ─────────────────────────────────────────────
//  SECTION 5 — COMPARISON TOGGLE
// ─────────────────────────────────────────────
function showComparison(mode) {
  const before = document.getElementById('panel-before');
  const after  = document.getElementById('panel-after');
  const btnB   = document.getElementById('comp-before');
  const btnA   = document.getElementById('comp-after');

  if (mode === 'before') {
    before.style.display = 'block';
    after.style.display  = 'none';
    btnB.classList.add('active', 'red');
    btnA.classList.remove('active', 'red');
  } else {
    before.style.display = 'none';
    after.style.display  = 'block';
    btnA.classList.add('active');
    btnA.classList.remove('red');
    btnB.classList.remove('active', 'red');
  }
}

// ─────────────────────────────────────────────
//  SECTION 1 — TOPOLOGY SVG ANIMATIONS
// ─────────────────────────────────────────────

const SVG_NS = 'http://www.w3.org/2000/svg';

// Packet positions (SVG coordinate points along paths)
const PATHS = {
  // Victim → Gateway (right LAN)
  victimToGateway: [
    { x: 610, y: 240 },
    { x: 610, y: 200 },
    { x: 460, y: 155 },
  ],
  // Gateway → Attacker (injection path)
  gatewayToAttacker: [
    { x: 380, y: 140 },
    { x: 300, y: 155 },
    { x: 240, y: 240 },
    { x: 150, y: 240 },
  ],
  // Spoofed response: Attacker → Victim
  attackerToVictim: [
    { x: 150, y: 240 },
    { x: 240, y: 240 },
    { x: 300, y: 200 },
    { x: 520, y: 200 },
    { x: 610, y: 240 },
  ],
  // Legitimate DNS (for DoH): Victim → Internet (bypassing gateway)
  victimToInternet: [
    { x: 610, y: 240 },
    { x: 610, y: 120 },
    { x: 550, y: 70 },
    { x: 450, y: 45 },
  ],
  // Internet → Victim (DoH response)
  internetToVictim: [
    { x: 380, y: 45 },
    { x: 550, y: 45 },
    { x: 610, y: 120 },
    { x: 610, y: 240 },
  ],
};

let animationTimers = [];

function clearAnimTimers() {
  animationTimers.forEach(t => clearTimeout(t));
  animationTimers = [];
}

function addTimer(fn, ms) {
  animationTimers.push(setTimeout(fn, ms));
}

function createPacket(id, cssClass, label) {
  const g = document.createElementNS(SVG_NS, 'g');
  g.setAttribute('id', id);
  g.setAttribute('opacity', '0');

  const circle = document.createElementNS(SVG_NS, 'circle');
  circle.setAttribute('r', '7');
  circle.setAttribute('class', 'packet ' + (cssClass || ''));
  g.appendChild(circle);

  if (label) {
    const text = document.createElementNS(SVG_NS, 'text');
    text.setAttribute('y', '-11');
    text.setAttribute('class', 'packet-label');
    text.setAttribute('text-anchor', 'middle');
    text.textContent = label;
    g.appendChild(text);
  }

  document.getElementById('packets-group').appendChild(g);
  return g;
}

function animatePacketAlongPath(packetEl, pathPoints, durationMs, onDone) {
  packetEl.setAttribute('opacity', '1');
  const steps = 60;
  const dt = durationMs / steps;
  const totalPoints = pathPoints.length;

  let step = 0;
  function tick() {
    const t = step / steps;
    // Lerp along path segments
    const segCount = totalPoints - 1;
    const globalT = t * segCount;
    const segIdx = Math.min(Math.floor(globalT), segCount - 1);
    const localT = globalT - segIdx;
    const a = pathPoints[segIdx];
    const b = pathPoints[segIdx + 1] || pathPoints[segIdx];
    const x = a.x + (b.x - a.x) * localT;
    const y = a.y + (b.y - a.y) * localT;
    packetEl.setAttribute('transform', `translate(${x},${y})`);
    step++;
    if (step <= steps) {
      animationTimers.push(setTimeout(tick, dt));
    } else {
      packetEl.setAttribute('opacity', '0');
      if (onDone) onDone();
    }
  }
  tick();
}

function setTopoStatus(msg) {
  const el = document.getElementById('topo-status');
  if (el) el.textContent = msg;
}

function clearPackets() {
  const pg = document.getElementById('packets-group');
  if (pg) pg.innerHTML = '';
}

function resetTopology() {
  clearAnimTimers();
  clearPackets();
  setTopoStatus('[ Click a button below to run a simulation ]');
  document.getElementById('victim-doh-label').textContent = 'Standard DNS (UDP:53)';
  document.getElementById('victim-doh-label').setAttribute('fill', 'rgba(65,200,255,0.5)');

  // Reset LAN lines
  document.querySelectorAll('.lan-line-a, .lan-line-v').forEach(l => {
    l.setAttribute('stroke', 'rgba(255,255,255,0.15)');
  });

  // Reset buttons
  document.getElementById('btn-run-attack').disabled = false;
  document.getElementById('btn-doh-defence').disabled = false;
}

function runAttackAnimation() {
  resetTopology();
  document.getElementById('btn-run-attack').disabled = true;
  document.getElementById('btn-doh-defence').disabled = true;

  // Highlight LAN as dangerous
  addTimer(() => {
    document.querySelectorAll('.lan-line-a').forEach(l => l.setAttribute('stroke', 'rgba(255,65,65,0.4)'));
    setTopoStatus('[ Attack phase: Attacker listening on eth0 in promiscuous mode... ]');
  }, 400);

  // Packet 1: Victim sends DNS query to gateway
  addTimer(() => {
    setTopoStatus('[ Victim sends DNS query for test.local → UDP port 53 ]');
    const pkt = createPacket('pkt-dns-query', 'packet', 'DNS?test.local');
    pkt.querySelector('circle').style.fill = '#41c8ff';
    pkt.querySelector('circle').style.filter = 'drop-shadow(0 0 4px #41c8ff)';
    animatePacketAlongPath(pkt, PATHS.victimToGateway, 1200, null);
  }, 1200);

  // Packet 2: Attacker intercepts (gateway → attacker)
  addTimer(() => {
    setTopoStatus('[ Attacker intercepts DNS query (promiscuous mode) ]');
    const pkt = createPacket('pkt-intercept', 'packet-red', 'INTERCEPT!');
    animatePacketAlongPath(pkt, PATHS.gatewayToAttacker, 1000, null);
  }, 2800);

  // Packet 3: Attacker injects spoofed response back to victim
  addTimer(() => {
    setTopoStatus('[ Attacker injects forged DNS response: test.local → 192.168.1.50 ]');
    const pkt = createPacket('pkt-spoof', 'packet-red', 'SPOOFED!');
    animatePacketAlongPath(pkt, PATHS.attackerToVictim, 1400, null);
  }, 4000);

  addTimer(() => {
    setTopoStatus('[ ⚠ Victim caches malicious mapping → 192.168.1.50 — Attack SUCCESSFUL ]');
    document.getElementById('victim-doh-label').textContent = 'SPOOFED: test.local→192.168.1.50';
    document.getElementById('victim-doh-label').setAttribute('fill', '#ff4141');
    document.getElementById('btn-run-attack').disabled = false;
    document.getElementById('btn-doh-defence').disabled = false;
  }, 5700);
}

function runDoHAnimation() {
  resetTopology();
  document.getElementById('btn-run-attack').disabled = true;
  document.getElementById('btn-doh-defence').disabled = true;

  addTimer(() => {
    document.getElementById('victim-doh-label').textContent = 'DoH Enabled (HTTPS:443)';
    document.getElementById('victim-doh-label').setAttribute('fill', '#00ff41');
    setTopoStatus('[ DoH enabled: DNS queries now encrypted in TLS 1.3 ]');
  }, 400);

  // Packet 1: Victim sends encrypted HTTPS query directly to internet (bypass gateway)
  addTimer(() => {
    setTopoStatus('[ Victim: HTTPS POST → cloudflare-dns.com:443 (bypasses local router) ]');
    const pkt = createPacket('pkt-doh-query', '', '🔒DoH');
    pkt.querySelector('circle').style.fill = '#00ff41';
    pkt.querySelector('circle').style.filter = 'drop-shadow(0 0 6px #00ff41)';
    animatePacketAlongPath(pkt, PATHS.victimToInternet, 1400, null);
  }, 1200);

  // Attacker tries (but sees nothing useful)
  addTimer(() => {
    setTopoStatus('[ Attacker sees: only encrypted HTTPS traffic — no plaintext DNS queries ]');
    const pkt = createPacket('pkt-attacker-fail', 'packet-red', '???????');
    pkt.querySelector('circle').setAttribute('r', '5');
    pkt.setAttribute('opacity', '0.4');
    animatePacketAlongPath(pkt, PATHS.gatewayToAttacker.slice().reverse(), 600, null);
  }, 2800);

  // DoH response from internet to victim
  addTimer(() => {
    setTopoStatus('[ Cloudflare returns authenticated NXDOMAIN — attack neutralised ]');
    const pkt = createPacket('pkt-doh-resp', '', '✓NXDOMAIN');
    pkt.querySelector('circle').style.fill = '#00ff41';
    pkt.querySelector('circle').style.filter = 'drop-shadow(0 0 6px #00ff41)';
    animatePacketAlongPath(pkt, PATHS.internetToVictim, 1400, null);
  }, 3600);

  addTimer(() => {
    setTopoStatus('[ ✓ DoH Defence Active — dnsspoof: 0 pattern matches. Attack BLOCKED. ]');
    document.getElementById('btn-run-attack').disabled = false;
    document.getElementById('btn-doh-defence').disabled = false;
  }, 5200);
}

// ─────────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Set step data-nums for reset
  document.querySelectorAll('.step-list').forEach(list => {
    list.querySelectorAll('.step-check').forEach((el, i) => {
      el.setAttribute('data-num', String(i + 1));
    });
  });
});
