/* 
   IA Innovations - Security Hardening Script
   Handles Email Obfuscation, Dynamic Link Protection, and Anti-Spam
*/

const Security = {
    /**
     * Decrypts emails hidden in data attributes to block simple scraper bots.
     */
    decryptEmails: function() {
        document.querySelectorAll('[data-email-name]').forEach(el => {
            const name = el.getAttribute('data-email-name');
            const domain = el.getAttribute('data-email-domain');
            if (!name || !domain) return;
            
            const email = name + '@' + domain;
            if (el.tagName === 'A') {
                el.href = 'mailto:' + email;
                if (!el.innerText || el.innerText.includes('...') || el.innerText.includes('[email')) {
                    el.innerText = email;
                }
            } else {
                el.innerText = email;
            }
        });
    },

    /**
     * Safety check: Automatically adds noopener noreferrer to target="_blank" links.
     */
    hardenLinks: function() {
        document.querySelectorAll('a[target="_blank"]').forEach(link => {
            const rel = link.getAttribute('rel') || '';
            if (!rel.includes('noopener')) {
                link.setAttribute('rel', (rel + ' noopener noreferrer').trim());
            }
        });
    },

    /**
     * Anti-Spam initialization.
     */
    initTimeCheck: function(fieldId) {
        const field = document.getElementById(fieldId);
        if (field) field.value = Date.now();
    },

    /**
     * Redirects bots to the 404 page if they trigger security traps.
     */
    validateHuman: function(form, openedAtId, redirectPath) {
        const honeyField = form.querySelector('input[name="_honey"]');
        const honey = honeyField ? honeyField.value : "";
        const timeField = document.getElementById(openedAtId);
        const timeLoaded = timeField ? parseInt(timeField.value, 10) : Date.now();
        const duration = Date.now() - timeLoaded;

        console.log("🛡️ Anti-Spam Check:", { honeypot: honey, timeSinceLoad_ms: duration });

        if (honey || duration < 3500) {
            console.warn("🚫 Spam bot detected. Locking out...");
            
            // PERSISTENT LOCKOUT: Tag this "browser" as a bot so they can't just refresh and try again
            localStorage.setItem('IA_BOT_QUARANTINE', 'true');
            
            debugger; // Pause for visibility
            window.top.location.replace(redirectPath || "../404.html");
            return false;
        }
        console.log("✅ Human validation passed.");
        return true;
    },

    /**
     * Checks if this browser has been tagged as a bot previously.
     */
    checkQuarantine: function() {
        if (localStorage.getItem('IA_BOT_QUARANTINE') === 'true') {
            console.error("⛔ Access Denied: Previous bot behavior detected.");
            // Determine relative path to 404.html based on current URL
            const isSubPath = window.location.pathname.includes('/html/BusinessTransformation/') || 
                             window.location.pathname.includes('/html/DigitalExperience/') ||
                             window.location.pathname.includes('/html/IndustrySolutions/') ||
                             window.location.pathname.includes('/html/InfrastructureServices/');
            
            const redirect = isSubPath ? "../404.html" : "html/404.html";
            window.top.location.replace(redirect);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Security.checkQuarantine();
    Security.decryptEmails();
    Security.hardenLinks();
});
