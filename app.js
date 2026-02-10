// Configuration
const API_CHANNELS = 'https://iptv-org.github.io/api/channels.json';
const API_STREAMS = 'https://iptv-org.github.io/api/streams.json';

// State
let channels = [];
let streams = [];
let categories = new Set();
let favorites = new Set();
let currentChannel = null;
let currentCategory = 'favorites';
let hls = null;

// DOM Elements
const categoriesList = document.getElementById('categoriesList');
const channelsList = document.getElementById('channelsList');
const videoPlayer = document.getElementById('videoPlayer');
const playerOverlay = document.getElementById('playerOverlay');
const nowPlaying = document.getElementById('nowPlaying');
const qualityInfo = document.getElementById('qualityInfo');
const qualitySelector = document.getElementById('qualitySelector');
const qualityModal = document.getElementById('qualityModal');
const qualityOptions = document.getElementById('qualityOptions');
const closeModal = document.getElementById('closeModal');
const searchInput = document.getElementById('searchInput');
const channelsPanelTitle = document.getElementById('channelsPanelTitle');

// Initialize
async function init() {
    loadFavorites();
    await loadData();
    renderCategories();
    renderChannels(currentCategory);
    setupEventListeners();
}

// Load IPTV data
async function loadData() {
    try {
        playerOverlay.querySelector('.player-message').textContent = 'Loading channels...';
        
        const [channelsRes, streamsRes] = await Promise.all([
            fetch(API_CHANNELS),
            fetch(API_STREAMS)
        ]);
        
        channels = await channelsRes.json();
        streams = await streamsRes.json();
        
        // Filter only HLS streams
        streams = streams.filter(s => s.url && s.url.includes('.m3u8'));
        
        // Extract categories
        channels.forEach(channel => {
            if (channel.categories && channel.categories.length > 0) {
                channel.categories.forEach(cat => categories.add(cat));
            }
        });
        
        playerOverlay.querySelector('.player-message').textContent = 'Select a channel to start playing';
        
    } catch (error) {
        console.error('Error loading data:', error);
        playerOverlay.querySelector('.player-message').textContent = 'Error loading channels';
    }

    // Update header stats
    document.getElementById('channelCount').textContent = channels.length;
    document.getElementById('categoryCount').textContent = categories.size;
    
}

// Render categories
function renderCategories() {
    const favItem = categoriesList.querySelector('[data-category="favorites"]');
    categoriesList.innerHTML = '';
    categoriesList.appendChild(favItem);
    
    Array.from(categories).sort().forEach(category => {
        const div = document.createElement('div');
        div.className = 'category-item';
        div.dataset.category = category;
        div.textContent = category;
        div.addEventListener('click', () => selectCategory(category));
        categoriesList.appendChild(div);
    });
}

// Select category
function selectCategory(category) {
    currentCategory = category;
    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    renderChannels(category);
}

// Render channels
function renderChannels(category) {
    channelsList.innerHTML = '';
    channelsPanelTitle.textContent = category === 'favorites' ? 'Favorites' : category;
    
    let filteredChannels = [];
    
    if (category === 'favorites') {
        filteredChannels = channels.filter(ch => favorites.has(ch.id));
    } else {
        filteredChannels = channels.filter(ch => 
            ch.categories && ch.categories.includes(category)
        );
    }
    
    if (filteredChannels.length === 0) {
        const div = document.createElement('div');
        div.className = 'channel-item';
        div.innerHTML = '<span class="channel-name" style="color: #888;">No channels available</span>';
        channelsList.appendChild(div);
        return;
    }
    
    filteredChannels.forEach(channel => {
        const div = document.createElement('div');
        div.className = 'channel-item';
        div.dataset.channelId = channel.id;
        
        const isFavorite = favorites.has(channel.id);
        
        div.innerHTML = `
            <span class="channel-name">${channel.name}</span>
            <span class="favorite-star ${isFavorite ? 'active' : ''}" data-channel-id="${channel.id}">⭐</span>
        `;
        
        div.querySelector('.channel-name').addEventListener('click', () => playChannel(channel));
        div.querySelector('.favorite-star').addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(channel.id);
        });
        
        channelsList.appendChild(div);
    });
}

