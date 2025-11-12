document.addEventListener('DOMContentLoaded', () => {
    const output = document.getElementById('output');
    const inputLine = document.getElementById('input-line');
    const cmdInput = document.getElementById('cmd-input');
    const screen = document.getElementById('screen');

    // --- System Stats & Config ---
    const laptopDob = new Date('2021-11-12');
    const today = new Date();
    const ageYears = Math.floor((today - laptopDob) / (365.25 * 24 * 60 * 60 * 1000));
    
    let commandHistory = [];
    let historyIndex = 0;
    const allCommands = ['help', 'status', 'ls', 'cat', 'uptime', 'clear', 'reboot', 'credits'];

    const bootText = [
        { text: "Booting RMNB-1002 (BIOS v1.4.2)...", delay: 1000 },
        { text: "CPU: Intel i5-1135G7 @ 2.40GHz | RAM: 8192MB", delay: 100 },
        { text: "Loading Kernel v6.0 (paras-os)...", delay: 500 },
        { text: `<span class="timestamp">[  0.000000]</span> Kernel command line: BOOT_IMAGE=/vmlinuz-6.0-generic root=UUID=... ro quiet splash`, delay: 100 },
        { text: `<span class="timestamp">[  0.125194]</span> pci 0000:00:00.0: host bridge: Intel Corporation 11th Gen Core Processor D-series Host Bridge (rev 01)`, delay: 20 },
        { text: `<span class="timestamp">[  0.125248]</span> pci 0000:00:02.0: VGA compatible controller: Intel Corporation Iris Xe Graphics (rev 01)`, delay: 20 },
        { text: `<span class="timestamp">[  0.125488]</span> pci 0000:00:14.0: USB controller: Intel Corporation Tiger Lake-LP USB 3.2 Gen 2x1 xHCI Host Controller (rev 20)`, delay: 20 },
        { text: `<span class="timestamp">[  0.125695]</span> pci 0000:00:1f.3: Audio device: Intel Corporation Tiger Lake-LP Smart Sound Technology Audio Controller (rev 20)`, delay: 20 },
        { text: `<span class="timestamp">[  0.211304]</span> usb usb1: New USB device found, idVendor=1d6b, idProduct=0002, bcdDevice= 6.00`, delay: 20 },
        { text: `<span class="timestamp">[  0.450123]</span> nvme0n1: p1 p2 p3`, delay: 100 },
        { text: `<span class="timestamp">[  0.501102]</span> NET: Registered protocol family 2`, delay: 20 },
        { text: `<span class="timestamp">[  0.502301]</span> iwlwifi 0000:00:14.3: enabling device (0000 -> 0002)`, delay: 20 },
        { text: `Loading initial ramdisk...`, delay: 800 },
        { text: ``, delay: 200 },
        { text: `<span class="service-status">[ <span class="ok">OK</span> ]</span> Started Kernel Logging Service.`, delay: 50 },
        { text: `<span class="service-status">[ <span class="ok">OK</span> ]</span> Mounted Configuration File System.`, delay: 50 },
        { text: `<span class="service-status">[ <span class="ok">OK</span> ]</span> Finished Set System Time.`, delay: 50 },
        { text: `<span class="service-status">[ <span class="ok">OK</span> ]</span> Started Journal Service.`, delay: 50 },
        { text: `<span class="service-status">[ <span class="ok">OK</span> ]</span> Reached target Local File Systems.`, delay: 50 },
        { text: `<span class="service-status">[ <span class="ok">OK</span> ]</span> Started Network Name Resolution.`, delay: 50 },
        { text: `<span class="service-status">[ <span class="info">INFO</span> ]</span> Mounting asset: /mnt/domains/parassharma.com (Acquired: 2025-11-12)`, delay: 300 },
        { text: `<span class="service-status">[ <span class="ok">OK</span> ]</span> Reached target Network.`, delay: 50 },
        { text: `<span class="service-status">[ <span class="info">INFO</span> ]</span> Checking system resources...`, delay: 300 },
        { text: `<span class="service-status">[ <span class="warn">WARN</span> ]</span> Resource 'INR' critically low: 33.25`, delay: 500 },
        { text: `<span class="service-status">[ <span class="ok">OK</span> ]</span> Started User Login Management.`, delay: 50 },
        { text: `<span class="service-status">[ <span class="ok">OK</span> ]</span> Reached target Multi-User System.`, delay: 50 },
        { text: ``, delay: 500 },
        { text: `Welcome to paras-os (Kernel 6.0)`, delay: 100 },
        { text: `System Uptime: ${ageYears} Years (Battery Health: Degrading)`, cls: 'warn', delay: 100 },
        { text: `Domain: parassharma.com (Status: Active)`, cls: 'info', delay: 100 },
        { text: ``, delay: 100 },
        { text: `Type 'help' for available commands.`, cls: 'info', delay: 100 },
    ];

    // --- Boot Sequence Logic ---
    let bootIndex = 0;
    function runBoot() {
        if (bootIndex < bootText.length) {
            const lineData = bootText[bootIndex];
            printHTML(lineData.text, lineData.cls);
            bootIndex++;
            setTimeout(runBoot, lineData.delay);
        } else {
            inputLine.style.display = 'flex';
            cmdInput.focus();
        }
    }

    // --- Printing Functions ---
    function printLine(text, cls = '') {
        const div = document.createElement('div');
        div.className = 'line ' + cls;
        div.textContent = text;
        output.appendChild(div);
        scrollToBottom();
    }

    function printHTML(html, cls = '') {
        const div = document.createElement('div');
        div.className = 'line ' + cls;
        div.innerHTML = html;
        output.appendChild(div);
        scrollToBottom();
    }
    
    function scrollToBottom() {
        // A slight delay to allow rendering before scrolling
        setTimeout(() => {
            screen.scrollTop = screen.scrollHeight;
        }, 0);
    }

    // --- Command Logic ---
    cmdInput.addEventListener('keydown', function(e) {
        switch(e.key) {
            case 'Enter':
                const command = this.value.trim().toLowerCase();
                // Echo the command
                printLine(`guest@RMNB-1002:~$ ${command}`, 'dim');
                
                if (command) {
                    commandHistory.push(command);
                    historyIndex = commandHistory.length;
                    processCommand(command);
                }
                
                this.value = '';
                scrollToBottom();
                break;
            
            case 'ArrowUp':
                e.preventDefault();
                if (historyIndex > 0) {
                    historyIndex--;
                    this.value = commandHistory[historyIndex];
                    this.setSelectionRange(this.value.length, this.value.length); // Move cursor to end
                }
                break;
            
            case 'ArrowDown':
                e.preventDefault();
                if (historyIndex < commandHistory.length - 1) {
                    historyIndex++;
                    this.value = commandHistory[historyIndex];
                    this.setSelectionRange(this.value.length, this.value.length);
                } else {
                    // At the end, clear the input
                    historyIndex = commandHistory.length;
                    this.value = '';
                }
                break;
            
            case 'Tab':
                e.preventDefault();
                const currentInput = this.value.trim().toLowerCase();
                if (currentInput) {
                    const matches = allCommands.filter(cmd => cmd.startsWith(currentInput));
                    if (matches.length === 1) {
                        this.value = matches[0] + ' ';
                    } else if (matches.length > 1) {
                        // Print all matches
                        printLine(matches.join('  '), 'info');
                    }
                }
                break;
        }
    });

    // Keep focus on the input
    screen.addEventListener('click', () => {
        cmdInput.focus();
    });

    // --- Command Processor ---
    function processCommand(cmd) {
        const args = cmd.split(' ');
        const mainCmd = args[0];

        switch(mainCmd) {
            case 'help':
                printLine("Available Commands:");
                printHTML("  <span class='info'>status</span>   - View system status");
                printHTML("  <span class='info'>ls [-a]</span>  - List assets (try '-a')");
                printHTML("  <span class='info'>cat</span>      - Read a file");
                printHTML("  <span class='info'>uptime</span>   - Show system uptime");
                printHTML("  <span class='info'>clear</span>    - Clear screen");
                printHTML("  <span class='info'>reboot</span>   - Reboot the system");
                printHTML("  <span class='info'>credits</span>  - View system acknowledgements");
                break;
            
            case 'status':
                printLine("[SYSTEM STATUS]");
                printLine(`  Device:     RMNB-1002`);
                printHTML(`  Health:     <span class="warn">Degrading (Battery)</span>`); // FIX: Was printLine
                printLine(`  Domain:     parassharma.com (Mounted: /mnt/domains)`);
                printHTML(`  Wallet:     <span class="warn">Critically Low (₹33.25)</span>`); // FIX: Was printLine
                break;

            case 'ls':
                if (args[1] === '-a') {
                    printLine("drwxr-xr-x 1 root root /mnt/domains");
                    printLine("-rw-r--r-- 1 root root .wallet_history.log");
                } else {
                    printLine("drwxr-xr-x 1 root root /mnt/domains");
                }
                break;
            
            case 'cat':
                if (!args[1]) {
                    printLine("cat: missing operand. Try 'cat /var/log/wallet.log'", 'err');
                    break;
                }
                switch(args[1]) {
                    case '/proc/cpuinfo':
                        printLine("Reading /proc/cpuinfo...");
                        printLine("  processor   : 0");
                        printLine("  vendor_id   : GenuineIntel");
                        printLine("  model name  : 11th Gen Intel(R) Core(TM) i5-1135G7 @ 2.40GHz");
                        printLine("  cache size  : 8192 KB");
                        break;
                    case '/var/log/wallet.log':
                    case '.wallet_history.log': // Easter egg alias
                        printLine("Reading /var/log/wallet.log...");
                        printLine("  [2025-11-12] SERVICE: domain_registrar");
                        printLine("  [2025-11-12] ACTION:  PURCHASE (parassharma.com)");
                        printHTML("  [2025-11-12] STATUS:  <span class='ok'>SUCCESS</span>"); // NOTE: This was already correct, but ensure it's printHTML
                        printLine("  [2025-11-12] BALANCE: 33.25 INR");
                        printLine("  [2025-11-12] NOTE:    Resource allocation is now minimal.");
                        break;
                    case '/etc/hosts':
                        printLine("Reading /etc/hosts...");
                        printLine("  127.0.0.1       localhost");
                        printLine("  185.199.108.153 parassharma.com");
                        printLine("  185.199.109.153 parassharma.com");
                        printLine("  185.199.110.153 parassharma.com");
                        printLine("  185.199.111.153 parassharma.com");
                        break;
                    default:
                        printLine(`cat: ${args[1]}: No such file or directory`, 'err');
                }
                break;

            case 'uptime':
                const now = new Date();
                const diff = now - laptopDob;
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                printLine(`System has been up for ${ageYears} years, ${days % 365} days.`);
                break;

            case 'clear':
            case 'cls':
                output.innerHTML = '';
                break;
            
            case 'reboot':
                printLine("Rebooting system...", 'warn');
                inputLine.style.display = 'none';
                setTimeout(() => {
                    output.innerHTML = '';
                    bootIndex = 0;
                    runBoot();
                }, 1500);
                break;

            case 'credits':
                printLine("[ACKNOWLEDGEMENTS]");
                printLine("  This system is stabilized by the following core module:");
                printHTML("    <span class='info'>Module: D.S. (Dikshita)</span>");
                printHTML("    Status: <span class='ok'>Active & Vital</span>");
                printLine("    Ref:    143");
                break;

            default:
                if (cmd !== '') printLine(`Command not found: ${cmd}. Try 'help'.`, 'err');
        }
    }

    // Start
    setTimeout(runBoot, 500);
});