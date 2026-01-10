// JavaScript implementation for LCS Algorithm Visualization

// Example presets
const PRESETS = {
    dna: {
        string1: 'AGGTAB',
        string2: 'GXTXAYB'
    },
    code: {
        string1: 'function calculateSum(a, b) { return a + b; }',
        string2: 'function computeSum(x, y) { return x + y; }'
    },
    natural: {
        string1: 'The quick brown fox jumps over the lazy dog',
        string2: 'The lazy dog was jumped over by a quick brown fox'
    },
    short: {
        string1: 'ABCDEF',
        string2: 'ACDEBF'
    }
};

// Input sanitization - escape HTML to prevent XSS
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') {
        return '';
    }
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Core LCS algorithm functions
function longestCommonBacktrack(x, y) {
    const m = x.length;
    const n = y.length;

    // Initialize matrices with zeros
    const res = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    const backtrack = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    // Fill the matrices
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const match = x[i - 1] === y[j - 1] ? 1 : 0;
            res[i][j] = Math.max(
                res[i - 1][j],
                res[i][j - 1],
                res[i - 1][j - 1] + match
            );

            // Determine backtrack direction
            if (res[i][j] === res[i - 1][j - 1]) {
                backtrack[i][j] = 4;
            } else if (res[i][j] === res[i - 1][j]) {
                backtrack[i][j] = 1;
            } else if (res[i][j] === res[i][j - 1]) {
                backtrack[i][j] = 2;
            } else if (res[i][j] === res[i - 1][j - 1] + 1 && x[i - 1] === y[j - 1]) {
                backtrack[i][j] = 3;
            }
        }
    }

    return backtrack;
}

// Helper function to show error messages
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
    setTimeout(() => {
        errorDiv.classList.remove('show');
    }, 5000);
}

// Helper function to hide error messages
function hideError() {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.classList.remove('show');
}

// Helper function to update character count
function updateCharCount(textareaId, countId, warningId) {
    const textarea = document.getElementById(textareaId);
    const countSpan = document.getElementById(countId);
    const warningSpan = document.getElementById(warningId);
    const length = textarea.value.length;

    countSpan.textContent = `${length} character${length !== 1 ? 's' : ''}`;

    if (length > 10000) {
        warningSpan.textContent = '⚠️ Very large input - computation may take time';
    } else if (length > 5000) {
        warningSpan.textContent = '⚠️ Large input';
    } else {
        warningSpan.textContent = '';
    }
}

// Helper function to show loading indicator
function showLoading(message = 'Preparing visualization...') {
    const loadingDiv = document.getElementById('loadingIndicator');
    const loadingText = loadingDiv.querySelector('.loading-text');
    loadingText.textContent = message;
    loadingDiv.classList.add('show');
}

// Helper function to hide loading indicator
function hideLoading() {
    const loadingDiv = document.getElementById('loadingIndicator');
    loadingDiv.classList.remove('show');
}

// Toggle high contrast mode
function toggleHighContrast() {
    document.body.classList.toggle('high-contrast');

    // Save preference to localStorage
    const isHighContrast = document.body.classList.contains('high-contrast');
    localStorage.setItem('highContrastMode', isHighContrast);

    // Announce to screen readers
    const message = isHighContrast ? 'High contrast mode enabled' : 'High contrast mode disabled';
    announceToScreenReader(message);
}

// Announce message to screen readers
function announceToScreenReader(message) {
    // Create or update a visually hidden live region
    let liveRegion = document.getElementById('sr-announcer');
    if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.id = 'sr-announcer';
        liveRegion.setAttribute('role', 'status');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.position = 'absolute';
        liveRegion.style.left = '-10000px';
        liveRegion.style.width = '1px';
        liveRegion.style.height = '1px';
        liveRegion.style.overflow = 'hidden';
        document.body.appendChild(liveRegion);
    }

    // Clear and set new message
    liveRegion.textContent = '';
    setTimeout(() => {
        liveRegion.textContent = message;
    }, 100);
}

// Load preset example
function loadPreset(presetName) {
    if (presetName && PRESETS[presetName]) {
        document.getElementById('string1').value = PRESETS[presetName].string1;
        document.getElementById('string2').value = PRESETS[presetName].string2;
        updateCharCount('string1', 'charCount1', 'warning1');
        updateCharCount('string2', 'charCount2', 'warning2');
    }
}

// ============================================================================
// ALGORITHM VISUALIZATION
// ============================================================================

