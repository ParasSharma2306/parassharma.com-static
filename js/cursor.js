document.addEventListener("DOMContentLoaded", () => {
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');

    if (window.matchMedia("(pointer: fine)").matches) {
        let mouseX = 0, mouseY = 0;
        let ringX = 0, ringY = 0;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            if (dot) {
                // Offset by radius to center
                dot.style.transform = `translate(${mouseX - 3}px, ${mouseY - 3}px)`;
            }
        });

        function animate() {
            ringX += (mouseX - ringX) * 0.15;
            ringY += (mouseY - ringY) * 0.15;
            if (ring) {
                // Offset by radius to center
                ring.style.transform = `translate(${ringX - 20}px, ${ringY - 20}px)`;
            }
            requestAnimationFrame(animate);
        }
        animate();

        const magnets = document.querySelectorAll('.magnetic, .magnetic-card, a, button');
        magnets.forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
        });
    }
});