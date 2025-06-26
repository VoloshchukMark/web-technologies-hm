document.addEventListener('DOMContentLoaded', () => {
    const defaultSliderConfig = {
        duration: 500, 
        autoplay: true,
        autoplayInterval: 3000,
        showArrows: true,
        showPagination: true,
    };

    function initializeSlider(selector, config = {}) {
        const sliderContainer = document.querySelector(selector);
        if (!sliderContainer) {
            console.error('Slider container not found:', selector);
            return;
        }

        const sliderWrapper = sliderContainer.querySelector('.slider-wrapper');
        const slides = Array.from(sliderWrapper.querySelectorAll('.slide'));
        const prevArrow = sliderContainer.querySelector('.prev-arrow');
        const nextArrow = sliderContainer.querySelector('.next-arrow');
        const paginationContainer = sliderContainer.querySelector('.pagination');

        let currentSlide = 0;
        let slideCount = slides.length;
        let autoplayTimer;
        let isPausedByHover = false;

        const sliderConfig = { ...defaultSliderConfig, ...config };

        if (!sliderConfig.showArrows) {
            prevArrow.style.display = 'none';
            nextArrow.style.display = 'none';
        }
        if (!sliderConfig.showPagination) {
            paginationContainer.style.display = 'none';
        }


        function updateSliderPosition() {
            sliderWrapper.style.transitionDuration = `${sliderConfig.duration}ms`;
            sliderWrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
            updatePagination();
        }

        function nextSlide() {
            currentSlide++;
            if (currentSlide >= slideCount) {
                currentSlide = 0; 
            }
            updateSliderPosition();
        }


        function prevSlide() {
            currentSlide--;
            if (currentSlide < 0) {
                currentSlide = slideCount - 1; 
            }
            updateSliderPosition();
        }

        function createPagination() {
            paginationContainer.innerHTML = ''; 
            for (let i = 0; i < slideCount; i++) {
                const dot = document.createElement('span');
                dot.classList.add('dot');
                dot.dataset.index = i;
                dot.addEventListener('click', () => {
                    currentSlide = i;
                    updateSliderPosition();
                    startAutoplay();
                });
                paginationContainer.appendChild(dot);
            }
            updatePagination();
        }

        function updatePagination() {
            const dots = paginationContainer.querySelectorAll('.dot');
            dots.forEach((dot, index) => {
                if (index === currentSlide) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }

        function startAutoplay() {
            if (sliderConfig.autoplay) {
                clearInterval(autoplayTimer); 
                autoplayTimer = setInterval(() => {
                    if (!isPausedByHover) { 
                        nextSlide();
                    }
                }, sliderConfig.autoplayInterval);
            }
        }

        function stopAutoplay() {
            clearInterval(autoplayTimer);
        }

        if (sliderConfig.showArrows) {
            prevArrow.addEventListener('click', () => {
                prevSlide();
                startAutoplay(); 
            });
            nextArrow.addEventListener('click', () => {
                nextSlide();
                startAutoplay();
            });
        }


        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                prevSlide();
                startAutoplay();
            } else if (e.key === 'ArrowRight') {
                nextSlide();
                startAutoplay();
            }
        });

        sliderContainer.addEventListener('mouseenter', () => {
            if (sliderConfig.autoplay) {
                isPausedByHover = true;
                stopAutoplay();
            }
        });

        sliderContainer.addEventListener('mouseleave', () => {
            if (sliderConfig.autoplay) {
                isPausedByHover = false;
                startAutoplay();
            }
        });

        updateSliderPosition();
        createPagination();
        startAutoplay();
    }

    initializeSlider('.slider-container', {
        duration: 500,
        autoplay: true,
        autoplayInterval: 3000,
        showArrows: true,
        showPagination: true,
    });
});