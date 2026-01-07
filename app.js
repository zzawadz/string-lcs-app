// JavaScript implementation of the LCS algorithm from the C++ code

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

// View mode state (alignment or side-by-side)
let currentViewMode = 'alignment'; // 'alignment' or 'side-by-side'

// Comparison mode state ('lcs' or 'char-compare')
let comparisonMode = 'lcs';

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

function outputLCS(backtrack, x, y, i, j) {
    if (i === 0 && j === 0) {
        return { first: '', second: '', codes: [] };
    }

    if (i > 0 && j === 0) {
        const result = outputLCS(backtrack, x, y, i - 1, j);
        result.first += x[i - 1];
        result.second += '-';
        result.codes.push(1);
        return result;
    }

    if (i === 0 && j > 0) {
        const result = outputLCS(backtrack, x, y, i, j - 1);
        result.first += '-';
        result.second += y[j - 1];
        result.codes.push(2);
        return result;
    }

    if (backtrack[i][j] === 1) {
        const result = outputLCS(backtrack, x, y, i - 1, j);
        result.first += x[i - 1];
        result.second += '-';
        result.codes.push(1);
        return result;
    }
    if (backtrack[i][j] === 2) {
        const result = outputLCS(backtrack, x, y, i, j - 1);
        result.first += '-';
        result.second += y[j - 1];
        result.codes.push(2);
        return result;
    }
    if (backtrack[i][j] === 3) {
        const result = outputLCS(backtrack, x, y, i - 1, j - 1);
        result.first += x[i - 1];
        result.second += x[i - 1];
        result.codes.push(3);
        return result;
    }
    if (backtrack[i][j] === 4) {
        const result = outputLCS(backtrack, x, y, i - 1, j - 1);
        result.first += x[i - 1];
        result.second += y[j - 1];
        result.codes.push(0);
        return result;
    }

    return { first: '', second: '', codes: [] };
}

function longestCommonSubseq(x, y) {
    const backtrack = longestCommonBacktrack(x, y);
    const result = outputLCS(backtrack, x, y, x.length, y.length);
    return result;
}

function getLCSString(aligned1, aligned2) {
    let lcs = '';
    for (let i = 0; i < aligned1.length; i++) {
        if (aligned1[i] === aligned2[i] && aligned1[i] !== '-') {
            lcs += aligned1[i];
        }
    }
    return lcs;
}

// Character-by-character comparison
function characterByCharacterCompare(x, y) {
    const maxLen = Math.max(x.length, y.length);
    let first = '';
    let second = '';
    let codes = [];

    for (let i = 0; i < maxLen; i++) {
        const char1 = i < x.length ? x[i] : '';
        const char2 = i < y.length ? y[i] : '';

        if (char1 === '' && char2 !== '') {
            // String 1 is shorter - gap in string 1
            first += '-';
            second += char2;
            codes.push(2);
        } else if (char2 === '' && char1 !== '') {
            // String 2 is shorter - gap in string 2
            first += char1;
            second += '-';
            codes.push(1);
        } else if (char1 === char2) {
            // Characters match
            first += char1;
            second += char2;
            codes.push(3);
        } else {
            // Characters differ (mismatch)
            first += char1;
            second += char2;
            codes.push(0);
        }
    }

    return { first, second, codes };
}

function getComparisonString(aligned1, aligned2) {
    let result = '';
    for (let i = 0; i < aligned1.length; i++) {
        if (aligned1[i] === aligned2[i] && aligned1[i] !== '-') {
            result += aligned1[i];
        } else {
            result += 'X';
        }
    }
    return result;
}

function formatAlignment(str, codes) {
    // Use CSS classes for consistent styling and high contrast support
    const classNames = {
        0: 'align-mismatch',      // mismatch (different chars at same position)
        1: 'align-gap-string2',   // gap in string2 (char only in string1 - removed)
        2: 'align-gap-string1',   // gap in string1 (char only in string2 - added)
        3: 'align-match'          // match (same char in both)
    };

    let formatted = '';
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        const code = codes[i];
        const className = classNames[code];

        // Escape HTML to prevent XSS
        const escapedChar = escapeHtml(char);

        if (className && code !== 3) {
            formatted += `<span class="${className}">${escapedChar}</span>`;
        } else if (code === 3) {
            // Match - highlight as common subsequence
            formatted += `<span class="${className}">${escapedChar}</span>`;
        } else {
            formatted += escapedChar;
        }
    }
    return formatted;
}

