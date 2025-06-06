// Convert scrollY -> a fraction in [0..1]
let scrollFraction = 0;
let atBottom = false;
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
let scrollText = null;
const navbarTitle = document.getElementById("navbar-title");
const modalTitle = document.getElementById("modal-title");
let mouseX = 0;
let mouseY = 0;
let blockScrollToBottom = false;
let controlsOverlay = null;

// Initialize elements when DOM is ready
function initializeElements() {
    scrollText = document.getElementById('scroll-text-container');
    controlsOverlay = document.getElementById('controls-overlay');
    
    if (!isMobile && scrollText) {
        scrollText.style.position = 'fixed';
        scrollText.style.width = 'initial';
        document.body.appendChild(scrollText)
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            // Update text position with smooth transitions
            if (scrollText) {
                scrollText.style.left = `${mouseX + 30}px`;
                scrollText.style.top = `${mouseY + 30}px`;
            }
        });
    }
}

// Paragraph animation observer
function setupParagraphAnimations() {
    const paragraphs = document.querySelectorAll('.slow-fade-in');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in-up');
            } else if (entry.intersectionRatio < 0.01) { // When less than 1% visible
                entry.target.classList.remove('animate-fade-in-up');
            }
        });
    }, {
        threshold: [0.01, 0.2], // Track visibility at 10% and 20%
        rootMargin: '0px 0px -100px 0px' // Adjust trigger point
    });

    paragraphs.forEach(p => {
        observer.observe(p);
    });
}

// Modal functionality
const modalOverlay = document.querySelector('.modal-overlay');
const closeButton = document.getElementById('close-modal-button');
const ctaSection = document.querySelector('.cta-section');
const fullStoryButton = document.getElementById('full-story-btn');
if (!isMobile) {
    fullStoryButton.style.opacity = '1';
    fullStoryButton.style.zIndex = '1';
}
let isModalOpen = false;
let scrollHandler = null;

// Open modal
fullStoryButton.addEventListener('click', () => {
    modalOverlay.style.height = "100%";
    document.body.style.overflow = 'hidden';
    isModalOpen = true;

    // Remove scroll handler while modal is open
    if (scrollHandler) {
        window.removeEventListener('scroll', scrollHandler);
    }

    // Setup paragraph animations
    setupParagraphAnimations();
});

// Close modal
function closeModal() {
    modalOverlay.style.height = "0%";
    document.body.style.overflow = '';
    isModalOpen = false;

    // Re-enable scroll handler
    if (scrollHandler) {
        window.addEventListener('scroll', scrollHandler);
    }
}

closeButton.addEventListener('click', closeModal);

// CTA click handler
ctaSection.addEventListener('click', () => {
    closeModal();
    setTimeout(scrollToBottom, 100);
});

modalTitle.addEventListener('click', () => {
    closeModal();
    scrollToTop();
});

let galleryId = null;

function initScrollingAnimationFollowing() {
    navbarTitle.addEventListener('click', () => scrollToTop());

    // Set isMobile here instead of in initializeGallery
    const title = document.querySelector('.untamed-title');
    const slide1 = document.querySelector('.slide-1');
    const canvas = document.getElementById('threejs-canvas');

    scrollHandler = () => {
        if (!isModalOpen) {
            updateAnimationTime(title, slide1, canvas);
        }
    };

    // Check if we're at the top of the page
    if (window.scrollY === 0) {
        // Set initial animations
        title.style.animation = 'title-appear 2s ease-in-out forwards';

        // Wait for animations to complete before enabling scroll control
        Promise.all([
            new Promise(resolve => title.addEventListener('animationend', resolve, { once: true })),
        ]).then(() => {
            // Set up scroll-controlled animations
            title.style.animation = 'scroll-title 1s linear paused';
            window.addEventListener('scroll', scrollHandler);
        });
    } else {
        // If not at top, set up scroll control immediately
        title.style.animation = 'scroll-title 1s linear paused';
        window.addEventListener('scroll', scrollHandler);
    }
    updateAnimationTime(title, slide1, canvas);
    setInterval(scrollHandler, 100);
};

if (document.readyState !== 'loading') {
    initScrollingAnimationFollowing();
} else {
    document.addEventListener('DOMContentLoaded', initScrollingAnimationFollowing);
}

function blockScrollingToBottom() {
    blockScrollToBottom = true;
    setTimeout(() => blockScrollToBottom = false, 1000);
}

function scrollToBottom() {
    if (blockScrollToBottom) return;
    console.log("Scroll to bottom")
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            const scrollTarget = document.documentElement.scrollHeight - window.innerHeight;
            window.scrollTo({
                top: scrollTarget,
                behavior: 'smooth'
            });
        }, 50 * i)
    }
    blockScrollingToBottom();
}

function scrollToTop() {
    blockScrollingToBottom();
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function scrollOutsideOfGallery() {
    blockScrollingToBottom();
    console.log("Scroll outside")
    const scrollTarget = (document.documentElement.scrollHeight * 0.5);
    window.scrollTo({
        top: scrollTarget,
        behavior: 'smooth'
    });
}

// Initialize music player
const music = document.getElementById('background-music');
const musicToggle = document.getElementById('music-toggle');
const musicIcon = document.getElementById('music-icon');

// Set initial volume
music.volume = 0.5;

// Try to play music immediately and after user interaction
let musicStarted = false;
const tryPlayMusic = () => {
    if (!musicStarted && music.paused) {
        music.play().then(() => {
            musicStarted = true;
            console.log('Music started playing');
        }).catch(err => {
            // Silently handle autoplay prevention
            console.log('Music autoplay prevented, waiting for user interaction');
        });
    }
};

// Try to play immediately when page loads
window.addEventListener('load', () => {
    tryPlayMusic();
});

// Also try on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    tryPlayMusic();
});

