const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const SHORT_CODE_LENGTH = 6;

// Generate random short code
function generateShortCode() {
    let code = "";
    for (let i = 0; i < SHORT_CODE_LENGTH; i++) {
        code += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
    }
    return code;
}

// Validate URL
function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Shorten URL
function shortenURL() {
    const longURL = document.getElementById("long-url").value.trim();
    const errorMsg = document.getElementById("error-message");

    // Clear error
    errorMsg.style.display = "none";
    errorMsg.textContent = "";

    if (!longURL) {
        errorMsg.textContent = "Please enter a URL";
        errorMsg.style.display = "block";
        return;
    }

    if (!isValidURL(longURL)) {
        errorMsg.textContent = "Please enter a valid URL (include https://)";
        errorMsg.style.display = "block";
        return;
    }

    // Generate short code
    let shortCode = generateShortCode();
    const urls = getURLs();

    // Make sure code is unique
    while (urls[shortCode]) {
        shortCode = generateShortCode();
    }

    // Save to storage
    urls[shortCode] = {
        long: longURL,
        short: shortCode,
        clicks: 0,
        created: new Date().toLocaleString()
    };
    localStorage.setItem("urls", JSON.stringify(urls));

    // Display result
    displayResult(shortCode, longURL);
    updateHistory();

    // Clear input
    document.getElementById("long-url").value = "";
}

// Display result
function displayResult(shortCode, longURL) {
    const shortURLDisplay = `${window.location.href.split('?')[0]}?s=${shortCode}`;
    
    document.getElementById("short-url-display").textContent = shortURLDisplay;
    document.getElementById("original-url-display").textContent = longURL;
    
    // Generate QR Code
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shortURLDisplay)}`;
    document.getElementById("qr-code").src = qrUrl;

    // Show result section
    document.getElementById("result-section").classList.add("active");

    // Update stats
    updateStats();
}

// Copy to clipboard
function copyToClipboard() {
    const shortURL = document.getElementById("short-url-display").textContent;
    navigator.clipboard.writeText(shortURL).then(() => {
        const btn = document.getElementById("copy-btn");
        btn.textContent = "Copied!";
        btn.classList.add("copied");
        setTimeout(() => {
            btn.textContent = "Copy";
            btn.classList.remove("copied");
        }, 2000);
    });
}

// Get all URLs from storage
function getURLs() {
    const stored = localStorage.getItem("urls");
    return stored ? JSON.parse(stored) : {};
}

// Update stats
function updateStats() {
    const urls = getURLs();
    const totalURLs = Object.keys(urls).length;
    const totalClicks = Object.values(urls).reduce((sum, url) => sum + url.clicks, 0);

    document.getElementById("total-urls").textContent = totalURLs;
    document.getElementById("total-clicks").textContent = totalClicks;
}

// Update history display
function updateHistory() {
    const urls = getURLs();
    const historyList = document.getElementById("history-list");

    if (Object.keys(urls).length === 0) {
        historyList.innerHTML = '<div class="empty-message">No shortened URLs yet. Create one to get started!</div>';
        return;
    }

    historyList.innerHTML = "";
    Object.values(urls).reverse().forEach(url => {
        const item = document.createElement("div");
        item.className = "history-item";
        item.innerHTML = `
            <div class="history-url">
                <div class="history-short">${window.location.href.split('?')[0]}?s=${url.short}</div>
                <div class="history-long">${url.long}</div>
                <div class="history-created">Created: ${url.created}</div>
            </div>
            <div class="history-clicks">${url.clicks} clicks</div>
            <button class="delete-btn" onclick="deleteURL('${url.short}')">Delete</button>
        `;
        historyList.appendChild(item);
    });

    updateStats();
}

// Delete URL
function deleteURL(shortCode) {
    const urls = getURLs();
    delete urls[shortCode];
    localStorage.setItem("urls", JSON.stringify(urls));
    updateHistory();
}

// Handle short URL redirect
function handleRedirect() {
    const params = new URLSearchParams(window.location.search);
    const shortCode = params.get("s");

    if (shortCode) {
        const urls = getURLs();
        if (urls[shortCode]) {
            urls[shortCode].clicks++;
            localStorage.setItem("urls", JSON.stringify(urls));
            window.location.href = urls[shortCode].long;
        } else {
            alert("Short link not found");
        }
    }
}

// Initialize on page load
window.addEventListener("load", () => {
    updateHistory();
    handleRedirect();
});

// Allow Enter key to shorten
document.getElementById("long-url").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        shortenURL();
    }
});
