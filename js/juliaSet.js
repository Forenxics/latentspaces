// Julia Set Visualizer
// Visualizes Julia sets - fractal patterns in the complex plane

class JuliaSetVisualizer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.c = { re: -0.7, im: 0.27 };
        this.zoom = 1;
        this.centerX = 0;
        this.centerY = 0;
        this.maxIterations = 100;
        this.colorScheme = 'electric';
        this.isAnimating = false;
        this.animationFrame = 0;
    }

    setParameter(real, imag) {
        this.c = { re: real, im: imag };
    }

    setZoom(zoom) {
        this.zoom = zoom;
    }

    setMaxIterations(iterations) {
        this.maxIterations = iterations;
    }

    setColorScheme(scheme) {
        this.colorScheme = scheme;
    }

    render() {
        const width = this.canvas.width;
        const height = this.canvas.height;

        const imageData = this.ctx.createImageData(width, height);
        const data = imageData.data;

        const scale = 3 / this.zoom;
        const minRe = this.centerX - scale;
        const maxRe = this.centerX + scale;
        const minIm = this.centerY - scale;
        const maxIm = this.centerY + scale;

        let pointsEscaped = 0;
        let pointsInSet = 0;
        const startTime = performance.now();

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                // Map pixel to complex plane
                const z = {
                    re: minRe + (x / width) * (maxRe - minRe),
                    im: minIm + (y / height) * (maxIm - minIm)
                };

                const iterations = this.juliaIteration(z);

                const pixelIndex = (y * width + x) * 4;

                if (iterations === this.maxIterations) {
                    // Point is in the set - black
                    data[pixelIndex] = 0;
                    data[pixelIndex + 1] = 0;
                    data[pixelIndex + 2] = 0;
                    data[pixelIndex + 3] = 255;
                    pointsInSet++;
                } else {
                    // Point escaped - color based on iteration count
                    const color = Utils.getColorScheme(
                        this.colorScheme,
                        iterations,
                        this.maxIterations
                    );

                    const rgb = this.hexToRgb(color);
                    data[pixelIndex] = rgb.r;
                    data[pixelIndex + 1] = rgb.g;
                    data[pixelIndex + 2] = rgb.b;
                    data[pixelIndex + 3] = 255;
                    pointsEscaped++;
                }
            }
        }

        this.ctx.putImageData(imageData, 0, 0);

        const renderTime = performance.now() - startTime;
        this.updateStats(pointsInSet, pointsEscaped, renderTime);
    }

    juliaIteration(z) {
        let iterations = 0;
        let zTemp = { ...z };

        while (iterations < this.maxIterations) {
            const magnitudeSq = zTemp.re * zTemp.re + zTemp.im * zTemp.im;

            if (magnitudeSq > 4) {
                return iterations;
            }

            // z = z^2 + c
            const newRe = zTemp.re * zTemp.re - zTemp.im * zTemp.im + this.c.re;
            const newIm = 2 * zTemp.re * zTemp.im + this.c.im;

            zTemp.re = newRe;
            zTemp.im = newIm;
            iterations++;
        }

        return this.maxIterations;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    async animateParameters() {
        if (this.isAnimating) {
            this.isAnimating = false;
            return;
        }

        this.isAnimating = true;
        this.animationFrame = 0;

        const animate = async () => {
            if (!this.isAnimating) return;

            // Animate the c parameter in a circle
            const angle = this.animationFrame * 0.02;
            const radius = 0.7885;

            this.c.re = radius * Math.cos(angle);
            this.c.im = radius * Math.sin(angle);

            this.render();

            // Update sliders to reflect animated values
            document.getElementById('julia-real').value = this.c.re.toFixed(2);
            document.getElementById('julia-imag').value = this.c.im.toFixed(2);
            document.getElementById('julia-real-value').textContent = this.c.re.toFixed(2);
            document.getElementById('julia-imag-value').textContent = this.c.im.toFixed(2);

            this.animationFrame++;

            if (this.isAnimating) {
                setTimeout(() => requestAnimationFrame(animate), 50);
            }
        };

        animate();
    }

    stopAnimation() {
        this.isAnimating = false;
    }

    reset() {
        this.c = { re: -0.7, im: 0.27 };
        this.zoom = 1;
        this.centerX = 0;
        this.centerY = 0;
        this.maxIterations = 100;
        this.stopAnimation();
        this.render();
    }

    updateStats(pointsInSet, pointsEscaped, renderTime) {
        const statsDiv = document.getElementById('stats');
        const totalPoints = pointsInSet + pointsEscaped;
        const fillRatio = (pointsInSet / totalPoints * 100).toFixed(2);

        statsDiv.innerHTML = `
            <strong>Julia Set Fractal</strong><br>
            Parameter c: ${this.c.re.toFixed(3)} ${this.c.im >= 0 ? '+' : ''}${this.c.im.toFixed(3)}i<br>
            Zoom: ${this.zoom.toFixed(2)}x<br>
            Max Iterations: ${this.maxIterations}<br>
            <br>
            Points in Set: ${Utils.formatNumber(pointsInSet)} (${fillRatio}%)<br>
            Points Escaped: ${Utils.formatNumber(pointsEscaped)}<br>
            Total Points: ${Utils.formatNumber(totalPoints)}<br>
            Render Time: ${Utils.formatTime(renderTime)}<br>
            <br>
            Color Scheme: ${this.colorScheme}
        `;
    }

    // Add interactivity for zooming and panning
    setupInteractivity() {
        let isDragging = false;
        let lastX, lastY;

        this.canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            lastX = e.offsetX;
            lastY = e.offsetY;
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const dx = e.offsetX - lastX;
            const dy = e.offsetY - lastY;

            const scale = 6 / (this.zoom * this.canvas.width);
            this.centerX -= dx * scale;
            this.centerY -= dy * scale;

            lastX = e.offsetX;
            lastY = e.offsetY;

            this.render();
        });

        this.canvas.addEventListener('mouseup', () => {
            isDragging = false;
        });

        this.canvas.addEventListener('mouseleave', () => {
            isDragging = false;
        });

        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            this.zoom *= delta;
            this.render();
        });

        // Double-click to zoom in
        this.canvas.addEventListener('dblclick', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const scale = 3 / this.zoom;
            const minRe = this.centerX - scale;
            const maxRe = this.centerX + scale;
            const minIm = this.centerY - scale;
            const maxIm = this.centerY + scale;

            this.centerX = minRe + (x / this.canvas.width) * (maxRe - minRe);
            this.centerY = minIm + (y / this.canvas.height) * (maxIm - minIm);
            this.zoom *= 2;

            this.render();
        });
    }
}
