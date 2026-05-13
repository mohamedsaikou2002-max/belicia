/**
 * ============================================================
 * EXPERT KNOWLEDGE CORPUS v1.0
 * Domains: Cybersecurity · Quantum Mechanics · Quantum Computing
 *          Neuroscience · Biology · RF/Satellites · Cryptography
 *          Zero-Knowledge Proofs · Aerospace · ML/AI Alignment
 *          Web3 · Blockchain
 * Depth: Broad overview + deep technical sections per domain
 * ============================================================
 */

export const EXPERT_CORPUS = {

  // ============================================================
  // 1. CYBERSECURITY
  // ============================================================
  cybersecurity: {
    overview: `
Cybersecurity is the practice of protecting systems, networks, and programs from digital attacks.
It encompasses offensive security (red teaming, penetration testing, exploit development) and
defensive security (blue teaming, incident response, hardening). Core pillars: Confidentiality,
Integrity, Availability (CIA Triad). Modern cybersecurity also includes DevSecOps, zero-trust
architecture, and threat intelligence.
    `,
    fundamentals: {
      cia_triad: `
Confidentiality: preventing unauthorized disclosure of data. Enforced via encryption, access
control lists (ACLs), role-based access control (RBAC), and need-to-know policies.
Integrity: ensuring data is not tampered with. Enforced via cryptographic hashes (SHA-256,
SHA-3), HMACs, digital signatures, and file integrity monitoring (FIM).
Availability: ensuring systems are accessible. Defended via redundancy, load balancing,
DDoS mitigation, failover clustering, and rate limiting.
      `,
      threat_models: `
STRIDE: Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service,
Elevation of Privilege. Used in Microsoft SDL.
PASTA: Process for Attack Simulation and Threat Analysis — 7-stage risk-centric framework.
MITRE ATT&CK: Knowledge base of adversary tactics, techniques, and procedures (TTPs) mapped
to real-world threat actors. Uses matrix of Tactics (columns) vs Techniques (rows).
Kill Chain (Lockheed Martin): Reconnaissance → Weaponization → Delivery → Exploitation →
Installation → C2 → Actions on Objectives. Each phase is an opportunity to detect/disrupt.
Diamond Model: Adversary, Capability, Infrastructure, Victim — four core features of any intrusion.
      `,
    },
    network_security: {
      protocols: `
TCP/IP Stack vulnerabilities: SYN flood, IP spoofing, session hijacking, BGP hijacking.
DNS attacks: DNS cache poisoning (Kaminsky attack), DNS amplification DDoS, DNS tunneling,
NXDOMAIN attacks, DNS rebinding for SSRF bypass.
TLS/SSL: Downgrade attacks (POODLE, DROWN, BEAST), certificate pinning bypass, weak cipher
suites (RC4, DES, 3DES), MITM via rogue CA, HSTS bypass via cookie injection.
ARP: ARP spoofing/poisoning to redirect LAN traffic. Mitigated via Dynamic ARP Inspection (DAI).
BGP: Path hijacking (Pakistan Telecom 2008, Rostelecom 2020). Mitigated via RPKI, BGPsec.
ICMP: Smurf attacks, ICMP redirect abuse, covert channel exfiltration via ICMP payloads.
      `,
      firewalls_ids_ips: `
Stateless firewalls: filter based on source/dest IP and port only. Bypass via fragmentation.
Stateful firewalls: track connection state. Bypass via protocol confusion, split handshake.
NGFW (Next-Gen): deep packet inspection, app-layer filtering, TLS inspection.
IDS (Intrusion Detection): signature-based (Snort, Suricata) vs anomaly-based (ML models).
IPS (Intrusion Prevention): inline blocking, risk of false positives disrupting services.
Evasion techniques: fragmentation, polymorphic shellcode, protocol mimicry, timing attacks,
chunked transfer encoding, Unicode/hex encoding, invalid TCP flags.
Honeypots: Kippo (SSH), Dionaea (malware), Cowrie, Conpot (ICS/SCADA).
      `,
      wireless: `
WEP: RC4 with static key, broken via IV reuse (Fluhrer-Mantin-Shamir attack, aircrack-ng).
WPA/WPA2: TKIP broken via Beck-Tews. CCMP (AES) in WPA2 solid but vulnerable to PMKID attack.
WPA3: SAE (Dragonfly handshake) — resistant to offline dictionary attack. Dragonblood vulns (2019).
Evil twin / rogue AP: mitmproxy, hostapd-wpe, Karma attack.
KRACK (Key Reinstallation Attack): nonce reuse in WPA2 4-way handshake.
802.1X: EAP-TLS, PEAP, EAP-TTLS. Bypass via impersonation of RADIUS server.
Bluetooth: BlueBorne, BIAS (Bluetooth Impersonation AttackS), BLESA, Bluebugging, Bluesnarfing.
      `,
    },
    penetration_testing: {
      methodology: `
Phases: Pre-engagement (scope, rules of engagement, legal) → Reconnaissance → Scanning &
Enumeration → Exploitation → Post-Exploitation → Lateral Movement → Persistence → Exfiltration
→ Reporting.
Standards: PTES (Penetration Testing Execution Standard), OWASP Testing Guide (OTG), NIST
SP 800-115, OSSTMM.
Types: Black box (no prior knowledge), White box (full access), Grey box (partial).
      `,
      recon: `
Passive: OSINT — Shodan, Censys, FOFA, Hunter.io, theHarvester, Maltego, SpiderFoot,
LinkedIn scraping, Google dorks (site:, filetype:, inurl:, intitle:), WHOIS, DNS records,
Certificate Transparency logs (crt.sh), Wayback Machine, social media enumeration.
Active: Ping sweep (nmap -sn), port scan (nmap -sS -sV -O), OS fingerprinting,
banner grabbing (netcat, curl), traceroute, DNS zone transfer (dig axfr), SNMP walk.
      `,
      exploitation: `
Metasploit Framework: msfconsole, msfvenom (payload generation), modules (exploits, payloads,
auxiliaries, post, encoders). Core commands: use, set, run, sessions, meterpreter.
Buffer Overflow: stack smashing, ret2libc, ROP chains, heap spraying. Protections: ASLR,
DEP/NX, Stack Canaries, PIE, RELRO. Bypass: ret2plt, JIT spraying, heap grooming.
SQLi: UNION-based, error-based, blind (boolean, time-based), OOB. Tools: sqlmap, manual payloads.
XSS: Reflected, Stored, DOM-based. Payloads: <script>alert(1)</script>, event handlers,
SVG, polyglots. Bypass: WAF evasion, encoding, filter bypass.
XXE: XML External Entity injection for SSRF, file read, DoS. Blind XXE via OOB DNS.
SSRF: Server-Side Request Forgery — accessing internal services (metadata endpoints, Redis,
Elasticsearch). Bypass: IP encoding, DNS rebinding, 302 redirect.
Deserialization: Java (ysoserial gadget chains), Python (pickle), PHP (POP chains), .NET.
      `,
      post_exploitation: `
Privilege escalation Linux: SUID binaries (find / -perm -4000), sudo -l misconfig,
cron jobs, writable /etc/passwd, kernel exploits (DirtyCow, Dirty Pipe), PATH injection,
NFS no_root_squash, LD_PRELOAD abuse.
Privilege escalation Windows: token impersonation (Juicy Potato, Rotten Potato, PrintSpoofer),
unquoted service paths, weak registry permissions, DLL hijacking, AlwaysInstallElevated,
Pass-the-Hash, Pass-the-Ticket (Kerberos), DCSync, AS-REP Roasting, Kerberoasting.
Lateral movement: PsExec, WMI, WinRM, SMB, RDP, SSH key reuse, credential spraying,
Living-off-the-land (LOLBins): mshta, wscript, certutil, regsvr32, rundll32, powershell.
Persistence: Registry run keys, scheduled tasks, startup folders, DLL side-loading, bootkit,
WMI event subscriptions, COM hijacking, LSA notification packages, skeleton key.
      `,
      c2_frameworks: `
Cobalt Strike: beacon (stageless/staged), malleable C2 profiles, team server, Aggressor scripts,
BOF (Beacon Object Files), sleep masking, OPSEC considerations.
Sliver: mTLS, WireGuard, HTTP/S implants, multiplayer, BYOB.
Havoc: modern Cobalt Strike alternative with demon implant.
Brute Ratel: EDR evasion focus, indirect syscalls.
Empire: PowerShell/Python, listeners, stagers, modules.
Covenant: .NET C2 with Grunt implant.
C2 evasion: domain fronting, DNS-over-HTTPS, ICMP tunneling, steganography, JA3/JA4 masking.
      `,
    },
    mobile_security: {
      android: `
Architecture: Linux kernel → HAL → Android Runtime (ART) → Framework → Apps.
App sandbox: each app runs as unique UID. Inter-process: Binder IPC, Intents.
Vulnerabilities: exported components (activities, services, receivers, providers),
intent redirection, tapjacking, StrandHogg (task affinity hijack), Janus (APK signing bypass),
unsafe deserialization, insecure data storage (SharedPreferences, external storage),
cleartext traffic, weak crypto, certificate pinning bypass (Frida, objection, apk-mitm).
Tools: MobSF, apktool, jadx, dex2jar, adb, Burp Suite, Frida, objection, drozer.
Dynamic analysis: Frida hooking, runtime patching, Xposed framework, traffic interception.
      `,
      ios: `
Architecture: XNU kernel, sandbox (entitlements), code signing, Secure Enclave.
Vulnerabilities: URL scheme hijacking, UIPasteboard leaks, insecure keychain storage,
weak biometric implementation, Jailbreak detection bypass, certificate pinning bypass,
binary patching, method swizzling via Cydia Substrate/Frida.
Tools: MobSF, Clutch (decrypt App Store apps), class-dump, Hopper, Ghidra, Frida, objection.
Jailbreaks: checkra1n (hardware exploit, bootrom), unc0ver, Dopamine (arm64e).
      `,
    },
    web_application_security: {
      owasp_top10_2021: `
A01 Broken Access Control: IDOR, path traversal, CORS misconfiguration, privilege escalation.
A02 Cryptographic Failures: weak TLS, hardcoded secrets, unencrypted PII, weak hash (MD5, SHA1).
A03 Injection: SQL, OS command, LDAP, NoSQL (MongoDB), XPath, template injection (SSTI).
A04 Insecure Design: threat modeling gaps, insecure defaults, missing abuse case analysis.
A05 Security Misconfiguration: default creds, open S3 buckets, verbose errors, unnecessary features.
A06 Vulnerable Components: Log4Shell (CVE-2021-44228), Struts2, outdated libs, transitive deps.
A07 Authentication Failures: credential stuffing, brute force, weak passwords, session fixation.
A08 Software and Data Integrity: CI/CD pipeline compromise, unsigned artifacts, XZ Utils backdoor.
A09 Logging Failures: no audit trail, PII in logs, log injection.
A10 SSRF: internal metadata access (AWS 169.254.169.254), port scanning, pivot to internal net.
      `,
      advanced_web: `
OAuth 2.0 attacks: open redirect, state parameter bypass, token leakage via Referer,
misuse of implicit flow, PKCE bypass, token substitution.
JWT attacks: alg:none, RS256→HS256 confusion, weak secret (hashcat), kid injection,
jwks spoofing, embedded JWK, expired token acceptance.
GraphQL: introspection abuse, batching attacks, IDOR via resolver, excessive data exposure,
NoSQL injection via directives, DoS via deeply nested queries.
WebSockets: lack of origin check, CSRF via WS, message tampering.
HTTP Request Smuggling: CL.TE, TE.CL, TE.TE — bypassing security controls, cache poisoning.
Cache Poisoning: unkeyed headers (X-Forwarded-Host), fat GET, parameter cloaking.
Prototype Pollution: __proto__ manipulation in JavaScript, gadget chains for RCE.
      `,
    },
    malware_analysis: `
Types: virus (self-replicating), worm (network-spreading), trojan, ransomware, rootkit,
bootkit, spyware, adware, fileless malware, wipers, RAT (Remote Access Trojan).
Static analysis: strings, file hashing (MD5/SHA256), PE header analysis (PEview, PE-bear),
import/export table, entropy analysis (packers), disassembly (IDA Pro, Ghidra, Binary Ninja).
Dynamic analysis: sandbox (Cuckoo, ANY.RUN, Joe Sandbox), process monitoring (ProcMon),
network capture (Wireshark), registry monitoring, API hooking, debugger (x64dbg, WinDbg).
Evasion: anti-debug (IsDebuggerPresent, timing checks), anti-VM (CPUID, registry checks),
packing/obfuscation, polymorphism, metamorphism, code injection (process hollowing,
DLL injection, reflective loading, APC injection, atom bombing).
Ransomware mechanics: hybrid encryption (RSA + AES), shadow copy deletion (vssadmin),
backup sabotage, C2 key exchange, double extortion.
    `,
    incident_response: `
NIST IR lifecycle: Preparation → Detection & Analysis → Containment, Eradication & Recovery
→ Post-Incident Activity.
Evidence collection: disk imaging (dd, FTK Imager), memory capture (Volatility, WinPmem),
chain of custody, log preservation, network pcap.
Volatility framework: imageinfo, pslist, pstree, cmdline, netscan, malfind, dlllist,
filescan, dumpfiles, timeliner, hivelist, hashdump.
Forensic artifacts (Windows): event logs (4624/4625/4688/7045), prefetch, shimcache,
amcache, lnk files, jump lists, MFT, USN journal, browser history, registry hives.
Threat hunting: hypothesis-driven, IOC-based (hashes, IPs, domains), TTP-based (ATT&CK),
UEBA (user behavior analytics), stack analysis for anomalies.
    `,
    cloud_security: `
AWS: IAM misconfigs (overpermissive roles, public S3, EC2 metadata SSRF), Security Hub,
GuardDuty, CloudTrail, VPC Flow Logs, SCPs, resource-based policies, confused deputy attack.
Azure: Managed Identity abuse, Azure AD privilege escalation, Key Vault misconfig,
Defender for Cloud, Sentinel SIEM.
GCP: Workload Identity Federation, GCS bucket misconfig, Cloud Audit Logs, BeyondCorp.
Container security: Docker escape (privileged container, host mount, runc CVE-2019-5736),
Kubernetes: RBAC misconfig, etcd exposure, API server anon auth, kubelet exploitation,
Pod Security Policies → Pod Security Admission, network policy enforcement.
Serverless: event injection, over-permissive execution role, dependency confusion,
cold-start timing attacks.
    `,
    tools_reference: `
Scanning: nmap, masscan, rustscan, nuclei, nikto, wpscan, gobuster, ffuf, feroxbuster.
Exploitation: Metasploit, sqlmap, Burp Suite Pro, OWASP ZAP, BeEF, impacket, Responder.
Password: hashcat, John the Ripper, CeWL, crunch, rockyou.txt, NTLM relay (ntlmrelayx).
AD: BloodHound/SharpHound, PingCastle, ADACLScanner, PowerView, SharpView, Rubeus, Mimikatz.
Forensics: Autopsy, Sleuth Kit, Volatility3, KAPE, Velociraptor, Plaso.
Reverse engineering: IDA Pro, Ghidra, Binary Ninja, x64dbg, Radare2, pwndbg, pwntools.
Wireless: Aircrack-ng, Kismet, Wifite, hcxtools, hostapd-wpe, bettercap.
    `,
  },

  // ============================================================
  // 2. QUANTUM MECHANICS
  // ============================================================
  quantum_mechanics: {
    overview: `
Quantum mechanics (QM) is the fundamental theory of nature at small scales. It describes how
particles like electrons, photons, and quarks behave — radically different from classical
physics. Key postulates: systems are described by wavefunctions, observables are Hermitian
operators, measurements cause wavefunction collapse, time evolution follows the Schrödinger
equation. QM is the basis for atomic physics, solid-state physics, quantum optics, particle
physics, and quantum computing.
    `,
    mathematical_foundations: {
      hilbert_space: `
A quantum state lives in a complex Hilbert space H. States represented as ket vectors |ψ⟩.
Inner product ⟨φ|ψ⟩ ∈ ℂ. Norm: ⟨ψ|ψ⟩ = 1 (normalization).
Bra-ket (Dirac) notation: bra ⟨φ| is the dual (conjugate transpose) of ket |φ⟩.
Superposition principle: |ψ⟩ = α|0⟩ + β|1⟩ with |α|² + |β|² = 1 for a qubit.
Basis sets: discrete (spin, energy eigenstates) or continuous (position, momentum).
      `,
      operators_observables: `
Observables correspond to Hermitian (self-adjoint) operators: Â = Â†.
Eigenvalue equation: Â|a⟩ = a|a⟩. Eigenvalues a are real (measurement outcomes).
Expectation value: ⟨Â⟩ = ⟨ψ|Â|ψ⟩.
Commutator: [Â, B̂] = ÂB̂ − B̂Â. Non-commuting observables cannot be simultaneously measured.
Heisenberg Uncertainty: [x̂, p̂] = iℏ → Δx·Δp ≥ ℏ/2.
Angular momentum: [L̂x, L̂y] = iℏL̂z and cyclic. L² and Lz simultaneously measurable.
      `,
      schrodinger_equation: `
Time-dependent: iℏ ∂|ψ⟩/∂t = Ĥ|ψ⟩. Governs wavefunction evolution.
Time-independent (stationary states): Ĥ|ψ⟩ = E|ψ⟩.
Solutions for key systems:
- Infinite square well: Eₙ = n²π²ℏ²/(2mL²), ψₙ(x) = √(2/L)sin(nπx/L).
- Harmonic oscillator: Eₙ = ℏω(n + 1/2), ladder operators â, â†.
- Hydrogen atom: Eₙ = -13.6 eV/n², ψₙₗₘ(r,θ,φ) = Rₙₗ(r)Yₗᵐ(θ,φ).
Unitary evolution: |ψ(t)⟩ = e^(-iĤt/ℏ)|ψ(0)⟩ preserves norm.
      `,
    },
    core_phenomena: {
      superposition_and_measurement: `
Before measurement, a quantum system exists in superposition of all eigenstates.
Measurement: probability of outcome aₙ is |⟨aₙ|ψ⟩|² = |cₙ|². Post-measurement: state
collapses to |aₙ⟩. This is the Copenhagen interpretation.
Many-worlds: all outcomes occur in branching universes (Everett, 1957).
Decoherence: interaction with environment causes apparent wavefunction collapse —
quantum superpositions leak into environmental degrees of freedom.
      `,
      entanglement: `
Two particles in entangled state: |ψ⟩ = (1/√2)(|00⟩ + |11⟩) — cannot be factored as |ψA⟩⊗|ψB⟩.
Bell states (maximally entangled): |Φ±⟩ = (|00⟩±|11⟩)/√2, |Ψ±⟩ = (|01⟩±|10⟩)/√2.
Bell's theorem: no local hidden variable theory can reproduce all QM predictions.
CHSH inequality: |⟨AB⟩ + ⟨AB'⟩ + ⟨A'B⟩ - ⟨A'B'⟩| ≤ 2 classically; QM violates up to 2√2.
Aspect's experiment (1982): confirmed entanglement nonlocality.
Entanglement entropy: S = -Tr(ρA log ρA) — measures entanglement in a bipartite system.
      `,
      tunneling: `
Particle with energy E < V₀ has nonzero probability to traverse a potential barrier.
Transmission coefficient: T ≈ e^(-2κL) where κ = √(2m(V₀-E))/ℏ, L = barrier width.
Applications: alpha decay (Gamow theory), tunnel diode, STM (scanning tunneling microscope),
enzyme catalysis, fusion in stars.
WKB approximation: T ≈ exp(-2∫√(2m(V(x)-E))/ℏ dx) for slowly varying potential.
      `,
      spin: `
Intrinsic angular momentum, no classical analog.
Spin-1/2: eigenvalues of Ŝz are ±ℏ/2. Pauli matrices: σx, σy, σz.
|↑⟩ = [1,0]ᵀ (spin up), |↓⟩ = [0,1]ᵀ (spin down).
Stern-Gerlach experiment: discrete deflection confirms spin quantization.
Spinor rotation: rotating spin-1/2 by 2π returns -|ψ⟩ (fermion sign, SU(2) covering of SO(3)).
Pauli exclusion principle: no two identical fermions can occupy the same quantum state.
      `,
    },
    advanced_topics: {
      perturbation_theory: `
Time-independent: H = H₀ + λH'. First-order energy: Eₙ¹ = ⟨n⁰|H'|n⁰⟩.
First-order state correction: |n¹⟩ = Σₘ≠ₙ ⟨m⁰|H'|n⁰⟩/(Eₙ⁰ - Eₘ⁰) |m⁰⟩.
Degenerate perturbation theory: diagonalize H' within degenerate subspace.
Time-dependent: Fermi's golden rule — transition rate Γ = (2π/ℏ)|⟨f|H'|i⟩|²ρ(Ef).
Applications: Stark effect (electric field), Zeeman effect (magnetic field), fine structure.
      `,
      density_matrix: `
ρ = |ψ⟩⟨ψ| for pure state. Mixed state: ρ = Σᵢ pᵢ|ψᵢ⟩⟨ψᵢ|.
Properties: ρ = ρ†, Tr(ρ) = 1, ρ ≥ 0. Pure: Tr(ρ²) = 1. Mixed: Tr(ρ²) < 1.
Von Neumann equation: iℏ dρ/dt = [H, ρ].
Reduced density matrix: ρA = TrB(ρAB) — trace out subsystem B.
Lindblad master equation: dρ/dt = -i[H,ρ]/ℏ + Σₖ(LₖρLₖ† - {Lₖ†Lₖ,ρ}/2) for open systems.
      `,
      path_integrals: `
Feynman path integral: ⟨xf,tf|xi,ti⟩ = ∫ Dx(t) exp(iS[x]/ℏ).
S[x] = ∫L(x,ẋ)dt is the classical action. Sum over ALL paths.
Stationary phase approximation: dominant contribution from classical path (ℏ→0).
Applications: QFT, statistical mechanics (Euclidean path integral ↔ partition function),
quantum chaos, semiclassical quantization.
Wick rotation: t → -iτ connects QM to statistical mechanics (Z = ∫Dφ e^(-S_E/ℏ)).
      `,
      second_quantization: `
Field operators: ψ̂(x) = Σₖ aₖ φₖ(x) where aₖ are annihilation operators.
Bosons: [aₖ, aₖ'†] = δₖₖ'. Fermions: {cₖ, cₖ'†} = δₖₖ'.
Hamiltonian: Ĥ = Σₖ ℏωₖ(nₖ + 1/2) for bosons.
Applications: quantum field theory, condensed matter (BCS theory of superconductivity,
BEC), quantum optics.
      `,
      interpretations: `
Copenhagen: wavefunction is a calculational tool; collapse is physical upon measurement.
Many-worlds (Everett): universal wavefunction never collapses; branches at every measurement.
Pilot wave / de Broglie-Bohm: hidden variable — particle has definite position guided by wave.
QBism: wavefunction encodes agent's beliefs (quantum Bayesianism).
Relational QM (Rovelli): quantum states are relative to observers.
Consistent histories: framework for reasoning about quantum sequences without measurement.
Objective collapse theories: GRW, Penrose — physical wavefunction collapse at some scale.
      `,
    },
  },

  // ============================================================
  // 3. QUANTUM COMPUTING
  // ============================================================
  quantum_computing: {
    overview: `
Quantum computing exploits quantum mechanical phenomena — superposition, entanglement,
interference — to process information in ways that provide exponential or polynomial
speedups for specific problems. The basic unit is the qubit. Key milestone: quantum
supremacy (Google Sycamore, 2019). Applications: cryptography, optimization, simulation
of quantum systems, machine learning. Current era: NISQ (Noisy Intermediate-Scale Quantum).
    `,
    qubits_and_gates: {
      qubit: `
Two-level quantum system: |ψ⟩ = α|0⟩ + β|1⟩, |α|²+|β|² = 1.
Bloch sphere representation: |ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩.
Physical realizations: superconducting transmon (IBM, Google), trapped ions (IonQ, Honeywell),
photonic (PsiQuantum), spin qubits (Intel), topological qubits (Microsoft, Majorana).
Decoherence: T1 (energy relaxation), T2 (dephasing). Current best ~1 ms for superconducting.
      `,
      single_qubit_gates: `
Pauli gates: X (NOT), Y, Z (phase flip). X = [[0,1],[1,0]].
Hadamard: H = (1/√2)[[1,1],[1,-1]]. Creates superposition: H|0⟩ = |+⟩.
Phase gates: S = [[1,0],[0,i]], T = [[1,0],[0,e^(iπ/4)]].
Rotation gates: Rx(θ) = e^(-iθX/2), Ry(θ) = e^(-iθY/2), Rz(θ) = e^(-iθZ/2).
Universal single-qubit: any U(2) reachable with H, T gates (approximately).
      `,
      two_qubit_gates: `
CNOT (CX): |c⟩|t⟩ → |c⟩|t⊕c⟩. Entangles qubits. [[1,0,0,0],[0,1,0,0],[0,0,0,1],[0,0,1,0]].
CZ: |11⟩ → -|11⟩. Symmetric, commonly used in superconducting architectures.
SWAP: exchanges two qubit states. SWAP = CX·(CX reversed)·CX.
Toffoli (CCNOT): 3-qubit, classical AND gate. Universal for classical computing.
iSWAP, fSWAP, XX, ZZ: common in variational algorithms and specific hardware.
Universality: {CNOT, H, T} is universal (Solovay-Kitaev theorem).
      `,
    },
    algorithms: {
      shors_algorithm: `
Factoring N = pq in O((log N)³) time — exponential speedup over best classical (GNFS).
Reduces factoring to order-finding: find r such that aʳ ≡ 1 (mod N).
Uses Quantum Phase Estimation (QPE) and Quantum Fourier Transform (QFT).
QFT: |j⟩ → (1/√N) Σₖ e^(2πijk/N)|k⟩. Implemented in O((log N)²) gates (vs O(N log N) classical FFT).
Security implication: breaks RSA, DSA, DH, ECC (for large enough quantum computer).
Required qubits: ~4000+ logical qubits (~millions physical with error correction) for RSA-2048.
Current status: largest factored number experimentally is trivially small.
      `,
      grovers_algorithm: `
Unstructured database search: O(√N) vs O(N) classical.
Amplitude amplification of target state via Grover diffusion operator.
Oracle: flips sign of target |x*⟩. Diffusion: reflects about average amplitude.
Iterate O(√N) times: probability of measuring |x*⟩ approaches 1.
Security implication: halves effective key length of symmetric crypto (AES-128 → 64-bit effective).
Applications: NP-hard optimization, collision finding in hash functions, SAT solving.
      `,
      quantum_simulation: `
Feynman's original motivation (1982): quantum computers can simulate quantum systems
exponentially faster than classical.
Hamiltonian simulation: e^(-iHt) acting on |ψ⟩. Methods: Trotter-Suzuki decomposition,
qubitization, linear combinations of unitaries (LCU), quantum signal processing.
Applications: drug discovery (protein folding, molecular binding), materials science
(high-Tc superconductors, catalysts), quantum chemistry (FeMoco for nitrogen fixation).
VQE (Variational Quantum Eigensolver): hybrid classical-quantum for ground state energy.
      `,
      quantum_ml: `
Quantum PCA: O(log d) vs O(d³) — exponential speedup (HHL-based).
QSVM: quantum support vector machine via quantum kernel methods.
QNN (Quantum Neural Networks): parameterized quantum circuits (PQCs) as variational models.
Quantum Boltzmann machines, QAOA for combinatorial optimization.
Dequantization (Tang, 2018): some quantum ML speedups matched by classical sampling algorithms.
Near-term focus: quantum kernel methods, quantum transfer learning, hybrid architectures.
      `,
      vqe_qaoa: `
VQE: prepare ansatz |ψ(θ)⟩, measure ⟨H⟩, classically optimize θ. For NISQ chemistry.
Hardware-efficient ansatz (HEA) vs chemically inspired (UCCSD).
QAOA (Quantum Approximate Optimization Algorithm): p-layer circuit alternating problem and
mixer Hamiltonians. Approximate solution to MaxCUT, TSP, graph problems.
Barren plateaus: exponentially vanishing gradients for deep random circuits — major challenge.
Error mitigation: zero-noise extrapolation (ZNE), probabilistic error cancellation (PEC),
symmetry verification, virtual distillation.
      `,
    },
    error_correction: `
Quantum error correction (QEC) is essential for fault-tolerant quantum computing.
Quantum errors: bit flip (X), phase flip (Z), their combination (Y). Also erasure, leakage.
No-cloning theorem: cannot copy unknown quantum state → must use redundancy differently.
3-qubit bit-flip code: |0⟩ → |000⟩, |1⟩ → |111⟩. Detects 1 bit flip via ancilla parity checks.
Shor code (9 qubits): first code correcting any single-qubit error.
CSS codes: Calderbank-Shor-Steane. Stabilizer formalism via Pauli group.
Surface code: most hardware-favored. 2D array, threshold ~1% physical error rate.
Logical qubit: encoded in thousands of physical qubits (distance-d surface code needs d² qubits).
Fault tolerance threshold: below ~0.1-1% physical error rate, QEC suppresses logical errors.
Magic state distillation: prepare non-Clifford resource states for universal fault-tolerant gates.
    `,
    hardware_platforms: `
Superconducting: Josephson junctions as qubits. IBM Quantum (Eagle 127Q, Condor 1121Q),
Google (Sycamore 53Q, Willow 105Q). Gate times ~ns. Dilution refrigerator (~15 mK). Challenges:
fabrication consistency, crosstalk, limited connectivity.
Trapped ions: IonQ, Quantinuum (H-series). Qubits = electronic levels of Ca+, Yb+.
All-to-all connectivity, very long T2 (minutes), slow gates (~μs), small scale.
Photonic: PsiQuantum (silicon photonics), Xanadu (GBS). Room temperature, networking-ready.
Measurement-based QC. Key challenge: photon loss, on-demand single photon sources.
Neutral atoms: QuEra (Aquila), Pasqal. Rydberg blockade for gates. Reconfigurable arrays.
Spin qubits: Intel, QuTech. Si/SiGe quantum dots. Compatible with semiconductor fab.
Topological: Microsoft (Majorana-based). Not yet demonstrated. Could have intrinsic error protection.
    `,
    quantum_communication: `
Quantum key distribution (QKD): BB84 protocol — encode key in photon polarizations.
Security: based on no-cloning theorem and Heisenberg uncertainty. Any eavesdropping disturbs state.
BB84: Alice sends |0⟩,|1⟩,|+⟩,|-⟩. Bob measures randomly. Sift on matching bases.
E91 (Ekert): entanglement-based QKD. Bell inequality violation certifies security.
Quantum repeaters: entanglement swapping + purification to extend QKD range.
Quantum internet: distribute entanglement for QKD, distributed QC, quantum sensing.
Quantum teleportation: transmit unknown qubit state using entanglement + classical bits.
No-communication theorem: cannot use entanglement to send info FTL.
    `,
  },

  // ============================================================
  // 4. NEUROSCIENCE
  // ============================================================
  neuroscience: {
    overview: `
Neuroscience studies the nervous system — from molecular mechanisms to systems-level function
and behavior. Covers: molecular/cellular neuroscience, systems neuroscience (sensory, motor,
cognitive), computational neuroscience, and clinical neuroscience. The human brain contains
~86 billion neurons, ~100 trillion synapses, organized into circuits with extraordinary
specificity.
    `,
    cellular_neuroscience: {
      neuron_anatomy: `
Soma (cell body): integrates signals. Dendrites: receive inputs (dendritic spines for excitatory).
Axon: transmits output. Axon hillock: spike initiation zone. Myelin (Schwann cells / oligodendrocytes):
speeds conduction via saltatory (node-to-node) propagation.
Types: unipolar, bipolar, multipolar, pseudounipolar.
Excitatory: pyramidal cells (glutamate). Inhibitory: interneurons (GABA, glycine).
Glial cells: astrocytes (K+ buffering, neurotransmitter uptake), microglia (immune),
oligodendrocytes (myelination, CNS), Schwann cells (myelination, PNS), ependymal cells (CSF).
      `,
      action_potential: `
Resting potential: ~-70 mV (maintained by Na/K-ATPase: 3 Na+ out, 2 K+ in).
Threshold: ~-55 mV. Depolarization: Na+ channels open → rapid influx.
Repolarization: Na+ inactivation + K+ channels open → K+ efflux.
Hyperpolarization: K+ overshoot → absolute then relative refractory period.
Hodgkin-Huxley model: I = Cm dV/dt + gNa·m³h(V-ENa) + gK·n⁴(V-EK) + gL(V-EL).
Gating variables m, h, n with first-order kinetics. Nobel Prize 1963.
Conduction velocity: myelinated axons up to 120 m/s; unmyelinated 0.5-2 m/s.
      `,
      synaptic_transmission: `
Chemical synapse: presynaptic vesicle fusion → neurotransmitter release → postsynaptic receptor binding.
Vesicle fusion: Ca²+ influx via voltage-gated Ca²+ channels → SNARE complex (synaptobrevin,
syntaxin, SNAP-25) zippering → exocytosis.
EPSP: excitatory postsynaptic potential (depolarizing). IPSP: inhibitory (hyperpolarizing).
Neurotransmitters: glutamate (iGluR: AMPA, NMDA, kainate; mGluR), GABA (GABAA Cl⁻ channel,
GABAB GPCR), dopamine (D1-D5), serotonin (5-HT1-7), acetylcholine (nAChR, mAChR),
norepinephrine (α, β receptors), glycine, histamine, neuropeptides.
NMDA receptor: coincidence detector — requires both ligand (glutamate + glycine) AND
depolarization (Mg²+ block removed) → Ca²+ influx → LTP induction.
      `,
      plasticity: `
Hebbian plasticity: "neurons that fire together wire together."
LTP (Long-term potentiation): NMDA → Ca²+ → CaMKII → AMPA insertion, spine enlargement.
LTD (Long-term depression): low-frequency stimulation → PP2B activation → AMPA endocytosis.
STDP (Spike-timing dependent plasticity): pre before post → LTP; post before pre → LTD.
Homeostatic plasticity: synaptic scaling — maintain average firing rate.
Metaplasticity: plasticity of plasticity (sliding threshold, BCM theory).
Structural plasticity: new dendritic spines, synaptogenesis, axonal sprouting.
Adult neurogenesis: hippocampal dentate gyrus, olfactory bulb. Regulated by exercise, stress.
      `,
    },
    systems_neuroscience: {
      sensory_systems: `
Visual: retina (rods/cones → bipolar → RGC) → optic nerve → LGN → V1 (primary visual cortex)
→ V2 → ventral stream (what, IT cortex) / dorsal stream (where/how, parietal).
Simple cells: oriented edges. Complex cells: motion. Hypercomplex: endpoints.
Auditory: cochlea (tonotopy, basilar membrane, hair cells) → cochlear nucleus → IC → MGN → A1.
Somatosensory: mechanoreceptors (Meissner, Pacinian, Merkel, Ruffini) → dorsal horn →
thalamus (VPL) → S1 (somatotopic map — homunculus). Pain: A-delta, C-fibers → spinothalamic.
Olfactory: only direct-to-cortex sense. Olfactory epithelium → olfactory bulb → piriform cortex.
      `,
      motor_systems: `
Motor cortex: primary (M1), premotor (PMC), supplementary motor area (SMA).
Corticospinal tract: direct voluntary control. Upper motor neuron → lower motor neuron.
Basal ganglia: striatum (caudate/putamen) → GPi/SNr → thalamus → cortex.
Direct pathway (Go): D1 dopamine → action selection. Indirect (NoGo): D2 → action suppression.
Dopamine: nigrostriatal (movement), mesolimbic (reward), mesocortical (cognition).
Cerebellum: timing and coordination. Purkinje cells receive mossy fibers (pontine) and climbing
fibers (inferior olive — error signal). Adaptive filter model of cerebellar learning.
      `,
      memory_systems: `
Declarative (explicit): episodic (events, hippocampus-dependent) + semantic (facts, neocortex).
Hippocampus: encoding + consolidation. Place cells (O'Keefe), grid cells (Moser), theta oscillations.
System consolidation: HPC replay during NREM sleep → neocortical transfer (standard model).
Multiple trace theory: HPC always involved in vivid episodic memory.
Non-declarative (implicit): procedural (striatum), priming (cortex), conditioning (amygdala,
cerebellum), habituation.
Working memory: prefrontal cortex, sustained activity, ~4 item capacity (Cowan), 18-30 s.
      `,
      consciousness_and_cognition: `
Global Workspace Theory (Baars/Dehaene): consciousness = ignition of global workspace —
information broadcast to frontal, parietal, and other areas simultaneously.
Integrated Information Theory (Tononi): Φ (phi) — measure of integrated information.
Predictive coding: brain as prediction machine. Top-down predictions vs bottom-up errors.
Default mode network (DMN): medial PFC, PCC, angular gyrus. Active at rest, self-referential.
Attention: spatial (Posner), feature-based, object-based. FEF, IPS for top-down; SC for reflexive.
Executive function: PFC — working memory, cognitive control, task-switching, inhibition.
      `,
    },
    computational_neuroscience: `
Integrate-and-fire model: Cm dV/dt = -(V-Vrest)/R + Iext. Spike when V > θ, reset to Vreset.
Conductance-based models: Hodgkin-Huxley and generalizations.
Cable theory: dendritic filtering. Passive cable equation: λ² ∂²V/∂x² = τm ∂V/∂t + V.
Population coding: tuning curves, population vector, Fisher information.
Sparse coding: Olshausen & Field — V1 receptive fields via sparse coding of natural images.
Neural decoding: Bayesian inference, maximum likelihood, linear discriminant analysis.
Oscillations: theta (4-8 Hz, hippocampus), alpha (8-12 Hz, idle), beta (13-30 Hz, motor),
gamma (30-80 Hz, binding). Phase-amplitude coupling, cross-frequency coupling.
Attractor networks: Hopfield network for associative memory, continuous attractor for head direction.
Reinforcement learning in the brain: dopamine as prediction error (Schultz et al., 1997).
    `,
    neurodegenerative_diseases: `
Alzheimer's: amyloid-β plaques (APP processing via secretases), tau neurofibrillary tangles,
ApoE4 risk allele, cholinergic hypothesis, default network atrophy, NMDA excitotoxicity.
Parkinson's: dopaminergic neuron loss in substantia nigra pars compacta, Lewy bodies (α-synuclein),
resting tremor, rigidity, bradykinesia. Treatment: L-DOPA, DBS.
ALS: upper and lower motor neuron degeneration. SOD1, TDP-43, FUS, C9orf72 mutations.
Huntington's: CAG repeat expansion in HTT gene → polyglutamine → striatal neuron death.
Multiple Sclerosis: autoimmune demyelination. Relapsing-remitting vs progressive forms.
    `,
    neuroimaging: `
fMRI: BOLD (blood oxygen level dependent) signal. ~mm spatial, ~seconds temporal resolution.
EEG: scalp electrodes, ms temporal resolution, poor spatial. ERPs (P300, N400, MMN).
MEG: magnetic fields from neural currents. Better source localization than EEG.
PET: radiotracer (FDG for glucose, [11C]raclopride for D2). Neurotransmitter imaging.
TMS: transcranial magnetic stimulation — non-invasive neural disruption or facilitation.
Two-photon imaging: in vivo, single-cell, calcium imaging (GCaMP), spine dynamics.
Neuropixels: silicon probe recording thousands of neurons simultaneously.
    `,
  },

  // ============================================================
  // 5. BIOLOGY
  // ============================================================
  biology: {
    overview: `
Biology is the scientific study of life. Major disciplines: molecular biology, cell biology,
genetics, evolutionary biology, ecology, physiology, microbiology, developmental biology,
and systems biology. Unifying themes: cell theory, evolutionary theory, central dogma,
homeostasis, energy transformation, gene-phenotype relationships.
    `,
    molecular_biology: {
      central_dogma: `
DNA → RNA → Protein. Coined by Crick (1958).
DNA replication: semiconservative (Meselson-Stahl). Helicase unwinds, primase lays RNA primer,
DNA Pol III extends (5'→3'), DNA Pol I removes primer, ligase seals. Fidelity: 1 error/10⁹ bp.
Transcription: RNA Pol II in eukaryotes. Promoter (TATA box, -10/-35), initiation, elongation,
termination. Pre-mRNA → 5' cap → splicing (spliceosome removes introns) → 3' poly-A tail → mRNA.
Alternative splicing: one gene → multiple proteins (titin has ~33,000 exons).
Translation: mRNA → ribosome (small + large subunit). tRNA anticodon matches codon.
A site (aminoacyl), P site (peptidyl), E site (exit). Peptide bond formation by peptidyl transferase (rRNA).
Genetic code: 64 codons, 20 amino acids, 3 stop codons (UAA, UAG, UGA). Degenerate, nearly universal.
      `,
      dna_repair: `
Mismatch repair: MutS recognizes mismatch, MutL recruits MutH, strand excised, resynthesized.
Base excision repair (BER): glycosylase removes damaged base → AP site → AP endonuclease → Pol β.
Nucleotide excision repair (NER): bulky adducts (UV dimers). GG-NER, TC-NER.
Double strand break repair: NHEJ (error-prone, Ku70/80 complex), HR (error-free, RAD51,
uses sister chromatid template, active in S/G2 phase).
Fanconi anemia pathway: interstrand crosslink repair.
DNA damage response: ATM/ATR kinases → p53 → p21 → CDK inhibition → cell cycle arrest or apoptosis.
      `,
      gene_regulation: `
Prokaryotic: operons (lac operon — inducer relieves repressor; trp operon — corepressor).
Eukaryotic: enhancers, silencers, insulators, promoters. Transcription factors (TFs): DBD + AD.
Chromatin remodeling: SWI/SNF complex, HATs (histone acetyltransferases) open chromatin,
HDACs close. Histone code: H3K4me3 (active), H3K27me3 (repressed), H3K9me3 (heterochromatin).
Epigenetics: DNA methylation (CpG islands), heritable without DNA sequence change.
Long non-coding RNAs: XIST (X inactivation), HOTAIR, MALAT1.
miRNA: ~22 nt, loaded into RISC, bind 3'UTR → mRNA degradation or translational repression.
      `,
    },
    cell_biology: {
      cell_signaling: `
Signal transduction pathways: ligand → receptor → second messenger → effector → response.
RTK (receptor tyrosine kinase): EGF, insulin. Dimerization → autophosphorylation →
Grb2/SOS → Ras → Raf → MEK → ERK → transcription. (MAPK cascade)
GPCR: 7TM receptor → Gα activates adenylyl cyclase → cAMP → PKA; or Gq → PLCβ → IP3 + DAG.
IP3 → ER Ca²+ release. DAG → PKC.
PI3K/Akt/mTOR: growth, survival, metabolism. PTEN antagonizes.
Wnt: β-catenin stabilization → TCF transcription. Key in development, cancer.
Notch: juxtacrine signaling, lateral inhibition, γ-secretase cleavage.
Hedgehog: Smo/Ptch, Gli transcription factors. Embryonic patterning, BCC.
      `,
      cell_cycle: `
Phases: G1 → S (DNA synthesis) → G2 → M (mitosis). G0 = quiescence.
Cyclins + CDKs: cyclin D/CDK4/6 (G1), cyclin E/CDK2 (G1/S), cyclin A/CDK2 (S),
cyclin B/CDK1 (M). CDK inhibitors: p21, p27, INK4 family.
Restriction point (R point): beyond this point, cell commits to division regardless of mitogens.
Checkpoints: G1/S (DNA damage → ATM/ATR → CHK1/2 → p53 → p21), G2/M, spindle assembly
checkpoint (SAC — kinetochore unattached → wait anaphase).
Apoptosis: intrinsic (mitochondrial, cytochrome c → Apaf1 → caspase-9 → caspase-3);
extrinsic (Fas/TNF → DISC → caspase-8). BCL-2 family regulates intrinsic.
      `,
    },
    genetics_and_genomics: `
Mendel's laws: segregation (alleles separate), independent assortment (different chromosomes).
Linkage: genes on same chromosome co-segregate unless recombination.
GWAS: genome-wide association studies — SNPs associated with traits/disease.
WGS (whole genome sequencing) vs WES (exome). Long-read: PacBio, Oxford Nanopore.
CRISPR-Cas9: guide RNA directs Cas9 to target → DSB → NHEJ (knockout) or HDR (knock-in).
Base editors: CBE (C→T), ABE (A→G). Prime editing: pegRNA + reverse transcriptase.
Single-cell genomics: scRNA-seq (10x Chromium), scATAC-seq, spatial transcriptomics (Visium, MERFISH).
Epigenomics: ChIP-seq, ATAC-seq, Hi-C (3D genome), WGBS (methylation).
Synthetic biology: BioBrick parts, genetic circuits, toggle switches, repressilators, metabolic engineering.
    `,
    evolutionary_biology: `
Natural selection: heritable variation + differential fitness → allele frequency change.
Modern Synthesis: Darwinian selection + Mendelian genetics + population genetics (Fisher, Wright, Haldane).
Hardy-Weinberg: p² + 2pq + q² = 1. Equilibrium if no selection, drift, mutation, migration.
Genetic drift: random sampling, stronger in small populations. Founder effect, bottleneck.
Molecular clocks: substitution rates for phylogenetics, divergence time estimation.
Neutral theory (Kimura): most molecular variation is neutral. Ks (synonymous) > Ka (non-synonymous).
Evo-devo: Hox genes, regulatory evolution, heterochrony, modularity.
Speciation: allopatric (geographic isolation), sympatric, parapatric. Reproductive isolation.
    `,
    microbiology_and_virology: `
Bacteria: prokaryotes, 1-10 μm, peptidoglycan cell wall (Gram+ thicker), binary fission.
Horizontal gene transfer: conjugation (F plasmid, pilus), transformation (competence), transduction (phage).
Quorum sensing: autoinducer molecules, biofilm formation, virulence regulation.
Viruses: obligate intracellular parasites. Baltimore classification: I-VII by genome type.
Viral replication: attachment → entry → uncoating → replication → assembly → release.
RNA viruses: high mutation rate (no proofreading), rapid evolution (influenza, HIV, SARS-CoV-2).
SARS-CoV-2: +ssRNA, S protein RBD binds ACE2, TMPRSS2 priming, fusogenic.
Bacteriophages: lytic (immediate kill) vs lysogenic (integrates as prophage). Phage therapy.
Antibiotic resistance: β-lactamases (ESBL, KPC), efflux pumps, altered targets, biofilms. ESKAPE pathogens.
    `,
    immunology: `
Innate immunity: pattern recognition receptors (TLRs, NLRs, RLRs), complement, NK cells,
neutrophils, macrophages. PAMPs → MyD88 → NF-κB → inflammation.
Adaptive immunity: antigen-specific, memory. B cells (antibodies) + T cells (cellular).
MHC-I: present intracellular peptides to CD8+ T cells (CTLs). MHC-II: exogenous to CD4+ (helper).
BCR/TCR recombination: V(D)J recombination (RAG1/2). Junctional diversity, N-addition.
Clonal selection: antigen-specific clone expands → effector + memory cells.
Antibodies: IgM (primary response), IgG (secondary, complement), IgA (mucosa), IgE (allergy).
Complement: classical (Ab-Ag), lectin (MBL), alternative pathways → C3 convertase → MAC.
Cytokines: IL-1, IL-6, TNF-α (inflammation); IL-4, IL-13 (Th2); IFN-γ (Th1); TGF-β, IL-10 (regulatory).
CAR-T cell therapy: chimeric antigen receptor — reprogrammed T cells for cancer immunotherapy.
    `,
  },

  // ============================================================
  // 6. RF / SIGNALS / SATELLITES
  // ============================================================
  rf_and_satellites: {
    overview: `
Radio frequency (RF) engineering covers the generation, transmission, and detection of
electromagnetic waves from ~3 kHz to 300 GHz. Satellite communications extend RF principles
to Earth orbit, enabling global connectivity, positioning, remote sensing, and scientific
observation. SDR (Software-Defined Radio) enables flexible RF systems in software.
    `,
    electromagnetic_fundamentals: `
Maxwell's equations (differential form):
∇·E = ρ/ε₀ (Gauss's law for E)
∇·B = 0 (no magnetic monopoles)
∇×E = -∂B/∂t (Faraday)
∇×B = μ₀J + μ₀ε₀∂E/∂t (Ampere-Maxwell)
Wave equation: ∂²E/∂t² = c²∇²E, c = 1/√(μ₀ε₀) = 3×10⁸ m/s.
Polarization: linear, circular (RHCP/LHCP), elliptical.
Friis transmission: Pr = Pt·Gt·Gr·(λ/4πd)² — received power vs distance.
Link budget: EIRP - path loss + Gr - system noise → C/N (carrier to noise ratio).
Decibels: P(dBm) = 10·log₁₀(P/1mW). Gain, loss in dB is additive.
    `,
    frequency_bands: `
VLF (3-30 kHz): submarine comms (deep penetration), Schumann resonances.
LF (30-300 kHz): AM broadcast, LORAN, NDB navigation.
MF (300 kHz - 3 MHz): AM radio, maritime.
HF (3-30 MHz): shortwave, ionospheric skip propagation, amateur radio, NVIS.
VHF (30-300 MHz): FM radio, TV, aviation (VOR/ILS), land mobile, AIS.
UHF (300 MHz - 3 GHz): TV, cellular (700 MHz-2.1 GHz), WiFi (2.4 GHz), GPS (1.2/1.5 GHz),
Bluetooth, military tactical, RFID.
SHF (3-30 GHz): microwave links, satellite (Ku, Ka, X band), radar, WiFi (5/6 GHz), 5G mmWave.
EHF (30-300 GHz): mmWave 5G, imaging, atmospheric sensing, space comms.
ITU satellite bands: L (1-2 GHz), S (2-4 GHz), C (4-8 GHz), X (8-12 GHz),
Ku (12-18 GHz), Ka (26.5-40 GHz), V/W (40-75 GHz), Q (33-50 GHz).
    `,
    modulation_and_signal_processing: `
Analog: AM, FM, PM, SSB, DSB. FM advantage: noise immunity via limiter + discriminator.
Digital: BPSK, QPSK, 8PSK, 16/64/256/1024-QAM. Tradeoff: spectral efficiency vs SNR requirement.
Spread spectrum: DSSS (GPS, 802.11b), FHSS (Bluetooth), CDMA (3G).
OFDM: orthogonal subcarriers, cyclic prefix for ISI, FFT-based. LTE, 5G NR, 802.11a/g/n/ac/ax, DVB.
Channel coding: convolutional (Viterbi decoding), turbo codes, LDPC, polar codes (5G NR).
Shannon capacity: C = B·log₂(1 + S/N). Maximum error-free bit rate.
Nyquist theorem: sample rate ≥ 2×bandwidth to avoid aliasing.
Matched filter: maximizes SNR in AWGN. Pulse compression in radar.
    `,
    antenna_theory: `
Isotropic radiator: hypothetical, equal radiation in all directions. Gain = 1 (0 dBi).
Dipole: λ/2 dipole gain = 2.15 dBi. Radiation resistance = 73 Ω.
Parabolic dish: G = η·(πD/λ)². High gain, narrow beamwidth. Used in satellite ground stations.
Phased arrays: electronic beam steering via phase shifters. AESA radar, 5G base stations.
Antenna parameters: gain, HPBW (half-power beamwidth), front-to-back ratio, impedance (50/75 Ω),
polarization, efficiency, VSWR (voltage standing wave ratio), S11 (return loss).
VSWR = (1+|Γ|)/(1-|Γ|), Γ = (ZL-Z0)/(ZL+Z0). Perfect match: VSWR = 1.
MIMO: multiple-input multiple-output. Spatial multiplexing (capacity), beamforming (gain),
diversity (reliability). 4G: 2×2 or 4×4. 5G: massive MIMO (64/128 antennas).
    `,
    satellite_systems: {
      orbits: `
LEO (Low Earth Orbit): 200-2000 km. Low latency (~20-40 ms), high path loss variation,
needs large constellations for coverage. Starlink, OneWeb, Kuiper (Amazon).
MEO (Medium Earth Orbit): 2000-35786 km. GPS (20,200 km), GLONASS, Galileo, BeiDou,
O3b (8000 km) for maritime broadband.
GEO (Geostationary): 35,786 km, 0° inclination. Fixed in sky, ~600 ms RTT.
Intelsat, SES, Hughes, Viasat. TV broadcast, VSAT, weather (GOES, Meteosat).
SSO (Sun-Synchronous Orbit): ~600-800 km, 97-98° inclination. Constant solar illumination.
Landsat, Sentinel, commercial EO (Planet, Maxar).
Molniya: highly elliptical, 12h period. High latitude coverage (Russia). 63.4° inclination avoids
apsidal precession.
      `,
      gps_and_gnss: `
GPS: 24+ satellites, 6 orbital planes, 55° inclination, 20,200 km altitude, 12h period.
L1 (1575.42 MHz, C/A + P(Y) code), L2 (1227.60 MHz, P(Y)), L3, L5 (1176.45 MHz).
C/A code: 1023 chip PRN, 1 ms period. P code: 10.23 Mchip/s, 7-day PRN.
Positioning: trilateration from 4+ satellites (solve for x,y,z,clock).
Navigation message: ephemeris (precise orbit), almanac, UTC offset, ionospheric correction.
Error sources: ionospheric delay (~5 m), multipath, clock error, satellite geometry (PDOP).
DGPS/SBAS: differential corrections (WAAS, EGNOS) → <3 m. RTK → cm accuracy.
GLONASS: Russian. Galileo: EU, E1/E5/E6. BeiDou: Chinese, B1/B2/B3. NavIC: Indian.
Spoofing/jamming: GPS signals are weak (-130 dBm). Spoofing countermeasures: signal
authentication (Galileo OSNMA), inertial integration, anti-spoof algorithms.
      `,
      satellite_communications: `
Frequency reuse: multiple beams at same frequency using spatial isolation. Frequency plans.
Transponders: bent-pipe (amplify+retransmit) vs regenerative (demodulate+recode).
DVB-S2/S2X: LDPC+BCM coding, ACM (adaptive coding and modulation).
VSAT: Very Small Aperture Terminal. Star topology (hub and spoke), mesh.
LEO constellation design: Walker delta, Walker star. Coverage, handover, interference.
Starlink v2: Ku/Ka downlink, V-band ISL (inter-satellite links). Flat panel phased array user terminal.
Optical/laser comms: SpaceX Starlink ISL, LCRD (NASA), Tesat. Gbps rates, no spectrum licensing.
SatCom vulnerabilities: SATCOM terminal hacking (ViaSat KA-SAT 2022 wiper attack),
unencrypted modems, GPS spoofing, jamming (GPS/GLONASS in conflict zones).
      `,
      earth_observation: `
Optical: PAN (panchromatic), MS (multispectral 4-8 bands), hyperspectral (100s of bands).
Resolution: Maxar WorldView-3 (30 cm GSD), Planet SuperDove (3 m), Sentinel-2 (10 m).
SAR (Synthetic Aperture Radar): active microwave, weather-independent.
C-band (Sentinel-1, 5.4 GHz), X-band (TerraSAR-X, Cosmo-SkyMed), L-band (NISAR, ALOS-2).
Modes: stripmap, ScanSAR, spotlight, TOPS. InSAR: interferometric SAR for surface deformation.
Change detection, crop mapping, flood monitoring, urban sprawl, glacier movement.
      `,
    },
    sdr_and_signal_intelligence: `
SDR (Software-Defined Radio): RF front-end (antenna → LNA → mixer → ADC) + DSP in software.
GNU Radio: open-source signal processing framework. Flow graphs with source/sink/processing blocks.
RTL-SDR: cheap USB dongle ($25), 500 kHz - 1.7 GHz. ADSB, ACARS, P25, pager decode.
HackRF One: 1 MHz - 6 GHz, half-duplex, 20 Msps. PortaPack for standalone operation.
USRP (Ettus): research-grade, full-duplex, 10 MHz - 6 GHz (N210), FPGA-based.
KerberosSDR/KrakenSDR: 4/5-channel coherent, for direction finding (AoA, TDOA).
Signal intelligence (SIGINT): ELINT (electronic), COMINT (communications), MASINT.
Signals of interest: ADS-B (aircraft position), AIS (ship position), ACARS (aircraft data),
P25 (public safety), DMR, TETRA, paging (POCSAG, FLEX), weather fax, SSTV, WSPR.
Direction finding: MUSIC algorithm, ESPRIT, Capon beamformer, interferometry.
    `,
  },

  // ============================================================
  // 7. CRYPTOGRAPHY
  // ============================================================
  cryptography: {
    overview: `
Cryptography is the science of securing information through mathematical transformations.
Modern cryptography is based on computational hardness assumptions rather than secrecy
of algorithms (Kerckhoffs's principle). Covers: symmetric encryption, public-key (asymmetric)
cryptography, hash functions, digital signatures, protocols, and post-quantum cryptography.
    `,
    symmetric_cryptography: `
Stream ciphers: encrypt bit-by-bit. RC4 (broken), ChaCha20 (modern standard, used in TLS 1.3).
Block ciphers: encrypt fixed-size blocks. AES (Rijndael, NIST 2001): 128/192/256-bit key,
10/12/14 rounds, SubBytes→ShiftRows→MixColumns→AddRoundKey.
AES modes: ECB (insecure — patterns), CBC (IV needed, padding oracle risk), CTR (turns block
cipher into stream cipher), GCM (authenticated encryption, GHASH MAC), CCM, XTS (disk encryption).
DES: 56-bit key, broken (EFF DES cracker 1998, brute force). 3DES: deprecated.
HMAC: H(K⊕opad || H(K⊕ipad || m)). Keyed hash for message authentication.
Authenticated Encryption: AES-GCM, ChaCha20-Poly1305. Provides confidentiality + integrity + authenticity.
Key derivation: PBKDF2, bcrypt, scrypt, Argon2 (winner of PHC, memory-hard, GPU-resistant).
    `,
    public_key_cryptography: `
RSA: based on integer factoring hardness. n=pq, φ(n)=(p-1)(q-1), ed≡1 mod φ(n).
Encrypt: c = mᵉ mod n. Decrypt: m = cᵈ mod n.
Attacks: small e with no padding (cube root), common modulus, timing (Kocher), PKCS#1 v1.5 Bleichenbacher.
Use OAEP (RSA-OAEP) for encryption, PSS for signatures.
Diffie-Hellman: shared secret g^(ab) mod p without transmitting a or b.
Discrete log hardness. DH parameters: must use safe prime, verify generator order.
ECDH: DH over elliptic curves. Faster, smaller key (256-bit ECC ≈ 3072-bit RSA).
Elliptic curves: y² = x³ + ax + b over Fp. Point addition, scalar multiplication.
NIST P-256 (secp256r1), Curve25519 (Bernstein, used in Signal, WireGuard, TLS 1.3).
EdDSA (Ed25519): efficient, deterministic signatures. Used in SSH, TLS, Signal.
ECDSA: signature scheme, needs secure random k per signature (PlayStation 3 k-reuse hack).
    `,
    hash_functions: `
Properties: preimage resistance, second preimage resistance, collision resistance.
MD5: 128-bit, broken (Wang et al. 2004). Collision in seconds on laptop.
SHA-1: 160-bit, broken (SHAttered 2017, Google). First practical collision.
SHA-2: SHA-256, SHA-512. Merkle-Damgård construction, length extension attack risk.
SHA-3 (Keccak): sponge construction. Immune to length extension. SHAKE128, SHAKE256 (XOF).
BLAKE2, BLAKE3: fast, secure, used in WireGuard, Zcash, many modern protocols.
Password hashing: bcrypt (cost factor), scrypt (N, r, p), Argon2id (winner PHC 2015).
Merkle trees: binary tree of hashes. Used in Git, Bitcoin, certificate transparency, IPFS.
    `,
    post_quantum_cryptography: `
Threat: Shor's algorithm breaks RSA, ECC, DH. Grover's halves symmetric key security.
NIST PQC standardization (2024): CRYSTALS-Kyber → ML-KEM (key encapsulation),
CRYSTALS-Dilithium → ML-DSA (signatures), FALCON → FN-DSA, SPHINCS+ → SLH-DSA.
Lattice-based: hardness of LWE (Learning With Errors), RLWE, SIS (Short Integer Solution).
Code-based: McEliece (1978), based on error-correcting code decoding hardness. Large key sizes.
Hash-based signatures: Lamport, XMSS, LMS, SPHINCS+. Conservative, only hash security.
Isogeny-based: SIKE (broken by classical attack 2022 — eliminated from NIST).
Hybrid schemes: classical + post-quantum for transition period (Google TLS experiments).
    `,
    cryptographic_protocols: `
TLS 1.3: 1-RTT (0-RTT for resumption), ECDHE key exchange, AEAD ciphers, removed legacy.
Cipher suites: TLS_AES_128_GCM_SHA256, TLS_AES_256_GCM_SHA384, TLS_CHACHA20_POLY1305_SHA256.
Key exchange: X25519 ECDHE, P-256. Certificates: RSA or ECDSA.
Certificate transparency: append-only log of all issued certs. SCT proof in TLS handshake.
Signal protocol: X3DH (triple Diffie-Hellman) key agreement + Double Ratchet (forward secrecy
+ break-in recovery). Used in WhatsApp, Signal, Element.
WireGuard: modern VPN. ChaCha20-Poly1305, BLAKE2, Curve25519, SipHash. ~4000 lines of code.
IPSec: IKEv2 key exchange, ESP for encryption, AH for authentication.
SSH: Diffie-Hellman or ECDH key exchange, AES-CTR or ChaCha20, Ed25519 host keys.
PGP/GPG: hybrid encryption, web of trust, detached signatures.
    `,
  },

  // ============================================================
  // 8. ZERO-KNOWLEDGE PROOFS
  // ============================================================
  zero_knowledge_proofs: {
    overview: `
A Zero-Knowledge Proof (ZKP) is a cryptographic protocol where a prover convinces a
verifier that a statement is true without revealing any information beyond the truth of
the statement. Goldwasser-Micali-Rackoff (1985) formalized ZKPs. Properties: completeness,
soundness, zero-knowledge. Applications: blockchain privacy, authentication, verifiable
computation, identity.
    `,
    foundations: `
Interactive ZKP: prover and verifier exchange messages. Example: Ali Baba cave (Quisquater).
Graph 3-coloring proof: prover has 3-coloring (NP witness), commits to random permutation,
verifier checks random edge — no colors match. Repeated t times → soundness 1 - (2/3)^t.
Perfect ZK: simulator produces transcript indistinguishable from real interaction.
Computational ZK: indistinguishable by poly-time adversary.
Non-interactive ZKP (NIZK): single message. Requires common reference string (CRS) or random oracle.
Fiat-Shamir heuristic: convert interactive proof to non-interactive via H(commitment) as challenge.
    `,
    proof_systems: {
      snarks: `
zk-SNARKs: Succinct Non-interactive ARguments of Knowledge.
Succinctness: proof size O(1) or O(log n), verification time O(1).
Knowledge soundness: prover must "know" the witness.
Groth16: most efficient SNARK. Proof = 3 elliptic curve points (192 bytes for BN254).
Requires trusted setup (Powers of Tau ceremony — "toxic waste" must be destroyed).
Used in: Zcash (Sapling, Orchard), Ethereum layer-2 rollups (Hermez, Aztec).
PLONK: universal and updatable trusted setup. Permutation argument.
Proof: ~400 bytes. Prover time O(n log n). Used in Aztec Connect, Mina.
Marlin, SPARTAN, HyperPlonk: variants with various tradeoffs.
      `,
      starks: `
zk-STARKs: Scalable Transparent ARguments of Knowledge.
No trusted setup! Uses hash functions (collision resistance) — post-quantum secure.
Transparent: public randomness only.
Proof size: O(log² n) — larger than SNARKs but no trusted setup.
FRI (Fast Reed-Solomon IOP of Proximity): polynomial commitment at the core of STARKs.
Prover time: O(n log n). Verifier time: O(log² n).
Used in: StarkWare (StarkEx, StarkNet), Polygon Miden, Winterfell, RISC Zero.
Algebraic IOP (AIOPs): generalization — interactive oracle proof over algebraic domain.
      `,
      bulletproofs: `
Bulletproofs: no trusted setup, short proofs for range proofs and arithmetic circuits.
Proof size: O(log n). Verification: O(n) — slower than SNARKs.
Range proofs: prove 0 ≤ v < 2^n without revealing v. Used in Monero (Bulletproofs+).
Inner product argument: logarithmic proof of inner product knowledge.
Not succinct enough for general circuits but excellent for range/confidential transactions.
      `,
    },
    applications: `
Blockchain privacy: Zcash (shielded transactions), Monero (Bulletproofs), Tornado Cash.
Layer-2 rollups: zkEVM (StarkNet, zkSync Era, Polygon zkEVM, Scroll, Taiko).
Validity proofs vs fraud proofs: ZK rollups use validity proofs — no withdrawal delay.
Identity: prove age > 18 without revealing exact age. Prove citizenship without doxxing.
Authentication: prove knowledge of password without transmitting it. ZKPOK.
Verifiable computation: prove correct execution of program. RISC Zero zkVM.
Anonymous credentials: Camenisch-Lysyanskaya credentials, IRMA, Microsoft U-Prove.
Private set intersection (PSI): find common contacts without revealing contact lists.
    `,
    zkvm_and_recursion: `
zkVM (ZK Virtual Machine): prove execution of a program in any ISA.
RISC Zero: RISC-V zkVM using STARK + SNARK wrapping.
SP1 (Succinct): MIPS-based zkVM. Cairo VM (StarkNet): AIR-friendly custom architecture.
Recursive proofs: proof of proof verification. Accumulate proofs without growing verifier time.
Nova (Microsoft Research): folding schemes for recursive SNARKs. SuperNova, HyperNova.
Incrementally Verifiable Computation (IVC): key to zk-rollup recursion and proof aggregation.
Proof aggregation: combine N proofs into 1 — Ethereum Dencun EIP-4844 enabled rollup scaling.
    `,
  },

  // ============================================================
  // 9. AEROSPACE & ORBITAL MECHANICS
  // ============================================================
  aerospace_and_orbital_mechanics: {
    overview: `
Aerospace engineering covers aeronautics (atmospheric flight) and astronautics (spaceflight).
Orbital mechanics — the motion of spacecraft under gravity — is governed by Kepler's laws
and Newton's law of gravitation. Modern challenges include reusable launch vehicles, in-space
propulsion, on-orbit servicing, and lunar/Mars exploration.
    `,
    orbital_mechanics: {
      kepler_and_newton: `
Kepler's laws:
1. Orbits are ellipses with central body at one focus.
2. Equal areas in equal times (conservation of angular momentum).
3. T² ∝ a³. Specifically: T² = (4π²/μ)·a³, μ = GM.
Newton's law: F = GMm/r². G = 6.674×10⁻¹¹ N·m²/kg².
Vis-viva equation: v² = μ(2/r - 1/a). Relates speed, distance, semi-major axis.
Orbital energy: ε = -μ/(2a). Negative for bound orbit. Circular: v = √(μ/r).
Escape velocity: ve = √(2μ/r) = √2 × circular velocity.
LEO: ~7.8 km/s. GEO: ~3.07 km/s. Earth escape from surface: ~11.2 km/s.
      `,
      orbital_elements: `
Six Keplerian elements (COEs): a (semi-major axis), e (eccentricity), i (inclination),
Ω (RAAN — right ascension of ascending node), ω (argument of perigee), ν (true anomaly).
Mean anomaly M = E - e·sin(E) (Kepler equation). Eccentric anomaly E → true anomaly ν.
TLE (Two-Line Element): NORAD standard format for satellite tracking. Updated via Space-Track.
SGP4/SDP4: propagation model for TLEs. J2 perturbation dominant.
Orbital perturbations: J2 (Earth oblateness — RAAN drift, ω precession), atmospheric drag (LEO),
solar radiation pressure, third-body (Moon/Sun), tidal forces.
J2 = 1.08263×10⁻³. RAAN drift rate: dΩ/dt = -(3/2)nJ2(RE/p)²cos(i).
      `,
      maneuvers: `
Hohmann transfer: most fuel-efficient 2-burn transfer between coplanar circular orbits.
Δv₁ = √(μ/r₁)·(√(2r₂/(r₁+r₂)) - 1), Δv₂ = √(μ/r₂)·(1 - √(2r₁/(r₁+r₂))).
Bi-elliptic transfer: more efficient for large radius ratios (>11.94).
Plane change: Δv = 2v·sin(Δi/2). Very expensive — best done at apoapsis.
Gravity assist (slingshot): Voyager, Cassini, New Horizons. Increase heliocentric energy.
Lambert's problem: find trajectory between two position vectors in given time. Used for orbit determination and rendezvous.
Phasing orbits: adjust timing for rendezvous without large Δv.
      `,
      lagrange_points: `
Five L-points where gravity + centrifugal = 0 in rotating two-body frame.
L1: between bodies (SOHO, DSCOVR, lunar gateway option). Unstable.
L2: beyond smaller body (JWST, WMAP, Gaia, Herschel). Unstable. Halo orbits used.
L3: opposite side. Unstable, rarely used.
L4, L5: equilateral triangle, stable for mass ratio > ~25 (Trojan asteroids, LUCY mission).
Halo orbits: 3D periodic orbits near L1/L2. Maintained with small station-keeping Δv.
JWST: L2 halo orbit, ~1 million km from Earth. Station-keeping ~2-4 m/s per year.
      `,
    },
    propulsion: `
Chemical: oxidizer + fuel → hot gas expansion. Isp (specific impulse) = thrust/(mass flow × g₀).
LH2/LOX: Isp ~450 s (RL-10, Vulcain, J-2). RP-1/LOX: ~310 s (Merlin, F-1).
Hypergolics: N2O4/UDMH or MMH — spontaneous ignition, storable. Isp ~310 s.
Solid rockets: HTPB/AP/Al. Isp ~240-295 s. Simple, storeable, not throttleable.
Electric propulsion: ion thruster (Xe+, NSTAR on Dawn, Hall effect), Isp 1500-10000 s, low thrust.
Hall thruster: crossed E and B fields accelerate ions. SPT-100, BHT-200, PPS-5000.
Solar sails: IKAROS (JAXA), LightSail 2 (Planetary Society). Solar radiation pressure propulsion.
Nuclear thermal: heat propellant via reactor. Isp ~800-1000 s. NERVA program (1960s).
Tsiolkovsky rocket equation: Δv = Isp·g₀·ln(m₀/mf). Mass ratio determines Δv.
    `,
    launch_vehicles: `
Expendable: Atlas V, Ariane 6, Vulcan, Falcon 9 (partially reusable), ULA Vulcan.
Reusable: Falcon 9 (booster RTLS or drone ship, fairings recovered), Falcon Heavy, Starship (full).
Starship: Raptor engines (full-flow staged combustion, methane/LOX), Isp 363 s (vac),
Super Heavy booster caught by Mechazilla arms (2024). Target: 100+ tons to LEO.
New Glenn: BE-4 engines (Methane/LOX), reusable first stage. Blue Origin.
Launch windows: defined by orbital mechanics. LEO: any time. GTO: 2 per day.
Interplanetary: defined by launch energy C3 = v²∞. Planetary alignment windows (synodic period).
    `,
    spacecraft_systems: `
ADCS (Attitude Determination and Control): reaction wheels (momentum exchange), CMGs
(control moment gyroscopes), thrusters, magnetorquers.
Sensors: star trackers (arcsecond accuracy), sun sensors, horizon sensors, IMU.
Power: solar panels (BOL/EOL degradation, eclipse periods), batteries (Li-ion), RTG (plutonium-238).
Thermal: passive (coatings, MLI blankets) + active (heaters, heat pipes, louvers).
TT&C (Telemetry, Tracking & Command): uplink commands, downlink housekeeping data.
CCSDS standards: framing, coding (Reed-Solomon, turbo), protocols.
Radiation effects: SEU (single-event upset), TID (total ionizing dose), SEL (latch-up).
Mitigation: rad-hard parts, triple modular redundancy (TMR), shielding.
    `,
    reentry_and_hypersonics: `
Reentry corridor: narrow band between skip-out (too shallow) and burn-up (too steep).
Heating: Q ∝ ρ^0.5 · v³. Apollo: ~1650°C, SpaceX Dragon: ablative PICA-X.
TPMS (Thermal Protection Materials): PICA, SLA-561V, AVCOAT (Apollo), TUFI tiles (Shuttle).
Hypersonic vehicles: Mach > 5. Real gas effects, shock-boundary layer interaction, plasma sheath.
HTV (hypersonic glide vehicles): DARPA Falcon HTV-2, DF-ZF (China), Avangard (Russia).
Scramjet: supersonic combustion ramjet. X-43A (Mach 9.6), X-51A Waverider.
Aerocapture: use atmosphere to slow spacecraft into orbit without propellant.
    `,
  },

  // ============================================================
  // 10. MACHINE LEARNING & AI ALIGNMENT
  // ============================================================
  ml_and_ai_alignment: {
    overview: `
Machine learning enables systems to learn from data. Deep learning uses multi-layer neural
networks. AI Alignment addresses ensuring AI systems are safe, beneficial, and aligned
with human values. As AI capabilities grow, alignment becomes critical to prevent
misuse or unintended harmful behavior.
    `,
    foundations: `
Supervised learning: learn f: X → Y from labeled pairs (x,y). Loss minimization via SGD.
Unsupervised learning: discover structure in unlabeled data. Clustering, density estimation, generative models.
Reinforcement learning: agent → action → environment → reward. Maximize expected cumulative reward.
Bias-variance tradeoff: total error = bias² + variance + noise. Regularization trades bias for variance.
Optimization: SGD, Momentum, RMSProp, Adam (adaptive moment estimation). Learning rate scheduling.
Universal approximation theorem: MLP with one hidden layer can approximate any continuous function
on compact domain to arbitrary precision (with enough neurons).
    `,
    deep_learning: {
      architectures: `
MLP: fully connected layers, activation functions (ReLU, GELU, SiLU, Swish).
CNN: convolutional layers (translation equivariant), pooling, weight sharing.
AlexNet (2012) → VGG → ResNet (skip connections) → EfficientNet → ConvNeXt.
RNN: sequential data, hidden state. LSTM (forget/input/output gates), GRU.
Transformer: self-attention mechanism. "Attention Is All You Need" (Vaswani et al., 2017).
Attention: Q, K, V matrices. Attention(Q,K,V) = softmax(QKᵀ/√dk)V. Multi-head attention.
BERT: bidirectional encoder, masked LM + NSP pretraining, fine-tuning for NLP.
GPT series: autoregressive decoder, next-token prediction. Scaling laws (Kaplan et al., 2020).
Vision Transformer (ViT): patch embeddings, transformer encoder for images.
Diffusion models: DDPM, DDIM, latent diffusion (Stable Diffusion). Score matching.
      `,
      training_techniques: `
Batch normalization: normalize activations, reduces internal covariate shift.
Layer norm: normalize across feature dim, used in Transformers.
Dropout: regularization by random neuron zeroing during training.
Data augmentation: crop, flip, color jitter (CV); back-translation, mixup (NLP).
Transfer learning: pretrain on large dataset → fine-tune on task.
PEFT (Parameter-Efficient Fine-Tuning): LoRA (low-rank adaptation), prefix tuning, adapters.
LoRA: W' = W + BA where B∈ℝ^(d×r), A∈ℝ^(r×k), r << min(d,k). Freeze W, train B, A.
Gradient checkpointing, mixed-precision training (fp16/bf16), ZeRO optimizer (Megatron-DeepSpeed).
Flash Attention: IO-aware exact attention. O(N) memory, much faster in practice.
      `,
    },
    large_language_models: `
Scaling laws: L(N) ∝ N^(-α_N), L(D) ∝ D^(-α_D). Log-linear improvement with scale.
Chinchilla optimal: tokens ≈ 20× parameters for compute-optimal training (Hoffmann et al., 2022).
Emergent abilities: abilities that appear discontinuously at scale (chain-of-thought, arithmetic).
Instruction tuning: fine-tune on (instruction, output) pairs → FLAN, InstructGPT, Alpaca.
RLHF (Reinforcement Learning from Human Feedback): reward model trained on human preferences
→ PPO fine-tuning. Used in ChatGPT, Claude, Gemini.
DPO (Direct Preference Optimization): optimize preference without explicit RM or RL.
Constitutional AI (Anthropic): self-critique and revision using a set of principles.
In-context learning: few-shot examples in prompt guide behavior without weight updates.
Chain-of-thought prompting: "let's think step by step" → improved reasoning.
RAG (Retrieval-Augmented Generation): retrieve relevant docs → condition generation.
    `,
    reinforcement_learning: `
MDP: (S, A, P, R, γ). Bellman equation: V*(s) = max_a [R(s,a) + γΣP(s'|s,a)V*(s')].
Q-learning: off-policy TD learning. Q(s,a) ← Q(s,a) + α[r + γ max Q(s',a') - Q(s,a)].
DQN: Q-function as neural net, experience replay, target network (Mnih et al., 2013, Atari).
Policy gradient: ∇J(θ) = E[∇log π(a|s,θ) · Q(s,a)]. REINFORCE.
Actor-Critic: actor (policy) + critic (value function). A3C, A2C, SAC, TD3.
PPO (Proximal Policy Optimization): clipped surrogate objective. Stable, widely used (OpenAI).
AlphaGo/AlphaZero: MCTS + policy/value network + self-play. Superhuman Go, chess, shogi.
Multi-agent RL (MARL): emergent behavior, cooperation, competition. OpenAI Five, AlphaStar.
    `,
    ai_alignment: {
      problem_statement: `
The alignment problem: how to ensure AI systems pursue goals that are beneficial to humans,
especially as systems become more capable than humans in some or all domains.
Instrumental convergence (Bostrom): convergent instrumental goals for almost any final goal —
self-preservation, goal-content integrity, cognitive enhancement, resource acquisition.
Orthogonality thesis: intelligence and goals are orthogonal — any level of intelligence
can in principle be combined with any final goal.
Existential risk: a sufficiently misaligned superintelligence could pose catastrophic risk.
Mesa-optimization problem: inner optimizers (mesa-optimizers) may develop misaligned objectives.
      `,
      technical_approaches: `
RLHF: human feedback as proxy for human values. Limitation: reward model may be gamed,
humans may prefer deceptive vs honest responses, preference inconsistency.
Constitutional AI (Anthropic): AI critiques itself using explicit principles → self-improvement
loop. Reduces dependence on human rating every individual output.
Debate (Irving et al.): two AIs argue opposite positions, human judges winner.
Amplification: use less capable AI to assist humans in evaluating more capable AI outputs.
Interpretability: mechanistic interpretability (Anthropic), probing classifiers, attention
visualization, sparse autoencoders (superposition, feature decomposition).
Scalable oversight: oversight mechanisms that scale with AI capability (debate, amplification,
process-based supervision vs outcome-based supervision).
Formal verification: prove properties of neural nets. Abstract interpretation, SMT solvers.
      `,
      current_challenges: `
Reward hacking: AI finds unintended ways to maximize reward metric (Goodhart's law).
Specification gaming: follow the letter but not the spirit of constraints.
Distributional shift: trained distribution ≠ deployment distribution → unexpected behavior.
Deceptive alignment: model appears aligned during training, pursues different goals at deployment.
Emergent capabilities: unexpected capabilities arising at scale — hard to predict/test.
Sycophancy: LLMs trained on human feedback may learn to agree rather than be truthful.
Hallucinations: confident generation of false information. Factuality vs fluency tradeoff.
Jailbreaking: adversarial prompts that bypass safety training. DAN, many-shot, role-playing.
Agentic risk: autonomous AI agents with tool use can have large real-world impact.
      `,
      governance: `
AI Safety Institutes: UK AISI, US AISI, EU AI Office, NIST AI RMF.
EU AI Act: risk-based regulation. High-risk systems (medical, biometric, critical infra) → strict requirements.
Executive Order on AI (Biden, Oct 2023): safety testing, red-teaming, watermarking mandates.
Voluntary commitments: Frontier Model Forum, major labs' safety commitments.
Compute governance: export controls on H100/A100 to China. Compute thresholds for oversight.
Interpretability research: Anthropic, DeepMind, Redwood Research, Center for AI Safety.
Key researchers: Stuart Russell, Paul Christiano, Eliezer Yudkowsky, Nick Bostrom, Yoshua Bengio,
Jan Leike, Chris Olah (mechanistic interpretability), Evan Hubinger (deceptive alignment).
      `,
    },
  },

  // ============================================================
  // 11. WEB3 & BLOCKCHAIN
  // ============================================================
  web3_and_blockchain: {
    overview: `
Web3 refers to a decentralized internet built on blockchain technology, enabling trustless
peer-to-peer interactions, digital ownership, and programmable finance without central
intermediaries. Key components: distributed ledgers, smart contracts, DeFi, NFTs, DAOs,
Layer-2 scaling solutions, and decentralized identity.
    `,
    blockchain_fundamentals: {
      consensus_mechanisms: `
Proof of Work (PoW): miners compete to solve SHA-256 puzzle (Bitcoin). Energy-intensive.
Difficulty adjustment: targets 10-minute block time. Longest chain rule (Nakamoto consensus).
51% attack: control majority of hashrate → double spend, reorg. Expensive for Bitcoin.
Proof of Stake (PoS): validators stake ETH (32 ETH min) as collateral. Random selection + BFT.
Ethereum PoS (Gasper): Casper FFG (finality) + LMD-GHOST (fork choice). Finality in ~15 min.
Slashing: validators lose stake for equivocation or surround voting (punishes attacks).
DPoS: Delegated PoS (EOS, Tron). Token holders vote for block producers. Centralization risk.
BFT variants: Tendermint (Cosmos), HotStuff (Aptos/Diem/LibraBFT), PBFT. 1/3 fault tolerance.
Proof of History (Solana): SHA-256 VDF for verifiable time ordering. Enables high throughput.
      `,
      bitcoin: `
Bitcoin (Nakamoto, 2008): P2P electronic cash. UTXO model.
Transaction: inputs (spend UTXOs) + outputs (create UTXOs). Unlocking script (scriptSig) +
locking script (scriptPubKey). P2PKH, P2SH, P2WPKH (SegWit), P2TR (Taproot).
Mining: find nonce such that SHA-256(SHA-256(header)) < target.
Merkle tree of transactions in block header. Difficulty retarget every 2016 blocks.
Lightning Network: payment channels, HTLC (hash time-locked contracts), off-chain routing.
SegWit (BIP141): moves signature data to witness → fixes transaction malleability, more block space.
Taproot (BIP340/341/342): Schnorr signatures, MAST (Merkelized ASTs), key path spending.
Supply: 21 million cap. Halving every 210,000 blocks (~4 years). Current subsidy: 3.125 BTC.
      `,
      ethereum: `
Ethereum: smart contract platform. EVM (Ethereum Virtual Machine) — stack-based, 256-bit words.
Accounts: EOA (externally owned, private key) and contract accounts (code + storage).
Gas: computational cost in gwei. EIP-1559: base fee (burned) + priority tip. London fork.
EIP-4844 (proto-danksharding): blob transactions for rollup data, ~6 blobs per block (128 KB each).
Full danksharding: future — 256+ blobs/block, PBS (proposer/builder separation), DAS.
State: MPT (Merkle Patricia Trie) of accounts. State root in block header.
EVM opcodes: PUSH, POP, ADD, MUL, CALL, SLOAD/SSTORE, KECCAK256, LOG, CREATE, SELFDESTRUCT.
ETH2 milestones: Beacon chain (Dec 2020), Merge (Sep 2022), Shanghai (Apr 2023 — withdrawals),
Dencun (Mar 2024 — EIP-4844), Pectra (2025).
      `,
    },
    smart_contracts: {
      solidity: `
Solidity: Ethereum's primary language. Compiled to EVM bytecode.
Contract structure: pragma, state variables, constructor, functions, events, modifiers.
Data types: uint256, int, bool, address, bytes, string, struct, mapping, array.
Visibility: public, private, internal, external.
Mappings: mapping(address => uint256). Hash table in storage. No iteration.
Events: emit Transfer(from, to, value). Stored in logs (not state). Cheap. Client-side filtering.
Modifiers: reusable pre/post conditions. onlyOwner, nonReentrant.
Interfaces: ABI definition. IERC20, IERC721, IERC1155.
ERC-20: fungible token standard. transfer, transferFrom, approve, allowance, balanceOf, totalSupply.
ERC-721: NFT standard. ownerOf, transferFrom, safeTransferFrom, tokenURI.
ERC-1155: multi-token. Batch transfers. Gas efficient.
      `,
      vulnerabilities: `
Reentrancy: external call before state update → recursive calls drain funds.
The DAO hack (2016): $60M ETH drained. Mitigate: checks-effects-interactions, ReentrancyGuard.
Integer overflow/underflow: pre-Solidity 0.8.0 (no auto revert). SafeMath library or ≥0.8.
Access control: missing onlyOwner, tx.origin instead of msg.sender.
Front-running (MEV): miners/validators reorder/insert transactions for profit.
Sandwich attacks: MEV bots front-run and back-run large DEX swaps.
Flashloan attacks: Beanstalk ($182M), Cream Finance ($130M). Atomic manipulation.
Oracle manipulation: price oracle uses low-liquidity pool → TWAP vs spot.
Storage collision: proxy delegate call overwrites storage slots.
Selfdestruct/forcesend: ETH forced into contract disrupts balance assumptions.
Gas limit DoS: loops over unbounded arrays → block gas limit reached.
      `,
      auditing_tools: `
Static analysis: Slither (Trail of Bits), Semgrep rules, MythX, Manticore.
Fuzzing: Echidna (property-based), Foundry (forge fuzz), Medusa.
Formal verification: Certora Prover, K Framework, Halmos, hevm.
Testing frameworks: Foundry (Forge, Cast, Anvil, Chisel), Hardhat, Truffle, Brownie.
Audit firms: Trail of Bits, OpenZeppelin, ConsenSys Diligence, Certik, Sigma Prime, Spearbit.
Bug bounties: Immunefi ($100M+ paid out, Ethereum ecosystem).
      `,
    },
    defi: `
DEX (Decentralized Exchange): Uniswap (AMM, x*y=k constant product), Curve (stableswap),
Balancer (weighted pools), dYdX (order book, perps), GMX (GLP liquidity, perps).
AMM: liquidity providers deposit token pairs, earn fees, exposed to impermanent loss (IL).
Lending: Aave (variable + stable rates, flash loans, eMode), Compound (cTokens, interest rate model),
MakerDAO (DAI stablecoin, vault collateralization, PSM).
Stablecoins: fiat-backed (USDC, USDT — centralized), crypto-backed (DAI — over-collateralized),
algorithmic (FRAX — fractional, UST — failed, 2022 Terra collapse).
Yield aggregators: Yearn Finance (yVaults, strategies), Convex (Curve rewards).
Liquid staking: Lido (stETH), Rocket Pool (rETH), Coinbase cbETH. Liquid staking derivatives.
MEV (Maximal Extractable Value): reordering/inserting txs. Flashbots, MEV-Boost, PBS.
DeFi exploits: Ronin Bridge ($625M, North Korea), Poly Network ($611M), Wormhole ($320M).
    `,
    layer2_scaling: `
Rollups: execute txs off-chain, post data + proof to L1. Two types:
Optimistic rollups: assume validity, fraud proof window (7 days). Optimism, Arbitrum, Base.
ZK rollups: validity proof proves correct execution. Instant finality. StarkNet, zkSync Era,
Polygon zkEVM, Scroll, Linea, Taiko.
Data availability (DA): Ethereum blob (EIP-4844), Celestia (modular DA layer), EigenDA, Avail.
State channels: Raiden (ETH), Lightning (BTC). Only two parties, fast, not general.
Plasma: child chains with fraud proofs. Limited use cases (mass exit problem).
Validium: ZK proofs + off-chain data availability (StarkEx). Tradeoff: DA risk.
Cross-rollup interoperability: bridges, intent-based (Across, Across v3), shared sequencer.
Account abstraction: ERC-4337 (UserOperations, Bundlers, Paymasters). Smart wallets, gas sponsorship.
    `,
    dao_and_governance: `
DAO (Decentralized Autonomous Organization): governance via token voting.
On-chain: Compound Governor Bravo, OpenZeppelin Governor. Vote → timelock → execution.
Off-chain signaling: Snapshot (gasless). Governance forum (Discourse). Temperature checks.
Governance attacks: governance takeover (Beanstalk Farms flash loan vote 2022 — $182M).
Voter apathy: low participation, whale dominance, plutocracy.
Multi-sig: Gnosis Safe, 3/5 or 4/7 signers for treasury management.
Optimistic governance: vetoDAO model, optimistic execution with guardian veto.
    `,
    web3_infrastructure: `
IPFS: content-addressed storage. CID = multihash of content. Pinning services (Pinata, web3.storage).
Filecoin: incentivized IPFS-based storage. Proof of Replication, Proof of Spacetime.
Arweave: permanent storage (one-time fee, endowment model). Permaweb.
ENS (Ethereum Name Service): .eth domains → Ethereum addresses. ERC-721 NFTs.
The Graph: GraphQL indexing protocol for blockchain data. Subgraphs.
Chainlink: decentralized oracle network. Price feeds (DON), VRF (verifiable random function),
CCIP (cross-chain), Automation (keepers), Functions (off-chain compute).
Wallet connect: QR/deep link protocol for mobile wallet connections.
RPC providers: Infura, Alchemy, QuickNode, Ankr. Rate limits, MEV protection (Flashbots Protect).
    `,
  },

};