// Format side-by-side comparison view
function formatSideBySide(aligned1, aligned2, codes) {
    let formatted1 = '';
    let formatted2 = '';

    for (let i = 0; i < aligned1.length; i++) {
        const char1 = aligned1[i];
        const char2 = aligned2[i];
        const code = codes[i];

        // Escape HTML to prevent XSS
        const escapedChar1 = escapeHtml(char1);
        const escapedChar2 = escapeHtml(char2);

        // Code meanings:
        // 0: mismatch (different chars at same position)
        // 1: gap in string2 (char only in string1)
        // 2: gap in string1 (char only in string2)
        // 3: match (same char in both)

        if (code === 3) {
            // Match - highlight in both as common subsequence
            formatted1 += `<span class="diff-match">${escapedChar1}</span>`;
            formatted2 += `<span class="diff-match">${escapedChar2}</span>`;
        } else if (code === 1) {
            // Gap in string2 - char only in string1 (removed)
            formatted1 += `<span class="diff-removed">${escapedChar1}</span>`;
            formatted2 += `<span class="diff-removed">${escapedChar2}</span>`;
        } else if (code === 2) {
            // Gap in string1 - char only in string2 (added)
            formatted1 += `<span class="diff-added">${escapedChar1}</span>`;
            formatted2 += `<span class="diff-added">${escapedChar2}</span>`;
        } else {
            // Mismatch - no highlighting
            formatted1 += escapedChar1;
            formatted2 += escapedChar2;
        }
    }

    return { formatted1, formatted2 };
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

// Helper function to estimate computation time
function estimateTime(len1, len2) {
    const operations = len1 * len2;
    if (operations > 100000000) {
        return 'This may take several seconds...';
    } else if (operations > 10000000) {
        return 'This may take a moment...';
    }
    return '';
}

// Helper function to show loading indicator
function showLoading(message = 'Computing LCS...') {
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

// Main compute function
function computeLCS() {
    const string1 = document.getElementById('string1').value;
    const string2 = document.getElementById('string2').value;

    // Hide any previous errors
    hideError();
    // Hide stale indicator
    hideStaleIndicator();

    // Validation
    if (!string1 || !string2) {
        showError('⚠️ Please enter both strings before computing the comparison.');
        return;
    }

    // Show estimated time if needed
    const timeEstimate = comparisonMode === 'lcs' ? estimateTime(string1.length, string2.length) : '';
    if (timeEstimate) {
        showLoading(timeEstimate);
    } else {
        showLoading(comparisonMode === 'lcs' ? 'Computing LCS...' : 'Comparing strings...');
    }

    // Use setTimeout to allow the loading indicator to render
    setTimeout(() => {
        try {
            let result;
            let resultString;

            // Choose algorithm based on comparison mode
            if (comparisonMode === 'lcs') {
                // Compute LCS
                result = longestCommonSubseq(string1, string2);
                resultString = getLCSString(result.first, result.second);
            } else {
                // Character-by-character comparison
                result = characterByCharacterCompare(string1, string2);
                resultString = getComparisonString(result.first, result.second);
            }

            // Update header based on mode
            const lcsHeader = document.querySelector('.lcs-header');
            if (comparisonMode === 'lcs') {
                lcsHeader.childNodes[0].textContent = 'Longest Common Subsequence: ';
            } else {
                lcsHeader.childNodes[0].textContent = 'Comparison Result: ';
            }

            // Display results - use textContent for plain text (XSS safe)
            document.getElementById('lcsResult').textContent = resultString || '(empty)';
            document.getElementById('lcsLength').textContent = `Length: ${resultString.length}`;

            // Display alignment view (with HTML escaping in formatAlignment)
            document.getElementById('alignedString1').innerHTML = formatAlignment(result.first, result.codes);
            document.getElementById('alignedString2').innerHTML = formatAlignment(result.second, result.codes);

            // Display side-by-side view (with HTML escaping in formatSideBySide)
            const sideBySide = formatSideBySide(result.first, result.second, result.codes);
            document.getElementById('sideBySideString1').innerHTML = sideBySide.formatted1;
            document.getElementById('sideBySideString2').innerHTML = sideBySide.formatted2;

            // Save the computed values
            lastComputedString1 = string1;
            lastComputedString2 = string2;

            // Show result section
            document.getElementById('resultSection').classList.add('show');
        } catch (error) {
            showError('❌ An error occurred while computing the comparison. Please try with smaller inputs.');
            console.error('Comparison computation error:', error);
        } finally {
            hideLoading();
        }
    }, 50);
}

// Copy to clipboard functionality
function copyToClipboard(text, buttonId) {
    navigator.clipboard.writeText(text).then(() => {
        const button = document.getElementById(buttonId);
        const originalText = button.textContent;
        button.textContent = '✓ Copied!';
        button.classList.add('copied');

        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        showError('❌ Failed to copy to clipboard. Please try again.');
        console.error('Copy failed:', err);
    });
}

// Copy LCS result
function copyLCS() {
    const lcsText = document.getElementById('lcsResult').textContent;
    copyToClipboard(lcsText, 'copyLCS');
}

// Copy alignment
function copyAlignment() {
    const aligned1 = document.getElementById('alignedString1').textContent;
    const aligned2 = document.getElementById('alignedString2').textContent;
    const alignmentText = `String 1 (aligned):\n${aligned1}\n\nString 2 (aligned):\n${aligned2}`;
    copyToClipboard(alignmentText, 'copyAlignment');
}

// Copy side-by-side comparison
function copySideBySide() {
    const sideBySide1 = document.getElementById('sideBySideString1').textContent;
    const sideBySide2 = document.getElementById('sideBySideString2').textContent;
    const comparisonText = `String 1:\n${sideBySide1}\n\nString 2:\n${sideBySide2}`;
    copyToClipboard(comparisonText, 'copySideBySide');
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

// Toggle view mode between alignment and side-by-side
function toggleViewMode() {
    const alignmentDisplay = document.getElementById('alignmentDisplay');
    const sideBySideDisplay = document.getElementById('sideBySideDisplay');
    const viewModeLabel = document.getElementById('viewModeLabel');

    if (currentViewMode === 'alignment') {
        // Switch to side-by-side
        alignmentDisplay.style.display = 'none';
        sideBySideDisplay.style.display = 'block';
        currentViewMode = 'side-by-side';
        viewModeLabel.textContent = 'Alignment';
        announceToScreenReader('Switched to side-by-side comparison view');
    } else {
        // Switch to alignment
        alignmentDisplay.style.display = 'block';
        sideBySideDisplay.style.display = 'none';
        currentViewMode = 'alignment';
        viewModeLabel.textContent = 'Side-by-Side';
        announceToScreenReader('Switched to alignment view');
    }
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

// Set comparison mode and update button states
function setComparisonMode(mode) {
    comparisonMode = mode;

    // Update active button state
    const lcsButton = document.getElementById('findLcsButton');
    const compareButton = document.getElementById('compareStringsButton');

    if (mode === 'lcs') {
        lcsButton.classList.add('active');
        compareButton.classList.remove('active');
    } else {
        lcsButton.classList.remove('active');
        compareButton.classList.add('active');
    }
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

// Track last computed values
let lastComputedString1 = '';
let lastComputedString2 = '';

// Check if results are stale
function checkStaleResults() {
    const resultSection = document.getElementById('resultSection');
    const staleIndicator = document.getElementById('staleIndicator');

    // Only check if results are currently shown
    if (!resultSection.classList.contains('show')) {
        return;
    }

    const currentString1 = document.getElementById('string1').value;
    const currentString2 = document.getElementById('string2').value;

    // Show stale indicator if inputs have changed from last computation
    if (currentString1 !== lastComputedString1 || currentString2 !== lastComputedString2) {
        staleIndicator.classList.add('show');
    } else {
        staleIndicator.classList.remove('show');
    }
}

// Hide stale indicator
function hideStaleIndicator() {
    const staleIndicator = document.getElementById('staleIndicator');
    staleIndicator.classList.remove('show');
}

// Initialize event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners for textareas
    const string1 = document.getElementById('string1');
    const string2 = document.getElementById('string2');

    // Character count updates and stale check
    string1.addEventListener('input', () => {
        updateCharCount('string1', 'charCount1', 'warning1');
        checkStaleResults();
    });
    string2.addEventListener('input', () => {
        updateCharCount('string2', 'charCount2', 'warning2');
        checkStaleResults();
    });

    // Initialize character counts
    updateCharCount('string1', 'charCount1', 'warning1');
    updateCharCount('string2', 'charCount2', 'warning2');

    // Ctrl+Enter to compute
    [string1, string2].forEach(textarea => {
        textarea.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                computeLCS();
            }
        });
    });

    // Action button event listeners
    document.getElementById('findLcsButton').addEventListener('click', function() {
        setComparisonMode('lcs');
        computeLCS();
    });

    document.getElementById('compareStringsButton').addEventListener('click', function() {
        setComparisonMode('char-compare');
        computeLCS();
    });

    // Copy button event listeners
    document.getElementById('copyLCS').addEventListener('click', copyLCS);
    document.getElementById('copyAlignment').addEventListener('click', copyAlignment);
    document.getElementById('copySideBySide').addEventListener('click', copySideBySide);

    // Accessibility button event listeners
    document.getElementById('toggleHighContrast').addEventListener('click', toggleHighContrast);
    document.getElementById('toggleViewMode').addEventListener('click', toggleViewMode);

    // Preset dropdown event listener
    document.getElementById('presets').addEventListener('change', function(e) {
        loadPreset(e.target.value);
    });

    // Restore high contrast preference from localStorage
    const savedHighContrast = localStorage.getItem('highContrastMode') === 'true';
    if (savedHighContrast) {
        document.body.classList.add('high-contrast');
    }

    // Keyboard shortcuts - ESC to close loading, H for high contrast, V for view mode
    document.addEventListener('keydown', function(e) {
        // H key for high contrast toggle (Alt+H to avoid conflicts)
        if (e.altKey && e.key === 'h') {
            e.preventDefault();
            toggleHighContrast();
        }
        // V key for view mode toggle (Alt+V)
        if (e.altKey && e.key === 'v') {
            e.preventDefault();
            toggleViewMode();
        }
    });
});
