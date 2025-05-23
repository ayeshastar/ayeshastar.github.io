class ToggleController {
    constructor() {
        this.btnSlider = document.getElementById('btns');
        this.buttons = document.querySelectorAll('.toggle-btn');
        this.sections = {
            experience: document.getElementById('experience'),
            education: document.getElementById('education')
        };

        this.init();
    }

    init() {
        // Espera a que el DOM esté listo
        document.addEventListener("DOMContentLoaded", () => {
            document.body.classList.add("loaded");
            this.setInitialState();
            this.addEventListeners();
        });
    }

    setInitialState() {
        // Establece colores iniciales
        if (this.buttons.length >= 2) {
            this.setActive(0);
        } else {
            console.error("No se encontraron suficientes botones con clase .toggle-btn");
        }
    }

    addEventListeners() {
        if (this.buttons.length >= 2) {
            this.buttons[0].addEventListener('click', () => this.onClick(0, 'experience'));
            this.buttons[1].addEventListener('click', () => this.onClick(1, 'education'));
        }
    }

    onClick(index, sectionId) {
        this.setActive(index);
        this.scrollToSection(sectionId);
        this.moveSlider(index);
    }

    setActive(activeIndex) {
        this.buttons.forEach((btn, i) => {
            btn.style.color = i === activeIndex ? '#fff' : '#3b3b3b';
        });
    }

    moveSlider(index) {
        const positions = [0, 145]; // puedes adaptar esto si el botón se mueve más o menos
        this.btnSlider.style.left = `${positions[index]}px`;
    }

    scrollToSection(sectionId) {
        const section = this.sections[sectionId];
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// Instancia la clase para que funcione
new ToggleController();
