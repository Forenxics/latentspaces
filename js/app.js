// Main Application
// Coordinates all visualizers and handles UI interactions

class LatentSpaceApp {
    constructor() {
        this.canvas = document.getElementById('main-canvas');
        this.currentViz = 'sort';

        // Initialize visualizers BEFORE resizing
        this.sortViz = new SortVisualizer(this.canvas);
        this.cayleyViz = new CayleyTableVisualizer(this.canvas);
        this.juliaViz = new JuliaSetVisualizer(this.canvas);
        this.complexViz = new ComplexFunctionsVisualizer(this.canvas);

        // Set canvas size AFTER visualizers are created
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Setup event listeners
        this.setupNavigation();
        this.setupSortControls();
        this.setupCayleyControls();
        this.setupJuliaControls();
        this.setupComplexControls();

        // Initialize with sort visualizer
        this.sortViz.initialize(50);
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();

        // Set canvas to a reasonable size based on container
        const size = Math.min(rect.width - 40, 800);
        this.canvas.width = size;
        this.canvas.height = size;

        // Redraw current visualization
        this.redrawCurrent();
    }

    redrawCurrent() {
        switch(this.currentViz) {
            case 'sort':
                if (this.sortViz) this.sortViz.draw();
                break;
            case 'cayley':
                if (this.cayleyViz) this.cayleyViz.draw();
                break;
            case 'julia':
                if (this.juliaViz) this.juliaViz.render();
                break;
            case 'complex':
                if (this.complexViz) this.complexViz.render();
                break;
        }
    }

