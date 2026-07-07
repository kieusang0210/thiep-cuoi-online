// =========================================================================
// CẤU HÌNH LIÊN KẾT GOOGLE SHEET NHẬN DỮ LIỆU RSVP
// Xem hướng dẫn thiết lập chi tiết tại tệp walkthrough.md
// =========================================================================
const GOOGLE_SHEET_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbwtdYTo5XEAjbUpgpa3qi-8ubv7bBGGjKarsU0f-d0SbGHNMUYoxGfwmGs7zBumTO9N0w/exec"; // Dán link Web App của Google Apps Script tại đây

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. ENVELOPE OPENING LOGIC ---
    const envelopeWrapper = document.getElementById('envelope-wrapper');
    const waxSeal = document.getElementById('wax-seal');
    const weddingContent = document.getElementById('wedding-content');
    const weddingMusic = document.getElementById('wedding-music');
    const musicToggle = document.getElementById('music-toggle');

    if (waxSeal && envelopeWrapper) {
        waxSeal.addEventListener('click', () => {
            // Step 1: Open the flap and raise the letter
            envelopeWrapper.classList.add('open');
            
            // Step 2: Play music (if browser policies allow after user interaction)
            weddingMusic.volume = 0.5;
            weddingMusic.play().then(() => {
                musicToggle.classList.remove('hidden');
            }).catch(err => {
                console.log("Autoplay prevented or music loading issue:", err);
                // Still show button so user can click to play manually
                musicToggle.classList.remove('hidden');
                musicToggle.classList.add('paused');
            });

            // Step 3: Fade out envelope and show main content
            setTimeout(() => {
                envelopeWrapper.classList.add('fade-out');
                weddingContent.classList.remove('hidden-content');
                
                // Triggers the content fade-in animation
                setTimeout(() => {
                    weddingContent.classList.add('visible');
                    // Initialize scroll animations
                    initScrollAnimations();
                }, 100);
                
                // Remove envelope element from DOM after transition to avoid performance drag
                setTimeout(() => {
                    envelopeWrapper.style.display = 'none';
                }, 1200);
            }, 1800);
        });
    }

    // --- 2. MUSIC CONTROLLER ---
    if (musicToggle && weddingMusic) {
        musicToggle.addEventListener('click', () => {
            if (weddingMusic.paused) {
                weddingMusic.play();
                musicToggle.classList.remove('paused');
            } else {
                weddingMusic.pause();
                musicToggle.classList.add('paused');
            }
        });
    }

    // --- 3. FLOATING HEARTS BACKGROUND ---
    const heartContainer = document.getElementById('heart-container');
    const maxHearts = 35; // Cap maximum hearts on mobile for performance

    function createHeart() {
        if (!heartContainer || document.querySelectorAll('.floating-heart').length >= maxHearts) return;

        const heart = document.createElement('div');
        heart.classList.add('floating-heart');

        // Randomize sizes (small, medium, large)
        const size = Math.random() * 25 + 10; // 10px to 35px
        heart.style.width = `${size}px`;
        heart.style.height = `${size}px`;

        // Randomize horizontal start position
        heart.style.left = `${Math.random() * 100}%`;

        // Randomize speed/duration of animation
        const duration = Math.random() * 8 + 7; // 7s to 15s
        heart.style.animationDuration = `${duration}s`;

        // Randomize opacity
        const opacity = Math.random() * 0.4 + 0.3; // 0.3 to 0.7 opacity
        heart.style.backgroundColor = `rgba(255, 183, 178, ${opacity})`;

        heartContainer.appendChild(heart);

        // Remove the heart element after its animation finishes
        setTimeout(() => {
            heart.remove();
        }, duration * 1000);
    }

    // Spawn hearts periodically
    setInterval(createHeart, 450);

    // --- 4. COUNTDOWN TIMER ---
    // Target wedding time: 11:00 on July 23, 2026
    const targetDate = new Date('2026-07-23T11:00:00').getTime();

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    function updateCountdown() {
        const now = new Date().getTime();
        const difference = targetDate - now;

        if (difference <= 0) {
            // Wedding has started/passed
            if (daysEl) daysEl.innerText = '00';
            if (hoursEl) hoursEl.innerText = '00';
            if (minutesEl) minutesEl.innerText = '00';
            if (secondsEl) secondsEl.innerText = '00';
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        if (daysEl) daysEl.innerText = days < 10 ? '0' + days : days;
        if (hoursEl) hoursEl.innerText = hours < 10 ? '0' + hours : hours;
        if (minutesEl) minutesEl.innerText = minutes < 10 ? '0' + minutes : minutes;
        if (secondsEl) secondsEl.innerText = seconds < 10 ? '0' + seconds : seconds;
    }

    // Initial call & interval running
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // --- 5. RSVP FORM SUBMISSION ---
    const rsvpForm = document.getElementById('rsvp-form');
    const attendanceRadios = document.querySelectorAll('input[name="attendance"]');
    const guestCountGroup = document.getElementById('number-of-guests-group');
    const rsvpSuccessModal = document.getElementById('rsvp-success-modal');
    const closeSuccessBtn = document.getElementById('close-rsvp-success');
    const successOkBtn = document.getElementById('rsvp-success-ok');

    // Toggle number of guests based on attendance radio choice
    attendanceRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'yes') {
                guestCountGroup.style.display = 'flex';
            } else {
                guestCountGroup.style.display = 'none';
            }
        });
    });

    // Helper function to display RSVP success popup
    function showRSVPSuccess(guestName, attendance) {
        const successMsg = document.getElementById('rsvp-success-msg');
        if (successMsg) {
            if (attendance === 'yes' || attendance === 'Tham dự') {
                successMsg.innerText = `Cảm ơn ${guestName} đã xác nhận tham gia chung vui cùng Hải Minh & Kiều Trang!`;
            } else {
                successMsg.innerText = `Cảm ơn ${guestName} đã gửi phản hồi. Chúng tôi vô cùng tiếc vì bạn không thể tham gia.`;
            }
        }
        if (rsvpSuccessModal) {
            rsvpSuccessModal.classList.add('show');
        }
    }

    if (rsvpForm) {
        rsvpForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Extract form values
            const guestName = document.getElementById('guest-name').value;
            const attendance = document.querySelector('input[name="attendance"]:checked').value;
            const guestCount = attendance === 'yes' ? document.getElementById('number-of-guests').value : '0';
            const wishes = document.getElementById('guest-wishes').value;

            // Prepare guest details payload
            const rsvpData = {
                guestName,
                attendance: attendance === 'yes' ? 'Tham dự' : 'Không tham dự',
                guestCount,
                wishes,
                timestamp: new Date().toLocaleString('vi-VN')
            };

            // Store inside LocalStorage for fallback backup
            let savedRSVPs = JSON.parse(localStorage.getItem('wedding_rsvp_list') || '[]');
            savedRSVPs.push(rsvpData);
            localStorage.setItem('wedding_rsvp_list', JSON.stringify(savedRSVPs));

            console.log("Xác nhận tham dự:", rsvpData);

            if (GOOGLE_SHEET_WEBAPP_URL) {
                // Show loading state on submit button
                const submitBtn = rsvpForm.querySelector('.submit-btn');
                const originalBtnText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang gửi...';

                // Send request to Google Sheets Web App
                fetch(GOOGLE_SHEET_WEBAPP_URL, {
                    method: 'POST',
                    mode: 'no-cors', // Use no-cors to bypass browser static page CORS limits
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(rsvpData)
                })
                .then(() => {
                    console.log("Đã lưu dữ liệu thành công vào Google Sheet!");
                    showRSVPSuccess(guestName, attendance);
                    rsvpForm.reset();
                })
                .catch(err => {
                    console.error("Lỗi khi kết nối Google Sheet:", err);
                    // Still show success to user so they don't get stuck, since data is already saved locally
                    showRSVPSuccess(guestName, attendance);
                    rsvpForm.reset();
                })
                .finally(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                });
            } else {
                // Standalone simulated success
                showRSVPSuccess(guestName, attendance);
                rsvpForm.reset();
            }
        });
    }

    // Modal Success Close
    const closeSuccessModal = () => {
        if (rsvpSuccessModal) rsvpSuccessModal.classList.remove('show');
    };
    if (closeSuccessBtn) closeSuccessBtn.addEventListener('click', closeSuccessModal);
    if (successOkBtn) successOkBtn.addEventListener('click', closeSuccessModal);

    // --- 8. COPY TO CLIPBOARD AND TOAST ---
    const toast = document.getElementById('toast');

    function showToast(message) {
        if (!toast) return;
        toast.innerText = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2200);
    }

    function setupClipboardCopy(btnId, valId, successMsg) {
        const btn = document.getElementById(btnId);
        const valEl = document.getElementById(valId);

        if (btn && valEl) {
            btn.addEventListener('click', () => {
                const textToCopy = valEl.innerText || valEl.textContent;
                
                // Modern clipboard API
                navigator.clipboard.writeText(textToCopy).then(() => {
                    showToast(successMsg);
                }).catch(err => {
                    console.error('Không thể sao chép văn bản: ', err);
                    // Fallback for older/unsupported browsers
                    const tempInput = document.createElement('input');
                    tempInput.value = textToCopy;
                    document.body.appendChild(tempInput);
                    tempInput.select();
                    document.execCommand('copy');
                    document.body.removeChild(tempInput);
                    showToast(successMsg);
                });
            });
        }
    }

    setupClipboardCopy('copy-acc-btn', 'bank-acc-no', 'Đã sao chép số tài khoản!');
    setupClipboardCopy('copy-name-btn', 'bank-acc-name', 'Đã sao chép tên chủ tài khoản!');

    // --- 9. GIFT/QR MODAL CONTROLLER ---
    const giftModal = document.getElementById('gift-modal');
    const openGiftBtn = document.getElementById('open-gift-modal');
    const closeGiftBtn = document.getElementById('close-gift-modal');

    if (giftModal && openGiftBtn && closeGiftBtn) {
        openGiftBtn.addEventListener('click', () => {
            giftModal.classList.add('show');
        });

        const hideGiftModal = () => {
            giftModal.classList.remove('show');
        };

        closeGiftBtn.addEventListener('click', hideGiftModal);
        
        // Close modal when clicking outside content area
        giftModal.addEventListener('click', (e) => {
            if (e.target === giftModal) hideGiftModal();
        });
    }

    // --- 10. SCROLL FADE IN ANIMATIONS (Intersection Observer) ---
    function initScrollAnimations() {
        const fadeElements = document.querySelectorAll('.fade-in');
        
        if ('IntersectionObserver' in window) {
            const observerOptions = {
                root: null,
                threshold: 0.1, // trigger when 10% of element is visible
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('appear');
                        observer.unobserve(entry.target); // Stop observing once animated
                    }
                });
            }, observerOptions);

            fadeElements.forEach(el => observer.observe(el));
        } else {
            // Fallback for older browsers
            fadeElements.forEach(el => el.classList.add('appear'));
        }
    }
});
