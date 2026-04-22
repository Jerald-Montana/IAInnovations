(function () {
  "use strict";

  if (window.__IA_CHATBOT_INITIALIZED__) return;
  window.__IA_CHATBOT_INITIALIZED__ = true;

  var BOT_NAME = "IA Assistant";
  var GREETING = "Hi there! Welcome to IA Innovations. How can I help you today?";
  var UNKNOWN_INFO_REPLY = "I'm sorry, I couldn't find specific information about that on our site. Please visit our Contact page or email info@iainnovations.com.";
  var UNCLEAR_REPLY = "I'm sorry, I didn't quite understand that. Could you rephrase it?";

  var CONFIG = {
    aiProxyEndpoint: "", // Leave blank to use local search
    maxContextItems: 3,
    maxContextCharsPerItem: 400,
    maxTotalContextChars: 1500,
    requestTimeoutMs: 9000,
    pagesToScan: [
      "/html/index.html",
      "/html/BusinessTransformation/AboutUs.html",
      "/html/BusinessTransformation/AppDevelopment.html",
      "/html/BusinessTransformation/Contact.html",
      "/html/BusinessTransformation/CorporatePerformance.html",
      "/html/BusinessTransformation/EnterpriseData.html",
      "/html/BusinessTransformation/EnterpriseResource.html",
      "/html/BusinessTransformation/IntegrationApi.html",
      "/html/BusinessTransformation/ManagementConsulting.html",
      "/html/BusinessTransformation/Partnership.html",
      "/html/BusinessTransformation/ProjectManagement.html",
      "/html/BusinessTransformation/RPA.html",
      "/html/BusinessTransformation/Solutions.html",
      "/html/BusinessTransformation/careers.html",
      "/html/DigitalExperience/DigitalExperience.html",
      "/html/DigitalExperience/MobileExperience.html",
      "/html/IndustrySolutions/FinancialServices.html",
      "/html/InfrastructureServices/Infrastructure.html"
    ]
  };

  var state = {
    isOpen: false,
    isMinimized: false,
    messages: [],
    lastMessageTime: 0,
    quickReplies: [
      "What services do you offer?",
      "Tell me about RPA solutions",
      "Are you hiring right now?",
      "How can I contact you?",
      "Digital experience services"
    ]
  };

  var refs = {};
  var scrapedKnowledge = [
    {
      title: "Contact Information",
      category: "Contact",
      description: "**Email:** info@iainnovations.com\n**Phone:** +63 28-9378-809",
      deepContent: "contact email phone number reach call phonebook",
      link: "/html/BusinessTransformation/Contact.html"
    },
    {
      title: "Our Locations",
      category: "Location",
      description: "**Main Office:**\n11th Floor Cyberone Bldg. Eastwood Cyberpark, Brgy. Bagumbayan, Quezon City 1110\n\n**Branch Office:**\n3201 Antel Global Corporate Center, 32nd Floor, 1605 Doña Julia Vargas Ave, Ortigas Center, Pasig",
      deepContent: "address location pasig quezon city cyberone antel global office branch where are you located map headquarters",
      link: "/html/BusinessTransformation/Contact.html"
    },
    {
      title: "Careers & Job Openings",
      category: "Careers",
      description: "We are currently seeking talented individuals for the following positions:\n\n• Senior Java Developer\n• Junior Java Developer\n• Web Developer\n• Senior Data Science\n• System Consultant\n• .Net Developer\n• Business Manager\n• Software Sales Executive\n• Sales and Marketing Associate\n• Supply Chain Coordinator\n• ELV CAD Designer\n• CAD Designer\n• CCTV Technician\n• Company Driver\n\nVisit our Careers page to learn more about responsibilities and how to send your resume.",
      deepContent: "job career hiring work application open position apply recruit resume developer designer manager sales technician driver vacancy",
      link: "/html/BusinessTransformation/careers.html"
    }
  ];

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizePath(path) {
    if (!path) return "";
    return String(path).replace(/\\/g, "/");
  }

  function isUnclearMessage(text) {
    var clean = String(text || "").trim();
    if (!clean) return true;
    if (clean.length < 2) return true;

    var tokens = clean.toLowerCase().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return true;

    var lowSignal = {
      hi: true, hello: true, hey: true, yo: true, ok: true,
      okay: true, hmm: true, help: true, info: true, details: true,
      what: true, where: true, who: true, why: true
    };

    if (tokens.length <= 2) {
      var allLowSignal = tokens.every(function (token) {
        return lowSignal[token] === true;
      });
      if (allLowSignal) return true;
    }

    return !/[a-z0-9]/i.test(clean);
  }

  function scanHtmlPages() {
    CONFIG.pagesToScan.forEach(function (url) {
      fetch(url)
        .then(function (response) {
          if (!response.ok) throw new Error("Network response was not ok");
          return response.text();
        })
        .then(function (html) {
          var parser = new DOMParser();
          var doc = parser.parseFromString(html, "text/html");

          var noisyElements = doc.querySelectorAll('nav, header, footer, .topbar, .navbar, script, style, .sidebar');
          noisyElements.forEach(function (el) {
            if (el && el.parentNode) {
              el.parentNode.removeChild(el);
            }
          });

          var title = doc.title.replace(" - IA Innovations", "").replace(" | IA Innovations", "").trim() || "Page";
          var contentNode = doc.body;

          if (contentNode) {
            var elements = contentNode.querySelectorAll('h1, h2, h3, p, li');
            var currentHeading = title;

            elements.forEach(function (el) {
              var tag = el.tagName.toLowerCase();
              if (tag === 'h1' || tag === 'h2' || tag === 'h3') {
                var hText = el.innerText.replace(/\s+/g, ' ').trim();
                if (hText.length > 0) currentHeading = hText;
              } else if (tag === 'p' || tag === 'li') {
                var text = el.innerText.replace(/\s+/g, ' ').trim();
                if (text.length > 40) {
                  scrapedKnowledge.push({
                    title: currentHeading === title ? title : title + " - " + currentHeading,
                    category: "Website Content",
                    description: text,
                    deepContent: text.toLowerCase(),
                    link: url
                  });
                }
              }
            });
          }
        })
        .catch(function (error) {
          console.warn("IA Assistant could not scan page:", url, error);
        });
    });
  }

  function rankMatches(query, items) {
    var q = query.toLowerCase().trim();
    var words = q.split(/\s+/).filter(function (w) { return w.length > 2; });

    var ranked = items
      .map(function (item) {
        var title = (item.title || "").toLowerCase();
        var deepContent = item.deepContent || "";

        var score = 0;
        if (deepContent.indexOf(q) !== -1) score += 50;
        if (title.indexOf(q) !== -1) score += 30;

        for (var i = 0; i < words.length; i += 1) {
          var w = words[i];
          if (title.indexOf(w) !== -1) score += 10;
          if (deepContent.indexOf(w) !== -1) score += 5;
        }

        return {
          item: item,
          score: score
        };
      })
      .filter(function (entry) {
        return entry.score > 0;
      })
      .sort(function (a, b) {
        return b.score - a.score;
      });

    var uniqueRanked = [];
    var seenTexts = new Set();
    for (var j = 0; j < ranked.length; j++) {
      var entry = ranked[j];
      var textSnippet = entry.item.description;
      if (!seenTexts.has(textSnippet)) {
        seenTexts.add(textSnippet);
        uniqueRanked.push(entry.item);
      }
    }

    return uniqueRanked;
  }

  function searchWebsiteContent(query) {
    if (scrapedKnowledge.length === 0) return [];
    var ranked = rankMatches(query, scrapedKnowledge).slice(0, CONFIG.maxContextItems);
    return ranked;
  }

  function formatLocalAnswer(contextItems) {
    if (!contextItems.length) return UNKNOWN_INFO_REPLY;

    var top = contextItems[0];
    var answer = "Based on our website (**" + top.title + "**), here is what I found:\n\n";
    answer += top.description;

    if (top.link) {
      answer += "\n\n[Read more about this](" + top.link + ")";
    }

    if (contextItems.length > 1) {
      var second = contextItems[1];
      if (second.title !== top.title && second.link !== top.link) {
        answer += "\n\n---\n*You might also be interested in: [" + second.title + "](" + second.link + ")*";
      }
    }

    return answer;
  }

  function getAssistantReply(userMessage) {
    if (isUnclearMessage(userMessage)) {
      return Promise.resolve(UNCLEAR_REPLY);
    }

    var searchResults = searchWebsiteContent(userMessage);
    if (!searchResults.length) {
      return Promise.resolve(UNKNOWN_INFO_REPLY);
    }

    return Promise.resolve(formatLocalAnswer(searchResults));
  }

  function scrollToBottom() {
    if (!refs.messages) return;
    refs.messages.scrollTop = refs.messages.scrollHeight;
  }

  function appendMessage(role, text) {
    state.messages.push({ role: role, text: text });

    var msg = document.createElement("div");
    msg.className = "ia-chat-message " + (role === "user" ? "user slide-in-right" : "bot slide-in-left");

    if (role === "bot") {
      var botAvatar = document.createElement("div");
      botAvatar.className = "ia-chat-bot-avatar";
      botAvatar.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>';
      msg.appendChild(botAvatar);
    }

    var bubble = document.createElement("div");
    bubble.className = "ia-chat-bubble";

    var safeText = String(text || "").split("\n").map(escapeHtml).join("<br>");
    safeText = safeText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    safeText = safeText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_parent" class="ia-chat-link">$1</a>');

    bubble.innerHTML = safeText;

    msg.appendChild(bubble);
    refs.messages.appendChild(msg);
    scrollToBottom();
  }

  function setTyping(isTyping) {
    if (!refs.messages) return;
    
    var existing = refs.messages.querySelector(".ia-chat-typing-msg");
    if (isTyping && !existing) {
      var typingMsg = document.createElement("div");
      typingMsg.className = "ia-chat-message bot ia-chat-typing-msg slide-in-left";
      
      var botAvatar = document.createElement("div");
      botAvatar.className = "ia-chat-bot-avatar";
      botAvatar.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>';
      
      var dots = document.createElement("div");
      dots.className = "ia-chat-bubble ia-typing";
      dots.innerHTML = "<span></span><span></span><span></span>";
      
      typingMsg.appendChild(botAvatar);
      typingMsg.appendChild(dots);
      refs.messages.appendChild(typingMsg);
      scrollToBottom();
    } else if (!isTyping && existing) {
      existing.remove();
    }
  }

  // --- UPDATED ANIMATED TOGGLE OPEN/CLOSE ---
  function toggleOpen(forceOpen) {
    var shouldOpen = typeof forceOpen === "boolean" ? forceOpen : !state.isOpen;
    if (state.isOpen === shouldOpen) return; // Prevent double triggers

    state.isOpen = shouldOpen;

    if (state.isOpen) {
      // Opening
      refs.panel.classList.remove("closing");
      refs.panel.classList.add("open");
      refs.fab.classList.add("hidden");
      state.isMinimized = false;
      refs.panel.classList.remove("minimized");
      refs.input.focus();
      scrollToBottom();
    } else {
      // Closing (Shrink Animation)
      refs.panel.classList.add("closing");

      // Wait exactly 400ms for the panel to shrink out of existence, 
      // then instantly hide it forever and spawn the FAB in its place.
      setTimeout(function () {
        if (!state.isOpen) {
          refs.panel.classList.remove("open");
          refs.panel.classList.remove("closing");
          refs.fab.classList.remove("hidden");
        }
      }, 400);
    }
  }

  function minimizeChat() {
    state.isMinimized = true;
    refs.panel.classList.add("minimized");
    // Hide panel, show FAB with echo pulse
    refs.panel.classList.add("closing");
    setTimeout(function() {
      refs.panel.classList.remove("open");
      refs.panel.classList.remove("closing");
      refs.fab.classList.remove("hidden");
      refs.fab.classList.add("echo");
    }, 280);
  }

  function restoreChat() {
    state.isMinimized = false;
    refs.fab.classList.remove("echo");
    refs.panel.classList.remove("minimized");
    toggleOpen(true);
  }

  function handleQuickReply(text) {
    if (!text) return;
    refs.input.value = text;
    handleSend();
  }

  function handleSend() {
    var text = refs.input.value.trim();
    if (!text) return;

    // --- CHAT COOLDOWN (3 Seconds) ---
    var now = Date.now();
    var lastSent = state.lastMessageTime || 0;
    if (now - lastSent < 3000) {
      console.warn("Retrying too fast... please wait.");
      return; 
    }
    state.lastMessageTime = now;

    // Visually disable the send button during the 3s cooldown
    refs.send.disabled = true;
    refs.send.style.opacity = "0.5";
    refs.send.style.cursor = "not-allowed";
    
    setTimeout(function() {
      refs.send.disabled = false;
      refs.send.style.opacity = "1";
      refs.send.style.cursor = "pointer";
    }, 3000);

    refs.input.value = "";
    appendMessage("user", text);
    setTyping(true);

    getAssistantReply(text)
      .then(function (reply) {
        setTimeout(function () {
          setTyping(false);
          appendMessage("bot", reply || UNKNOWN_INFO_REPLY);
        }, 1000);
      })
      .catch(function () {
        setTimeout(function () {
          setTyping(false);
          appendMessage("bot", UNKNOWN_INFO_REPLY);
        }, 1000);
      });
  }

  function injectStyles() {
    var style = document.createElement("style");
    style.id = "ia-chatbot-styles";
    // ADDED: transform-origin focusing on the FAB icon, scale up/down animations over 0.5s
    style.textContent = ""
      + ":root{"
      + "--ia-chat-primary:#0171b9;"
      + "--ia-chat-dark:#012e4a;"
      + "--ia-chat-lime:#bfd744;"
      + "--ia-chat-text:#012e4a;"
      + "--ia-chat-muted:#5b6870;"
      + "--ia-chat-glass-bg:rgba(255,255,255,0.92);"
      + "--ia-chat-glass-border:rgba(1,46,74,0.1);"
      + "--ia-chat-shadow:0 20px 50px rgba(1,46,74,0.2);"
      + "}"
      + ".ia-chatbot-root{position:fixed;right:24px;bottom:24px;z-index:10000;font-family:'Inter',system-ui,sans-serif;}"
      + ".ia-chat-fab{width:60px;height:60px;border:none;border-radius:50%;background:linear-gradient(135deg,#0171b9,#012e4a);color:#fff;cursor:pointer;box-shadow:0 8px 32px rgba(1,46,74,0.28);display:flex;align-items:center;justify-content:center;transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1),box-shadow 0.3s;position:relative;z-index:10;}"
      + ".ia-chat-fab:hover{transform:translateY(-4px) scale(1.07);box-shadow:0 14px 40px rgba(1,46,74,0.35);}"
      + ".ia-chat-fab.hidden{opacity:0;transform:scale(0);pointer-events:none;transition:transform 0.15s ease,opacity 0.15s ease;}"
      + ".ia-chat-fab.echo{animation:iaEchoPulse 1.6s ease-in-out infinite;}"
      + "@keyframes iaEchoPulse{0%{box-shadow:0 0 0 0 rgba(1,113,185,0.7);}60%{box-shadow:0 0 0 16px rgba(1,113,185,0);}100%{box-shadow:0 0 0 0 rgba(1,113,185,0);}}"
      + ".ia-chat-panel{position:absolute;right:0;bottom:74px;width:370px;height:500px;max-width:calc(100vw - 40px);max-height:calc(100vh - 92px);background:transparent;border:none;border-radius:22px;box-shadow:none;display:none;flex-direction:column;overflow:hidden;transform-origin:bottom right;}"
      + ".ia-chat-panel.open{display:flex;animation:iaPanelScaleIn 0.38s cubic-bezier(0.34,1.56,0.64,1) forwards;}"
      + ".ia-chat-panel.closing{display:flex;animation:iaPanelScaleOut 0.28s ease forwards;pointer-events:none;}"
      + "@keyframes iaPanelScaleIn{from{opacity:0;transform:scale(0.82) translateY(18px);}to{opacity:1;transform:scale(1) translateY(0);}}"
      + "@keyframes iaPanelScaleOut{from{opacity:1;transform:scale(1);}to{opacity:0;transform:scale(0.82) translateY(18px);}}"
      + ".ia-chat-header{padding:10px 14px;background:linear-gradient(135deg,#0171b9,#012e4a);color:#fff;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;min-height:54px;border-radius:22px 22px 0 0;}"
      + ".ia-chat-header-left{display:flex;align-items:center;gap:10px;}"
      + ".ia-chat-avatar{width:38px;height:38px;border-radius:10px;background:rgba(255,255,255,0.15);display:grid;place-items:center;flex-shrink:0;}"
      + ".ia-bot-eye{animation:iaBotBlink 1.5s infinite;}"
      + "@keyframes iaBotBlink{0%,88%,100%{opacity:1;}92%,96%{opacity:0;}}"
      + ".ia-chat-header-info{display:flex;flex-direction:column;line-height:1.2;}"
      + ".ia-chat-header-name{font-weight:700;font-size:14px;letter-spacing:0.1px;}"
      + ".ia-chat-header-sub{font-size:11px;opacity:0.75;display:flex;align-items:center;gap:5px;margin-top:2px;}"
      + ".ia-chat-header-sub::before{content:'';width:6px;height:6px;background:#6ee7a0;border-radius:50%;}"
      + ".ia-chat-header-actions{display:flex;gap:6px;align-items:center;}"
      + ".ia-chat-hbtn{background:rgba(255,255,255,0.13);border:none;color:#fff;width:30px;height:30px;border-radius:50%;cursor:pointer;display:grid;place-items:center;transition:background 0.18s;}"
      + ".ia-chat-hbtn:hover{background:rgba(255,255,255,0.26);}"
      + ".ia-chat-messages{flex:1;overflow-y:auto;padding:10px 12px 6px;display:flex;flex-direction:column;gap:8px;background:linear-gradient(175deg,#f4f8fc 0%,#eaf0f8 100%);}"
      + ".ia-chat-messages::-webkit-scrollbar{width:4px;}"
      + ".ia-chat-messages::-webkit-scrollbar-track{background:transparent;}"
      + ".ia-chat-messages::-webkit-scrollbar-thumb{background:rgba(1,46,74,0.15);border-radius:4px;}"
      + ".ia-chat-message{display:flex;gap:6px;max-width:90%;}"
      + ".ia-chat-message.user{align-self:flex-end;flex-direction:row-reverse;}"
      + ".ia-chat-message.bot{align-self:flex-start;}"
      + ".ia-chat-bubble{padding:8px 12px;border-radius:16px;font-size:13px;line-height:1.35;word-break:break-word;}"
      + ".ia-chat-message.bot .ia-chat-bubble{background:#fff;color:#012e4a;box-shadow:0 2px 10px rgba(1,46,74,0.07);}"
      + ".ia-chat-message.user .ia-chat-bubble{background:#0171b9;color:#fff;}"
      + ".ia-chat-bot-avatar{width:28px;height:28px;background:#fff;color:#0171b9;border-radius:8px;display:grid;place-items:center;box-shadow:0 2px 8px rgba(0,0,0,0.07);flex-shrink:0;}"
      + ".ia-chat-quick-replies{display:flex;gap:6px;padding:6px 12px 5px;overflow-x:auto;scrollbar-width:none;flex-shrink:0;background:rgba(248,251,255,0.95);border-top:1px solid rgba(1,46,74,0.05);}"
      + ".ia-chat-quick-replies::-webkit-scrollbar{display:none;}"
      + ".ia-quick-btn{white-space:nowrap;padding:5px 11px;background:#fff;border:1px solid rgba(1,113,185,0.22);border-radius:16px;font-size:11.5px;color:#0171b9;cursor:pointer;transition:all 0.18s;font-weight:500;}"
      + ".ia-quick-btn:hover{background:#0171b9;color:#fff;border-color:#0171b9;transform:translateY(-1px);}"
      + ".ia-chat-input-area{padding:8px 12px 10px;background:#fff;border-top:1px solid rgba(1,46,74,0.07);flex-shrink:0;border-radius:0 0 22px 22px;box-shadow:0 4px 18px 0 rgba(1,113,185,0.13);}"
      + ".ia-chat-input-wrapper{display:flex;background:#f2f5f9;border-radius:20px;padding:3px 3px 3px 12px;align-items:center;border:1.5px solid transparent;transition:border-color 0.2s,background 0.2s,box-shadow 0.2s,transform 0.2s;}"
      + ".ia-chat-input-wrapper:focus-within{border-color:#0171b9;background:#ffffff;box-shadow:0 0 0 4px rgba(1,113,185,0.14),0 8px 18px rgba(1,113,185,0.08);transform:translateY(-1px);}"
      + ".ia-chat-input{flex:1;border:none;background:transparent;padding:7px 0;font-size:13.5px;outline:none;color:#012e4a;}"
      + ".ia-chat-input::placeholder{color:#7f93a7;opacity:0.82;transition:none;}"
      + ".ia-chat-input:focus::placeholder{color:#5f7f9a;opacity:0.55;}"
      + ".ia-chat-send{width:36px;height:36px;background:#0171b9;color:#fff;border:none;border-radius:50%;cursor:pointer;display:grid;place-items:center;transition:transform 0.2s,opacity 0.2s,background 0.2s,box-shadow 0.2s;flex-shrink:0;}"
      + ".ia-chat-send:hover,.ia-chat-send:focus-visible{transform:scale(1.08);background:#015fa0;box-shadow:0 0 0 3px rgba(1,113,185,0.14);}"
      + ".ia-chat-send:disabled{opacity:0.38;cursor:not-allowed;transform:none;}"
      + ".ia-chat-link{color:#0171b9;text-decoration:underline;font-weight:600;}"
      + ".ia-chat-link:hover{color:#015fa0;}"
      + ".slide-in-right{animation:iaSlideRight 0.26s ease-out;}"
      + ".slide-in-left{animation:iaSlideLeft 0.26s ease-out;}"
      + "@keyframes iaSlideRight{from{opacity:0;transform:translateX(14px);}to{opacity:1;transform:translateX(0);}}"
      + "@keyframes iaSlideLeft{from{opacity:0;transform:translateX(-14px);}to{opacity:1;transform:translateX(0);}}"
      + ".ia-typing{display:flex;gap:4px;padding:4px 2px;align-items:center;}"
      + ".ia-typing span{width:6px;height:6px;background:#8fa0ad;border-radius:50%;animation:iaBounce 1.4s infinite ease-in-out both;}"
      + ".ia-typing span:nth-child(1){animation-delay:-0.32s;}"
      + ".ia-typing span:nth-child(2){animation-delay:-0.16s;}"
      + "@keyframes iaBounce{0%,80%,100%{transform:scale(0);}40%{transform:scale(1);}}"
      + "@media(max-width:640px){.ia-chat-panel{width:calc(100vw - 32px);height:min(76vh,470px);}}"
      + "@media(max-width:480px){.ia-chatbot-root{right:14px;bottom:14px;}}";

    document.head.appendChild(style);
  }

  function buildUi() {
    var root = document.createElement("div");
    root.className = "ia-chatbot-root";

    var fab = document.createElement("button");
    fab.type = "button";
    fab.className = "ia-chat-fab";
    fab.setAttribute("aria-label", "Open IA Assistant");
    fab.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';

    var panel = document.createElement("section");
    panel.className = "ia-chat-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "IA Assistant Chat");

    var header = document.createElement("header");
    header.className = "ia-chat-header";
    // Robot profile avatar SVG with blinking eyes
    var robotSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
      + '<path d="M12 2v4M8 2v4M16 2v4"/>'
      + '<rect x="3" y="8" width="18" height="12" rx="4"/>'
      + '<circle cx="8" cy="13" r="1.5" fill="currentColor" class="ia-bot-eye"/>'
      + '<circle cx="16" cy="13" r="1.5" fill="currentColor" class="ia-bot-eye"/>'
      + '<path d="M9 17h6"/>'
      + '</svg>';

    header.innerHTML = ""
      + "<div class=\"ia-chat-header-left\">"
      + "  <div class=\"ia-chat-avatar\">" + robotSvg + "</div>"
      + "  <div class=\"ia-chat-header-info\">"
      + "    <div class=\"ia-chat-header-name\">" + BOT_NAME + "</div>"
      + "    <div class=\"ia-chat-header-sub\">Online</div>"
      + "  </div>"
      + "</div>"
      + "<div class=\"ia-chat-header-actions\">"
      + "  <button type=\"button\" class=\"ia-chat-hbtn ia-chat-minimize\" aria-label=\"Minimize chat\">"
      + "    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\"><line x1=\"5\" y1=\"12\" x2=\"19\" y2=\"12\"/></svg>"
      + "  </button>"
      + "  <button type=\"button\" class=\"ia-chat-hbtn ia-chat-close\" aria-label=\"Close chat\">"
      + "    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\"><line x1=\"18\" y1=\"6\" x2=\"6\" y2=\"18\"/><line x1=\"6\" y1=\"6\" x2=\"18\" y2=\"18\"/></svg>"
      + "  </button>"
      + "</div>";

    var messages = document.createElement("div");
    messages.className = "ia-chat-messages";

    var quickReplies = document.createElement("div");
    quickReplies.className = "ia-chat-quick-replies";
    state.quickReplies.forEach(function(text) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ia-quick-btn";
      btn.textContent = text;
      btn.addEventListener("click", function() { handleQuickReply(text); });
      quickReplies.appendChild(btn);
    });

    var inputArea = document.createElement("div");
    inputArea.className = "ia-chat-input-area";
    inputArea.innerHTML = ""
      + "<div class=\"ia-chat-input-wrapper\">"
      + "<input class=\"ia-chat-input\" type=\"text\" placeholder=\"Type your message...\" aria-label=\"Message IA Chatbot\">"
      + "<button type=\"button\" class=\"ia-chat-send\" aria-label=\"Send message\">"
      + "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\">"
      + "<line x1=\"22\" y1=\"2\" x2=\"11\" y2=\"13\"></line>"
      + "<polygon points=\"22 2 15 22 11 13 2 9 22 2\"></polygon>"
      + "</svg></button></div>";

    panel.appendChild(header);
    panel.appendChild(messages);
    panel.appendChild(quickReplies);
    panel.appendChild(inputArea);

    root.appendChild(fab);
    root.appendChild(panel);
    document.body.appendChild(root);

    refs.root = root;
    refs.fab = fab;
    refs.panel = panel;
    refs.messages = messages;
    refs.input = inputArea.querySelector(".ia-chat-input");
    refs.send = inputArea.querySelector(".ia-chat-send");
    refs.close = header.querySelector(".ia-chat-close");
    refs.minimize = header.querySelector(".ia-chat-minimize");
  }

  function bindEvents() {
    refs.fab.addEventListener("click", function () {
      if (state.isMinimized) {
        restoreChat();
      } else {
        toggleOpen(true);
      }
    });

    refs.close.addEventListener("click", function () {
      state.isMinimized = false;
      refs.fab.classList.remove("echo");
      toggleOpen(false);
    });

    if (refs.minimize) {
      refs.minimize.addEventListener("click", function () {
        minimizeChat();
      });
    }

    refs.send.addEventListener("click", handleSend);

    refs.input.addEventListener("keydown", function (event) {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSend();
      }
    });
  }

  function init() {
    injectStyles();
    buildUi();
    bindEvents();

    scanHtmlPages();

    setTyping(true);
    setTimeout(function () {
      setTyping(false);
      appendMessage("bot", GREETING);
    }, 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();