import { Challenge } from '../types';

export const initialChallenges: Challenge[] = [
  {
    id: 'web-easy-1',
    title: 'Inspector Gadget',
    category: 'Web',
    difficulty: 'Easy',
    author: 'IEEE UD Team',
    description: 'The developer left a secret message hidden in the open. You just need to know where to look. \\n\\n**Target:** http://inspector.challenges.ieee.org',
    hints: [
      { id: 'h1', cost: 10, content: 'Have you checked the source code?' }
    ],
    files: [],
    links: [{ label: 'Website', url: 'http://inspector.challenges.ieee.org' }],
    flag: 'FLAG{1nsp3ct_3l3m3nt_1s_y0ur_fr13nd}',
    state: 'active'
  },
  {
    id: 'pwn-medium-1',
    title: 'Buffer Overflow 101',
    category: 'Pwn',
    difficulty: 'Medium',
    author: 'IEEE Rosario Team',
    description: 'Can you overwrite the return address to call the `win()` function?\\n\\n**Connect:** `nc pwn.challenges.ieee.org 1337`',
    hints: [
      { id: 'h2', cost: 50, content: 'Look into the `gets()` function vulnerability.' }
    ],
    files: [{ name: 'vuln.c', url: '#', size: '1.2 KB' }, { name: 'vuln', url: '#', size: '16 KB' }],
    links: [{ label: 'Netcat Command', url: 'nc pwn.challenges.ieee.org 1337' }],
    flag: 'FLAG{b0f_m4st3r_1337}',
    state: 'active'
  },
  {
    id: 'crypto-hard-1',
    title: 'RSA with a Twist',
    category: 'Cryptography',
    difficulty: 'Hard',
    author: 'IEEE UD Team',
    description: 'We intercepted this message encrypted with RSA, but we think they made a critical mistake in choosing their primes. Can you factor `n` and decrypt the message?',
    hints: [
      { id: 'h3', cost: 100, content: "Fermat's factorization method might be useful here if `p` and `q` are close." }
    ],
    files: [{ name: 'intercept.txt', url: '#', size: '2 KB' }, { name: 'public.pem', url: '#', size: '1 KB' }],
    links: [],
    flag: 'FLAG{f3rm4t_f4ct0r1z4t10n_ftw}',
    state: 'active'
  },
  {
    id: 'forensics-easy-1',
    title: 'Magic Bytes',
    category: 'Forensics',
    difficulty: 'Easy',
    author: 'IEEE Rosario Team',
    description: "This file won't open, but it looks like a standard image format. Can you fix it?",
    hints: [
      { id: 'h4', cost: 20, content: 'Check the file signature (magic numbers) in a hex editor.' }
    ],
    files: [{ name: 'corrupted.jpg', url: '#', size: '250 KB' }],
    links: [],
    flag: 'FLAG{m4g1c_byt3s_r3st0r3d}',
    state: 'active'
  },
  {
    id: 're-medium-1',
    title: 'Keygen Me',
    category: 'Reverse Engineering',
    difficulty: 'Medium',
    author: 'IEEE UD Team',
    description: 'Reverse engineer this binary and write a keygen for it, or just find the one valid key.',
    hints: [
      { id: 'h5', cost: 50, content: 'Ghidra or IDA Pro will make this easier.' }
    ],
    files: [{ name: 'keygenme.exe', url: '#', size: '45 KB' }],
    links: [],
    flag: 'FLAG{r3v3rs3_3ng1n33r1ng_pwn}',
    state: 'active'
  },
  {
    id: 'iot-hard-1',
    title: 'Firmware Extraction',
    category: 'Hardware / IoT',
    difficulty: 'Hard',
    author: 'IEEE Rosario Team',
    description: 'We dumped the firmware from a smart lock. Extract the filesystem and find the hardcoded backdoor password.',
    hints: [
      { id: 'h6', cost: 150, content: 'Binwalk is your friend for extracting filesystems from firmware blobs.' }
    ],
    files: [{ name: 'firmware.bin', url: '#', size: '4 MB' }],
    links: [],
    flag: 'FLAG{b1nw4lk_3xtr4ct_p4ssw0rd}',
    state: 'active'
  },
  {
    id: 'misc-easy-1',
    title: 'Sanity Check',
    category: 'Misc',
    difficulty: 'Easy',
    author: 'Admin',
    description: 'Welcome to the IEEE Intercollegiate CyberOps CTF! The flag is in the Discord server rules.',
    hints: [],
    files: [],
    links: [{ label: 'Discord Server', url: 'https://discord.gg/example' }],
    flag: 'FLAG{w3lc0m3_t0_cyb3r0ps}',
    state: 'active'
  },
  {
    id: 'web-medium-1',
    title: 'SQLi Time',
    category: 'Web',
    difficulty: 'Medium',
    author: 'IEEE UD Team',
    description: 'The login page looks secure, but the search feature might not be. Extract the admin password from the database.',
    hints: [
      { id: 'h7', cost: 50, content: 'Try a UNION-based SQL injection.' }
    ],
    files: [],
    links: [{ label: 'Search Page', url: 'http://sqli.challenges.ieee.org/search' }],
    flag: 'FLAG{un10n_b4s3d_sq11}',
    state: 'active'
  },
  {
    id: 'crypto-easy-1',
    title: 'Caesar Salad',
    category: 'Cryptography',
    difficulty: 'Easy',
    author: 'IEEE Rosario Team',
    description: '`synt{p43f4e_f414q_1f_g4fg1}`\\nCan you decode this classic cipher?',
    hints: [
      { id: 'h8', cost: 10, content: 'ROT13 might be the answer.' }
    ],
    files: [],
    links: [],
    flag: 'FLAG{c43s4r_s4l4d_1s_t4sty}',
    state: 'active'
  },
  {
    id: 'pwn-hard-1',
    title: 'Heap Exploitation',
    category: 'Pwn',
    difficulty: 'Hard',
    author: 'IEEE UD Team',
    description: 'A classic use-after-free vulnerability. Get a shell and read the flag.\\n\\n**Connect:** `nc heap.challenges.ieee.org 31337`',
    hints: [
      { id: 'h9', cost: 100, content: 'Look at how the chunks are freed and re-allocated.' }
    ],
    files: [{ name: 'heap_vuln', url: '#', size: '20 KB' }, { name: 'libc.so.6', url: '#', size: '2 MB' }],
    links: [{ label: 'Netcat', url: 'nc heap.challenges.ieee.org 31337' }],
    flag: 'FLAG{u4f_h34p_m4g1c}',
    state: 'active'
  },
  {
    id: 'forensics-medium-1',
    title: 'Packet Analysis',
    category: 'Forensics',
    difficulty: 'Medium',
    author: 'IEEE Rosario Team',
    description: 'We captured some suspicious network traffic. Can you find the exfiltrated data in this PCAP?',
    hints: [
      { id: 'h10', cost: 50, content: 'Filter for HTTP requests or follow TCP streams in Wireshark.' }
    ],
    files: [{ name: 'capture.pcapng', url: '#', size: '1.5 MB' }],
    links: [],
    flag: 'FLAG{w1r3sh4rk_pcap_4n4lys1s}',
    state: 'active'
  },
  {
    id: 're-easy-1',
    title: 'Strings Attached',
    category: 'Reverse Engineering',
    difficulty: 'Easy',
    author: 'IEEE UD Team',
    description: 'Sometimes the flag is just sitting there in plain text inside the binary.',
    hints: [
      { id: 'h11', cost: 10, content: 'The `strings` command in Linux is very useful.' }
    ],
    files: [{ name: 'binary', url: '#', size: '10 KB' }],
    links: [],
    flag: 'FLAG{str1ngs_c0mm4nd_1s_34sy}',
    state: 'active'
  },
  {
    id: 'iot-medium-1',
    title: 'UART Console',
    category: 'Hardware / IoT',
    difficulty: 'Medium',
    author: 'IEEE Rosario Team',
    description: "We got access to the UART console of this router, but we don't have the root password. Can you bypass it?",
    hints: [
      { id: 'h12', cost: 50, content: 'Try interrupting the bootloader.' }
    ],
    files: [],
    links: [{ label: 'Console Instance', url: 'ssh root@uart.challenges.ieee.org' }],
    flag: 'FLAG{u4rt_b00tl04d3r_byp4ss}',
    state: 'active'
  },
  {
    id: 'web-hard-1',
    title: 'XSS to RCE',
    category: 'Web',
    difficulty: 'Hard',
    author: 'IEEE UD Team',
    description: 'Find the XSS vulnerability, steal the admin cookie, access the admin panel, and find a way to execute code.',
    hints: [
      { id: 'h13', cost: 100, content: 'The report feature sends your payload to a headless browser bot.' }
    ],
    files: [],
    links: [{ label: 'App', url: 'http://xss.challenges.ieee.org' }],
    flag: 'FLAG{xss_t0_rc3_ch41n}',
    state: 'active'
  },
  {
    id: 'crypto-medium-1',
    title: 'Vigenere Cipher',
    category: 'Cryptography',
    difficulty: 'Medium',
    author: 'IEEE Rosario Team',
    description: 'The key is the name of a famous computer scientist. Decode the message.',
    hints: [
      { id: 'h14', cost: 50, content: 'Alan Turing might be relevant.' }
    ],
    files: [{ name: 'cipher.txt', url: '#', size: '1 KB' }],
    links: [],
    flag: 'FLAG{v1g3n3r3_1s_n0t_s3cur3}',
    state: 'active'
  },
  {
    id: 'pwn-easy-1',
    title: 'Ret2Win',
    category: 'Pwn',
    difficulty: 'Easy',
    author: 'IEEE UD Team',
    description: 'Just call the `win()` function. The binary is provided.',
    hints: [
      { id: 'h15', cost: 10, content: 'Find the offset to the instruction pointer and the address of win().' }
    ],
    files: [{ name: 'ret2win', url: '#', size: '15 KB' }],
    links: [{ label: 'Netcat', url: 'nc r2w.challenges.ieee.org 1337' }],
    flag: 'FLAG{r3t2w1n_1s_f4c1l}',
    state: 'active'
  },
  {
    id: 'forensics-hard-1',
    title: 'Memory Dump',
    category: 'Forensics',
    difficulty: 'Hard',
    author: 'IEEE Rosario Team',
    description: 'We dumped the RAM of an infected machine. Find the malware and extract the C2 server address.',
    hints: [
      { id: 'h16', cost: 150, content: 'Volatility 3 is the tool for the job. Look at running processes.' }
    ],
    files: [{ name: 'memdump.raw', url: '#', size: '1 GB' }],
    links: [],
    flag: 'FLAG{v0l4t1l1ty_m3m0ry_4n4lys1s}',
    state: 'active'
  },
  {
    id: 're-hard-1',
    title: 'Obfuscated Go',
    category: 'Reverse Engineering',
    difficulty: 'Hard',
    author: 'IEEE UD Team',
    description: 'This Go binary is heavily obfuscated. Find the validation logic and get the flag.',
    hints: [
      { id: 'h17', cost: 100, content: 'Look into Go symbol recovery tools.' }
    ],
    files: [{ name: 'obf_go', url: '#', size: '2.5 MB' }],
    links: [],
    flag: 'FLAG{g0_0bfusc4t10n_byp4ss}',
    state: 'active'
  }
];