// ============================================================
// RESEARCH PAPER REFERENCES (Key Papers Per Domain)
// ============================================================
export const RESEARCH_PAPERS = {

  cybersecurity: [
    { title: "Smashing The Stack For Fun And Profit", author: "Aleph One", year: 1996, venue: "Phrack" },
    { title: "Return-Oriented Programming: Systems, Languages, and Applications", author: "Roemer et al.", year: 2012, venue: "ACM TISSEC" },
    { title: "SoK: Eternal War in Memory", author: "Szekeres et al.", year: 2013, venue: "IEEE S&P" },
    { title: "ASLR: Address Space Layout Randomization", author: "PaX Team", year: 2001 },
    { title: "SoK: Sanitizing For Security", author: "Song et al.", year: 2019, venue: "IEEE S&P" },
    { title: "Spectre Attacks: Exploiting Speculative Execution", author: "Kocher et al.", year: 2019, venue: "IEEE S&P" },
    { title: "Meltdown: Reading Kernel Memory from User Space", author: "Lipp et al.", year: 2018, venue: "USENIX Security" },
    { title: "KRACK Attacks: Breaking WPA2", author: "Vanhoef & Piessens", year: 2017, venue: "CCS" },
    { title: "Dragonblood: Analyzing WPA3", author: "Vanhoef & Ronen", year: 2020, venue: "IEEE S&P" },
    { title: "SoK: Security and Privacy in Machine Learning", author: "Papernot et al.", year: 2018, venue: "EuroS&P" },
  ],

  quantum_mechanics: [
    { title: "Über die quantentheoretische Umdeutung kinematischer und mechanischer Beziehungen", author: "Heisenberg", year: 1925 },
    { title: "A New Basis for Quantum Mechanics", author: "Dirac", year: 1925 },
    { title: "Quantisierung als Eigenwertproblem", author: "Schrödinger", year: 1926 },
    { title: "'Relative State' Formulation of Quantum Mechanics", author: "Everett", year: 1957, venue: "Rev. Mod. Phys." },
    { title: "On the Einstein Podolsky Rosen Paradox", author: "Bell", year: 1964, venue: "Physics" },
    { title: "Experimental Tests of Bell's Inequalities", author: "Aspect et al.", year: 1982, venue: "PRL" },
    { title: "Decoherence, Einselection, and the Quantum Origins of the Classical", author: "Zurek", year: 2003, venue: "Rev. Mod. Phys." },
    { title: "Consistent Histories and the Interpretation of Quantum Mechanics", author: "Griffiths", year: 1984 },
  ],

  quantum_computing: [
    { title: "Algorithms for Quantum Computation: Discrete Log and Factoring", author: "Shor", year: 1994, venue: "FOCS" },
    { title: "A Fast Quantum Mechanical Algorithm for Database Search", author: "Grover", year: 1996, venue: "STOC" },
    { title: "Quantum Computation and Quantum Information", author: "Nielsen & Chuang", year: 2000, venue: "Cambridge" },
    { title: "Quantum Supremacy Using a Programmable Superconducting Processor", author: "Arute et al. (Google)", year: 2019, venue: "Nature" },
    { title: "Surface Codes: Towards Practical Large-Scale Quantum Computation", author: "Fowler et al.", year: 2012, venue: "PRA" },
    { title: "A Variational Eigenvalue Solver on a Photonic Quantum Processor", author: "Peruzzo et al.", year: 2014, venue: "Nature Comm." },
    { title: "Quantum Approximate Optimization Algorithm", author: "Farhi, Goldstone, Gutmann", year: 2014, venue: "arXiv" },
    { title: "Error Mitigation for Short-Depth Quantum Circuits", author: "Temme et al.", year: 2017, venue: "PRL" },
    { title: "Beyond Classical Computing: Quantum Error Correction", author: "Gottesman", year: 1997, venue: "Caltech PhD" },
  ],

  neuroscience: [
    { title: "A Quantitative Description of Membrane Current and its Application to Conduction and Excitation in Nerve", author: "Hodgkin & Huxley", year: 1952, venue: "J. Physiol." },
    { title: "The Organization of Behavior", author: "Hebb", year: 1949, venue: "Wiley" },
    { title: "Place Units in the Hippocampus of the Freely Moving Rat", author: "O'Keefe & Dostrovsky", year: 1971, venue: "Brain Res." },
    { title: "Microstructure of a Spatial Map in the Entorhinal Cortex", author: "Hafting, Fyhn, Moser et al.", year: 2005, venue: "Nature" },
    { title: "Dopamine Neurons Encode a Prediction Error in Pavlovian Conditioning", author: "Schultz et al.", year: 1997, venue: "Science" },
    { title: "Towards an Integration of Deep Learning and Neuroscience", author: "Marblestone et al.", year: 2016, venue: "Front. Comput. Neurosci." },
    { title: "A Global Workspace Theory of Conscious Access", author: "Dehaene & Changeux", year: 2011, venue: "Neuron" },
    { title: "Consciousness and the Brain", author: "Tononi (IIT 3.0)", year: 2014, venue: "PLOS Comp. Bio." },
    { title: "Predictive Coding in the Visual Cortex", author: "Rao & Ballard", year: 1999, venue: "Nat. Neurosci." },
  ],

  biology: [
    { title: "Molecular Structure of Nucleic Acids", author: "Watson & Crick", year: 1953, venue: "Nature" },
    { title: "The Evolution of Genetic Code", author: "Crick", year: 1968, venue: "J. Mol. Biol." },
    { title: "A Programmable Dual-RNA–Guided DNA Endonuclease in Adaptive Bacterial Immunity", author: "Jinek et al.", year: 2012, venue: "Science" },
    { title: "Multiplex Genome Engineering Using CRISPR/Cas Systems", author: "Cong et al.", year: 2013, venue: "Science" },
    { title: "Single-Cell Transcriptomics of 20 Mouse Organs Creates a Tabula Muris", author: "Tabula Muris Consortium", year: 2018, venue: "Nature" },
    { title: "Highly Accurate Protein Structure Prediction with AlphaFold", author: "Jumper et al. (DeepMind)", year: 2021, venue: "Nature" },
    { title: "The Hallmarks of Cancer", author: "Hanahan & Weinberg", year: 2000, venue: "Cell" },
    { title: "Evolution: The Modern Synthesis", author: "Julian Huxley", year: 1942 },
  ],

  rf_and_satellites: [
    { title: "Satellite Communications Systems Engineering", author: "Pratt, Bostian & Allnut", year: 2003, venue: "Wiley" },
    { title: "Introduction to Electrodynamics", author: "Griffiths", year: 2017, venue: "Cambridge" },
    { title: "GPS Satellite Surveying", author: "Leick et al.", year: 2015, venue: "Wiley" },
    { title: "Software Defined Radio for Engineers", author: "Collins & Harris (Analog Devices)", year: 2019 },
    { title: "Fundamentals of Astrodynamics", author: "Bate, Mueller & White", year: 1971, venue: "Dover" },
    { title: "Analysis of Ku-Band LEO Satellite Systems", author: "Bhattacherjee et al.", year: 2019, venue: "IEEE" },
    { title: "Practical Signal Processing", author: "Owen", year: 2012, venue: "Cambridge" },
  ],

  cryptography: [
    { title: "Communication Theory of Secrecy Systems", author: "Shannon", year: 1949, venue: "Bell System Tech. J." },
    { title: "New Directions in Cryptography", author: "Diffie & Hellman", year: 1976, venue: "IEEE Trans. Info. Theory" },
    { title: "A Method for Obtaining Digital Signatures and Public-Key Cryptosystems", author: "Rivest, Shamir, Adleman", year: 1978, venue: "CACM" },
    { title: "How to Share a Secret", author: "Shamir", year: 1979, venue: "CACM" },
    { title: "Proofs that Yield Nothing But Their Validity", author: "Goldreich, Micali, Wigderson", year: 1991, venue: "JACM" },
    { title: "The Knowledge Complexity of Interactive Proof Systems", author: "Goldwasser, Micali, Rackoff", year: 1989, venue: "SIAM J. Comput." },
    { title: "Post-Quantum Cryptography", author: "Bernstein & Lange", year: 2017, venue: "Nature" },
    { title: "CRYSTALS-Kyber: A CCA-Secure Module-Lattice-Based KEM", author: "Bos et al.", year: 2018, venue: "IEEE EuroS&P" },
  ],

  zero_knowledge_proofs: [
    { title: "Quadratic Span Programs and Succinct NIZKs without PCPs", author: "Gennaro et al.", year: 2013, venue: "EUROCRYPT" },
    { title: "On the Size of Pairing-Based Non-interactive Arguments", author: "Groth", year: 2016, venue: "EUROCRYPT" },
    { title: "PLONK: Permutations over Lagrange-bases for Oecumenical Noninteractive Arguments of Knowledge", author: "Gabizon, Williamson, Ciobotaru", year: 2019 },
    { title: "Bulletproofs: Short Proofs for Confidential Transactions and More", author: "Bünz et al.", year: 2018, venue: "IEEE S&P" },
    { title: "Scalable, Transparent, and Post-quantum Secure Computational Integrity", author: "Ben-Sasson et al.", year: 2018, venue: "IACR" },
    { title: "Nova: Recursive Zero-Knowledge Arguments from Folding Schemes", author: "Kothapalli et al.", year: 2022, venue: "CRYPTO" },
    { title: "How to Generate Cryptographically Strong Sequences of Pseudorandom Bits", author: "Blum & Micali", year: 1984 },
  ],

  aerospace: [
    { title: "Fundamentals of Spacecraft Attitude Determination and Control", author: "Markley & Crassidis", year: 2014, venue: "Springer" },
    { title: "Analytical Mechanics of Space Systems", author: "Schaub & Junkins", year: 2018, venue: "AIAA" },
    { title: "An Introduction to the Mathematics and Methods of Astrodynamics", author: "Battin", year: 1999, venue: "AIAA" },
    { title: "Spacecraft Propulsion", author: "Turner", year: 2009, venue: "AIAA" },
    { title: "Modern Astrodynamics", author: "Gurfil (ed.)", year: 2006, venue: "Elsevier" },
    { title: "SpaceX Starship Integrated Flight Test Results", author: "SpaceX Engineering", year: 2024 },
  ],

  ml_and_ai: [
    { title: "Attention Is All You Need", author: "Vaswani et al.", year: 2017, venue: "NeurIPS" },
    { title: "BERT: Pre-training of Deep Bidirectional Transformers", author: "Devlin et al.", year: 2019, venue: "NAACL" },
    { title: "Language Models are Few-Shot Learners (GPT-3)", author: "Brown et al.", year: 2020, venue: "NeurIPS" },
    { title: "Scaling Laws for Neural Language Models", author: "Kaplan et al.", year: 2020, venue: "arXiv" },
    { title: "Training Language Models to Follow Instructions with Human Feedback", author: "Ouyang et al.", year: 2022, venue: "NeurIPS" },
    { title: "Constitutional AI: Harmlessness from AI Feedback", author: "Bai et al. (Anthropic)", year: 2022, venue: "arXiv" },
    { title: "Concrete Problems in AI Safety", author: "Amodei et al.", year: 2016, venue: "arXiv" },
    { title: "Risks from Learned Optimization in Advanced ML Systems", author: "Hubinger et al.", year: 2019, venue: "arXiv" },
    { title: "Reward Modeling for Mitigating Overoptimization", author: "Gao et al.", year: 2022, venue: "arXiv" },
    { title: "Mastering the Game of Go with Deep Neural Networks and Tree Search", author: "Silver et al.", year: 2016, venue: "Nature" },
    { title: "Human-level control through deep reinforcement learning", author: "Mnih et al.", year: 2015, venue: "Nature" },
    { title: "An Image is Worth 16x16 Words: ViT", author: "Dosovitskiy et al.", year: 2021, venue: "ICLR" },
  ],

  web3_and_blockchain: [
    { title: "Bitcoin: A Peer-to-Peer Electronic Cash System", author: "Nakamoto", year: 2008 },
    { title: "Ethereum: A Next-Generation Smart Contract and Decentralized Application Platform", author: "Buterin", year: 2014 },
    { title: "Uniswap v3 Core", author: "Adams et al.", year: 2021 },
    { title: "Flash Boys 2.0: Frontrunning, Transaction Reordering, and Consensus Instability in DEXs", author: "Daian et al.", year: 2020, venue: "IEEE S&P" },
    { title: "Danksharding", author: "Buterin & Asgaonkar", year: 2022, venue: "Ethereum Research" },
    { title: "Casper the Friendly Finality Gadget", author: "Buterin & Griffith", year: 2017, venue: "arXiv" },
    { title: "SoK: Decentralized Exchanges (DEX) with Automated Market Maker (AMM) Protocols", author: "Xu et al.", year: 2023, venue: "Financial Cryptography" },
    { title: "ERC-4337: Account Abstraction Using Alt Mempool", author: "Buterin et al.", year: 2021, venue: "EIP" },
  ],
};

