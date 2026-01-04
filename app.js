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

function formatAlignment(str, codes) {
    // Color mapping from the reference app
    const colors = {
        0: '#e0e0d1',  // light beige - mismatch
        1: '#ffff99',  // light yellow - gap in string2
        2: '#99bbff',  // light blue - gap in string1
        3: ''          // no color - match
    };

    let formatted = '';
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        const code = codes[i];
        const bgColor = colors[code];

        if (bgColor) {
            formatted += `<span style="background-color: ${bgColor}; display: inline; overflow: hidden; padding: 0px; margin: 0px;">${char}</span>`;
        } else {
            formatted += char;
        }
    }
    return formatted;
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

    // Validation
    if (!string1 || !string2) {
        showError('⚠️ Please enter both strings before computing the LCS.');
        return;
    }

    // Show estimated time if needed
    const timeEstimate = estimateTime(string1.length, string2.length);
    if (timeEstimate) {
        showLoading(timeEstimate);
    } else {
        showLoading();
    }

    // Use setTimeout to allow the loading indicator to render
    setTimeout(() => {
        try {
            // Compute LCS
            const result = longestCommonSubseq(string1, string2);
            const lcsString = getLCSString(result.first, result.second);

            // Display results
            document.getElementById('lcsResult').textContent = lcsString || '(empty)';
            document.getElementById('lcsLength').textContent = `Length: ${lcsString.length}`;
            document.getElementById('alignedString1').innerHTML = formatAlignment(result.first, result.codes);
            document.getElementById('alignedString2').innerHTML = formatAlignment(result.second, result.codes);

            // Show result section
            document.getElementById('resultSection').classList.add('show');
        } catch (error) {
            showError('❌ An error occurred while computing the LCS. Please try with smaller inputs.');
            console.error('LCS computation error:', error);
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

// Load preset example
function loadPreset(presetName) {
    if (presetName && PRESETS[presetName]) {
        document.getElementById('string1').value = PRESETS[presetName].string1;
        document.getElementById('string2').value = PRESETS[presetName].string2;
        updateCharCount('string1', 'charCount1', 'warning1');
        updateCharCount('string2', 'charCount2', 'warning2');
    }
}

// Initialize event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners for textareas
    const string1 = document.getElementById('string1');
    const string2 = document.getElementById('string2');

    // Character count updates
    string1.addEventListener('input', () => updateCharCount('string1', 'charCount1', 'warning1'));
    string2.addEventListener('input', () => updateCharCount('string2', 'charCount2', 'warning2'));

    // Initialize character counts
    updateCharCount('string1', 'charCount1', 'warning1');
    updateCharCount('string2', 'charCount2', 'warning2');

    // Ctrl+Enter to compute
    [string1, string2].forEach(textarea => {
        textarea.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && e.ctrlKey) {
                computeLCS();
            }
        });
    });

    // Compute button event listener
    document.getElementById('computeButton').addEventListener('click', computeLCS);

    // Copy button event listeners
    document.getElementById('copyLCS').addEventListener('click', copyLCS);
    document.getElementById('copyAlignment').addEventListener('click', copyAlignment);

    // Preset dropdown event listener
    document.getElementById('presets').addEventListener('change', function(e) {
        loadPreset(e.target.value);
        // Reset dropdown to default after loading
        setTimeout(() => {
            e.target.value = '';
        }, 100);
    });
});
