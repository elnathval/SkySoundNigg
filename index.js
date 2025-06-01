// --- DOM element references ---
const openUploadMenu = document.getElementById("openUploadMenu");
const toggleOverlay = document.getElementById("toggleOverlay");
const closeUploadMenu = document.getElementById("closeUploadMenu");
const dropzone = document.getElementById("dropzone");
const audioInput = document.getElementById("audioInput");
const dropzoneText = document.getElementById("dropzoneText");
const imageDropzone = document.getElementById("imageDropzone");
const imageInput = document.getElementById("imageInput");
const imageDropzoneText = document.getElementById("imageDropzoneText");
const uploadSong = document.getElementById("uploadSong");
const authorInput = document.getElementById("authorInput");
const nameInput = document.getElementById("nameInput");
const songsList = document.getElementById("songsList");
const playerBar = document.getElementById("playerBar");
const playerCover = document.getElementById("playerCover");
const playerSongName = document.getElementById("playerSongName");
const playerSongAuthor = document.getElementById("playerSongAuthor");
const playerPlayButton = document.getElementById("playerPlayButton");
const playerPlayIcon = document.getElementById("playerPlayIcon");
const playerPauseIcon = document.getElementById("playerPauseIcon");
const playerAudio = document.getElementById("playerAudio");
const playerTimeBar = document.getElementById("playerTimeBar");
const playerCurrentTime = document.getElementById("playerCurrentTime");
const playerDuration = document.getElementById("playerDuration");
const playerVolume = document.getElementById("playerVolume");
const playerVolumePercentage = document.getElementById("playerVolumePercentage");
let coverDataUrl = null;
let currentSongCard = null;
let currentSongplayButton = null;
let currentSongPlayIcon = null;
let currentSongPauseIcon = null;

// --- Overlay open/close logic ---
openUploadMenu.addEventListener("click", () => {
    toggleOverlay.classList.add("active");
});
closeUploadMenu.addEventListener("click", () => {
    toggleOverlay.classList.remove("active");
});

// --- Audio file dropzone logic ---
dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
});
dropzone.addEventListener("dragleave", (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
});
dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        audioInput.files = files;
        dropzoneText.textContent = files[0].name;
    }
});
dropzone.addEventListener("click", () => {
    audioInput.click();
});
audioInput.addEventListener("change", () => {
    if (audioInput.files.length > 0) {
        dropzoneText.textContent = audioInput.files[0].name;
    } else {
        dropzoneText.textContent = "Drop an audio file here";
    }
});

// --- Image file dropzone logic ---
imageDropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    imageDropzone.classList.add("dragover");
});
imageDropzone.addEventListener("dragleave", (e) => {
    e.preventDefault();
    imageDropzone.classList.remove("dragover");
});
imageDropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    imageDropzone.classList.remove("dragover");
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith("image/")) {
        handleImageFile(files[0]);
        imageInput.files = files;
    }
});
imageDropzone.addEventListener("click", () => {
    imageInput.click();
});
imageInput.addEventListener("change", () => {
    if (imageInput.files.length > 0) {
        handleImageFile(imageInput.files[0]);
    } else {
        resetImageDropzone();
    }
});

// --- Image file processing and preview ---
function handleImageFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new window.Image();
        img.onload = function() {
            const size = Math.min(img.width, img.height);
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            // Crop to square and compress
            ctx.drawImage(
                img,
                (img.width - size) / 2,
                (img.height - size) / 2,
                size,
                size,
                0,
                0,
                size,
                size
            );
            let quality = 0.92;
            let dataUrl = canvas.toDataURL('image/jpeg', quality);
            let byteString = atob(dataUrl.split(',')[1]);
            let byteLength = byteString.length;
            while (byteLength > 500 * 1024 && quality > 0.1) {
                quality -= 0.05;
                dataUrl = canvas.toDataURL('image/jpeg', quality);
                byteString = atob(dataUrl.split(',')[1]);
                byteLength = byteString.length;
            }
            coverDataUrl = dataUrl;
            showImagePreview(dataUrl);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}
function showImagePreview(dataUrl) {
    imageDropzoneText.style.display = "none";
    let img = document.getElementById("imagePreview");
    if (!img) {
        img = document.createElement("img");
        img.id = "imagePreview";
        imageDropzone.appendChild(img);
    }
    img.src = dataUrl;
    img.style.display = "block";
}
function resetImageDropzone() {
    imageDropzoneText.style.display = "";
    const img = document.getElementById("imagePreview");
    if (img) {
        img.remove();
    }
    coverDataUrl = null;
}

// --- Upload song logic ---
uploadSong.addEventListener("click", () => {
    const author = authorInput.value.trim();
    const name = nameInput.value.trim();
    const audioFile = audioInput.files[0];
    const cover = coverDataUrl;

    // Validate all fields
    if (!author || !name || !audioFile || !cover) {
        alert("Please provide the song's audio file, author, name, and cover image.");
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        const audioFile = e.target.result;
        addSongToList({
            audioFile,
            author,
            name,
            cover
        });
        // Reset form
        authorInput.value = "";
        nameInput.value = "";
        audioInput.value = "";
        dropzoneText.textContent = "Drop an audio file here";
        resetImageDropzone();
        toggleOverlay.classList.remove("active");
    };
    reader.readAsDataURL(audioFile);
});

