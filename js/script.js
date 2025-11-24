document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Dynamic Year
    const yearSpan = document.getElementById('year');
    if(yearSpan) yearSpan.textContent = new Date().getFullYear();

    // 2. Smooth Scroll (Lenis)
    const lenis = new Lenis({
        duration: 1.2,
        smooth: true,
        smoothTouch: false
    });
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // 3. Animations (GSAP)
    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        
        // Section Reveals
        document.querySelectorAll('.section-block').forEach(section => {
            gsap.to(section, {
                scrollTrigger: { trigger: section, start: "top 80%" },
                opacity: 1, y: 0, duration: 1, ease: "power3.out"
            });
        });
        
        // Quote Fades
        document.querySelectorAll('.fade-text').forEach(text => {
            gsap.fromTo(text, 
                { opacity: 0, y: 30 },
                {
                    scrollTrigger: { trigger: text, start: "top 85%" },
                    opacity: 1, y: 0, duration: 1.5, ease: "power2.out"
                }
            );
        });
    }

    // 4. Nav Highlight
    window.addEventListener('scroll', () => {
        let current = '';
        document.querySelectorAll('section').forEach(section => {
            // Offset ensures the link highlights slightly before the section hits the top
            if (window.scrollY >= (section.offsetTop - 300)) {
                current = section.getAttribute('id');
            }
        });
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });
    
    // 5. Mobile Menu Toggle
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navContainer = document.querySelector('.nav-container');
    
    if(menuBtn) {
        menuBtn.addEventListener('click', () => {
            navContainer.classList.toggle('open');
            // Optional: Toggle a class on the button for animation if you add CSS for it later
            menuBtn.classList.toggle('active'); 
        });
        
        // Close menu when a link is clicked (Mobile UX best practice)
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navContainer.classList.remove('open');
                menuBtn.classList.remove('active');
            });
        });
    }
});