// Visualization state
const visualizationState = {
    steps: [],
    currentStepIndex: -1,
    isPlaying: false,
    animationSpeed: 500, // milliseconds per step
    animationTimer: null,
    string1: '',
    string2: '',
    dpTable: null,
    backtrackTable: null,
    mode: 'filling' // 'filling' or 'backtracking'
};

// Speed presets
const SPEED_PRESETS = {
    slow: 1000,
    normal: 500,
    fast: 200
};

// Instrumented LCS algorithm that captures each computation step
function computeLCSWithSteps(x, y) {
    const m = x.length;
    const n = y.length;
    const steps = [];

    // Initialize matrices with zeros
    const res = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    const backtrack = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    // Add initialization step
    steps.push({
        type: 'init',
        i: 0,
        j: 0,
        dpTable: JSON.parse(JSON.stringify(res)),
        backtrackTable: JSON.parse(JSON.stringify(backtrack)),
        explanation: 'Initialize DP table with zeros. The table has dimensions (m+1) × (n+1) where m and n are the lengths of the two strings.'
    });

    // Fill the matrices and capture each step
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const match = x[i - 1] === y[j - 1] ? 1 : 0;
            const char1 = x[i - 1];
            const char2 = y[j - 1];

            // Compute the three possible values
            const fromTop = res[i - 1][j];
            const fromLeft = res[i][j - 1];
            const fromDiagonal = res[i - 1][j - 1] + match;

            res[i][j] = Math.max(fromTop, fromLeft, fromDiagonal);

            // Determine backtrack direction
            if (res[i][j] === res[i - 1][j - 1]) {
                backtrack[i][j] = 4;
            } else if (res[i][j] === res[i - 1][j]) {
                backtrack[i][j] = 1;
            } else if (res[i][j] === res[i][j - 1]) {
                backtrack[i][j] = 2;
            } else if (res[i][j] === res[i - 1][j - 1] + 1 && x[i - 1] === y[j - 1]) {
                backtrack[i][j] = 3;
            }

            // Create explanation
            let explanation = `Computing cell [${i},${j}] for characters '${char1}' (String 1) and '${char2}' (String 2).\n`;

            if (match) {
                explanation += `✓ Characters MATCH! Take diagonal value + 1: ${fromDiagonal}\n`;
            } else {
                explanation += `✗ Characters DON'T match.\n`;
                explanation += `  - From top [${i-1},${j}]: ${fromTop}\n`;
                explanation += `  - From left [${i},${j-1}]: ${fromLeft}\n`;
                explanation += `  - From diagonal [${i-1},${j-1}]: ${fromDiagonal}\n`;
            }
            explanation += `Result: max(${fromTop}, ${fromLeft}, ${fromDiagonal}) = ${res[i][j]}`;

            // Add step
            steps.push({
                type: 'compute',
                i: i,
                j: j,
                char1: char1,
                char2: char2,
                match: match === 1,
                value: res[i][j],
                fromTop: fromTop,
                fromLeft: fromLeft,
                fromDiagonal: fromDiagonal,
                dpTable: JSON.parse(JSON.stringify(res)),
                backtrackTable: JSON.parse(JSON.stringify(backtrack)),
                explanation: explanation
            });
        }
    }

    // Add completion step
    steps.push({
        type: 'complete',
        i: m,
        j: n,
        dpTable: JSON.parse(JSON.stringify(res)),
        backtrackTable: JSON.parse(JSON.stringify(backtrack)),
        explanation: `DP table filling complete! The LCS length is ${res[m][n]} (bottom-right cell). Now we can backtrack to find the actual subsequence.`
    });

    // Generate backtracking steps
    const backtrackSteps = generateBacktrackSteps(backtrack, x, y, m, n, res);

    return {
        steps: steps,
        backtrackSteps: backtrackSteps,
        dpTable: res,
        backtrackTable: backtrack,
        lcsLength: res[m][n]
    };
}

