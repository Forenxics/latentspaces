// Utility functions for the visualizer

class Utils {
    // Color utilities
    static hslToRgb(h, s, l) {
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c/2;

        let r, g, b;
        if (h < 60) { r = c; g = x; b = 0; }
        else if (h < 120) { r = x; g = c; b = 0; }
        else if (h < 180) { r = 0; g = c; b = x; }
        else if (h < 240) { r = 0; g = x; b = c; }
        else if (h < 300) { r = x; g = 0; b = c; }
        else { r = c; g = 0; b = x; }

        return {
            r: Math.round((r + m) * 255),
            g: Math.round((g + m) * 255),
            b: Math.round((b + m) * 255)
        };
    }

    static rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    static getColorScheme(scheme, iterations, maxIterations) {
        const t = iterations / maxIterations;

        switch(scheme) {
            case 'electric':
                return this.electricBlue(t);
            case 'fire':
                return this.fireColors(t);
            case 'ocean':
                return this.oceanColors(t);
            case 'rainbow':
                return this.rainbowColors(t);
            case 'monochrome':
                return this.monochromeColors(t);
            default:
                return this.electricBlue(t);
        }
    }

    static electricBlue(t) {
        if (t === 1) return '#000000';
        const hue = 200 + t * 180;
        const rgb = this.hslToRgb(hue, 1, 0.5 + t * 0.3);
        return this.rgbToHex(rgb.r, rgb.g, rgb.b);
    }

    static fireColors(t) {
        if (t === 1) return '#000000';
        const hue = t * 60;
        const rgb = this.hslToRgb(hue, 1, 0.5);
        return this.rgbToHex(rgb.r, rgb.g, rgb.b);
    }

    static oceanColors(t) {
        if (t === 1) return '#000018';
        const hue = 200 + t * 60;
        const rgb = this.hslToRgb(hue, 0.8, 0.3 + t * 0.4);
        return this.rgbToHex(rgb.r, rgb.g, rgb.b);
    }

    static rainbowColors(t) {
        if (t === 1) return '#000000';
        const hue = t * 360;
        const rgb = this.hslToRgb(hue, 1, 0.5);
        return this.rgbToHex(rgb.r, rgb.g, rgb.b);
    }

    static monochromeColors(t) {
        const value = Math.floor((1 - t) * 255);
        return this.rgbToHex(value, value, value);
    }

    // Complex number utilities
    static complexAdd(a, b) {
        return { re: a.re + b.re, im: a.im + b.im };
    }

    static complexMultiply(a, b) {
        return {
            re: a.re * b.re - a.im * b.im,
            im: a.re * b.im + a.im * b.re
        };
    }

    static complexMagnitude(c) {
        return Math.sqrt(c.re * c.re + c.im * c.im);
    }

    static complexPhase(c) {
        return Math.atan2(c.im, c.re);
    }

    static complexExp(c) {
        const expReal = Math.exp(c.re);
        return {
            re: expReal * Math.cos(c.im),
            im: expReal * Math.sin(c.im)
        };
    }

    static complexSin(c) {
        return {
            re: Math.sin(c.re) * Math.cosh(c.im),
            im: Math.cos(c.re) * Math.sinh(c.im)
        };
    }

    static complexPower(c, n) {
        let result = { re: 1, im: 0 };
        for (let i = 0; i < n; i++) {
            result = this.complexMultiply(result, c);
        }
        return result;
    }

    // Array utilities
    static shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    static generateRandomArray(size, max = 100) {
        return Array.from({ length: size }, () => Math.floor(Math.random() * max) + 1);
    }

    // Animation utilities
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static lerp(start, end, t) {
        return start + (end - start) * t;
    }

    static easeInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    // Stats formatting
    static formatNumber(num) {
        return num.toLocaleString();
    }

    static formatTime(ms) {
        if (ms < 1000) return `${ms.toFixed(0)}ms`;
        return `${(ms / 1000).toFixed(2)}s`;
    }
}
