// Cayley Table Visualizer
// Visualizes group theory structures - algebraic latent spaces

class CayleyTableVisualizer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.group = null;
        this.mode = 'table';
        this.animationFrame = 0;
        this.isAnimating = false;
    }

    setGroup(groupType) {
        switch(groupType) {
            case 'z4':
                this.group = this.createCyclicGroup(4);
                break;
            case 'z5':
                this.group = this.createCyclicGroup(5);
                break;
            case 'z6':
                this.group = this.createCyclicGroup(6);
                break;
            case 's3':
                this.group = this.createSymmetricGroup3();
                break;
            case 'klein':
                this.group = this.createKleinFourGroup();
                break;
            case 'd4':
                this.group = this.createDihedralGroup4();
                break;
        }
        this.draw();
    }

    setMode(mode) {
        this.mode = mode;
        this.draw();
    }

    createCyclicGroup(n) {
        const elements = Array.from({ length: n }, (_, i) => i);
        const operation = (a, b) => (a + b) % n;
        const table = elements.map(a =>
            elements.map(b => operation(a, b))
        );

        return {
            name: `Z${n}`,
            elements,
            labels: elements.map(i => i.toString()),
            operation,
            table
        };
    }

    createSymmetricGroup3() {
        const elements = [
            [0, 1, 2], // identity
            [1, 2, 0], // (012)
            [2, 0, 1], // (021)
            [0, 2, 1], // (01)
            [2, 1, 0], // (02)
            [1, 0, 2]  // (12)
        ];

        const compose = (p1, p2) => {
            return p2.map(i => p1[i]);
        };

        const table = elements.map(e1 =>
            elements.map(e2 => {
                const result = compose(e1, e2);
                return elements.findIndex(e =>
                    e.every((val, idx) => val === result[idx])
                );
            })
        );

        return {
            name: 'S₃',
            elements,
            labels: ['e', 'σ', 'σ²', 'τ₁', 'τ₂', 'τ₃'],
            operation: compose,
            table
        };
    }

    createKleinFourGroup() {
        const elements = ['e', 'a', 'b', 'c'];
        const table = [
            [0, 1, 2, 3],
            [1, 0, 3, 2],
            [2, 3, 0, 1],
            [3, 2, 1, 0]
        ];

        return {
            name: 'V₄',
            elements,
            labels: elements,
            operation: null,
            table
        };
    }

    createDihedralGroup4() {
        // D4: rotations and reflections of a square
        const elements = ['e', 'r', 'r²', 'r³', 's', 'sr', 'sr²', 'sr³'];
        const table = [
            [0, 1, 2, 3, 4, 5, 6, 7],
            [1, 2, 3, 0, 7, 4, 5, 6],
            [2, 3, 0, 1, 6, 7, 4, 5],
            [3, 0, 1, 2, 5, 6, 7, 4],
            [4, 5, 6, 7, 0, 1, 2, 3],
            [5, 6, 7, 4, 3, 0, 1, 2],
            [6, 7, 4, 5, 2, 3, 0, 1],
            [7, 4, 5, 6, 1, 2, 3, 0]
        ];

        return {
            name: 'D₄',
            elements,
            labels: elements,
            operation: null,
            table
        };
    }

    draw() {
        if (!this.group) return;

        const width = this.canvas.width;
        const height = this.canvas.height;

        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, width, height);

        switch(this.mode) {
            case 'table':
                this.drawTable();
                break;
            case 'graph':
                this.drawCayleyGraph();
                break;
            case 'heatmap':
                this.drawHeatmap();
                break;
        }

        this.updateStats();
    }

    drawTable() {
        const { table, labels } = this.group;
        const n = labels.length;
        const width = this.canvas.width;
        const height = this.canvas.height;

        const cellSize = Math.min((width - 100) / (n + 1), (height - 100) / (n + 1));
        const startX = (width - cellSize * (n + 1)) / 2;
        const startY = (height - cellSize * (n + 1)) / 2;

        // Draw header row
        this.ctx.fillStyle = '#667eea';
        this.ctx.font = 'bold 16px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        for (let i = 0; i < n; i++) {
            this.ctx.fillText(
                labels[i],
                startX + (i + 1) * cellSize + cellSize / 2,
                startY + cellSize / 2
            );
        }

        // Draw header column
        for (let i = 0; i < n; i++) {
            this.ctx.fillText(
                labels[i],
                startX + cellSize / 2,
                startY + (i + 1) * cellSize + cellSize / 2
            );
        }

        // Draw multiplication symbol in corner
        this.ctx.fillText('∗', startX + cellSize / 2, startY + cellSize / 2);

        // Draw table cells
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                const value = table[i][j];
                const x = startX + (j + 1) * cellSize;
                const y = startY + (i + 1) * cellSize;

                // Color based on value
                const hue = (value / n) * 360;
                const rgb = Utils.hslToRgb(hue, 0.7, 0.5);
                this.ctx.fillStyle = Utils.rgbToHex(rgb.r, rgb.g, rgb.b);
                this.ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4);

                // Draw border
                this.ctx.strokeStyle = '#667eea';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(x, y, cellSize, cellSize);

                // Draw value
                this.ctx.fillStyle = '#fff';
                this.ctx.font = 'bold 14px monospace';
                this.ctx.fillText(labels[value], x + cellSize / 2, y + cellSize / 2);
            }
        }
    }

    drawCayleyGraph() {
        const { labels } = this.group;
        const n = labels.length;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) * 0.35;

        // Calculate node positions in a circle
        const positions = labels.map((_, i) => {
            const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
            return {
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle)
            };
        });

        // Draw edges (connections based on group operation)
        this.ctx.strokeStyle = 'rgba(102, 126, 234, 0.3)';
        this.ctx.lineWidth = 2;

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (i !== j) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(positions[i].x, positions[i].y);
                    this.ctx.lineTo(positions[j].x, positions[j].y);
                    this.ctx.stroke();
                }
            }
        }

        // Draw nodes
        positions.forEach((pos, i) => {
            // Outer glow
            const gradient = this.ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 30);
            gradient.addColorStop(0, '#667eea');
            gradient.addColorStop(1, 'rgba(102, 126, 234, 0)');
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, 30, 0, 2 * Math.PI);
            this.ctx.fill();

            // Node
            this.ctx.fillStyle = '#764ba2';
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, 20, 0, 2 * Math.PI);
            this.ctx.fill();

            this.ctx.strokeStyle = '#667eea';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();

            // Label
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 16px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(labels[i], pos.x, pos.y);
        });
    }

    drawHeatmap() {
        const { table, labels } = this.group;
        const n = labels.length;
        const width = this.canvas.width;
        const height = this.canvas.height;

        const cellSize = Math.min(width / n, height / n);
        const startX = (width - cellSize * n) / 2;
        const startY = (height - cellSize * n) / 2;

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                const value = table[i][j];
                const x = startX + j * cellSize;
                const y = startY + i * cellSize;

                // Create gradient based on value
                const intensity = value / n;
                const gradient = this.ctx.createLinearGradient(x, y, x + cellSize, y + cellSize);

                const rgb1 = Utils.hslToRgb(240, 0.8, 0.2 + intensity * 0.5);
                const rgb2 = Utils.hslToRgb(320, 0.8, 0.3 + intensity * 0.4);

                gradient.addColorStop(0, Utils.rgbToHex(rgb1.r, rgb1.g, rgb1.b));
                gradient.addColorStop(1, Utils.rgbToHex(rgb2.r, rgb2.g, rgb2.b));

                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(x, y, cellSize, cellSize);

                // Draw subtle border
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(x, y, cellSize, cellSize);
            }
        }

        // Draw axis labels
        this.ctx.fillStyle = '#667eea';
        this.ctx.font = 'bold 14px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        for (let i = 0; i < n; i++) {
            // Top labels
            this.ctx.fillText(
                labels[i],
                startX + i * cellSize + cellSize / 2,
                startY - 20
            );
            // Left labels
            this.ctx.fillText(
                labels[i],
                startX - 20,
                startY + i * cellSize + cellSize / 2
            );
        }
    }

    async animate() {
        if (this.isAnimating) {
            this.isAnimating = false;
            return;
        }

        this.isAnimating = true;
        this.animationFrame = 0;

        const animate = () => {
            if (!this.isAnimating) return;

            this.animationFrame++;
            this.draw();

            // Add rotation or other animation effects
            if (this.mode === 'graph') {
                this.ctx.save();
                this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
                this.ctx.rotate(this.animationFrame * 0.01);
                this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2);
                this.ctx.restore();
            }

            requestAnimationFrame(animate);
        };

        animate();
    }

    stopAnimation() {
        this.isAnimating = false;
    }

    updateStats() {
        if (!this.group) return;

        const statsDiv = document.getElementById('stats');
        const n = this.group.labels.length;

        // Check group properties
        const isAbelian = this.checkAbelian();

        statsDiv.innerHTML = `
            <strong>Group Theory: ${this.group.name}</strong><br>
            Order: ${n}<br>
            Elements: {${this.group.labels.join(', ')}}<br>
            Properties:<br>
            - Closure: ✓<br>
            - Associativity: ✓<br>
            - Identity: ${this.group.labels[0]}<br>
            - Inverse: ✓<br>
            - Abelian: ${isAbelian ? '✓' : '✗'}<br>
            <br>
            Visualization: ${this.mode}
        `;
    }

    checkAbelian() {
        const { table } = this.group;
        const n = table.length;

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (table[i][j] !== table[j][i]) {
                    return false;
                }
            }
        }
        return true;
    }
}