// Generate backtracking steps
function generateBacktrackSteps(backtrack, x, y, startI, startJ, dpTable) {
    const steps = [];
    let i = startI;
    let j = startJ;
    const path = [];
    const lcsChars = [];

    steps.push({
        type: 'backtrack-start',
        i: i,
        j: j,
        path: [...path],
        dpTable: JSON.parse(JSON.stringify(dpTable)),
        backtrackTable: JSON.parse(JSON.stringify(backtrack)),
        lcsChars: [...lcsChars],
        explanation: `Starting backtracking from cell [${i},${j}] (value: ${dpTable[i][j]}). The DP table is fully populated. Now we'll trace back through it to find which characters form the LCS.`
    });

    while (i > 0 || j > 0) {
        path.push({ i, j });

        let explanation = `At cell [${i},${j}] (value: ${dpTable[i][j]}). `;
        let nextI = i;
        let nextJ = j;
        let isMatch = false;

        if (i === 0 && j === 0) {
            break;
        } else if (i > 0 && j === 0) {
            explanation += `Only row boundary - move up to [${i-1},${j}].`;
            nextI = i - 1;
        } else if (i === 0 && j > 0) {
            explanation += `Only column boundary - move left to [${i},${j-1}].`;
            nextJ = j - 1;
        } else if (backtrack[i][j] === 1) {
            explanation += `Value came from above. Move UP to [${i-1},${j}].`;
            nextI = i - 1;
        } else if (backtrack[i][j] === 2) {
            explanation += `Value came from left. Move LEFT to [${i},${j-1}].`;
            nextJ = j - 1;
        } else if (backtrack[i][j] === 3) {
            isMatch = true;
            lcsChars.unshift(x[i-1]);
            explanation += `✓ MATCH! Character '${x[i-1]}' is part of the LCS! Move diagonally to [${i-1},${j-1}].\nLCS so far (reading backwards): ${lcsChars.join('')}`;
            nextI = i - 1;
            nextJ = j - 1;
        } else if (backtrack[i][j] === 4) {
            explanation += `Characters don't match (value same as diagonal). Move diagonally to [${i-1},${j-1}].`;
            nextI = i - 1;
            nextJ = j - 1;
        }

        steps.push({
            type: 'backtrack',
            i: i,
            j: j,
            nextI: nextI,
            nextJ: nextJ,
            isMatch: isMatch,
            char: isMatch ? x[i-1] : null,
            path: [...path],
            dpTable: JSON.parse(JSON.stringify(dpTable)),
            backtrackTable: JSON.parse(JSON.stringify(backtrack)),
            lcsChars: [...lcsChars],
            explanation: explanation
        });

        i = nextI;
        j = nextJ;
    }

    path.push({ i: 0, j: 0 });
    steps.push({
        type: 'backtrack-complete',
        path: [...path],
        dpTable: JSON.parse(JSON.stringify(dpTable)),
        backtrackTable: JSON.parse(JSON.stringify(backtrack)),
        lcsChars: [...lcsChars],
        explanation: `Backtracking complete! The LCS is: "${lcsChars.join('')}"\n\nThe highlighted path (in blue) shows the cells we visited. The green cells show where characters matched and contributed to the LCS.`
    });

    return steps;
}

// Render the DP table visualization
function renderDPTable(step, mode = 'filling') {
    const container = document.getElementById('dpTableContainer');
    if (!container) return;

    const { dpTable, backtrackTable } = step;
    const { string1, string2 } = visualizationState;

    if (!dpTable) return;

    const m = string1.length;
    const n = string2.length;

    let html = '<table class="dp-table">';

    // Header row
    html += '<tr><th></th><th></th>';
    for (let j = 0; j < n; j++) {
        html += `<th class="table-header">${escapeHtml(string2[j])}</th>`;
    }
    html += '</tr>';

    // Table rows
    for (let i = 0; i <= m; i++) {
        html += '<tr>';

        // Row header
        if (i === 0) {
            html += '<th></th>';
        } else {
            html += `<th class="table-header">${escapeHtml(string1[i-1])}</th>`;
        }

        // Cells
        for (let j = 0; j <= n; j++) {
            const value = dpTable[i][j];
            let cellClass = 'dp-cell';

            // Highlight current cell
            if (step.i === i && step.j === j) {
                cellClass += ' current-cell';
            }

            // Highlight next cell in backtracking
            if (mode === 'backtracking' && step.nextI === i && step.nextJ === j) {
                cellClass += ' next-cell';
            }

            // For backtracking mode, highlight the path
            if (mode === 'backtracking' && step.path) {
                const inPath = step.path.some(p => p.i === i && p.j === j);
                if (inPath) {
                    cellClass += ' path-cell';
                }
            }

            // Highlight all matched cells that contributed to LCS
            if (mode === 'backtracking' && step.lcsChars && backtrackTable) {
                // Check if this cell represents a match in the backtrack
                if (i > 0 && j > 0 && backtrackTable[i][j] === 3) {
                    // This cell had a match - check if it's in our completed path
                    const inCompletedPath = step.path.some(p => p.i === i && p.j === j);
                    if (inCompletedPath) {
                        cellClass += ' match-cell';
                    }
                }
            }

            html += `<td class="${cellClass}" data-i="${i}" data-j="${j}">
                        <div class="cell-value">${value}</div>
                     </td>`;
        }

        html += '</tr>';
    }

    html += '</table>';
    container.innerHTML = html;
}