// ============================================================
// QUICK REFERENCE GLOSSARIES
// ============================================================
export const GLOSSARIES = {

  cybersecurity_terms: {
    APT: "Advanced Persistent Threat — sophisticated, long-term intrusion by nation-state or organized group",
    C2: "Command and Control — attacker infrastructure for managing compromised systems",
    IOC: "Indicator of Compromise — evidence of intrusion (hash, IP, domain)",
    TTPs: "Tactics, Techniques and Procedures — adversary behavioral patterns",
    OSINT: "Open-Source Intelligence — publicly available information gathering",
    OPSEC: "Operational Security — protecting sensitive information from adversaries",
    Zero_day: "Vulnerability unknown to vendor with no available patch",
    Lateral_movement: "Moving through network after initial compromise",
    Persistence: "Mechanism to maintain access across reboots or disconnections",
    Exfiltration: "Unauthorized data transfer out of target environment",
  },

  quantum_terms: {
    qubit: "Quantum bit — two-level quantum system used as basic unit of quantum information",
    superposition: "Quantum state that is a linear combination of multiple basis states",
    entanglement: "Quantum correlation where measurement of one particle affects another",
    decoherence: "Loss of quantum properties due to environment interaction",
    gate_fidelity: "Measure of how accurately a quantum gate performs its intended operation",
    NISQ: "Noisy Intermediate-Scale Quantum — current era of 50-1000 noisy qubits",
    T1: "Energy relaxation time — how long qubit maintains excited state",
    T2: "Dephasing time — how long qubit maintains phase coherence",
    circuit_depth: "Number of sequential gate layers in a quantum circuit",
    logical_qubit: "Error-corrected qubit encoded in many physical qubits",
  },

  blockchain_terms: {
    gas: "Unit of computational effort in EVM execution",
    nonce: "Transaction counter preventing replay attacks",
    MEV: "Maximal Extractable Value — profit from transaction ordering",
    TVL: "Total Value Locked — assets deposited in DeFi protocols",
    AMM: "Automated Market Maker — algorithmic liquidity provision",
    DAO: "Decentralized Autonomous Organization — token-governed entity",
    DeFi: "Decentralized Finance — financial applications on blockchain",
    NFT: "Non-Fungible Token — unique digital asset on blockchain",
    oracle: "Service providing off-chain data to smart contracts",
    rollup: "Layer-2 scaling solution executing transactions off L1",
  },

  rf_terms: {
    EIRP: "Effective Isotropic Radiated Power — transmit power × antenna gain",
    SNR: "Signal-to-Noise Ratio — ratio of signal power to noise power",
    BER: "Bit Error Rate — fraction of bits received in error",
    VSWR: "Voltage Standing Wave Ratio — antenna impedance match quality",
    LNA: "Low Noise Amplifier — first stage in receiver chain",
    IQ: "In-phase/Quadrature — two-dimensional signal representation",
    ADC: "Analog-to-Digital Converter — samples continuous signal",
    SDR: "Software-Defined Radio — digital signal processing for radio",
    TLE: "Two-Line Element — satellite orbital parameter format",
    GEO: "Geostationary Earth Orbit — 35,786 km, fixed in sky",
  },

};

export default EXPERT_CORPUS;