// --- Add a new song card to the list ---
function addSongToList({ cover, author, name, audioFile }) {
    const card = document.createElement("div");
    card.className = "song-card";
    card.innerHTML = `
        <img class="song-cover" src="${cover}" alt="Cover">
        <div class="song-info">
            <div class="song-author">${author}</div>
            <div class="song-name">${name}</div>
        </div>
        <button class="song-play" title="Play">
            <svg class="song-play-icon" viewBox="0 0 24 24">
                <polygon points="6,4 20,12 6,20" />
            </svg>
            <!-- Pause icon SVG for the song card -->
            <svg class="song-pause-icon" viewBox="0 0 24 24" style="display:none;">
                <rect x="6" y="4" width="4" height="16"/>
                <rect x="14" y="4" width="4" height="16"/>
            </svg>
        </button>
        <audio style="display:none" src="${audioFile}"></audio>
    `;
    const playButton = card.querySelector('.song-play');
    const playIcon = card.querySelector('.song-play-icon');
    const pauseIcon = card.querySelector('.song-pause-icon');
    playButton.addEventListener('click', () => {
        // If this card is already playing, toggle play/pause
        if (currentSongCard === card) {
            if (playerAudio.paused) {
                playerAudio.play();
            } else {
                playerAudio.pause();
            }
        } else {
            // Otherwise, load this song into the player bar
            showPlayerBar({
                cover,
                author,
                name,
                audioFile
            }, card, playButton, playIcon, pauseIcon);
            playerAudio.play();
        }
    });
    songsList.prepend(card);
}

// --- Show the player bar and load a song ---
function showPlayerBar({ cover, author, name, audioFile }, card = null, playButton = null, playIcon = null, pauseIcon = null) {
    playerBar.style.display = "flex";
    playerCover.src = cover;
    playerSongName.textContent = name;
    playerSongAuthor.textContent = author;
    playerAudio.src = audioFile;
    playerAudio.currentTime = 0;
    playerAudio.volume = playerVolume.value;
    playerAudio.pause();
    updatePlayerTime();
    updatePlayPauseBtn();
    currentSongCard = card;
    currentSongplayButton = playButton;
    currentSongPlayIcon = playIcon;
    currentSongPauseIcon = pauseIcon;
    updateSongCardPlayPauseBtn();
}

// --- Player bar play/pause button logic ---
playerPlayButton.addEventListener("click", () => {
    if (playerAudio.paused) {
        playerAudio.play();
    } else {
        playerAudio.pause();
    }
    updateSongCardPlayPauseBtn();
});
playerAudio.addEventListener("play", () => {
    updatePlayPauseBtn();
    updateSongCardPlayPauseBtn();
});
playerAudio.addEventListener("pause", () => {
    updatePlayPauseBtn();
    updateSongCardPlayPauseBtn();
});

// --- Update play/pause icons in player bar ---
function updatePlayPauseBtn() {
    if (playerAudio.paused) {
        playerPlayIcon.style.display = "";
        playerPauseIcon.style.display = "none";
    } else {
        playerPlayIcon.style.display = "none";
        playerPauseIcon.style.display = "";
    }
}

// --- Update play/pause icons in song cards ---
function updateSongCardPlayPauseBtn() {
    document.querySelectorAll('.song-card').forEach(card => {
        const playIcon = card.querySelector('.song-play-icon');
        const pauseIcon = card.querySelector('.song-pause-icon');
        if (playIcon && pauseIcon) {
            playIcon.style.display = "";
            pauseIcon.style.display = "none";
        }
    });
    if (currentSongCard && currentSongplayButton) {
        const playIcon = currentSongCard.querySelector('.song-play-icon');
        const pauseIcon = currentSongCard.querySelector('.song-pause-icon');
        if (playerAudio.paused) {
            playIcon.style.display = "";
            pauseIcon.style.display = "none";
        } else {
            playIcon.style.display = "none";
            pauseIcon.style.display = "";
        }
    }
}

// --- Player timeline and slider logic ---
playerAudio.addEventListener("timeupdate", updatePlayerTime);
playerAudio.addEventListener("loadedmetadata", updatePlayerTime);
playerTimeBar.addEventListener("input", () => {
    playerAudio.currentTime = (playerTimeBar.value / 100) * playerAudio.duration;
    setSliderFill(playerTimeBar);
});
playerAudio.addEventListener("timeupdate", () => {
    if (!isNaN(playerAudio.duration)) {
        playerTimeBar.value = (playerAudio.currentTime / playerAudio.duration) * 100;
        setSliderFill(playerTimeBar);
    }
});
function updatePlayerTime() {
    playerCurrentTime.textContent = formatTime(playerAudio.currentTime);
    playerDuration.textContent = isNaN(playerAudio.duration) ? "0:00" : formatTime(playerAudio.duration);
    if (!isNaN(playerAudio.duration)) {
        playerTimeBar.value = (playerAudio.currentTime / playerAudio.duration) * 100;
    } else {
        playerTimeBar.value = 0;
    }
    setSliderFill(playerTimeBar);
}
function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

// --- Volume slider logic ---
playerVolume.addEventListener("input", () => {
    playerAudio.volume = playerVolume.value;
    setSliderFill(playerVolume);
    const p = Math.round(playerVolume.value * 100);
    playerVolumePercentage.textContent = `${p}%`;
});
playerVolume.addEventListener("change", () => setSliderFill(playerVolume));

// --- Slider fill effect for both time and volume sliders ---
function setSliderFill(slider) {
    const min = parseFloat(slider.min) || 0;
    const max = parseFloat(slider.max) || 100;
    const val = parseFloat(slider.value);
    const percent = ((val - min) / (max - min)) * 100;
    const color = getComputedStyle(document.documentElement).getPropertyValue('--color-heading').trim();
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--color-slider').trim();
    slider.style.background = `linear-gradient(to right, ${color} 0%, ${color} ${percent}%, ${bg} ${percent}%, ${bg} 100%)`;
}
setSliderFill(playerTimeBar);
setSliderFill(playerVolume);

// --- Pause audio on page unload ---
window.addEventListener("beforeunload", () => {
    playerAudio.pause();
});