// Render explanation tooltip
function renderExplanation(step) {
    const explanationDiv = document.getElementById('stepExplanation');
    if (!explanationDiv || !step) return;

    explanationDiv.textContent = step.explanation || '';
}

// Update step counter
function updateStepCounter() {
    const counter = document.getElementById('stepCounter');
    if (!counter) return;

    const { currentStepIndex, steps } = visualizationState;
    const total = visualizationState.mode === 'filling' ?
        visualizationState.steps.length :
        visualizationState.backtrackSteps.length;

    counter.textContent = `Step ${currentStepIndex + 1} of ${total}`;
}

// Show specific step
function showStep(index) {
    const { mode, steps, backtrackSteps } = visualizationState;
    const currentSteps = mode === 'filling' ? steps : backtrackSteps;

    if (index < 0 || index >= currentSteps.length) return;

    visualizationState.currentStepIndex = index;
    const step = currentSteps[index];

    renderDPTable(step, mode);
    renderExplanation(step);
    updateStepCounter();
    updatePlaybackButtons();
}

// Playback controls
function playVisualization() {
    if (visualizationState.isPlaying) return;

    visualizationState.isPlaying = true;
    updatePlaybackButtons();

    const animate = () => {
        if (!visualizationState.isPlaying) return;

        const { mode, steps, backtrackSteps, currentStepIndex } = visualizationState;
        const currentSteps = mode === 'filling' ? steps : backtrackSteps;

        if (currentStepIndex >= currentSteps.length - 1) {
            pauseVisualization();
            return;
        }

        showStep(currentStepIndex + 1);

        visualizationState.animationTimer = setTimeout(animate, visualizationState.animationSpeed);
    };

    animate();
}

function pauseVisualization() {
    visualizationState.isPlaying = false;
    if (visualizationState.animationTimer) {
        clearTimeout(visualizationState.animationTimer);
        visualizationState.animationTimer = null;
    }
    updatePlaybackButtons();
}

function stepForward() {
    pauseVisualization();
    const { mode, steps, backtrackSteps, currentStepIndex } = visualizationState;
    const currentSteps = mode === 'filling' ? steps : backtrackSteps;

    if (currentStepIndex < currentSteps.length - 1) {
        showStep(currentStepIndex + 1);
    }
}

function stepBackward() {
    pauseVisualization();
    if (visualizationState.currentStepIndex > 0) {
        showStep(visualizationState.currentStepIndex - 1);
    }
}

function resetVisualization() {
    pauseVisualization();
    visualizationState.currentStepIndex = -1;
    showStep(0);
}

