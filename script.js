document.addEventListener('DOMContentLoaded', () => {
    const output = document.getElementById('terminal-output');
    const inputLine = document.getElementById('input-line');
    const cmdInput = document.getElementById('cmd-input');
    const screen = document.getElementById('screen');
    
    // Editor Elements
    const editorOverlay = document.getElementById('editor-overlay');
    const editorArea = document.getElementById('editor-area');
    const editorFilename = document.getElementById('editor-filename');
    let isEditing = false;
    let currentEditFile = '';

    inputLine.style.display = 'none'; // Wait for boot

    let commandHistory = [];
    let historyIndex = 0;

    // --- Default File System ---
    const defaultFiles = {
        "commands.md": `MASTER COMMAND LIST
===================

[FILE SYSTEM]
  ls           - List directory
  cat <file>   - Read file
  touch <file>- Create file
  rm <file>    - Delete file
  code <file>  - Edit file (GUI)
  cp <src> <dst> - Copy
  mv <src> <dst> - Move/Rename
  grep <txt> <file> - Search text

[UTILITIES]
  calc <expr>  - Scientific Calculator
  convert      - Ultimate Unit Converter
  timer <sec>  - Background Alarm
  search <q>   - Google Search
  metar <code> - Weather Report
  repo         - Source Code

[NETWORK / STATUS]
  fetch        - System Info
  whois        - Domain Details
  contacts     - Social Links
  wallet       - Financial Status
  legal        - License`,

        "README.md": `ParasOS v2.0                     User Commands                    PARAS_OS(1)

NAME
    ParasOS v2.0 - Interactive Terminal Portfolio & Shell Environment

SYNOPSIS
    A persistent, UNIX-like shell environment running on the RMNB-1002 Kernel.
    Designed for navigation, utility, and exploring the life of Paras Sharma.

DESCRIPTION
    Welcome to the terminal interface. This system mimics standard Linux 
    capabilities including file manipulation, process execution, and system 
    monitoring. All file changes are persisted via LocalStorage.

CORE UTILITIES
    calc [expr]     Scientific calculator (PEMDAS, Trig, Logs).
    convert         Universal unit converter (Aviation, Physics, Standard).
    code [file]     Integrated GUI text editor (Nano-style).
    fetch           Display system diagnostics and kernel info.

FILESYSTEM OPERATIONS
    Standard shell commands available:
    ls, cat, touch, rm, cp, mv, grep

COPYRIGHT
    © 2025 Paras Sharma. Licensed under CC BY-NC 4.0.
    The 'Wifey' module is strictly proprietary and closed-source.
`
    };

    // --- Storage Engine ---
    let files = {};
    function loadSystem() {
        const stored = localStorage.getItem('parasOS_files_v7');
        if (stored) files = JSON.parse(stored);
        else files = JSON.parse(JSON.stringify(defaultFiles));
    }
    function saveSystem() {
        localStorage.setItem('parasOS_files_v7', JSON.stringify(files));
    }
    loadSystem();

    // User Settings
    const user = "guest";
    const hostname = "parassharma.com";
    const path = "~";

    // --- Boot Sequence ---
    const bootText = [
        { text: "RMNB-1002 BIOS Date 09/22/2021 16:40:00 Ver: 1.7.0", delay: 100 },
        { text: "CPU: Intel(R) Core(TM) i5-1135G7 @ 2.40GHz", delay: 50 },
        { text: "Memory: 8192MB LPDDR4x @ 4267 MHz", delay: 100 },
        { text: "NVMe Drive: 512GB (Health: 100%)", delay: 100 },
        { text: " ", delay: 100 },
        { text: "Loading Kernel v2.0...", delay: 300 },
        { text: `<span class="ts">[    0.000000]</span> Linux version 2.0.0-paras-kernel (gcc v12.2.0)`, delay: 20 },
        { text: `<span class="ts">[    0.145002]</span> Memory: 8192MB available (4267MHz verified)`, delay: 20 },
        { text: `<span class="ts">[    0.550210]</span> Checking Financial Modules...`, delay: 400 },
        { text: `<span class="ts">[    0.550999]</span> <span class="err">[FAILED]</span> Wallet Balance: ₹33.25 INR (CRITICAL)`, delay: 200 },
        { text: `<span class="ts">[    0.551000]</span> <span class="warn">[WARN]</span> Purchase Detected: Domain Name (-₹2317.05)`, delay: 200 },
        { text: " ", delay: 100 },
        { text: `<span class="ok">[  OK  ]</span> Loaded Module: DADA (Legacy Core).`, delay: 100 },
        { text: `<span class="ok">[  OK  ]</span> Loaded Module: DADI (Guidance).`, delay: 100 },
        { text: `<span class="ok">[  OK  ]</span> Loaded Module: DIDI (Support).`, delay: 100 },
        { text: `<span class="ok">[  OK  ]</span> Loaded Module: WIFEY (Proprietary).`, delay: 100 },
        { text: " ", delay: 200 },
        { text: "Welcome to ParasOS v2.0", cls: "info", delay: 100 },
        { text: `Logged in as: ${user}@${hostname}`, cls: "dim", delay: 0 }
    ];

    let bootIndex = 0;

    function runBoot() {
        if (bootIndex < bootText.length) {
            const line = bootText[bootIndex];
            printLine(line.text, line.cls);
            bootIndex++;
            setTimeout(runBoot, line.delay);
        } else {
            inputLine.style.display = 'flex';
            cmdInput.focus();
            scrollToBottom();
        }
    }

    function printLine(text, cls = '') {
        const div = document.createElement('div');
        div.className = 'line ' + cls;
        div.innerHTML = text; 
        output.appendChild(div);
        scrollToBottom();
    }

    function scrollToBottom() {
        window.scrollTo(0, document.body.scrollHeight);
        screen.scrollTop = screen.scrollHeight;
    }

    // --- Input Handling ---
    cmdInput.addEventListener('keydown', (e) => {
        if (isEditing) return;

        if (e.key === 'Enter') {
            const rawInput = cmdInput.value;
            const parts = rawInput.trim().split(/\s+/);
            const cmd = parts[0].toLowerCase();
            const args = parts.slice(1);

            const promptHTML = `<span class="p-user">${user}</span><span class="p-sep">@</span><span class="p-host">${hostname}</span>:<span class="p-path">${path}</span>$`;
            printLine(`${promptHTML} ${rawInput}`);
            
            if (cmd) {
                commandHistory.push(rawInput);
                historyIndex = commandHistory.length;
                executeCommand(cmd, args);
            }
            cmdInput.value = '';
            scrollToBottom();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                cmdInput.value = commandHistory[historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                cmdInput.value = commandHistory[historyIndex];
            } else {
                historyIndex = commandHistory.length;
                cmdInput.value = '';
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            const currentInput = cmdInput.value.split(" ").pop();
            const matches = Object.keys(files).filter(k => k.startsWith(currentInput));
            if (matches.length === 1) {
                const base = cmdInput.value.substring(0, cmdInput.value.lastIndexOf(currentInput));
                cmdInput.value = base + matches[0];
            }
        }
    });

    // --- Editor Logic ---
    function openEditor(filename) {
        isEditing = true;
        currentEditFile = filename;
        editorFilename.textContent = filename;
        editorArea.value = files[filename] !== undefined ? files[filename] : ""; 
        editorOverlay.classList.remove('hidden');
        editorArea.focus();
    }
    function closeEditor(save) {
        if (save) {
            files[currentEditFile] = editorArea.value;
            saveSystem();
            printLine(`[nano] Wrote ${files[currentEditFile].length} bytes to ${currentEditFile}`, "ok");
        } else printLine(`[nano] Buffer not saved.`, "warn");
        editorOverlay.classList.add('hidden');
        isEditing = false;
        cmdInput.focus();
    }
    editorArea.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 's') { e.preventDefault(); closeEditor(true); } 
        else if (e.ctrlKey && e.key === 'x') { e.preventDefault(); closeEditor(false); }
    });

    // --- Command Logic ---
    function executeCommand(cmd, args) {
        switch (cmd) {
            case 'ls':
                printLine(Object.keys(files).map(f => `<span class="file">${f}</span>`).join("  "));
                break;

            case 'cat':
                if (!args[0]) printLine("Usage: cat <filename>", "err");
                else if (files[args[0]] !== undefined) printLine(files[args[0]].replace(/\n/g, "<br>"));
                else printLine(`cat: ${args[0]}: No such file`, "err");
                break;

            case 'grep':
                if (args.length < 2) printLine("Usage: grep <pattern> <file>", "err");
                else if (files[args[1]] !== undefined) {
                    const lines = files[args[1]].split('\n');
                    lines.forEach((l, i) => {
                        if (l.includes(args[0])) printLine(`<span class="dim">${i+1}:</span> ${l.replace(args[0], `<span class="wifey-color">${args[0]}</span>`)}`);
                    });
                } else printLine(`grep: ${args[1]}: No such file`, "err");
                break;

            case 'touch':
                if (!args[0]) printLine("Usage: touch <file>", "err");
                else { if (files[args[0]] === undefined) files[args[0]] = ""; saveSystem(); printLine(`Created ${args[0]}`); }
                break;

            case 'rm':
                if (args[0] === '-rf') {
                    if (!args[1] || args[1] === '/') {
                        printLine("I'm afraid I can't let you do that, Dave.", "err");
                        return;
                    }
                    if (files[args[1]] !== undefined) {
                        delete files[args[1]];
                        saveSystem();
                        printLine(`Deleted ${args[1]} (forced)`, "warn");
                        return;
                    }
                    printLine(`rm: cannot remove '${args[1]}': No such file`, "err");
                    return;
                }
                if (!args[0]) printLine("Usage: rm <file>", "err");
                else if (files[args[0]] !== undefined) { delete files[args[0]]; saveSystem(); printLine(`Deleted ${args[0]}`); } 
                else printLine("File not found.", "err");
                break;

            case 'code': case 'nano':
                if (!args[0]) printLine("Usage: code <file>", "err"); else openEditor(args[0]);
                break;

            case 'cp':
                if (args.length < 2) printLine("Usage: cp <src> <dst>", "err");
                else if (files[args[0]] !== undefined) { files[args[1]] = files[args[0]]; saveSystem(); printLine(`Copied ${args[0]} to ${args[1]}`); }
                else printLine(`cp: ${args[0]}: No such file`, "err");
                break;
            
            case 'mv':
                if (args.length < 2) printLine("Usage: mv <src> <dst>", "err");
                else if (files[args[0]] !== undefined) { files[args[1]] = files[args[0]]; delete files[args[0]]; saveSystem(); printLine(`Moved ${args[0]} to ${args[1]}`); }
                else printLine(`mv: ${args[0]}: No such file`, "err");
                break;

            case 'whois':
                printLine("Scanning global registrar database...", "dim");
                setTimeout(() => {
                    printLine("Domain Name: <span class='ok'>PARASSHARMA.COM</span>");
                    printLine("Registrant: <span class='info'>Paras Sharma</span>");
                    printLine("Status: <span class='warn'>Broke Student (Verified)</span>");
                    printLine("Email: contact@parassharma.in");
                    printLine("Creation Date: 2021-09-22");
                }, 600);
                break;

            case 'contacts': case 'contact': case 'socials':
                printLine("CONNECT WITH PARAS:", "info");
                printLine("-------------------");
                printLine("GitHub:    <span class='ok'>github.com/parassharma2306</span>");
                printLine("Instagram: <span class='didi-color'>@parassharma2306</span>");
                printLine("X (Tw):    <span class='didi-color'>@ParasSharma_23</span>");
                printLine("Email:     <span class='info'>contact@parassharma.in</span>");
                break;

            case 'wallet': case 'money':
                printLine("FINANCIAL REPORT:", "warn");
                printLine("-----------------");
                printLine("Account:   Student Savings");
                printLine("Balance:   <span class='err'>₹33.25 INR</span>");
                printLine("Status:    CRITICALLY LOW");
                printLine("Last Txn:  PURCHASE - Domain Name (GoDaddy) - <span class='err'>₹2317.05</span>");
                break;

            case 'fetch':
                printLine(`
  <span class="info">OS</span>: ParasOS v2.0
  <span class="info">Kernel</span>: Linux 2.0.0
  <span class="info">Host</span>: RMNB-1002 (Silver)
  <span class="info">Uptime</span>: Forever
  <span class="info">Balance</span>: ₹33.25
  <span class="info">Modules</span>: Dada, Dadi, Didi, Wifey`);
                break;

            case 'calc':
                if (!args[0]) return printLine("Usage: calc <expr> (Supports: +, -, *, /, ^, sqrt, sin, cos)", "warn");
                try {
                    let expr = args.join(" ").replace(/\^/g, '**');
                    Object.getOwnPropertyNames(Math).forEach(n => expr = expr.replace(new RegExp(`\\b${n}\\b`,'g'), `Math.${n}`));
                    printLine(`${eval(expr)}`, "ok");
                } catch (e) { printLine("Math Error", "err"); }
                break;

            case 'convert':
                if (args.length < 2) {
                    printLine("Usage: convert <val> <unit>", "warn");
                    printLine("Type 'convert help' for units.", "dim");
                    if (args[0] === 'help') {
                        printLine("---------------------------------");
                        printLine("[LENGTH]: km_mi, mi_km, m_ft, ft_m, cm_in, in_cm, mm_in");
                        printLine("[WEIGHT]: kg_lbs, lbs_kg, g_oz, oz_g");
                        printLine("[TEMP]:   c_f, f_c, k_c, c_k");
                        printLine("[SPEED]:  kmh_mph, mph_kmh, kts_mph, mach_kts");
                        printLine("[VOLUME]: l_gal, gal_l, ml_oz, oz_ml");
                        printLine("---------------------------------");
                    }
                    return;
                }
                const val = parseFloat(args[0]), unit = args[1].toLowerCase();
                const map = {
                    // Length
                    'km_mi': v => `${v*0.621371} mi`, 'mi_km': v => `${v/0.621371} km`,
                    'm_ft': v => `${v*3.28084} ft`, 'ft_m': v => `${v/3.28084} m`,
                    'cm_in': v => `${v*0.393701} in`, 'in_cm': v => `${v/0.393701} cm`,
                    'mm_in': v => `${v*0.03937} in`, 'in_mm': v => `${v/0.03937} mm`,
                    // Weight
                    'kg_lbs': v => `${v*2.20462} lbs`, 'lbs_kg': v => `${v/2.20462} kg`,
                    'g_oz': v => `${v*0.035274} oz`, 'oz_g': v => `${v/0.035274} g`,
                    // Temp
                    'c_f': v => `${(v*9/5)+32} °F`, 'f_c': v => `${(v-32)*5/9} °C`,
                    'k_c': v => `${v-273.15} °C`, 'c_k': v => `${v+273.15} K`,
                    // Speed
                    'kmh_mph': v => `${v*0.621371} mph`, 'mph_kmh': v => `${v/0.621371} km/h`,
                    'kts_mph': v => `${v*1.15078} mph`, 'mph_kts': v => `${v/1.15078} kts`,
                    'mach_kts': v => `${v*661.47} kts`, 'kts_mach': v => `${v/661.47} Mach`,
                    // Volume
                    'l_gal': v => `${v*0.264172} gal`, 'gal_l': v => `${v/0.264172} L`,
                    'ml_oz': v => `${v*0.033814} fl oz`, 'oz_ml': v => `${v/0.033814} ml`
                };
                if (map[unit]) printLine(map[unit](val), "ok");
                else printLine("Unknown unit. Type 'convert help'", "err");
                break;

            case 'metar':
                if (!args[0]) printLine("Usage: metar <ICAO>", "warn");
                else {
                    printLine(`Fetching METAR for ${args[0].toUpperCase()}...`, "dim");
                    setTimeout(() => window.open(`https://www.aviationweather.gov/metar/data?ids=${args[0]}`, "_blank"), 500);
                }
                break;

            case 'timer':
                if (!args[0]) printLine("Usage: timer <sec>", "warn");
                else {
                    const t = parseInt(args[0]);
                    printLine(`Timer set for ${t}s.`, "info");
                    setTimeout(() => printLine(`[TIMER] ${t}s elapsed!`, "ok"), t*1000);
                }
                break;

            case 'search':
                if (!args[0]) printLine("Usage: search <query>", "warn");
                else window.open(`https://www.google.com/search?q=${args.join("+")}`, "_blank");
                break;

            case 'repo':
                printLine("Opening GitHub...", "dim");
                window.open("https://github.com/parassharma2306/parassharma.com-static", "_blank");
                break;

            case 'legal':
                printLine("LICENSE: <span class='ok'>CC BY-NC 4.0</span>");
                printLine("Attribution-NonCommercial 4.0 International.");
                printLine("PROPRIETARY NOTICE:");
                printLine("The <span class='wifey-color'>[ WIFEY MODULE ]</span> is closed-source.");
                printLine("Access restricted to Paras only. ❤️");
                break;

            // --- FAMILY ---
            case 'dada': printLine("<span class='dada-color'>[ MEMORY: GRANDFATHER ]</span>\nSilent architect of my values. Wisdom: Infinite."); break;
            case 'dadi': printLine("<span class='dadi-color'>[ GUIDANCE: GRANDMOTHER ]</span>\nHer blessings are my firewall."); break;
            case 'didi': printLine("<span class='didi-color'>[ SUPPORT: SISTER ]</span>\nCo-pilot who never lets me crash."); break;
            
            // --- WIFEY SPECIALS ---
            case 'wifey': 
            case 'dikshita':
                printLine("<span class='wifey-color'>[ HEART: DIKSHITA ]</span>");
                printLine("Status: <span class='ok'>The One and Only</span>");
                printLine("Privileges: <span class='wifey-color'>Root Access (Permanent)</span>");
                printLine("Quote: \"You are my favorite bug to debug.\"");
                break;
            
            case 'love':
                printLine("Calculating love for Dikshita...");
                setTimeout(() => printLine("Result: <span class='wifey-color'>Undefined (Too Large)</span>", "ok"), 800);
                break;

            case 'future':
                printLine("🔮 Scanning future timeline...");
                setTimeout(() => printLine("Outcome: <span class='wifey-color'>Paras & Dikshita taking over the world.</span>", "ok"), 1000);
                break;
            
            case 'proposal':
                printLine("💍 ERROR: Ring not found in hardware.", "err");
                printLine("Patch pending... Standby.", "dim");
                break;

            case 'family': printLine("Modules: dada, dadi, didi, wifey"); break;

            // --- EASTER EGGS ---
            case 'sudo':
                printLine("User 'guest' is not in the sudoers file. This incident will be reported to your Grandma.", "err");
                break;
            case 'party':
                printLine("🎉 PARTY MODE ENGAGED!", "wifey-color");
                document.body.classList.add('party-mode');
                setTimeout(() => document.body.classList.remove('party-mode'), 5000);
                break;
            case 'dance':
                printLine("(>'-')> <('-'<) ^(' - ')^ <('-'<) (>'-')>", "info");
                break;
            case 'linux':
                printLine("I use Arch btw.", "dim");
                break;
            case 'windows':
                printLine("BSOD Initiated... just kidding.", "err");
                break;
            case 'python':
                printLine("import life\nlife.be_happy()", "ok");
                break;
            case 'sl': 
                printLine("🚂 Choo Choo! (Steam Locomotive Module Missing)", "warn");
                break;
            case 'matrix':
                printLine("Wake up, Neo...", "ok");
                setTimeout(() => printLine("The Matrix has you...", "ok"), 1000);
                break;
            case 'coinflip':
                printLine(Math.random() > 0.5 ? "Heads" : "Tails", "info");
                break;
            case 'coffee':
                printLine("☕ HTTP 418: I'm a teapot.", "warn");
                break;
            case 'rm -rf':
            case 'rm -rf /':
                printLine("I'm afraid I can't let you do that, Dave.", "err");
                break;
            case 'exit':
                printLine("There is no escape.", "err");
                break;
            case 'clear':
                output.innerHTML = '';
                break;
            case 'reset':
                localStorage.removeItem('parasOS_files_v7');
                location.reload();
                break;
            case 'cheat':
                printLine("up, up, down, down, left, right, left, right, b, a", "dim");
                break;

            default:
                printLine(`${cmd}: command not found`, "err");
        }
    }

    screen.addEventListener('click', () => { if (!isEditing) cmdInput.focus(); });
    setTimeout(runBoot, 500);
});