// Search channels
function searchChannels(query) {
    channelsList.innerHTML = '';
    channelsPanelTitle.textContent = `Search: "${query}"`;
    
    const filteredChannels = channels.filter(ch => 
        ch.name.toLowerCase().includes(query.toLowerCase())
    );
    
    if (filteredChannels.length === 0) {
        const div = document.createElement('div');
        div.className = 'channel-item';
        div.innerHTML = '<span class="channel-name" style="color: #888;">No results found</span>';
        channelsList.appendChild(div);
        return;
    }
    
    filteredChannels.forEach(channel => {
        const div = document.createElement('div');
        div.className = 'channel-item';
        div.dataset.channelId = channel.id;
        
        const isFavorite = favorites.has(channel.id);
        
        div.innerHTML = `
            <span class="channel-name">${channel.name}</span>
            <span class="favorite-star ${isFavorite ? 'active' : ''}" data-channel-id="${channel.id}">⭐</span>
        `;
        
        div.querySelector('.channel-name').addEventListener('click', () => playChannel(channel));
        div.querySelector('.favorite-star').addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(channel.id);
        });
        
        channelsList.appendChild(div);
    });
}

// Play channel
function playChannel(channel) {
    const stream = streams.find(s => s.channel === channel.id);
    
    if (!stream) {
        alert('No stream available for this channel');
        return;
    }
    
    currentChannel = channel;
    
    // Update UI
    document.querySelectorAll('.channel-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-channel-id="${channel.id}"]`)?.classList.add('active');
    
    nowPlaying.textContent = `Now Playing: ${channel.name}`;
    playerOverlay.classList.add('hidden');
    
    // Load stream
    loadStream(stream.url);
}

// Load HLS stream
function loadStream(url) {
    if (hls) {
        hls.destroy();
    }
    
    if (Hls.isSupported()) {
        hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 90,
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
        });
        
        hls.loadSource(url);
        hls.attachMedia(videoPlayer);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            videoPlayer.play();
            updateQualityInfo();
        });
        
        hls.on(Hls.Events.LEVEL_SWITCHED, () => {
            updateQualityInfo();
        });
        
        hls.on(Hls.Events.ERROR, (event, data) => {
            console.error('HLS Error:', data);
            if (data.fatal) {
                handleError(data);
            }
        });
        
    } else if (videoPlayer.canPlayType('application/vnd.apple.mpegurl')) {
        videoPlayer.src = url;
        videoPlayer.addEventListener('loadedmetadata', () => {
            videoPlayer.play();
        });
    } else {
        alert('HLS not supported in this browser');
    }
}

// Handle errors
function handleError(data) {
    switch (data.type) {
        case Hls.ErrorTypes.NETWORK_ERROR:
            console.log('Network error, trying to recover...');
            hls.startLoad();
            break;
        case Hls.ErrorTypes.MEDIA_ERROR:
            console.log('Media error, trying to recover...');
            hls.recoverMediaError();
            break;
        default:
            console.log('Fatal error, cannot recover');
            playerOverlay.classList.remove('hidden');
            playerOverlay.querySelector('.player-message').textContent = 'Playback error';
            break;
    }
}

// Update quality info
// Update quality info
function updateQualityInfo() {
    if (!hls) return;
    
    const currentLevel = hls.currentLevel;
    const autoLevel = hls.autoLevelEnabled;
    
    const qualityBadge = qualityInfo.querySelector('.quality-badge');
    const resolution = qualityInfo.querySelector('.resolution');
    
    if (currentLevel >= 0 && hls.levels[currentLevel]) {
        const level = hls.levels[currentLevel];
        const height = level.height;
        
        qualityBadge.textContent = autoLevel ? 'Auto' : `${height}p`;
        resolution.textContent = `${height}p`;
    } else {
        qualityBadge.textContent = 'Auto';
        resolution.textContent = '-';
    }
}