function setVisualizationSpeed(speed) {
    visualizationState.animationSpeed = SPEED_PRESETS[speed] || 500;

    // Update button states
    document.querySelectorAll('.speed-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`speed-${speed}`)?.classList.add('active');
}

function switchToBacktracking() {
    pauseVisualization();
    visualizationState.mode = 'backtracking';
    visualizationState.currentStepIndex = -1;

    // Update mode button states
    document.getElementById('modeFillingButton').classList.remove('active');
    document.getElementById('modeBacktrackButton').classList.add('active');

    showStep(0);
}

function switchToFilling() {
    pauseVisualization();
    visualizationState.mode = 'filling';
    visualizationState.currentStepIndex = -1;

    // Update mode button states
    document.getElementById('modeFillingButton').classList.add('active');
    document.getElementById('modeBacktrackButton').classList.remove('active');

    showStep(0);
}

function updatePlaybackButtons() {
    const playButton = document.getElementById('playButton');
    const pauseButton = document.getElementById('pauseButton');
    const stepBackButton = document.getElementById('stepBackButton');
    const stepForwardButton = document.getElementById('stepForwardButton');

    if (!playButton || !pauseButton) return;

    if (visualizationState.isPlaying) {
        playButton.style.display = 'none';
        pauseButton.style.display = 'inline-block';
    } else {
        playButton.style.display = 'inline-block';
        pauseButton.style.display = 'none';
    }

    // Disable/enable step buttons based on position
    const { mode, steps, backtrackSteps, currentStepIndex } = visualizationState;
    const currentSteps = mode === 'filling' ? steps : backtrackSteps;

    if (stepBackButton) {
        stepBackButton.disabled = currentStepIndex <= 0;
    }
    if (stepForwardButton) {
        stepForwardButton.disabled = currentStepIndex >= currentSteps.length - 1;
    }
}

// Start visualization
function startVisualization() {
    const string1 = document.getElementById('string1').value;
    const string2 = document.getElementById('string2').value;

    // Hide any previous errors
    hideError();

    // Validation
    if (!string1 || !string2) {
        showError('⚠️ Please enter both strings before starting the visualization.');
        return;
    }

    // Limit string length for visualization (it can get overwhelming with large strings)
    if (string1.length > 20 || string2.length > 20) {
        const proceed = confirm('⚠️ Visualizing strings longer than 20 characters may be difficult to view. Continue anyway?');
        if (!proceed) return;
    }

    showLoading('Preparing visualization...');

    setTimeout(() => {
        try {
            // Compute LCS with steps
            const result = computeLCSWithSteps(string1, string2);

            // Store in visualization state
            visualizationState.string1 = string1;
            visualizationState.string2 = string2;
            visualizationState.steps = result.steps;
            visualizationState.backtrackSteps = result.backtrackSteps;
            visualizationState.dpTable = result.dpTable;
            visualizationState.backtrackTable = result.backtrackTable;
            visualizationState.currentStepIndex = -1;
            visualizationState.mode = 'filling';
            visualizationState.isPlaying = false;

            // Show visualization section
            document.getElementById('visualizationSection').classList.add('show');

            // Initialize visualization
            document.getElementById('modeFillingButton').classList.add('active');
            document.getElementById('modeBacktrackButton').classList.remove('active');
            setVisualizationSpeed('normal');
            showStep(0);

            // Scroll to visualization
            document.getElementById('visualizationSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (error) {
            showError('❌ An error occurred while preparing the visualization. Please try with smaller inputs.');
            console.error('Visualization error:', error);
        } finally {
            hideLoading();
        }
    }, 50);
}

// Initialize event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners for textareas
    const string1 = document.getElementById('string1');
    const string2 = document.getElementById('string2');

    // Character count updates
    string1.addEventListener('input', () => {
        updateCharCount('string1', 'charCount1', 'warning1');
    });
    string2.addEventListener('input', () => {
        updateCharCount('string2', 'charCount2', 'warning2');
    });

    // Initialize character counts
    updateCharCount('string1', 'charCount1', 'warning1');
    updateCharCount('string2', 'charCount2', 'warning2');

    // Accessibility button event listener
    document.getElementById('toggleHighContrast').addEventListener('click', toggleHighContrast);

    // Preset dropdown event listener
    document.getElementById('presets').addEventListener('change', function(e) {
        loadPreset(e.target.value);
    });

    // Restore high contrast preference from localStorage
    const savedHighContrast = localStorage.getItem('highContrastMode') === 'true';
    if (savedHighContrast) {
        document.body.classList.add('high-contrast');
    }

    // Visualization control event listeners
    const visualizeButton = document.getElementById('visualizeButton');
    if (visualizeButton) {
        visualizeButton.addEventListener('click', startVisualization);
    }

    const playButton = document.getElementById('playButton');
    if (playButton) {
        playButton.addEventListener('click', playVisualization);
    }

    const pauseButton = document.getElementById('pauseButton');
    if (pauseButton) {
        pauseButton.addEventListener('click', pauseVisualization);
    }

    const stepBackButton = document.getElementById('stepBackButton');
    if (stepBackButton) {
        stepBackButton.addEventListener('click', stepBackward);
    }

    const stepForwardButton = document.getElementById('stepForwardButton');
    if (stepForwardButton) {
        stepForwardButton.addEventListener('click', stepForward);
    }

    const resetButton = document.getElementById('resetButton');
    if (resetButton) {
        resetButton.addEventListener('click', resetVisualization);
    }

    // Speed control buttons
    const speedSlowButton = document.getElementById('speed-slow');
    if (speedSlowButton) {
        speedSlowButton.addEventListener('click', () => setVisualizationSpeed('slow'));
    }

    const speedNormalButton = document.getElementById('speed-normal');
    if (speedNormalButton) {
        speedNormalButton.addEventListener('click', () => setVisualizationSpeed('normal'));
    }

    const speedFastButton = document.getElementById('speed-fast');
    if (speedFastButton) {
        speedFastButton.addEventListener('click', () => setVisualizationSpeed('fast'));
    }

    // Mode toggle buttons
    const modeFillingButton = document.getElementById('modeFillingButton');
    if (modeFillingButton) {
        modeFillingButton.addEventListener('click', switchToFilling);
    }

    const modeBacktrackButton = document.getElementById('modeBacktrackButton');
    if (modeBacktrackButton) {
        modeBacktrackButton.addEventListener('click', switchToBacktracking);
    }
});
