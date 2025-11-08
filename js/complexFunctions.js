// Complex Functions Visualizer
// Visualizes complex number operations and fractals

class ComplexFunctionsVisualizer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.functionType = 'mandelbrot';
        this.vizType = 'magnitude';
        this.zoom = 1;
        this.centerX = -0.5;
        this.centerY = 0;
        this.maxIterations = 100;
    }

    setFunction(functionType) {
        this.functionType = functionType;
        this.resetView();
    }

    setVisualization(vizType) {
        this.vizType = vizType;
    }

    setZoom(zoom) {
        this.zoom = zoom;
    }

    resetView() {
        switch(this.functionType) {
            case 'mandelbrot':
                this.centerX = -0.5;
                this.centerY = 0;
                break;
            case 'sine':
            case 'exp':
            case 'polynomial':
            case 'newton':
                this.centerX = 0;
                this.centerY = 0;
                break;
        }
        this.zoom = 1;
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

        const startTime = performance.now();

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const c = {
                    re: minRe + (x / width) * (maxRe - minRe),
                    im: minIm + (y / height) * (maxIm - minIm)
                };

                const pixelIndex = (y * width + x) * 4;
                const color = this.calculatePixelColor(c);

                data[pixelIndex] = color.r;
                data[pixelIndex + 1] = color.g;
                data[pixelIndex + 2] = color.b;
                data[pixelIndex + 3] = 255;
            }
        }

        this.ctx.putImageData(imageData, 0, 0);

        const renderTime = performance.now() - startTime;
        this.updateStats(renderTime);
    }

    calculatePixelColor(c) {
        let result;

        switch(this.functionType) {
            case 'mandelbrot':
                result = this.mandelbrotIteration(c);
                break;
            case 'sine':
                result = Utils.complexSin(c);
                break;
            case 'exp':
                result = Utils.complexExp(c);
                break;
            case 'polynomial':
                result = this.polynomial(c);
                break;
            case 'newton':
                result = this.newtonFractal(c);
                break;
            default:
                result = { re: 0, im: 0 };
        }

        return this.visualizeComplex(result, c);
    }

    mandelbrotIteration(c) {
        let z = { re: 0, im: 0 };
        let iterations = 0;

        while (iterations < this.maxIterations) {
            const magnitudeSq = z.re * z.re + z.im * z.im;

            if (magnitudeSq > 4) {
                return { iterations, inSet: false, z };
            }

            // z = z^2 + c
            const newRe = z.re * z.re - z.im * z.im + c.re;
            const newIm = 2 * z.re * z.im + c.im;

            z.re = newRe;
            z.im = newIm;
            iterations++;
        }

        return { iterations: this.maxIterations, inSet: true, z };
    }

    polynomial(c) {
        // z^3 - 1
        const z3 = Utils.complexPower(c, 3);
        return { re: z3.re - 1, im: z3.im };
    }

    newtonFractal(z0) {
        // Newton's method for z^3 - 1 = 0
        let z = { ...z0 };
        const roots = [
            { re: 1, im: 0 },
            { re: -0.5, im: Math.sqrt(3) / 2 },
            { re: -0.5, im: -Math.sqrt(3) / 2 }
        ];

        for (let i = 0; i < 50; i++) {
            // f(z) = z^3 - 1
            const z3 = Utils.complexPower(z, 3);
            const f = { re: z3.re - 1, im: z3.im };

            // f'(z) = 3z^2
            const z2 = Utils.complexPower(z, 2);
            const fPrime = { re: 3 * z2.re, im: 3 * z2.im };

            // z = z - f(z)/f'(z)
            const denominator = fPrime.re * fPrime.re + fPrime.im * fPrime.im;
            if (denominator === 0) break;

            const quotient = {
                re: (f.re * fPrime.re + f.im * fPrime.im) / denominator,
                im: (f.im * fPrime.re - f.re * fPrime.im) / denominator
            };

            z.re -= quotient.re;
            z.im -= quotient.im;

            // Check convergence to a root
            for (let j = 0; j < roots.length; j++) {
                const diff = {
                    re: z.re - roots[j].re,
                    im: z.im - roots[j].im
                };
                if (Utils.complexMagnitude(diff) < 0.001) {
                    return { root: j, iterations: i, z };
                }
            }
        }

        return { root: -1, iterations: 50, z };
    }

    visualizeComplex(result, c) {
        if (this.functionType === 'mandelbrot') {
            return this.visualizeMandelbrot(result);
        } else if (this.functionType === 'newton') {
            return this.visualizeNewton(result);
        }

        const value = result;

        switch(this.vizType) {
            case 'magnitude':
                return this.visualizeMagnitude(value);
            case 'phase':
                return this.visualizePhase(value);
            case 'domain':
                return this.visualizeDomainColoring(value);
            default:
                return { r: 0, g: 0, b: 0 };
        }
    }

    visualizeMandelbrot(result) {
        if (result.inSet) {
            return { r: 0, g: 0, b: 0 };
        }

        const t = result.iterations / this.maxIterations;
        const hue = 200 + t * 160;
        const rgb = Utils.hslToRgb(hue, 1, 0.5 + t * 0.3);
        return rgb;
    }

    visualizeNewton(result) {
        if (result.root === -1) {
            return { r: 0, g: 0, b: 0 };
        }

        const colors = [
            { r: 255, g: 100, b: 100 },  // Red
            { r: 100, g: 255, b: 100 },  // Green
            { r: 100, g: 100, b: 255 }   // Blue
        ];

        const baseColor = colors[result.root];
        const brightness = 1 - (result.iterations / 50);

        return {
            r: Math.floor(baseColor.r * brightness),
            g: Math.floor(baseColor.g * brightness),
            b: Math.floor(baseColor.b * brightness)
        };
    }

    visualizeMagnitude(c) {
        const magnitude = Utils.complexMagnitude(c);
        const normalized = Math.min(magnitude / 2, 1);

        const rgb = Utils.hslToRgb(240 - normalized * 240, 1, 0.5);
        return rgb;
    }

    visualizePhase(c) {
        const phase = Utils.complexPhase(c);
        const hue = ((phase + Math.PI) / (2 * Math.PI)) * 360;

        const rgb = Utils.hslToRgb(hue, 1, 0.5);
        return rgb;
    }

    visualizeDomainColoring(c) {
        const magnitude = Utils.complexMagnitude(c);
        const phase = Utils.complexPhase(c);

        // Hue from phase
        const hue = ((phase + Math.PI) / (2 * Math.PI)) * 360;

        // Lightness from magnitude (with modulo for contour lines)
        const logMag = Math.log(magnitude + 1);
        const lightness = 0.5 + 0.3 * Math.sin(logMag * 3);

        const rgb = Utils.hslToRgb(hue, 1, lightness);
        return rgb;
    }

    updateStats(renderTime) {
        const statsDiv = document.getElementById('stats');

        let functionDesc = '';
        switch(this.functionType) {
            case 'mandelbrot':
                functionDesc = 'f(z) = z² + c';
                break;
            case 'sine':
                functionDesc = 'f(z) = sin(z)';
                break;
            case 'exp':
                functionDesc = 'f(z) = eᶻ';
                break;
            case 'polynomial':
                functionDesc = 'f(z) = z³ - 1';
                break;
            case 'newton':
                functionDesc = "Newton's method: z³ - 1 = 0";
                break;
        }

        statsDiv.innerHTML = `
            <strong>Complex Function Visualization</strong><br>
            Function: ${functionDesc}<br>
            Center: (${this.centerX.toFixed(3)}, ${this.centerY.toFixed(3)})<br>
            Zoom: ${this.zoom.toFixed(2)}x<br>
            Visualization: ${this.vizType}<br>
            <br>
            Render Time: ${Utils.formatTime(renderTime)}<br>
            Resolution: ${this.canvas.width} × ${this.canvas.height}<br>
            <br>
            <em>Scroll to zoom, drag to pan</em>
        `;
    }

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
    }
}