// Show quality selector
function showQualitySelector() {
    if (!hls || !hls.levels || hls.levels.length === 0) {
        return;
    }
    
    qualityOptions.innerHTML = '';
    
    // Auto option
    const autoDiv = document.createElement('div');
    autoDiv.className = 'quality-option' + (hls.autoLevelEnabled ? ' active' : '');
    autoDiv.innerHTML = `
        <span>Auto</span>
        <span class="quality-badge">Adaptive</span>
    `;
    autoDiv.addEventListener('click', () => {
        hls.currentLevel = -1;
        qualityModal.classList.remove('show');
        updateQualityInfo();
    });
    qualityOptions.appendChild(autoDiv);
    
    // Manual quality options
    const uniqueLevels = [];
    const seenHeights = new Set();
    
    hls.levels.forEach((level, index) => {
        if (!seenHeights.has(level.height)) {
            seenHeights.add(level.height);
            uniqueLevels.push({ level, index });
        }
    });
    
    uniqueLevels.sort((a, b) => b.level.height - a.level.height).forEach(({ level, index }) => {
        const div = document.createElement('div');
        div.className = 'quality-option' + (hls.currentLevel === index && !hls.autoLevelEnabled ? ' active' : '');
        div.innerHTML = `
            <span>${level.height}p</span>
            <span class="quality-badge-modal">${Math.round(level.bitrate / 1000)} kbps</span>
        `;
        div.addEventListener('click', () => {
            hls.currentLevel = index;
            qualityModal.classList.remove('show');
            updateQualityInfo();
        });
        qualityOptions.appendChild(div);
    });
    
    qualityModal.classList.add('show');
}

// Toggle favorite
function toggleFavorite(channelId) {
    if (favorites.has(channelId)) {
        favorites.delete(channelId);
    } else {
        favorites.add(channelId);
    }
    
    saveFavorites();
    
    // Update star icon
    document.querySelectorAll(`.favorite-star[data-channel-id="${channelId}"]`).forEach(star => {
        star.classList.toggle('active');
    });
    
    // Refresh if in favorites view
    if (currentCategory === 'favorites') {
        renderChannels('favorites');
    }
}

// Save favorites to localStorage
function saveFavorites() {
    localStorage.setItem('mmb-favorites', JSON.stringify([...favorites]));
}

// Load favorites from localStorage
function loadFavorites() {
    const saved = localStorage.getItem('mmb-favorites');
    if (saved) {
        favorites = new Set(JSON.parse(saved));
    }
}

// Setup event listeners
function setupEventListeners() {
    // Quality selector
    qualitySelector.addEventListener('click', showQualitySelector);
    
    // Close modal
    closeModal.addEventListener('click', () => {
        qualityModal.classList.remove('show');
    });
    
    qualityModal.addEventListener('click', (e) => {
        if (e.target === qualityModal) {
            qualityModal.classList.remove('show');
        }
    });
    
    // Search
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                searchChannels(query);
            } else {
                renderChannels(currentCategory);
            }
        }
    });
    
    // Fullscreen toggle
    videoPlayer.addEventListener('click', () => {
        toggleFullscreen();
    });
    
    // Favorites category
    document.querySelector('[data-category="favorites"]').addEventListener('click', () => {
        selectCategory('favorites');
    });
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            }
            qualityModal.classList.remove('show');
        }
    });
}

// Toggle fullscreen
function toggleFullscreen() {
    const playerPanel = document.querySelector('.player-panel');
    
    if (!document.fullscreenElement) {
        playerPanel.requestFullscreen().catch(err => {
            console.error('Error entering fullscreen:', err);
        });
    } else {
        document.exitFullscreen();
    }
}

// Initialize app
init();
