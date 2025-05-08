document.addEventListener('DOMContentLoaded', () => {
    const screens = document.querySelectorAll('.screen');
    const initialScreen = document.getElementById('screen-initial');
    const cameraScreen = document.getElementById('screen-camera');
    const scanningScreen = document.getElementById('screen-scanning');
    const recommendationScreen = document.getElementById('screen-recommendation');
    const manualMoodScreen = document.getElementById('screen-manual-mood');

    const allowCameraBtn = document.getElementById('allow-camera-btn');
    const noPicInitialLink = document.getElementById('no-pic-initial-link');
    const noPicCameraLink = document.getElementById('no-pic-camera-link');


    const userVideo = document.getElementById('user-video');
    const videoPlaceholderImg = document.getElementById('video-placeholder-img');
    const photoCanvas = document.getElementById('photo-canvas');
    const scanPreviewImg = document.getElementById('scan-preview-img');
    const checkMoodBtn = document.getElementById('check-mood-btn');

    const recommendationIntro = document.getElementById('recommendation-intro');
    const movieTitleRecommendation = document.getElementById('movie-title-recommendation');
    const moviePoster = document.getElementById('movie-poster');
    const watchNowBtn = document.getElementById('watch-now-btn');
    const scanAgainBtn = document.getElementById('scan-again-btn');

    const moodOptionBtns = document.querySelectorAll('.mood-options .mood-btn');
    const thisIsMyMoodBtn = document.getElementById('this-is-my-mood-btn');

    const messageArea = document.getElementById('message-area');

    let currentStream = null;
    let selectedMoodByUser = null;
    const availableMoods = ["Happy", "Excited", "Neutral", "Angry", "Sad"];

    const movieDatabase = {
        Happy: {
            name: "Welcome",
            link: "https://www.primevideo.com/detail/0MJFLZHIV04F9V9V21RAY2Z8ZZ/",
            thumbnail: "https://m.media-amazon.com/images/S/pv-target-images/af13e1c59556eb143d2b213c9f95567677f409033d4c9619c553367d71bee982._SX1920_FMwebp_.jpg",
        },
        Sad: {
            name: "Call me Bae",
            link: "https://www.primevideo.com/detail/0TF2BODX83KZOWTP08NXFE897E/",
            thumbnail: "https://m.media-amazon.com/images/S/pv-target-images/0cb7ac74d1d6e8eb2e3d59aa5354359714eb54d84fcfaa616d9de19d64b492ca._SX1920_FMwebp_.jpg",
        },
        Excited: {
            name: "Citadel Honey Bunny",
            link: "https://www.primevideo.com/detail/0KYRVT4JDB957NXZO72E2MIFW5",
            thumbnail: "https://m.media-amazon.com/images/S/pv-target-images/51c2c75da778c109ccc33ff293ff48f0cccc60b18c3fef8a42afe2a80e07acac._SX1920_FMwebp_.jpg",
        },
        Neutral: {
            name: "Farzi",
            link: "https://www.primevideo.com/detail/0HDHQAUF5LPWOJRCO025LFJSJI",
            thumbnail: "https://m.media-amazon.com/images/S/pv-target-images/8aed532f0875925f72c4012aab688ed409773ecbfb3b18e1a39cd9ad1a4dd485._SX1920_FMwebp_.jpg",
        },
        Angry: {
            name: "Agneepath",
            link: "https://www.primevideo.com/detail/0NU7IFXPL2WWSDHNGAR5Z1GUJE/",
            thumbnail: "https://images-eu.ssl-images-amazon.com/images/S/pv-target-images/1863426056ae862def9a69ca76e8af54cdb6b8a5a2be1100e096e59b00060847._UX1920_.png",
        },
    };

    function showScreen(screenElement) {
        screens.forEach(s => s.classList.remove('active'));
        screenElement.classList.add('active');
        hideMessage();
    }

    function showMessage(text, isError = true) { 
       messageArea.textContent = text;
        messageArea.style.color = isError ? 'red' : '#004d00'; 
        messageArea.style.borderColor = isError ? 'red' : '#006400';
        messageArea.style.backgroundColor = isError ? 'rgba(255,0,0,0.1)' : 'rgba(144,238,144,0.2)';
        messageArea.style.display = 'block';
        setTimeout(hideMessage, 4000);
    }

    function hideMessage() {
        messageArea.style.display = 'none';
    }

    async function startCamera() {
        try {
            if (currentStream) {
                currentStream.getTracks().forEach(track => track.stop());
            }
            currentStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
            userVideo.srcObject = currentStream;
            userVideo.onloadedmetadata = () => {
                userVideo.classList.add('active'); // CSS will hide placeholder
                showScreen(cameraScreen);
            };
            userVideo.onplay = () => { // Additional check
                 userVideo.classList.add('active');
            };
        } catch (err) {
            console.error("Camera access denied or error:", err);
            showMessage("Camera access denied. Choose mood manually.", true);
            showScreen(manualMoodScreen);
        }
    }

    function stopCamera() {
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
            currentStream = null;
        }
        userVideo.srcObject = null;
        userVideo.classList.remove('active'); // Show placeholder again if needed
    }

    function capturePhoto() {
        if (!userVideo.srcObject || userVideo.videoWidth === 0 || userVideo.videoHeight === 0) {
            console.error("Video stream not ready or no dimensions.");
            showMessage("Error capturing photo. Please try again or select mood manually.", true);
            showScreen(cameraScreen);
            return null;
        }
        const context = photoCanvas.getContext('2d');
        photoCanvas.width = userVideo.videoWidth;
        photoCanvas.height = userVideo.videoHeight;
        context.drawImage(userVideo, 0, 0, photoCanvas.width, photoCanvas.height);
        
        const dataUrl = photoCanvas.toDataURL('image/jpeg', 0.8);
        scanPreviewImg.src = dataUrl; // For the scanning screen preview
        return dataUrl;
    }

    async function getMoodFromOpenAI_API_SIMULATION(imageDataUrl) {
        console.log("Simulating OpenAI API call with image data (not actually sending)");
        return new Promise(resolve => {
            setTimeout(() => {
                const randomIndex = Math.floor(Math.random() * availableMoods.length);
                let mood = availableMoods[randomIndex];
                if (Math.random() < 0.1) mood = "Confused"; // Simulate unrecognized
                console.log("Simulated mood detected:", mood);
                resolve(mood);
            }, 2500); // Simulate API latency + scan animation time
        });
    }

    function resolveMood(detectedMood) {
        if (availableMoods.includes(detectedMood)) {
            return detectedMood;
        }
        console.warn(`Detected mood "${detectedMood}" not in available list. Defaulting to Neutral.`);
        return "Neutral";
    }

    function displayRecommendation(mood) {
        const movie = movieDatabase[mood];
        if (movie) {
            recommendationIntro.innerHTML = `Hey! You're in a <span class="detected-mood-highlight">${mood}</span> mood and we got stories to match!`;
            movieTitleRecommendation.textContent = movie.name;
            moviePoster.src = movie.thumbnail;
            moviePoster.alt = movie.name + " Poster";
            watchNowBtn.href = movie.link;
        } else {
            console.error("No movie found for mood:", mood, ". Defaulting to Neutral.");
            const neutralMovie = movieDatabase["Neutral"]; // Explicitly get Neutral
            recommendationIntro.innerHTML = `We found you in a <span class="detected-mood-highlight">Neutral</span> mood. Here's a great choice:`;
            if (neutralMovie) {
                movieTitleRecommendation.textContent = neutralMovie.name;
                moviePoster.src = neutralMovie.thumbnail;
                moviePoster.alt = neutralMovie.name + " Poster";
                watchNowBtn.href = neutralMovie.link;
            } else {
                 recommendationIntro.textContent = "Error finding a movie recommendation.";
                 movieTitleRecommendation.textContent = "Try again later";
                 moviePoster.src = "https://via.placeholder.com/200x300/FF0000/FFFFFF?Text=Error";
            }
        }
        showScreen(recommendationScreen);
        stopCamera();
    }

    allowCameraBtn.addEventListener('click', startCamera);

    const goToManualMoodScreen = (e) => {
        if(e) e.preventDefault();
        stopCamera();
        showScreen(manualMoodScreen);
    };

    noPicInitialLink.addEventListener('click', goToManualMoodScreen);
    noPicCameraLink.addEventListener('click', goToManualMoodScreen);

    checkMoodBtn.addEventListener('click', async () => {
        const imageDataUrl = capturePhoto();
        if (!imageDataUrl) return;

        showScreen(scanningScreen);
        const detectedMood = await getMoodFromOpenAI_API_SIMULATION(imageDataUrl);
        const finalMood = resolveMood(detectedMood);
        displayRecommendation(finalMood);
    });

    scanAgainBtn.addEventListener('click', () => {
        selectedMoodByUser = null;
        moodOptionBtns.forEach(btn => btn.classList.remove('selected'));
        thisIsMyMoodBtn.disabled = true;
        showScreen(initialScreen); 
    });

    moodOptionBtns.forEach(button => {
        button.addEventListener('click', () => {
            moodOptionBtns.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            selectedMoodByUser = button.dataset.mood;
            thisIsMyMoodBtn.disabled = false;
        });
    });

    thisIsMyMoodBtn.addEventListener('click', () => {
        if (selectedMoodByUser) {
            displayRecommendation(selectedMoodByUser);
        }
    });

    showScreen(initialScreen);
});