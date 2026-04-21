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
    maxContextCharsPerItem: 400, // Increased to give better context
    maxTotalContextChars: 1500,
    requestTimeoutMs: 9000,
    // FIX 1: Absolute paths ensure the bot finds the files no matter what page the user is currently on.
    pagesToScan: [
      "/html/BusinessTransformation/AboutUs.html",
      "/html/BusinessTransformation/AppDevelopment.html",
      "/html/BusinessTransformation/careers.html",
      "/html/BusinessTransformation/Contact.html",
      "/html/BusinessTransformation/CorporatePerformance.html",
      "/html/BusinessTransformation/EnterpriseData.html",
      "/html/BusinessTransformation/EnterpriseResource.html",
      "/html/BusinessTransformation/IntegrationApi.html"
    ]
  };

  var state = {
    isOpen: false,
    isMinimized: false,
    messages: []
  };

  var refs = {};
  var scrapedKnowledge = []; 

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
          
          // FIX 2: Remove the topbar, navbar, and footer so the bot doesn't memorize menus!
          var noisyElements = doc.querySelectorAll('nav, header, footer, .topbar, .navbar, script, style');
          noisyElements.forEach(function(el) {
            el.parentNode.removeChild(el);
          });
          
          // Now grab the text of whatever is left (the actual content)
          var contentNode = doc.body;
          
          if (contentNode) {
            // Clean up the text
            var text = contentNode.innerText.replace(/\s+/g, ' ').trim();
            var title = doc.title.replace(" - IA Innovations", "").replace(" | IA Innovations", "").trim() || "Page";
            
            // Only add if there's actual content left
            if (text.length > 50) {
                scrapedKnowledge.push({
                  title: title,
                  category: "Website Content",
                  description: text.substring(0, 350) + "...", // The snippet shown to the user
                  deepContent: text, // The full text the search algorithm looks through
                  link: url
                });
            }
          }
        })
        .catch(function (error) {
          console.warn("IA Assistant could not scan page:", url, error);
        });
    });
  }

  function rankMatches(query, items) {
    var q = query.toLowerCase().trim();
    return items
      .map(function (item) {
        var title = (item.title || "").toLowerCase();
        var deepContent = (item.deepContent || "").toLowerCase();

        var score = 0;
        // Exact phrase match gets a huge boost
        if (deepContent.indexOf(q) !== -1) score += 10;
        if (title.indexOf(q) !== -1) score += 15;

        // Individual word matching
        var words = q.split(/\s+/).filter(Boolean);
        for (var i = 0; i < words.length; i += 1) {
          var w = words[i];
          if (w.length < 3) continue; // ignore tiny words like "a", "is", "to"
          if (title.indexOf(w) !== -1) score += 5;
          if (deepContent.indexOf(w) !== -1) score += 2;
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
      })
      .map(function (entry) {
        return entry.item;
      });
  }

  function searchWebsiteContent(query) {
    if (scrapedKnowledge.length === 0) return [];
    var ranked = rankMatches(query, scrapedKnowledge).slice(0, CONFIG.maxContextItems);
    return ranked;
  }

  function formatLocalAnswer(contextItems) {
    if (!contextItems.length) return UNKNOWN_INFO_REPLY;

    var top = contextItems[0];
    
    // Give a much cleaner, friendlier response format
    var answer = "Based on our website, here is what I found regarding **" + top.title + "**:\n\n";
    answer += top.description;

    if (top.link) {
      answer += "\n\n[Read more about this here](" + top.link + ")";
    }

    if (contextItems.length > 1) {
      var second = contextItems[1];
      if (second.title !== top.title) {
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
    msg.className = "ia-chat-message " + (role === "user" ? "user" : "bot");

    var bubble = document.createElement("div");
    bubble.className = "ia-chat-bubble";

    var safeText = String(text || "").split("\n").map(escapeHtml).join("<br>");
    
    // Fix markdown parsing so bolding works
    safeText = safeText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert markdown links [text](url) to clickable HTML anchor tags
    safeText = safeText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_parent" style="color: inherit; text-decoration: underline; font-weight: bold;">$1</a>');
    
    bubble.innerHTML = safeText;

    msg.appendChild(bubble);
    refs.messages.appendChild(msg);
    scrollToBottom();
  }

  function setTyping(isTyping) {
    if (!refs.typing) return;
    refs.typing.style.display = isTyping ? "block" : "none";
    if (isTyping) scrollToBottom();
  }

  function toggleOpen(forceOpen) {
    var shouldOpen = typeof forceOpen === "boolean" ? forceOpen : !state.isOpen;
    state.isOpen = shouldOpen;

    if (state.isOpen) {
      refs.panel.classList.add("open");
      refs.fab.classList.add("hidden");
      state.isMinimized = false;
      refs.panel.classList.remove("minimized");
      refs.input.focus();
      scrollToBottom();
    } else {
      refs.panel.classList.remove("open");
      refs.fab.classList.remove("hidden");
    }
  }

  function minimizeChat() {
    state.isMinimized = true;
    refs.panel.classList.add("minimized");
  }

  function restoreChat() {
    state.isMinimized = false;
    refs.panel.classList.remove("minimized");
    refs.input.focus();
    scrollToBottom();
  }

  function handleSend() {
    var text = refs.input.value.trim();
    if (!text) return;

    refs.input.value = "";
    appendMessage("user", text);
    
    // Trigger typing indicator
    setTyping(true);

    getAssistantReply(text)
      .then(function (reply) {
        // 1 second delay before replying
        setTimeout(function() {
          setTyping(false);
          appendMessage("bot", reply || UNKNOWN_INFO_REPLY);
        }, 1000);
      })
      .catch(function () {
        setTimeout(function() {
          setTyping(false);
          appendMessage("bot", UNKNOWN_INFO_REPLY);
        }, 1000);
      });
  }

  function injectStyles() {
    var style = document.createElement("style");
    style.id = "ia-chatbot-styles";
    style.textContent = ""
      + ":root {"
      + "--ia-chat-accent:#0171b9;" // Brand blue
      + "--ia-chat-accent-2:#012e4a;" // Brand dark blue
      + "--ia-chat-bg:#ffffff;"
      + "--ia-chat-surface:#f8fbfd;"
      + "--ia-chat-text:#012e4a;"
      + "--ia-chat-muted:#5b6870;"
      + "--ia-chat-shadow:0 18px 46px rgba(1,46,74,.18);"
      + "}"
      + ".ia-chatbot-root{position:fixed;right:18px;bottom:64px;z-index:9999;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;color:var(--ia-chat-text)}"
      + ".ia-chat-fab{width:56px;height:56px;border:none;border-radius:999px;background:linear-gradient(135deg,var(--ia-chat-accent),var(--ia-chat-accent-2));color:#fff;cursor:pointer;box-shadow:var(--ia-chat-shadow);display:grid;place-items:center;transition:transform .18s ease,opacity .18s ease}"
      + ".ia-chat-fab:hover{transform:translateY(-2px)}"
      + ".ia-chat-fab.hidden{opacity:0;pointer-events:none}"
      + ".ia-chat-panel{position:absolute;right:0;bottom:0;width:min(380px,calc(100vw - 24px));height:min(600px,calc(100vh - 24px));background:var(--ia-chat-bg);border-radius:18px;box-shadow:var(--ia-chat-shadow);display:none;flex-direction:column;overflow:hidden;border:1px solid rgba(1,46,74,.08)}"
      + ".ia-chat-panel.open{display:flex;animation:iaChatIn .18s ease-out}"
      + ".ia-chat-panel.minimized{height:62px}"
      + ".ia-chat-panel.minimized .ia-chat-messages,.ia-chat-panel.minimized .ia-chat-input-row,.ia-chat-panel.minimized .ia-chat-typing{display:none}"
      + ".ia-chat-header{height:62px;background:linear-gradient(135deg,#0171b9,#012e4a);color:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 14px}"
      + ".ia-chat-title{font-weight:600;font-size:14px;letter-spacing:.2px}"
      + ".ia-chat-actions{display:flex;gap:8px}"
      + ".ia-chat-action-btn{width:30px;height:30px;border:none;border-radius:8px;background:rgba(255,255,255,.16);color:#fff;cursor:pointer;display:grid;place-items:center;font-size:16px;line-height:1}"
      + ".ia-chat-messages{flex:1;overflow:auto;padding:14px 12px;background:linear-gradient(180deg,#f8fbfd 0%,#eef2f7 100%)}"
      + ".ia-chat-message{display:flex;margin-bottom:10px}"
      + ".ia-chat-message.user{justify-content:flex-end}"
      + ".ia-chat-message.bot{justify-content:flex-start}"
      + ".ia-chat-bubble{max-width:82%;padding:10px 12px;border-radius:14px;font-size:14px;line-height:1.4;word-wrap:break-word;white-space:normal}"
      + ".ia-chat-message.user .ia-chat-bubble{background:#0171b9;color:#fff;border-bottom-right-radius:6px}"
      + ".ia-chat-message.bot .ia-chat-bubble{background:#fff;color:#012e4a;border:1px solid rgba(1,46,74,.08);border-bottom-left-radius:6px}"
      + ".ia-chat-typing{display:none;padding:0 12px 8px;font-size:12px;color:var(--ia-chat-muted);background:linear-gradient(180deg,#f8fbfd 0%,#eef2f7 100%)}"
      + ".ia-chat-input-row{display:flex;gap:8px;align-items:center;padding:10px;border-top:1px solid rgba(1,46,74,.08);background:#fff}"
      + ".ia-chat-input{flex:1;border:1px solid rgba(1,46,74,.16);border-radius:999px;padding:10px 14px;font-size:14px;outline:none}"
      + ".ia-chat-input:focus{border-color:#0171b9;box-shadow:0 0 0 3px rgba(1,113,185,.14)}"
      + ".ia-chat-send{width:42px;height:42px;border:none;border-radius:999px;background:#0171b9;color:#fff;cursor:pointer;display:grid;place-items:center;font-size:16px}"
      + "@keyframes iaChatIn{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}"
      + "@media (max-width:640px){.ia-chatbot-root{right:10px;bottom:18px}.ia-chat-panel{width:calc(100vw - 20px);height:min(76vh,560px)}}";

    document.head.appendChild(style);
  }

  function buildUi() {
    var root = document.createElement("div");
    root.className = "ia-chatbot-root";

    var fab = document.createElement("button");
    fab.type = "button";
    fab.className = "ia-chat-fab";
    fab.setAttribute("aria-label", "Open IA Assistant");
    fab.innerHTML = "<span aria-hidden=\"true\">&#128172;</span>";

    var panel = document.createElement("section");
    panel.className = "ia-chat-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "IA Assistant Chat");

    var header = document.createElement("header");
    header.className = "ia-chat-header";
    header.innerHTML = ""
      + "<div class=\"ia-chat-title\">" + BOT_NAME + "</div>"
      + "<div class=\"ia-chat-actions\">"
      + "  <button type=\"button\" class=\"ia-chat-action-btn ia-chat-close\" aria-label=\"Close chat\">&#10005;</button>"
      + "</div>";

    var messages = document.createElement("div");
    messages.className = "ia-chat-messages";

    var typing = document.createElement("div");
    typing.className = "ia-chat-typing";
    typing.innerHTML = `<span style="font-style: italic;">${BOT_NAME} is typing...</span>`;

    var inputRow = document.createElement("div");
    inputRow.className = "ia-chat-input-row";
    inputRow.innerHTML = ""
      + "<input class=\"ia-chat-input\" type=\"text\" placeholder=\"Ask a question...\" aria-label=\"Message IA Assistant\">"
      + "<button type=\"button\" class=\"ia-chat-send\" aria-label=\"Send message\">&#10148;</button>";

    panel.appendChild(header);
    panel.appendChild(messages);
    panel.appendChild(typing);
    panel.appendChild(inputRow);

    root.appendChild(fab);
    root.appendChild(panel);
    document.body.appendChild(root);

    refs.root = root;
    refs.fab = fab;
    refs.panel = panel;
    refs.messages = messages;
    refs.typing = typing;
    refs.input = inputRow.querySelector(".ia-chat-input");
    refs.send = inputRow.querySelector(".ia-chat-send");
    refs.minimize = header.querySelector(".ia-chat-minimize");
    refs.close = header.querySelector(".ia-chat-close");
  }

  function bindEvents() {
    refs.fab.addEventListener("click", function () {
      toggleOpen(true);
    });

    refs.close.addEventListener("click", function () {
      toggleOpen(false);
    });

    refs.minimize.addEventListener("click", function () {
      if (state.isMinimized) {
        restoreChat();
      } else {
        minimizeChat();
      }
    });

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
    
    // Kick off the scanning
    scanHtmlPages();

    setTyping(true);
    setTimeout(function() {
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