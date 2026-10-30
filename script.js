document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-list');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('main section[id]');
    const year = document.getElementById('current-year');
    const heroArt = document.querySelector('.hero-art');
    const portraitImage = document.querySelector('.portrait-image');
    const artFrame = document.querySelector('.art-frame');
    const scrollProgress = document.createElement('div');
    scrollProgress.className = 'scroll-progress';
    scrollProgress.setAttribute('aria-hidden', 'true');
    document.body.appendChild(scrollProgress);

    if (year) {
        year.textContent = new Date().getFullYear();
    }

    const unesaLogo = document.querySelector('.unesa-vector-logo');
    if (unesaLogo) {
        if ('IntersectionObserver' in window) {
            let isLogoVisible = false;
            const logoObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting && !isLogoVisible) {
                        isLogoVisible = true;
                        unesaLogo.classList.remove('is-blooming');
                        void unesaLogo.getBoundingClientRect();
                        unesaLogo.classList.add('is-blooming');
                    } else if (!entry.isIntersecting && isLogoVisible) {
                        isLogoVisible = false;
                    }
                });
            }, { threshold: .05 });
            logoObserver.observe(unesaLogo.parentElement);
        } else {
            unesaLogo.classList.add('is-blooming');
        }
    }

    if (portraitImage && artFrame) {
        function showPortrait() {
            const ratio = portraitImage.naturalWidth / portraitImage.naturalHeight;
            artFrame.style.setProperty('--portrait-ratio', String(ratio));
            portraitImage.hidden = false;
            artFrame.classList.add('has-portrait');
        }

        portraitImage.addEventListener('load', showPortrait);
        portraitImage.addEventListener('error', function () {
            portraitImage.hidden = true;
            artFrame.classList.remove('has-portrait');
        });

        if (portraitImage.complete && portraitImage.naturalWidth > 0) {
            showPortrait();
        }
    }

    sections.forEach(function (section) {
        section.classList.add('story-section');
    });

    function registerStoryItem(element, effect) {
        if (!element || element.dataset.storyItem) {
            return;
        }
        element.dataset.storyItem = effect;
        element.classList.add('story-item');
    }

    const heroCopy = document.querySelector('.hero-copy');
    if (heroCopy) {
        heroCopy.querySelectorAll(':scope > *').forEach(function (item, index) {
            registerStoryItem(item, index === 1 ? 'zoom' : 'sweep');
        });
    }
    registerStoryItem(heroArt, 'depth');

    const aboutProfile = document.querySelector('.about-profile');
    registerStoryItem(aboutProfile, 'depth');
    const aboutCopy = document.querySelector('.about-copy');
    if (aboutCopy) {
        aboutCopy.querySelectorAll(':scope > *').forEach(function (item, index) {
            registerStoryItem(item, index % 2 === 0 ? 'sweep' : 'zoom');
        });
    }
    document.querySelectorAll('.about-fact').forEach(function (item) {
        registerStoryItem(item, 'depth');
    });

    document.querySelectorAll('.section-heading').forEach(function (heading) {
        registerStoryItem(heading, 'sweep');
    });
    document.querySelectorAll('.capability-card').forEach(function (item) {
        registerStoryItem(item, 'depth');
    });

    const achievementContent = document.querySelector('.achievement-content');
    if (achievementContent) {
        Array.from(achievementContent.children).forEach(function (item, index) {
            registerStoryItem(item, index === 0 ? 'sweep' : 'depth');
        });
    }
    document.querySelectorAll('.achievement-item').forEach(function (item) {
        registerStoryItem(item, 'depth');
    });

    const contactContent = document.querySelector('.contact-content');
    if (contactContent) {
        contactContent.querySelectorAll(':scope > *').forEach(function (item, index) {
            registerStoryItem(item, index === 1 ? 'zoom' : 'sweep');
        });
    }

    const storyText = document.querySelectorAll(
        '.hero-copy h1, .hero-copy .hero-description, .about-copy h2, .about-copy p, ' +
        '.section-heading h2, .section-heading > p, .capability-card h3, .capability-card p, ' +
        '.achievement-content h2, .achievement-content > p, .achievement-item h3, .achievement-item p, ' +
        '.contact-content h2, .contact-content > p'
    );
    storyText.forEach(function (item) {
        item.classList.add('story-text');
        const walker = document.createTreeWalker(item, NodeFilter.SHOW_TEXT);
        const textNodes = [];
        while (walker.nextNode()) {
            if (walker.currentNode.textContent.trim()) {
                textNodes.push(walker.currentNode);
            }
        }

        let wordIndex = 0;
        textNodes.forEach(function (textNode) {
            const fragment = document.createDocumentFragment();
            textNode.textContent.split(/(\s+)/).forEach(function (part) {
                if (!part || !part.trim()) {
                    fragment.appendChild(document.createTextNode(part));
                    return;
                }
                const word = document.createElement('span');
                word.className = 'story-word';
                word.dataset.wordIndex = String(wordIndex++);
                word.textContent = part;
                fragment.appendChild(word);
            });
            textNode.parentNode.replaceChild(fragment, textNode);
        });
        item.style.setProperty('--word-count', String(wordIndex));
    });

    const storyItems = document.querySelectorAll('.story-item');
    const storyTextWords = Array.from(storyText, function (item) {
        return Array.from(item.querySelectorAll('.story-word'));
    });
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobileViewport = window.matchMedia('(max-width: 640px)');
    let storyFrame = 0;

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    function updateStory() {
        const viewportHeight = window.innerHeight;
        const scrollableHeight = document.documentElement.scrollHeight - viewportHeight;
        const pageProgress = scrollableHeight > 0 ? clamp(window.scrollY / scrollableHeight, 0, 1) : 0;
        document.documentElement.style.setProperty('--scroll-progress', String(pageProgress));

        let currentSection = sections[0];
        let nearestDistance = Infinity;
        sections.forEach(function (section) {
            const bounds = section.getBoundingClientRect();
            const centerDistance = Math.abs(bounds.top + bounds.height / 2 - viewportHeight / 2);
            if (centerDistance < nearestDistance) {
                currentSection = section;
                nearestDistance = centerDistance;
            }
            if (!mobileViewport.matches) {
                const sectionProgress = clamp((viewportHeight - bounds.top) / (viewportHeight + bounds.height), 0, 1);
                section.style.setProperty('--scene-progress', String(sectionProgress));
            }
        });

        navLinks.forEach(function (link) {
            link.classList.toggle('active', currentSection && link.getAttribute('href') === '#' + currentSection.id);
        });

        if (!mobileViewport.matches) {
            storyItems.forEach(function (item) {
                const bounds = item.getBoundingClientRect();
                const previousShift = Number.parseFloat(item.style.getPropertyValue('--story-y')) || 0;
                const center = bounds.top + bounds.height / 2 - previousShift;
                const distance = clamp((center - viewportHeight * .5) / (viewportHeight * .72), -1, 1);
                const focus = 1 - Math.abs(distance);
                const effect = item.dataset.storyItem;
                const vertical = (distance * 28).toFixed(2) + 'px';
                const scale = (0.98 + focus * .02).toFixed(4);
                const opacity = (0.82 + focus * .18).toFixed(3);
                let transform;

                item.style.setProperty('--story-y', vertical);
                if (effect === 'depth') {
                    transform = 'perspective(1100px) translate3d(0, var(--story-y), 0) rotateX(' + (distance * -3).toFixed(2) + 'deg) scale(' + scale + ')';
                } else if (effect === 'zoom') {
                    transform = 'translate3d(0, var(--story-y), 0) scale(' + scale + ')';
                } else {
                    const horizontal = (distance * 18).toFixed(2) + 'px';
                    transform = 'translate3d(' + horizontal + ', var(--story-y), 0) skewX(' + (distance * -1.2).toFixed(2) + 'deg) scale(' + scale + ')';
                }

                item.style.setProperty('--story-transform', transform);
                item.style.setProperty('--story-opacity', opacity);
            });

            storyText.forEach(function (item, index) {
                const bounds = item.getBoundingClientRect();
                const reveal = motionPreference.matches
                    ? 1
                    : clamp((viewportHeight * 1.06 - bounds.top) / (viewportHeight * .76), 0, 1);
                const words = storyTextWords[index];
                const wordCount = Math.max(1, Number(item.style.getPropertyValue('--word-count')) || 1);
                words.forEach(function (word) {
                    const stagger = wordCount > 1 ? Number(word.dataset.wordIndex) / (wordCount - 1) * .28 : 0;
                    const progress = motionPreference.matches ? 1 : clamp((reveal - stagger) / (1 - stagger), 0, 1);
                    word.style.setProperty('--word-progress', String(progress));
                });
            });
        }

        storyFrame = 0;
    }

    function scheduleStoryUpdate() {
        if (!storyFrame) {
            storyFrame = window.requestAnimationFrame(updateStory);
        }
    }

    window.addEventListener('scroll', scheduleStoryUpdate, { passive: true });
    window.addEventListener('resize', function () {
        scheduleStoryUpdate();
    }, { passive: true });
    if (typeof motionPreference.addEventListener === 'function') {
        motionPreference.addEventListener('change', scheduleStoryUpdate);
    } else if (typeof motionPreference.addListener === 'function') {
        motionPreference.addListener(scheduleStoryUpdate);
    }
    window.addEventListener('pageshow', scheduleStoryUpdate);
    document.addEventListener('visibilitychange', function () {
        if (!document.hidden) {
            scheduleStoryUpdate();
        }
    });
    if (heroArt && window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        let pointerFrame = 0;
        let pointerX = 50;
        let pointerY = 45;
        const tiltTargets = document.querySelectorAll('.hero-art .art-frame, .capability-card, .achievement-item, .about-profile');
        const tiltBounds = new WeakMap();

        tiltTargets.forEach(function (target) {
            target.addEventListener('pointerenter', function () {
                tiltBounds.set(target, target.getBoundingClientRect());
            });

            target.addEventListener('pointermove', function (event) {
                const bounds = tiltBounds.get(target) || target.getBoundingClientRect();
                tiltBounds.set(target, bounds);
                const tiltX = ((event.clientX - bounds.left) / bounds.width - .5) * 10;
                const tiltY = (.5 - (event.clientY - bounds.top) / bounds.height) * 10;
                target.style.setProperty('--tilt-x', tiltX.toFixed(2) + 'deg');
                target.style.setProperty('--tilt-y', tiltY.toFixed(2) + 'deg');
            });

            target.addEventListener('pointerleave', function () {
                tiltBounds.delete(target);
                target.style.setProperty('--tilt-x', '0deg');
                target.style.setProperty('--tilt-y', '0deg');
            });
        });

        window.addEventListener('resize', function () {
            tiltTargets.forEach(function (target) {
                tiltBounds.delete(target);
            });
        }, { passive: true });

        heroArt.addEventListener('pointermove', function (event) {
            const bounds = heroArt.getBoundingClientRect();
            pointerX = ((event.clientX - bounds.left) / bounds.width) * 100;
            pointerY = ((event.clientY - bounds.top) / bounds.height) * 100;

            if (!pointerFrame) {
                pointerFrame = window.requestAnimationFrame(function () {
                    heroArt.style.setProperty('--light-x', pointerX + '%');
                    heroArt.style.setProperty('--light-y', pointerY + '%');
                    pointerFrame = 0;
                });
            }
        });

        heroArt.addEventListener('pointerleave', function () {
            heroArt.style.setProperty('--light-x', '50%');
            heroArt.style.setProperty('--light-y', '45%');
        });
    }

    function closeMenu() {
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Buka menu');
        navMenu.classList.remove('is-open');
    }

    menuToggle.addEventListener('click', function () {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', String(!isExpanded));
        menuToggle.setAttribute('aria-label', isExpanded ? 'Buka menu' : 'Tutup menu');
        navMenu.classList.toggle('is-open', !isExpanded);
    });

    navLinks.forEach(function (link) {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            closeMenu();
        }
    });

    document.addEventListener('click', function (event) {
        if (!navMenu.contains(event.target) && !menuToggle.contains(event.target)) {
            closeMenu();
        }
    });

    updateStory();
});