// Keep trying every second for the first 5 seconds
let attempts = 0;
const autoplayInterval = setInterval(() => {
    attempts++;
    tryPlayMusic();
    if (musicStarted || attempts > 5) {
        clearInterval(autoplayInterval);
    }
}, 1000);

// Still keep the user interaction fallbacks as backup
document.addEventListener('click', tryPlayMusic, { once: true });
document.addEventListener('scroll', tryPlayMusic, { once: true });
document.addEventListener('touchstart', tryPlayMusic, { once: true });

// Toggle mute/unmute
musicToggle.addEventListener('click', () => {
    if (!musicStarted) {
        tryPlayMusic();
    }
    music.muted = !music.muted;
    musicIcon.src = music.muted ?
        'Untamed - A journey through love and the open road_files/speaker.svg' :
        'Untamed - A journey through love and the open road_files/speaker.svg';
});

const galleryScript = document.createElement('script');
galleryScript.src = isMobile ? 'Untamed - A journey through love and the open road_files/mobile-gallery.js' : 'Untamed - A journey through love and the open road_files/desktop-gallery.js';
galleryScript.async = true;
document.body.appendChild(galleryScript);

function updateAnimationTime(title, slide1, canvas) {
    // Current scroll from top
    const scrollY = window.scrollY;

    // Max scroll is (entire page height) - (window height)
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    // Convert scrollY -> a fraction in [0..1]
    scrollFraction = scrollY / maxScroll;

    if (scrollFraction > 0.75 && scrollFraction < 1 && !atBottom) {
        scrollToBottom();
    }

    if (scrollFraction < 0.7) {
        atBottom = false;
    }

    // Handle visibility based on scrollFraction
    if (scrollFraction >= 0.999) {
        title.style.display = 'none';
        slide1.style.display = 'none';
        navbarTitle.style.zIndex = '1';
        navbarTitle.style.opacity = '1';
        canvas.style.filter = 'blur(0)';
        canvas.style.zIndex = '0';
        if (isMobile) {
            canvas.style.opacity = '1';
            fullStoryButton.style.zIndex = '1';
            fullStoryButton.style.opacity = '1';
        }
        if (scrollText) {
            scrollText.style.opacity = '0';
        }
        if (controlsOverlay) {
            controlsOverlay.style.opacity = '1'; // Show controls toggle
        }
        atBottom = true;
    } else {
        title.style.display = 'block';
        slide1.style.display = 'block';
        canvas.style.removeProperty('filter'); // filter is controlled through keyframe animation
        canvas.style.zIndex = '-1';
        if (isMobile) {
            canvas.style.opacity = '0.2';
            fullStoryButton.style.opacity = '0';
            fullStoryButton.style.zIndex = '-1';
        }
        navbarTitle.style.opacity = '0';
        navbarTitle.style.zIndex = '-1';
        if (scrollText) {
            scrollText.style.opacity = '1';
        }
        if (controlsOverlay) {
            controlsOverlay.style.opacity = '0'; // Hide controls toggle
        }
    }

    // Clamp between 0 and 1 for animation purposes
    scrollFraction = Math.max(0, Math.min(0.999, scrollFraction));

    // The animation is 1s long
    const duration = 1; // 1 second
    const negativeDelay = -(scrollFraction * duration);

    // Update both elements' animation delays
    title.style.animationDelay = `${negativeDelay}s`;
    slide1.style.animationDelay = `${negativeDelay}s`;
    canvas.style.animationDelay = `${negativeDelay}s`;
}

function toggleControls() {
    const controlsContent = document.querySelector('.controls-content');
    if (controlsContent) {
        const newOpacity = (controlsContent.style.opacity == '0' || controlsContent.style.opacity == '') ? '1' : '0';
        // hide music controls when we show these controls
        const musicControls = document.getElementById('music-controls');
        if (musicControls) {
            musicControls.style.opacity = (1 - newOpacity).toString();
        }
        controlsContent.style.opacity = newOpacity;
    }
}

// Set up controls toggle button if it exists
document.addEventListener('DOMContentLoaded', function() {
    const controlsToggle = document.getElementById('controls-toggle');
    if (controlsToggle) {
        controlsToggle.addEventListener('click', toggleControls);
    }
});

// Initialize the intro sequence
document.addEventListener('DOMContentLoaded', function() {
    // Initialize DOM elements first
    initializeElements();
    
    const title = document.querySelector('.untamed-title');
    const slide1 = document.querySelector('.slide-1');
    const canvas = document.getElementById('threejs-canvas');
    
    // Ensure intro elements are visible and animations start properly
    if (title) {
        title.style.display = 'block';
        title.style.opacity = '1';
        title.style.animation = 'title-appear 3s ease-out forwards, scroll-title 1s linear paused';
    }
    
    if (slide1) {
        slide1.style.display = 'block';
        slide1.style.opacity = '0';
    }
    
    // Set up scroll listener for animation control
    const handleScroll = () => {
        updateAnimationTime(title, slide1, canvas);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Initial call to set proper states
    updateAnimationTime(title, slide1, canvas);
});
