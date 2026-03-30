// search-init.js
document.addEventListener("DOMContentLoaded", () => {
  const placeholder = document.getElementById('search-bar-placeholder');
  
  if (placeholder) {
    // Inject the HTML structure once
    placeholder.innerHTML = `
      <div class="search-container">
        <div class="search-wrapper">
          <input type="text" id="liveSearchInput" placeholder="Search for 'Cloud', 'Security'..." autocomplete="off">
          <div class="search-icon"><i class="fas fa-search"></i></div>
        </div>
      </div>
    `;
    
    // Initialize the logic
    initSearchLogic();
  }
});

function initSearchLogic() {
  const input = document.getElementById('liveSearchInput');
  input.addEventListener('keyup', (e) => {
    const term = e.target.value.toLowerCase();
    // Your existing search filtering logic goes here
    console.log("Searching for:", term);
  });
}