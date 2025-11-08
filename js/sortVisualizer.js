// Sorting Algorithm Visualizer
// Visualizes the "latent space" of sorting algorithms - how data transforms through the algorithm

class SortVisualizer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.array = [];
        this.states = [];
        this.currentState = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.speed = 50;
        this.comparisons = 0;
        this.swaps = 0;
        this.startTime = 0;
    }

    initialize(size) {
        this.array = Utils.generateRandomArray(size, 100);
        this.states = [];
        this.currentState = 0;
        this.comparisons = 0;
        this.swaps = 0;
        this.draw();
    }

    shuffle() {
        this.array = Utils.shuffleArray(this.array);
        this.states = [];
        this.currentState = 0;
        this.comparisons = 0;
        this.swaps = 0;
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
        const width = this.canvas.width;
        const height = this.canvas.height;
        const barWidth = width / this.array.length;

        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, width, height);

        this.array.forEach((value, idx) => {
            const barHeight = (value / 100) * height * 0.9;
            const x = idx * barWidth;
            const y = height - barHeight;

            // Gradient for bars
            const gradient = this.ctx.createLinearGradient(x, y, x, height);
            gradient.addColorStop(0, '#667eea');
            gradient.addColorStop(1, '#764ba2');

            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
        });
    }

    drawWithHighlight(comparing, swapping) {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const barWidth = width / this.array.length;

        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, width, height);

        this.array.forEach((value, idx) => {
            const barHeight = (value / 100) * height * 0.9;
            const x = idx * barWidth;
            const y = height - barHeight;

            let color;
            if (comparing.includes(idx)) {
                color = '#ffd700'; // Gold for comparing
            } else if (swapping.includes(idx)) {
                color = '#ff4757'; // Red for swapping
            } else {
                const gradient = this.ctx.createLinearGradient(x, y, x, height);
                gradient.addColorStop(0, '#667eea');
                gradient.addColorStop(1, '#764ba2');
                color = gradient;
            }

            this.ctx.fillStyle = color;
            this.ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
        });
    }

    drawSorted() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const barWidth = width / this.array.length;

        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, width, height);

        this.array.forEach((value, idx) => {
            const barHeight = (value / 100) * height * 0.9;
            const x = idx * barWidth;
            const y = height - barHeight;

            // Green gradient for sorted
            const gradient = this.ctx.createLinearGradient(x, y, x, height);
            gradient.addColorStop(0, '#48bb78');
            gradient.addColorStop(1, '#38a169');

            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
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