    setupNavigation() {
        const tabs = document.querySelectorAll('.viz-tab');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Update active control group
                const vizType = tab.dataset.viz;
                this.switchVisualization(vizType);
            });
        });
    }

    switchVisualization(vizType) {
        // Stop any running animations
        this.sortViz.stop();
        this.cayleyViz.stopAnimation();
        this.juliaViz.stopAnimation();

        // Hide all control groups
        document.querySelectorAll('.control-group').forEach(group => {
            group.classList.remove('active');
        });

        // Show selected control group
        document.getElementById(`${vizType}-controls`).classList.add('active');

        // Update current viz and initialize
        this.currentViz = vizType;

        switch(vizType) {
            case 'sort':
                this.sortViz.initialize(parseInt(document.getElementById('array-size').value));
                break;
            case 'cayley':
                this.cayleyViz.setGroup(document.getElementById('cayley-group').value);
                this.cayleyViz.setMode(document.getElementById('cayley-mode').value);
                break;
            case 'julia':
                this.juliaViz.setupInteractivity();
                this.juliaViz.render();
                break;
            case 'complex':
                this.complexViz.setupInteractivity();
                this.complexViz.render();
                break;
        }
    }

    // Sort Controls
    setupSortControls() {
        const algorithmSelect = document.getElementById('sort-algorithm');
        const arraySizeSlider = document.getElementById('array-size');
        const arraySizeValue = document.getElementById('array-size-value');
        const speedSlider = document.getElementById('sort-speed');
        const speedValue = document.getElementById('sort-speed-value');
        const shuffleBtn = document.getElementById('sort-shuffle');
        const startBtn = document.getElementById('sort-start');
        const pauseBtn = document.getElementById('sort-pause');
        const resetBtn = document.getElementById('sort-reset');

        arraySizeSlider.addEventListener('input', (e) => {
            const size = parseInt(e.target.value);
            arraySizeValue.textContent = size;
            this.sortViz.initialize(size);
        });

        speedSlider.addEventListener('input', (e) => {
            const speed = parseInt(e.target.value);
            speedValue.textContent = speed;
            this.sortViz.speed = speed;
        });

        shuffleBtn.addEventListener('click', () => {
            this.sortViz.shuffle();
        });

        startBtn.addEventListener('click', () => {
            const algorithm = algorithmSelect.value;
            this.sortViz.sort(algorithm);
        });

        pauseBtn.addEventListener('click', () => {
            this.sortViz.pause();
        });

        resetBtn.addEventListener('click', () => {
            this.sortViz.reset();
        });
    }

    // Cayley Controls
    setupCayleyControls() {
        const groupSelect = document.getElementById('cayley-group');
        const modeSelect = document.getElementById('cayley-mode');
        const animateBtn = document.getElementById('cayley-animate');
        const resetBtn = document.getElementById('cayley-reset');

        groupSelect.addEventListener('change', (e) => {
            this.cayleyViz.setGroup(e.target.value);
        });

        modeSelect.addEventListener('change', (e) => {
            this.cayleyViz.setMode(e.target.value);
        });

        animateBtn.addEventListener('click', () => {
            this.cayleyViz.animate();
        });

        resetBtn.addEventListener('click', () => {
            this.cayleyViz.stopAnimation();
            this.cayleyViz.draw();
        });
    }

    // Julia Controls
    setupJuliaControls() {
        const realSlider = document.getElementById('julia-real');
        const realValue = document.getElementById('julia-real-value');
        const imagSlider = document.getElementById('julia-imag');
        const imagValue = document.getElementById('julia-imag-value');
        const zoomSlider = document.getElementById('julia-zoom');
        const zoomValue = document.getElementById('julia-zoom-value');
        const colorSelect = document.getElementById('julia-colors');
        const iterationsSlider = document.getElementById('julia-iterations');
        const iterationsValue = document.getElementById('julia-iterations-value');
        const renderBtn = document.getElementById('julia-render');
        const animateBtn = document.getElementById('julia-animate-params');
        const resetBtn = document.getElementById('julia-reset');

        realSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            realValue.textContent = value.toFixed(2);
        });

        imagSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            imagValue.textContent = value.toFixed(2);
        });

        zoomSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            zoomValue.textContent = value.toFixed(1);
        });

        iterationsSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            iterationsValue.textContent = value;
        });

        renderBtn.addEventListener('click', () => {
            const real = parseFloat(realSlider.value);
            const imag = parseFloat(imagSlider.value);
            const zoom = parseFloat(zoomSlider.value);
            const iterations = parseInt(iterationsSlider.value);
            const colorScheme = colorSelect.value;

            this.juliaViz.setParameter(real, imag);
            this.juliaViz.setZoom(zoom);
            this.juliaViz.setMaxIterations(iterations);
            this.juliaViz.setColorScheme(colorScheme);
            this.juliaViz.render();
        });

        animateBtn.addEventListener('click', () => {
            this.juliaViz.animateParameters();
        });

        resetBtn.addEventListener('click', () => {
            this.juliaViz.reset();

            // Reset controls
            realSlider.value = -0.7;
            realValue.textContent = '-0.70';
            imagSlider.value = 0.27;
            imagValue.textContent = '0.27';
            zoomSlider.value = 1;
            zoomValue.textContent = '1.0';
            iterationsSlider.value = 100;
            iterationsValue.textContent = '100';
        });
    }

    // Complex Functions Controls
    setupComplexControls() {
        const functionSelect = document.getElementById('complex-function');
        const vizSelect = document.getElementById('complex-viz');
        const zoomSlider = document.getElementById('complex-zoom');
        const zoomValue = document.getElementById('complex-zoom-value');
        const renderBtn = document.getElementById('complex-render');
        const resetBtn = document.getElementById('complex-reset');

        functionSelect.addEventListener('change', (e) => {
            this.complexViz.setFunction(e.target.value);
        });

        vizSelect.addEventListener('change', (e) => {
            this.complexViz.setVisualization(e.target.value);
        });

        zoomSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            zoomValue.textContent = value.toFixed(1);
        });

        renderBtn.addEventListener('click', () => {
            const zoom = parseFloat(zoomSlider.value);
            this.complexViz.setZoom(zoom);
            this.complexViz.render();
        });

        resetBtn.addEventListener('click', () => {
            this.complexViz.resetView();
            this.complexViz.render();

            // Reset controls
            zoomSlider.value = 1;
            zoomValue.textContent = '1.0';
        });
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new LatentSpaceApp();
    console.log('🌌 Latent Space Visualizer initialized');
});
