// Sorting Algorithm Visualizer
// Visualizes the "latent space" of sorting algorithms - how data transforms through the algorithm

class SortVisualizer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.array = [];
        this.elementColors = []; // Store unique color for each element
        this.states = [];
        this.currentState = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.speed = 50;
        this.comparisons = 0;
        this.swaps = 0;
        this.startTime = 0;
        this.visualizationMode = 'bars'; // 'bars' or 'latent'
    }

    initialize(size) {
        this.array = Utils.generateRandomArray(size, 100);
        // Assign a unique color to each element based on its initial value
        this.elementColors = this.array.map((val, idx) => {
            const hue = (idx / size) * 360;
            return { hue, saturation: 0.8, lightness: 0.6 };
        });
        this.states = [];
        this.currentState = 0;
        this.comparisons = 0;
        this.swaps = 0;
        this.draw();
    }

    shuffle() {
        // Shuffle array while maintaining color associations
        const indices = this.array.map((_, i) => i);
        const shuffledIndices = Utils.shuffleArray(indices);

        const newArray = [];
        const newColors = [];
        shuffledIndices.forEach(oldIdx => {
            newArray.push(this.array[oldIdx]);
            newColors.push(this.elementColors[oldIdx]);
        });

        this.array = newArray;
        this.elementColors = newColors;
        this.states = [];
        this.currentState = 0;
        this.comparisons = 0;
        this.swaps = 0;
        this.draw();
    }

    setVisualizationMode(mode) {
        this.visualizationMode = mode;
        this.draw();
    }

    async sort(algorithm) {
        if (this.isRunning) return;

        this.isRunning = true;
        this.isPaused = false;
        this.states = [];
        this.comparisons = 0;
        this.swaps = 0;
        this.startTime = Date.now();

        // Generate all states
        switch(algorithm) {
            case 'bubble':
                await this.bubbleSort();
                break;
            case 'quick':
                await this.quickSort(0, this.array.length - 1);
                break;
            case 'merge':
                await this.mergeSort(0, this.array.length - 1);
                break;
            case 'insertion':
                await this.insertionSort();
                break;
            case 'selection':
                await this.selectionSort();
                break;
        }

        // Animate through states
        this.currentState = 0;
        await this.animate();
        this.isRunning = false;
    }

    async animate() {
        while (this.currentState < this.states.length && this.isRunning) {
            if (!this.isPaused) {
                const state = this.states[this.currentState];
                this.array = [...state.array];
                this.drawWithHighlight(state.comparing, state.swapping);
                this.updateStats();
                this.currentState++;

                const delay = 101 - this.speed; // Inverse relationship
                await Utils.sleep(delay);
            } else {
                await Utils.sleep(100);
            }
        }

        if (this.currentState >= this.states.length) {
            this.drawSorted();
            this.updateStats(true);
        }
    }

    pause() {
        this.isPaused = !this.isPaused;
    }

    stop() {
        this.isRunning = false;
        this.isPaused = false;
    }

    reset() {
        this.stop();
        this.currentState = 0;
        this.draw();
        this.updateStats();
    }

    // Sorting Algorithms
    async bubbleSort() {
        const arr = [...this.array];
        const n = arr.length;

        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                this.comparisons++;
                this.states.push({
                    array: [...arr],
                    comparing: [j, j + 1],
                    swapping: []
                });

                if (arr[j] > arr[j + 1]) {
                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                    this.swaps++;
                    this.states.push({
                        array: [...arr],
                        comparing: [],
                        swapping: [j, j + 1]
                    });
                }
            }
        }
    }

    async quickSort(low, high) {
        if (low < high) {
            const pi = await this.partition(low, high);
            await this.quickSort(low, pi - 1);
            await this.quickSort(pi + 1, high);
        }
    }

    async partition(low, high) {
        const arr = this.states.length > 0
            ? [...this.states[this.states.length - 1].array]
            : [...this.array];

        const pivot = arr[high];
        let i = low - 1;

        for (let j = low; j < high; j++) {
            this.comparisons++;
            this.states.push({
                array: [...arr],
                comparing: [j, high],
                swapping: []
            });

            if (arr[j] < pivot) {
                i++;
                [arr[i], arr[j]] = [arr[j], arr[i]];
                this.swaps++;
                this.states.push({
                    array: [...arr],
                    comparing: [],
                    swapping: [i, j]
                });
            }
        }

        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        this.swaps++;
        this.states.push({
            array: [...arr],
            comparing: [],
            swapping: [i + 1, high]
        });

        return i + 1;
    }

    async mergeSort(left, right) {
        if (left < right) {
            const mid = Math.floor((left + right) / 2);
            await this.mergeSort(left, mid);
            await this.mergeSort(mid + 1, right);
            await this.merge(left, mid, right);
        }
    }

    async merge(left, mid, right) {
        const arr = this.states.length > 0
            ? [...this.states[this.states.length - 1].array]
            : [...this.array];

        const leftArr = arr.slice(left, mid + 1);
        const rightArr = arr.slice(mid + 1, right + 1);

        let i = 0, j = 0, k = left;

        while (i < leftArr.length && j < rightArr.length) {
            this.comparisons++;
            this.states.push({
                array: [...arr],
                comparing: [left + i, mid + 1 + j],
                swapping: []
            });

            if (leftArr[i] <= rightArr[j]) {
                arr[k] = leftArr[i];
                i++;
            } else {
                arr[k] = rightArr[j];
                j++;
            }
            this.swaps++;
            this.states.push({
                array: [...arr],
                comparing: [],
                swapping: [k]
            });
            k++;
        }

        while (i < leftArr.length) {
            arr[k] = leftArr[i];
            this.states.push({
                array: [...arr],
                comparing: [],
                swapping: [k]
            });
            i++;
            k++;
        }

        while (j < rightArr.length) {
            arr[k] = rightArr[j];
            this.states.push({
                array: [...arr],
                comparing: [],
                swapping: [k]
            });
            j++;
            k++;
        }
    }

    async insertionSort() {
        const arr = [...this.array];
        const n = arr.length;

        for (let i = 1; i < n; i++) {
            const key = arr[i];
            let j = i - 1;

            this.states.push({
                array: [...arr],
                comparing: [i],
                swapping: []
            });

            while (j >= 0 && arr[j] > key) {
                this.comparisons++;
                this.states.push({
                    array: [...arr],
                    comparing: [j, j + 1],
                    swapping: []
                });

                arr[j + 1] = arr[j];
                this.swaps++;
                this.states.push({
                    array: [...arr],
                    comparing: [],
                    swapping: [j + 1]
                });
                j--;
            }

            arr[j + 1] = key;
            this.states.push({
                array: [...arr],
                comparing: [],
                swapping: [j + 1]
            });
        }
    }

    async selectionSort() {
        const arr = [...this.array];
        const n = arr.length;

        for (let i = 0; i < n - 1; i++) {
            let minIdx = i;

            for (let j = i + 1; j < n; j++) {
                this.comparisons++;
                this.states.push({
                    array: [...arr],
                    comparing: [minIdx, j],
                    swapping: []
                });

                if (arr[j] < arr[minIdx]) {
                    minIdx = j;
                }
            }

            if (minIdx !== i) {
                [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
                this.swaps++;
                this.states.push({
                    array: [...arr],
                    comparing: [],
                    swapping: [i, minIdx]
                });
            }
        }
    }

    // Drawing methods
    draw() {
        if (this.visualizationMode === 'latent') {
            this.drawLatentSpace();
        } else {
            this.drawBars();
        }
    }

    drawBars() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const barWidth = width / this.array.length;

        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, width, height);

        this.array.forEach((value, idx) => {
            const barHeight = (value / 100) * height * 0.9;
            const x = idx * barWidth;
            const y = height - barHeight;

            // Use unique color for each element
            const color = this.elementColors[idx];
            const rgb = Utils.hslToRgb(color.hue, color.saturation, color.lightness);
            this.ctx.fillStyle = Utils.rgbToHex(rgb.r, rgb.g, rgb.b);
            this.ctx.fillRect(x + 1, y, barWidth - 2, barHeight);

            // Add glow effect
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = Utils.rgbToHex(rgb.r, rgb.g, rgb.b);
            this.ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
            this.ctx.shadowBlur = 0;
        });
    }

    drawLatentSpace() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const padding = 50;

        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, width, height);

        // Draw axes
        this.ctx.strokeStyle = '#334155';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(padding, padding);
        this.ctx.lineTo(padding, height - padding);
        this.ctx.lineTo(width - padding, height - padding);
        this.ctx.stroke();

        // Labels
        this.ctx.fillStyle = '#94a3b8';
        this.ctx.font = '14px monospace';
        this.ctx.fillText('Position (Index)', width / 2 - 50, height - 15);
        this.ctx.save();
        this.ctx.translate(15, height / 2);
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.fillText('Value', 0, 0);
        this.ctx.restore();

        // Draw points in latent space
        const xScale = (width - 2 * padding) / this.array.length;
        const yScale = (height - 2 * padding) / 100;

        this.array.forEach((value, idx) => {
            const x = padding + idx * xScale + xScale / 2;
            const y = height - padding - value * yScale;

            // Draw connection lines to show ordering
            if (idx > 0) {
                const prevValue = this.array[idx - 1];
                const prevX = padding + (idx - 1) * xScale + xScale / 2;
                const prevY = height - padding - prevValue * yScale;

                this.ctx.strokeStyle = 'rgba(100, 116, 139, 0.3)';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(prevX, prevY);
                this.ctx.lineTo(x, y);
                this.ctx.stroke();
            }

            // Draw point
            const color = this.elementColors[idx];
            const rgb = Utils.hslToRgb(color.hue, color.saturation, color.lightness);
            const colorHex = Utils.rgbToHex(rgb.r, rgb.g, rgb.b);

            // Outer glow
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = colorHex;
            this.ctx.fillStyle = colorHex;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 6, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;

            // Inner bright center
            this.ctx.fillStyle = '#fff';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 3, 0, 2 * Math.PI);
            this.ctx.fill();
        });
    }

    drawWithHighlight(comparing, swapping) {
        if (this.visualizationMode === 'latent') {
            this.drawLatentSpaceWithHighlight(comparing, swapping);
        } else {
            this.drawBarsWithHighlight(comparing, swapping);
        }
    }

    drawBarsWithHighlight(comparing, swapping) {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const barWidth = width / this.array.length;

        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, width, height);

        this.array.forEach((value, idx) => {
            const barHeight = (value / 100) * height * 0.9;
            const x = idx * barWidth;
            const y = height - barHeight;

            let colorHex;
            let glow = 10;
            if (comparing.includes(idx)) {
                colorHex = '#ffd700'; // Gold for comparing
                glow = 20;
            } else if (swapping.includes(idx)) {
                colorHex = '#ff1744'; // Bright red for swapping
                glow = 25;
            } else {
                // Use unique color for each element
                const color = this.elementColors[idx];
                const rgb = Utils.hslToRgb(color.hue, color.saturation, color.lightness);
                colorHex = Utils.rgbToHex(rgb.r, rgb.g, rgb.b);
            }

            this.ctx.fillStyle = colorHex;
            this.ctx.shadowBlur = glow;
            this.ctx.shadowColor = colorHex;
            this.ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
            this.ctx.shadowBlur = 0;
        });
    }

    drawLatentSpaceWithHighlight(comparing, swapping) {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const padding = 50;

        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, width, height);

        // Draw axes
        this.ctx.strokeStyle = '#334155';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(padding, padding);
        this.ctx.lineTo(padding, height - padding);
        this.ctx.lineTo(width - padding, height - padding);
        this.ctx.stroke();

        // Labels
        this.ctx.fillStyle = '#94a3b8';
        this.ctx.font = '14px monospace';
        this.ctx.fillText('Position (Index)', width / 2 - 50, height - 15);
        this.ctx.save();
        this.ctx.translate(15, height / 2);
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.fillText('Value', 0, 0);
        this.ctx.restore();

        // Draw points
        const xScale = (width - 2 * padding) / this.array.length;
        const yScale = (height - 2 * padding) / 100;

        this.array.forEach((value, idx) => {
            const x = padding + idx * xScale + xScale / 2;
            const y = height - padding - value * yScale;

            // Draw connection lines
            if (idx > 0) {
                const prevValue = this.array[idx - 1];
                const prevX = padding + (idx - 1) * xScale + xScale / 2;
                const prevY = height - padding - prevValue * yScale;

                this.ctx.strokeStyle = 'rgba(100, 116, 139, 0.3)';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(prevX, prevY);
                this.ctx.lineTo(x, y);
                this.ctx.stroke();
            }

            // Determine color and size
            let colorHex;
            let radius = 6;
            let glowIntensity = 15;

            if (comparing.includes(idx)) {
                colorHex = '#ffd700';
                radius = 8;
                glowIntensity = 25;
            } else if (swapping.includes(idx)) {
                colorHex = '#ff1744';
                radius = 9;
                glowIntensity = 30;
            } else {
                const color = this.elementColors[idx];
                const rgb = Utils.hslToRgb(color.hue, color.saturation, color.lightness);
                colorHex = Utils.rgbToHex(rgb.r, rgb.g, rgb.b);
            }

            // Draw point with glow
            this.ctx.shadowBlur = glowIntensity;
            this.ctx.shadowColor = colorHex;
            this.ctx.fillStyle = colorHex;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;

            // Inner bright center
            this.ctx.fillStyle = '#fff';
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius / 2, 0, 2 * Math.PI);
            this.ctx.fill();
        });
    }

    drawSorted() {
        if (this.visualizationMode === 'latent') {
            this.drawLatentSpaceSorted();
        } else {
            this.drawBarsSorted();
        }
    }

    drawBarsSorted() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const barWidth = width / this.array.length;

        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, width, height);

        this.array.forEach((value, idx) => {
            const barHeight = (value / 100) * height * 0.9;
            const x = idx * barWidth;
            const y = height - barHeight;

            // Use unique color with enhanced brightness for sorted state
            const color = this.elementColors[idx];
            const rgb = Utils.hslToRgb(color.hue, color.saturation, 0.7); // Brighter
            const colorHex = Utils.rgbToHex(rgb.r, rgb.g, rgb.b);

            this.ctx.fillStyle = colorHex;
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = colorHex;
            this.ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
            this.ctx.shadowBlur = 0;

            // Add white highlight at top
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.fillRect(x + 1, y, barWidth - 2, Math.min(barHeight * 0.3, 10));
        });
    }

    drawLatentSpaceSorted() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const padding = 50;

        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, width, height);

        // Draw axes
        this.ctx.strokeStyle = '#10b981';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(padding, padding);
        this.ctx.lineTo(padding, height - padding);
        this.ctx.lineTo(width - padding, height - padding);
        this.ctx.stroke();

        // Labels
        this.ctx.fillStyle = '#10b981';
        this.ctx.font = 'bold 14px monospace';
        this.ctx.fillText('Position (Index) - SORTED ✓', width / 2 - 100, height - 15);
        this.ctx.save();
        this.ctx.translate(15, height / 2);
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.fillText('Value', 0, 0);
        this.ctx.restore();

        // Draw points
        const xScale = (width - 2 * padding) / this.array.length;
        const yScale = (height - 2 * padding) / 100;

        this.array.forEach((value, idx) => {
            const x = padding + idx * xScale + xScale / 2;
            const y = height - padding - value * yScale;

            // Draw connection lines (should be diagonal for sorted)
            if (idx > 0) {
                const prevValue = this.array[idx - 1];
                const prevX = padding + (idx - 1) * xScale + xScale / 2;
                const prevY = height - padding - prevValue * yScale;

                this.ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(prevX, prevY);
                this.ctx.lineTo(x, y);
                this.ctx.stroke();
            }

            // Draw point with enhanced glow
            const color = this.elementColors[idx];
            const rgb = Utils.hslToRgb(color.hue, color.saturation, 0.7);
            const colorHex = Utils.rgbToHex(rgb.r, rgb.g, rgb.b);

            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = colorHex;
            this.ctx.fillStyle = colorHex;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 7, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;

            // Inner bright center
            this.ctx.fillStyle = '#fff';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 4, 0, 2 * Math.PI);
            this.ctx.fill();
        });
    }

    updateStats(finished = false) {
        const elapsed = Date.now() - this.startTime;
        const statsDiv = document.getElementById('stats');

        statsDiv.innerHTML = `
            <strong>Sorting Algorithm Statistics</strong><br>
            Array Size: ${this.array.length}<br>
            Comparisons: ${Utils.formatNumber(this.comparisons)}<br>
            Swaps: ${Utils.formatNumber(this.swaps)}<br>
            States: ${Utils.formatNumber(this.states.length)}<br>
            Current State: ${this.currentState}/${this.states.length}<br>
            Time: ${Utils.formatTime(elapsed)}<br>
            ${finished ? '<span style="color: #48bb78;">✓ Sorting Complete!</span>' : ''}
        `;
    }
}
