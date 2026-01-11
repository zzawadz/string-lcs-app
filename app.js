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

// Algorithm mode state
let algorithmMode = 'lcs'; // 'lcs', 'levenshtein', 'hamming', 'lcs-substring', 'char-compare'

// Legacy comparison mode for backwards compatibility
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

// Levenshtein Distance Algorithm
function levenshteinDistance(x, y) {
    const m = x.length;
    const n = y.length;

    // Initialize DP table
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    // Base cases
    for (let i = 0; i <= m; i++) {
        dp[i][0] = i;
    }
    for (let j = 0; j <= n; j++) {
        dp[0][j] = j;
    }

    // Fill DP table
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (x[i - 1] === y[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = 1 + Math.min(
                    dp[i - 1][j],     // deletion
                    dp[i][j - 1],     // insertion
                    dp[i - 1][j - 1]  // substitution
                );
            }
        }
    }

    // Backtrack to build alignment
    let i = m, j = n;
    let first = '';
    let second = '';
    let codes = [];

    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && x[i - 1] === y[j - 1]) {
            // Match
            first = x[i - 1] + first;
            second = y[j - 1] + second;
            codes.unshift(3);
            i--;
            j--;
        } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
            // Substitution (mismatch)
            first = x[i - 1] + first;
            second = y[j - 1] + second;
            codes.unshift(0);
            i--;
            j--;
        } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
            // Deletion (gap in string2)
            first = x[i - 1] + first;
            second = '-' + second;
            codes.unshift(1);
            i--;
        } else {
            // Insertion (gap in string1)
            first = '-' + first;
            second = y[j - 1] + second;
            codes.unshift(2);
            j--;
        }
    }

    return {
        first,
        second,
        codes,
        distance: dp[m][n],
        similarity: m + n > 0 ? (1 - dp[m][n] / Math.max(m, n)) * 100 : 100
    };
}

// Hamming Distance Algorithm
function hammingDistance(x, y, shouldTruncate = true) {
    const originalLength1 = x.length;
    const originalLength2 = y.length;
    let truncated = false;
    let truncatedLength = 0;

    // If strings are not equal length, truncate to the shorter length
    if (x.length !== y.length) {
        if (shouldTruncate) {
            truncated = true;
            const minLength = Math.min(x.length, y.length);
            truncatedLength = minLength;
            x = x.substring(0, minLength);
            y = y.substring(0, minLength);
        } else {
            throw new Error('Hamming distance requires strings of equal length');
        }
    }

    let first = '';
    let second = '';
    let codes = [];
    let distance = 0;

    for (let i = 0; i < x.length; i++) {
        first += x[i];
        second += y[i];
        if (x[i] === y[i]) {
            codes.push(3); // Match
        } else {
            codes.push(0); // Mismatch
            distance++;
        }
    }

    return {
        first,
        second,
        codes,
        distance,
        similarity: x.length > 0 ? ((x.length - distance) / x.length) * 100 : 100,
        truncated,
        truncatedLength,
        originalLength1,
        originalLength2
    };
}

// Longest Common Substring Algorithm
function longestCommonSubstring(x, y) {
    const m = x.length;
    const n = y.length;

    // Initialize DP table
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    let maxLength = 0;
    let endPosX = 0;
    let endPosY = 0;

    // Fill DP table
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (x[i - 1] === y[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
                if (dp[i][j] > maxLength) {
                    maxLength = dp[i][j];
                    endPosX = i;
                    endPosY = j;
                }
            }
        }
    }

    // Extract the longest common substring
    const substring = x.substring(endPosX - maxLength, endPosX);
    const substringStartX = endPosX - maxLength;
    const substringStartY = endPosY - maxLength;

    // Build alignment to show where the substring appears in both strings
    let first = '';
    let second = '';
    let codes = [];

    // Show the substring location in both strings
    // Use code 5 to mark the actual longest common substring
    for (let i = 0; i < m; i++) {
        first += x[i];
        const inSubstringX = i >= substringStartX && i < substringStartX + maxLength;
        codes.push(inSubstringX ? 5 : 0);
    }

    // Second string codes
    let secondCodes = [];
    for (let i = 0; i < n; i++) {
        second += y[i];
        const inSubstringY = i >= substringStartY && i < substringStartY + maxLength;
        secondCodes.push(inSubstringY ? 5 : 0);
    }

    return {
        first,
        second,
        codes,
        secondCodes, // Store separate codes for second string
        substring,
        substringStartX,
        substringStartY,
        length: maxLength,
        similarity: maxLength > 0 ? (maxLength / Math.max(m, n)) * 100 : 0
    };
}

function formatAlignment(str, codes) {
    // Use CSS classes for consistent styling and high contrast support
    const classNames = {
        0: 'align-mismatch',      // mismatch (different chars at same position)
        1: 'align-gap-string2',   // gap in string2 (char only in string1 - removed)
        2: 'align-gap-string1',   // gap in string1 (char only in string2 - added)
        3: 'align-match',         // match (same char in both)
        5: 'align-substring'      // longest common substring location
    };

    let formatted = '';
    let codeIndex = 0; // Separate index for codes array

    for (let i = 0; i < str.length; i++) {
        const char = str[i];

        // Skip newline characters - they're just for display formatting and don't have codes
        if (char === '\n') {
            formatted += '<br>';
            continue;
        }

        const code = codes[codeIndex];
        const className = classNames[code];

        // Escape HTML to prevent XSS
        const escapedChar = escapeHtml(char);

        if (className && (code === 3 || code === 5)) {
            // Match or substring - highlight
            formatted += `<span class="${className}">${escapedChar}</span>`;
        } else if (className && code !== 3 && code !== 5) {
            formatted += `<span class="${className}">${escapedChar}</span>`;
        } else {
            formatted += escapedChar;
        }

        codeIndex++;
    }
    return formatted;
}

// Format side-by-side comparison view
function formatSideBySide(aligned1, aligned2, codes) {
    let formatted1 = '';
    let formatted2 = '';
    let codeIndex = 0; // Separate index for codes array

    for (let i = 0; i < aligned1.length; i++) {
        const char1 = aligned1[i];
        const char2 = aligned2[i];

        // Skip newline characters - they're just for display formatting and don't have codes
        if (char1 === '\n' || char2 === '\n') {
            formatted1 += '<br>';
            formatted2 += '<br>';
            continue;
        }

        const code = codes[codeIndex];

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

        codeIndex++;
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

    // Get preprocessing options
    const processingOptions = getProcessingOptions();

    // Apply preprocessing
    let processedString1 = preprocessString(string1, processingOptions);
    let processedString2 = preprocessString(string2, processingOptions);

    // Show estimated time if needed
    const timeEstimate = comparisonMode === 'lcs' ? estimateTime(processedString1.length, processedString2.length) : '';
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
            let additionalInfo = '';

            // Choose algorithm based on algorithm mode
            switch (algorithmMode) {
                case 'lcs':
                    // Compute LCS
                    result = longestCommonSubseq(processedString1, processedString2);
                    resultString = getLCSString(result.first, result.second);
                    break;

                case 'levenshtein':
                    // Compute Levenshtein Distance
                    result = levenshteinDistance(processedString1, processedString2);
                    resultString = result.distance.toString();
                    additionalInfo = ` (Similarity: ${result.similarity.toFixed(1)}%)`;
                    break;

                case 'hamming':
                    // Compute Hamming Distance
                    result = hammingDistance(processedString1, processedString2, true);
                    resultString = result.distance.toString();
                    additionalInfo = ` (Similarity: ${result.similarity.toFixed(1)}%)`;
                    if (result.truncated) {
                        additionalInfo += ` - Truncated to ${result.truncatedLength} chars (was ${result.originalLength1} and ${result.originalLength2})`;
                    }
                    break;

                case 'lcs-substring':
                    // Compute Longest Common Substring
                    result = longestCommonSubstring(processedString1, processedString2);
                    resultString = result.substring || '(no common substring)';
                    additionalInfo = result.substring ? ` (Similarity: ${result.similarity.toFixed(1)}%)` : '';
                    break;

                case 'char-compare':
                    // Character-by-character comparison
                    result = characterByCharacterCompare(processedString1, processedString2);
                    resultString = getComparisonString(result.first, result.second);
                    break;

                default:
                    result = longestCommonSubseq(processedString1, processedString2);
                    resultString = getLCSString(result.first, result.second);
            }

            // Postprocess for display (e.g., line-by-line mode)
            const displayFirst = postprocessAlignment(result.first, processingOptions);
            const displaySecond = postprocessAlignment(result.second, processingOptions);
            const displayResult = postprocessAlignment(resultString, processingOptions);

            // Update header based on mode
            const lcsHeader = document.querySelector('.lcs-header');
            const algorithmNames = {
                'lcs': 'Longest Common Subsequence',
                'levenshtein': 'Levenshtein Distance',
                'hamming': 'Hamming Distance',
                'lcs-substring': 'Longest Common Substring',
                'char-compare': 'Comparison Result'
            };
            lcsHeader.childNodes[0].textContent = (algorithmNames[algorithmMode] || 'Result') + ': ';

            // Display results - use textContent for plain text (XSS safe)
            document.getElementById('lcsResult').textContent = displayResult || '(empty)';

            // Update length display based on algorithm
            let lengthText = '';
            if (algorithmMode === 'levenshtein') {
                lengthText = `Edit Distance: ${resultString}${additionalInfo}`;
            } else if (algorithmMode === 'hamming') {
                lengthText = `Hamming Distance: ${resultString}${additionalInfo}`;
            } else if (algorithmMode === 'lcs-substring') {
                lengthText = `Length: ${result.length || 0}${additionalInfo}`;
            } else {
                lengthText = processingOptions.lineByLine
                    ? `Length: ${resultString.split(LINE_SEPARATOR).filter(l => l).length} lines`
                    : `Length: ${resultString.length}`;
            }
            document.getElementById('lcsLength').textContent = lengthText;

            // Update alignment title and visibility based on algorithm
            const alignmentTitleElement = document.getElementById('alignmentTitle');
            const alignmentDisplay = document.getElementById('alignmentDisplay');
            const sideBySideDisplay = document.getElementById('sideBySideDisplay');

            const alignmentTitles = {
                'lcs': 'Alignment:',
                'levenshtein': 'Edit Alignment:',
                'hamming': 'Character Comparison:',
                'lcs-substring': 'Substring Location:',
                'char-compare': 'Position Comparison:'
            };

            if (alignmentTitleElement) {
                alignmentTitleElement.textContent = alignmentTitles[algorithmMode] || 'Alignment:';
            }

            // Display alignment view (with HTML escaping in formatAlignment)
            // For longest common substring, use separate codes for each string
            const codes1 = result.secondCodes ? result.codes : result.codes;
            const codes2 = result.secondCodes ? result.secondCodes : result.codes;
            document.getElementById('alignedString1').innerHTML = formatAlignment(displayFirst, codes1);
            document.getElementById('alignedString2').innerHTML = formatAlignment(displaySecond, codes2);

            // Display side-by-side view (with HTML escaping in formatSideBySide)
            const sideBySide = formatSideBySide(displayFirst, displaySecond, result.codes);
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

// Text Processing Options

// Get current preprocessing options
function getProcessingOptions() {
    return {
        ignoreCase: document.getElementById('optionIgnoreCase')?.checked || false,
        ignoreWhitespace: document.getElementById('optionIgnoreWhitespace')?.checked || false,
        ignorePunctuation: document.getElementById('optionIgnorePunctuation')?.checked || false,
        ignoreNumbers: document.getElementById('optionIgnoreNumbers')?.checked || false,
        removeDuplicateSpaces: document.getElementById('optionRemoveDuplicateSpaces')?.checked || false,
        lineByLine: document.getElementById('optionLineByLine')?.checked || false
    };
}

// Line separator for line-by-line mode
const LINE_SEPARATOR = '\u2028'; // Unicode line separator (rarely used in normal text)

// Preprocess string based on selected options
function preprocessString(str, options) {
    let processed = str;

    // Line-by-line mode - treat each line as a "character"
    if (options.lineByLine) {
        // Split by newlines, process each line, join with special separator
        let lines = processed.split(/\r?\n/);

        // Apply other preprocessing to each line if needed
        lines = lines.map(line => {
            let processedLine = line;

            if (options.ignoreCase) {
                processedLine = processedLine.toLowerCase();
            }

            if (options.ignoreWhitespace) {
                processedLine = processedLine.trim();
            }

            if (options.ignorePunctuation) {
                processedLine = processedLine.replace(/[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/g, '');
            }

            if (options.ignoreNumbers) {
                processedLine = processedLine.replace(/\d/g, '');
            }

            if (options.removeDuplicateSpaces) {
                processedLine = processedLine.replace(/\s+/g, ' ');
            }

            return processedLine;
        });

        // Join lines with special separator
        processed = lines.join(LINE_SEPARATOR);
        return processed;
    }

    // Regular character-by-character processing
    if (options.ignoreCase) {
        processed = processed.toLowerCase();
    }

    if (options.ignoreWhitespace) {
        processed = processed.replace(/\s/g, '');
    }

    if (options.ignorePunctuation) {
        processed = processed.replace(/[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/g, '');
    }

    if (options.ignoreNumbers) {
        processed = processed.replace(/\d/g, '');
    }

    if (options.removeDuplicateSpaces) {
        processed = processed.replace(/\s+/g, ' ').trim();
    }

    return processed;
}

// Postprocess alignment results for display (convert line separators back to readable format)
function postprocessAlignment(str, options) {
    if (options.lineByLine) {
        // Replace line separators with newline symbols for display
        return str.split(LINE_SEPARATOR).join('↵\n');
    }
    return str;
}

// Toggle processing options visibility
function toggleProcessingOptions() {
    const content = document.getElementById('processingOptionsContent');
    const button = document.getElementById('toggleProcessingOptions');

    if (content.style.display === 'none') {
        content.style.display = 'block';
        button.innerHTML = '<span aria-hidden="true">▲</span> Hide Options';
        button.setAttribute('aria-expanded', 'true');
    } else {
        content.style.display = 'none';
        button.innerHTML = '<span aria-hidden="true">▼</span> Show Options';
        button.setAttribute('aria-expanded', 'false');
    }
}

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

// URL Sharing Functions

// Generate shareable URL with encoded inputs and settings
function generateShareableURL() {
    const string1 = document.getElementById('string1').value;
    const string2 = document.getElementById('string2').value;

    // Only generate URL if we have at least one string
    if (!string1 && !string2) {
        return null;
    }

    try {
        const params = new URLSearchParams();

        // Encode strings using base64 to handle special characters
        if (string1) {
            params.set('s1', btoa(encodeURIComponent(string1)));
        }
        if (string2) {
            params.set('s2', btoa(encodeURIComponent(string2)));
        }

        // Include comparison mode
        params.set('mode', comparisonMode);

        // Include view mode
        params.set('view', currentViewMode);

        // Include preprocessing options
        const processingOptions = getProcessingOptions();
        if (processingOptions.ignoreCase) params.set('ignoreCase', '1');
        if (processingOptions.ignoreWhitespace) params.set('ignoreWhitespace', '1');
        if (processingOptions.ignorePunctuation) params.set('ignorePunctuation', '1');
        if (processingOptions.ignoreNumbers) params.set('ignoreNumbers', '1');
        if (processingOptions.removeDuplicateSpaces) params.set('removeDuplicateSpaces', '1');
        if (processingOptions.lineByLine) params.set('lineByLine', '1');

        // Generate full URL
        const baseUrl = window.location.origin + window.location.pathname;
        return `${baseUrl}?${params.toString()}`;
    } catch (error) {
        console.error('Error generating shareable URL:', error);
        return null;
    }
}

// Load state from URL parameters
function loadFromURLParams() {
    try {
        const params = new URLSearchParams(window.location.search);

        // Load strings if present
        if (params.has('s1')) {
            const string1 = decodeURIComponent(atob(params.get('s1')));
            document.getElementById('string1').value = string1;
            updateCharCount('string1', 'charCount1', 'warning1');
        }

        if (params.has('s2')) {
            const string2 = decodeURIComponent(atob(params.get('s2')));
            document.getElementById('string2').value = string2;
            updateCharCount('string2', 'charCount2', 'warning2');
        }

        // Load comparison mode if present
        if (params.has('mode')) {
            const mode = params.get('mode');
            if (mode === 'lcs' || mode === 'char-compare') {
                setComparisonMode(mode);
            }
        }

        // Load view mode if present
        if (params.has('view')) {
            const viewMode = params.get('view');
            if (viewMode === 'side-by-side' && currentViewMode === 'alignment') {
                // Toggle to side-by-side if that's what's in the URL
                toggleViewMode();
            }
        }

        // Load preprocessing options if present
        const hasProcessingOptions = params.has('ignoreCase') || params.has('ignoreWhitespace') ||
                                     params.has('ignorePunctuation') || params.has('ignoreNumbers') ||
                                     params.has('removeDuplicateSpaces') || params.has('lineByLine');

        if (hasProcessingOptions) {
            // Show the processing options panel
            const content = document.getElementById('processingOptionsContent');
            const button = document.getElementById('toggleProcessingOptions');
            if (content && button && content.style.display === 'none') {
                toggleProcessingOptions();
            }

            // Set the checkboxes
            if (params.has('ignoreCase')) {
                document.getElementById('optionIgnoreCase').checked = true;
            }
            if (params.has('ignoreWhitespace')) {
                document.getElementById('optionIgnoreWhitespace').checked = true;
            }
            if (params.has('ignorePunctuation')) {
                document.getElementById('optionIgnorePunctuation').checked = true;
            }
            if (params.has('ignoreNumbers')) {
                document.getElementById('optionIgnoreNumbers').checked = true;
            }
            if (params.has('removeDuplicateSpaces')) {
                document.getElementById('optionRemoveDuplicateSpaces').checked = true;
            }
            if (params.has('lineByLine')) {
                document.getElementById('optionLineByLine').checked = true;
            }
        }

        // Auto-compute if we loaded strings from URL
        if (params.has('s1') && params.has('s2')) {
            // Use setTimeout to ensure DOM is fully ready
            setTimeout(() => {
                computeLCS();
            }, 100);
        }
    } catch (error) {
        console.error('Error loading from URL parameters:', error);
        showError('⚠️ Failed to load from URL. The shared link may be invalid or corrupted.');
    }
}

// Share URL - copy to clipboard
function shareURL() {
    const shareUrl = generateShareableURL();

    if (!shareUrl) {
        showError('⚠️ Please enter at least one string before sharing.');
        return;
    }

    const shareButton = document.getElementById('shareButton');

    navigator.clipboard.writeText(shareUrl).then(() => {
        const originalText = shareButton.innerHTML;
        shareButton.innerHTML = '<span aria-hidden="true">✓</span> URL Copied!';
        shareButton.classList.add('copied');

        announceToScreenReader('Shareable URL copied to clipboard');

        setTimeout(() => {
            shareButton.innerHTML = originalText;
            shareButton.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        showError('❌ Failed to copy URL to clipboard. Please try again.');
        console.error('Share failed:', err);
    });
}

// Generate QR code for the shareable URL
function generateQRCode() {
    const shareUrl = generateShareableURL();

    if (!shareUrl) {
        showError('⚠️ Please enter at least one string before generating a QR code.');
        return;
    }

    // Use a QR code API service to generate the QR code
    // Using goqr.me API which is free and doesn't require authentication
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareUrl)}`;

    // Create modal to display QR code
    const modal = document.createElement('div');
    modal.className = 'qr-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-label', 'QR Code for sharing');
    modal.setAttribute('aria-modal', 'true');

    modal.innerHTML = `
        <div class="qr-modal-content">
            <div class="qr-modal-header">
                <h2>Scan to Open on Mobile</h2>
                <button class="qr-close-button" aria-label="Close QR code modal">×</button>
            </div>
            <div class="qr-code-container">
                <img src="${qrCodeUrl}" alt="QR code for sharing this comparison" />
            </div>
            <div class="qr-modal-footer">
                <p>Scan this QR code with your mobile device to open this comparison</p>
                <button class="copy-button" id="copyUrlFromQR">
                    <span aria-hidden="true">📋</span> Copy URL
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Close modal when clicking the close button or outside the modal
    const closeButton = modal.querySelector('.qr-close-button');
    const copyButton = modal.querySelector('#copyUrlFromQR');

    closeButton.addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });

    copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(shareUrl).then(() => {
            copyButton.innerHTML = '<span aria-hidden="true">✓</span> Copied!';
            setTimeout(() => {
                copyButton.innerHTML = '<span aria-hidden="true">📋</span> Copy URL';
            }, 2000);
        });
    });

    // Focus the close button for accessibility
    setTimeout(() => closeButton.focus(), 100);

    announceToScreenReader('QR code displayed');
}

// Export Functions

// Helper function to get current result data
function getCurrentResultData() {
    // Get current input strings
    const string1 = lastComputedString1;
    const string2 = lastComputedString2;

    // Check if results exist
    if (!string1 || !string2) {
        return null;
    }

    // Get the result elements
    const lcsResultElement = document.getElementById('lcsResult');
    const alignedString1Element = document.getElementById('alignedString1');
    const alignedString2Element = document.getElementById('alignedString2');

    if (!lcsResultElement || !alignedString1Element || !alignedString2Element) {
        return null;
    }

    // Get result text and aligned strings
    const resultString = lcsResultElement.textContent;
    const alignedString1 = alignedString1Element.textContent;
    const alignedString2 = alignedString2Element.textContent;

    // Reconstruct the codes array from the alignment
    const codes = [];
    for (let i = 0; i < alignedString1.length; i++) {
        const char1 = alignedString1[i];
        const char2 = alignedString2[i];

        if (char1 === char2 && char1 !== '-') {
            codes.push(3); // Match
        } else if (char1 !== '-' && char2 === '-') {
            codes.push(1); // Gap in string 2
        } else if (char1 === '-' && char2 !== '-') {
            codes.push(2); // Gap in string 1
        } else {
            codes.push(0); // Mismatch
        }
    }

    return {
        string1,
        string2,
        result: resultString,
        alignedString1,
        alignedString2,
        codes,
        mode: comparisonMode,
        timestamp: new Date().toISOString()
    };
}

// Export to Plain Text (.txt)
function exportToText() {
    const data = getCurrentResultData();
    if (!data) {
        showError('⚠️ Please compute a comparison before exporting.');
        return;
    }

    let content = '';
    content += '═══════════════════════════════════════════════════════\n';
    content += `  ${comparisonMode === 'lcs' ? 'LONGEST COMMON SUBSEQUENCE' : 'STRING COMPARISON'} RESULTS\n`;
    content += '═══════════════════════════════════════════════════════\n\n';
    content += `Generated: ${new Date().toLocaleString()}\n\n`;
    content += '-----------------------------------------------------------\n';
    content += 'INPUT STRINGS\n';
    content += '-----------------------------------------------------------\n\n';
    content += `String 1 (${data.string1.length} characters):\n${data.string1}\n\n`;
    content += `String 2 (${data.string2.length} characters):\n${data.string2}\n\n`;
    content += '-----------------------------------------------------------\n';
    content += comparisonMode === 'lcs' ? 'LCS RESULT\n' : 'COMPARISON RESULT\n';
    content += '-----------------------------------------------------------\n\n';
    content += `${comparisonMode === 'lcs' ? 'LCS' : 'Result'}: ${data.result || '(empty)'}\n`;
    content += `Length: ${data.result.length}\n\n`;
    content += '-----------------------------------------------------------\n';
    content += 'ALIGNMENT\n';
    content += '-----------------------------------------------------------\n\n';
    content += `String 1 (aligned): ${data.alignedString1}\n`;
    content += `String 2 (aligned): ${data.alignedString2}\n\n`;
    content += 'Legend:\n';
    content += '  - Match (same character in both):         highlighted\n';
    content += '  - Only in String 1 (gap in String 2):     highlighted in String 1\n';
    content += '  - Only in String 2 (gap in String 1):     highlighted in String 2\n';
    content += '  - Mismatch (different at same position):  no highlighting\n\n';
    content += '═══════════════════════════════════════════════════════\n';

    downloadFile(content, 'lcs-result.txt', 'text/plain');
}

// Export to JSON (.json)
function exportToJSON() {
    const data = getCurrentResultData();
    if (!data) {
        showError('⚠️ Please compute a comparison before exporting.');
        return;
    }

    const jsonData = {
        metadata: {
            exportedAt: new Date().toISOString(),
            comparisonMode: data.mode,
            version: '1.0'
        },
        inputs: {
            string1: data.string1,
            string2: data.string2,
            string1Length: data.string1.length,
            string2Length: data.string2.length
        },
        results: {
            lcs: data.result,
            lcsLength: data.result.length,
            alignedString1: data.alignedString1,
            alignedString2: data.alignedString2,
            alignmentCodes: data.codes,
            alignmentLength: data.codes.length
        },
        statistics: {
            matches: data.codes.filter(c => c === 3).length,
            mismatches: data.codes.filter(c => c === 0).length,
            gapsInString1: data.codes.filter(c => c === 2).length,
            gapsInString2: data.codes.filter(c => c === 1).length
        },
        legend: {
            alignmentCodes: {
                0: 'Mismatch (different characters at same position)',
                1: 'Gap in String 2 (character only in String 1)',
                2: 'Gap in String 1 (character only in String 2)',
                3: 'Match (same character in both)'
            }
        }
    };

    const content = JSON.stringify(jsonData, null, 2);
    downloadFile(content, 'lcs-result.json', 'application/json');
}

// Export to CSV (.csv)
function exportToCSV() {
    const data = getCurrentResultData();
    if (!data) {
        showError('⚠️ Please compute a comparison before exporting.');
        return;
    }

    let content = '';

    // Header
    content += 'Position,String 1 Char,String 2 Char,Alignment Code,Alignment Type,Is Match\n';

    // Data rows
    for (let i = 0; i < data.alignedString1.length; i++) {
        const char1 = data.alignedString1[i];
        const char2 = data.alignedString2[i];
        const code = data.codes[i];

        let alignmentType = '';
        switch (code) {
            case 0: alignmentType = 'Mismatch'; break;
            case 1: alignmentType = 'Gap in String 2'; break;
            case 2: alignmentType = 'Gap in String 1'; break;
            case 3: alignmentType = 'Match'; break;
        }

        const isMatch = code === 3 ? 'Yes' : 'No';

        // Escape quotes in CSV
        const escapedChar1 = char1.replace(/"/g, '""');
        const escapedChar2 = char2.replace(/"/g, '""');

        content += `${i + 1},"${escapedChar1}","${escapedChar2}",${code},"${alignmentType}",${isMatch}\n`;
    }

    downloadFile(content, 'lcs-result.csv', 'text/csv');
}

// Export to HTML (.html)
function exportToHTML() {
    const data = getCurrentResultData();
    if (!data) {
        showError('⚠️ Please compute a comparison before exporting.');
        return;
    }

    // Recompute formatted alignment for HTML
    const result = longestCommonSubseq(data.string1, data.string2);
    const formattedAlignment1 = formatAlignment(result.first, result.codes);
    const formattedAlignment2 = formatAlignment(result.second, result.codes);

    const content = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${comparisonMode === 'lcs' ? 'LCS' : 'String Comparison'} Results - ${new Date().toLocaleDateString()}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
        }
        h2 {
            color: #34495e;
            margin-top: 30px;
        }
        .metadata {
            background: #ecf0f1;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .input-section {
            background: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
        }
        .result-box {
            background: #e8f5e9;
            padding: 15px;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
            font-size: 16px;
            margin: 10px 0;
            word-break: break-all;
        }
        .alignment-box {
            background: #fff3e0;
            padding: 15px;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
            font-size: 16px;
            margin: 10px 0;
            word-break: break-all;
        }
        .legend {
            margin-top: 20px;
            padding: 15px;
            background: #f5f5f5;
            border-radius: 5px;
        }
        .legend-item {
            margin: 8px 0;
        }
        .align-match { background-color: #c8e6c9; font-weight: bold; }
        .align-mismatch { background-color: #ffccbc; }
        .align-gap-string1 { background-color: #b3e5fc; }
        .align-gap-string2 { background-color: #ffe0b2; }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .stat-card {
            background: #3498db;
            color: white;
            padding: 15px;
            border-radius: 5px;
            text-align: center;
        }
        .stat-value {
            font-size: 24px;
            font-weight: bold;
        }
        .stat-label {
            font-size: 14px;
            opacity: 0.9;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${comparisonMode === 'lcs' ? 'Longest Common Subsequence Results' : 'String Comparison Results'}</h1>

        <div class="metadata">
            <strong>Generated:</strong> ${new Date().toLocaleString()}<br>
            <strong>Comparison Mode:</strong> ${comparisonMode === 'lcs' ? 'Longest Common Subsequence (LCS)' : 'Character-by-Character Comparison'}
        </div>

        <h2>Input Strings</h2>
        <div class="input-section">
            <strong>String 1</strong> (${data.string1.length} characters)<br>
            <div style="margin-top: 10px; font-family: 'Courier New', monospace;">${escapeHtml(data.string1)}</div>
        </div>
        <div class="input-section">
            <strong>String 2</strong> (${data.string2.length} characters)<br>
            <div style="margin-top: 10px; font-family: 'Courier New', monospace;">${escapeHtml(data.string2)}</div>
        </div>

        <h2>${comparisonMode === 'lcs' ? 'LCS Result' : 'Comparison Result'}</h2>
        <div class="result-box">
            <strong>${comparisonMode === 'lcs' ? 'LCS:' : 'Result:'}</strong> ${escapeHtml(data.result) || '(empty)'}<br>
            <strong>Length:</strong> ${data.result.length}
        </div>

        <h2>Statistics</h2>
        <div class="stats">
            <div class="stat-card">
                <div class="stat-value">${data.codes.filter(c => c === 3).length}</div>
                <div class="stat-label">Matches</div>
            </div>
            <div class="stat-card" style="background: #e74c3c;">
                <div class="stat-value">${data.codes.filter(c => c === 0).length}</div>
                <div class="stat-label">Mismatches</div>
            </div>
            <div class="stat-card" style="background: #f39c12;">
                <div class="stat-value">${data.codes.filter(c => c === 1).length}</div>
                <div class="stat-label">Gaps in String 2</div>
            </div>
            <div class="stat-card" style="background: #9b59b6;">
                <div class="stat-value">${data.codes.filter(c => c === 2).length}</div>
                <div class="stat-label">Gaps in String 1</div>
            </div>
        </div>

        <h2>Alignment</h2>
        <div class="alignment-box">
            <strong>String 1 (aligned):</strong><br>
            ${formattedAlignment1}<br><br>
            <strong>String 2 (aligned):</strong><br>
            ${formattedAlignment2}
        </div>

        <div class="legend">
            <strong>Legend:</strong>
            <div class="legend-item"><span class="align-match" style="padding: 2px 5px;">text</span> Match (same character in both)</div>
            <div class="legend-item"><span class="align-gap-string2" style="padding: 2px 5px;">text</span> Only in String 1 (gap in String 2)</div>
            <div class="legend-item"><span class="align-gap-string1" style="padding: 2px 5px;">text</span> Only in String 2 (gap in String 1)</div>
            <div class="legend-item"><span class="align-mismatch" style="padding: 2px 5px;">text</span> Mismatch (different characters at same position)</div>
        </div>
    </div>
</body>
</html>`;

    downloadFile(content, 'lcs-result.html', 'text/html');
}

// Export to Markdown (.md)
function exportToMarkdown() {
    const data = getCurrentResultData();
    if (!data) {
        showError('⚠️ Please compute a comparison before exporting.');
        return;
    }

    const modeTitle = comparisonMode === 'lcs' ? 'Longest Common Subsequence' : 'String Comparison';

    let content = `# ${modeTitle} Results\n\n`;
    content += `**Generated:** ${new Date().toLocaleString()}  \n`;
    content += `**Comparison Mode:** ${comparisonMode === 'lcs' ? 'LCS' : 'Character-by-Character'}\n\n`;
    content += `---\n\n`;
    content += `## Input Strings\n\n`;
    content += `### String 1 (${data.string1.length} characters)\n\n`;
    content += '```\n' + data.string1 + '\n```\n\n';
    content += `### String 2 (${data.string2.length} characters)\n\n`;
    content += '```\n' + data.string2 + '\n```\n\n';
    content += `---\n\n`;
    content += `## ${comparisonMode === 'lcs' ? 'LCS Result' : 'Comparison Result'}\n\n`;
    content += `- **${comparisonMode === 'lcs' ? 'LCS' : 'Result'}:** \`${data.result || '(empty)'}\`\n`;
    content += `- **Length:** ${data.result.length}\n\n`;
    content += `---\n\n`;
    content += `## Statistics\n\n`;
    content += `| Metric | Count |\n`;
    content += `|--------|-------|\n`;
    content += `| Matches | ${data.codes.filter(c => c === 3).length} |\n`;
    content += `| Mismatches | ${data.codes.filter(c => c === 0).length} |\n`;
    content += `| Gaps in String 2 | ${data.codes.filter(c => c === 1).length} |\n`;
    content += `| Gaps in String 1 | ${data.codes.filter(c => c === 2).length} |\n\n`;
    content += `---\n\n`;
    content += `## Alignment\n\n`;
    content += `**String 1 (aligned):**\n`;
    content += '```\n' + data.alignedString1 + '\n```\n\n';
    content += `**String 2 (aligned):**\n`;
    content += '```\n' + data.alignedString2 + '\n```\n\n';
    content += `### Legend\n\n`;
    content += `- **Match:** Same character in both strings (highlighted)\n`;
    content += `- **Only in String 1:** Character only in String 1 (gap in String 2)\n`;
    content += `- **Only in String 2:** Character only in String 2 (gap in String 1)\n`;
    content += `- **Mismatch:** Different characters at same position\n\n`;
    content += `---\n\n`;
    content += `*Generated by Longest Common Subsequence Finder*\n`;

    downloadFile(content, 'lcs-result.md', 'text/markdown');
}

// Helper function to download a file
function downloadFile(content, filename, mimeType) {
    try {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        announceToScreenReader(`File ${filename} downloaded successfully`);
    } catch (error) {
        showError('❌ Failed to export file. Please try again.');
        console.error('Export error:', error);
    }
}

// Show/hide export dropdown menu
function toggleExportMenu() {
    const dropdown = document.getElementById('exportDropdown');
    dropdown.classList.toggle('show');

    // Close dropdown when clicking outside
    if (dropdown.classList.contains('show')) {
        const closeDropdown = (e) => {
            if (!e.target.closest('.export-container')) {
                dropdown.classList.remove('show');
                document.removeEventListener('click', closeDropdown);
            }
        };
        // Add slight delay to prevent immediate closing
        setTimeout(() => {
            document.addEventListener('click', closeDropdown);
        }, 10);
    }
}


// File Upload Functionality

// File size constants (in bytes)
const FILE_SIZE_WARNING_THRESHOLD = 100 * 1024; // 100 KB
const FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5 MB

// Allowed file extensions
const ALLOWED_EXTENSIONS = ['.txt', '.md', '.json', '.csv', '.log'];

// Current file being previewed
let currentFileData = null;
let currentTargetTextarea = null;

// Validate file type
function isValidFileType(filename) {
    const extension = filename.substring(filename.lastIndexOf('.')).toLowerCase();
    return ALLOWED_EXTENSIONS.includes(extension);
}

// Format file size for display
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Get file extension
function getFileExtension(filename) {
    return filename.substring(filename.lastIndexOf('.')).toLowerCase();
}

// Show file preview modal
function showFilePreview(file, targetTextareaId) {
    // Store current file data
    currentFileData = file;
    currentTargetTextarea = targetTextareaId;

    // Get modal elements
    const modal = document.getElementById('filePreviewModal');
    const fileName = document.getElementById('previewFileName');
    const fileSize = document.getElementById('previewFileSize');
    const fileType = document.getElementById('previewFileType');
    const previewContent = document.getElementById('previewContent');
    const sizeWarning = document.getElementById('fileSizeWarning');

    // Populate file info
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    fileType.textContent = getFileExtension(file.name);

    // Show size warning if needed
    if (file.size > FILE_SIZE_WARNING_THRESHOLD) {
        sizeWarning.textContent = file.size > FILE_SIZE_LIMIT
            ? `⚠️ File size exceeds limit (${formatFileSize(FILE_SIZE_LIMIT)}). Please choose a smaller file.`
            : `⚠️ This is a large file (${formatFileSize(file.size)}). Loading may take time or affect performance.`;
        sizeWarning.classList.add('show');
    } else {
        sizeWarning.classList.remove('show');
    }

    // Read file content for preview
    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        // Show first 500 characters as preview
        const preview = content.length > 500 ? content.substring(0, 500) + '\n...\n(preview truncated)' : content;
        previewContent.textContent = preview;
    };
    reader.onerror = function() {
        previewContent.textContent = 'Error reading file preview.';
    };
    reader.readAsText(file);

    // Show modal
    modal.classList.add('show');

    // Focus the close button for accessibility
    setTimeout(() => {
        document.getElementById('closePreview').focus();
    }, 100);

    // Announce to screen reader
    announceToScreenReader(`File preview opened for ${file.name}`);
}

// Hide file preview modal
function hideFilePreview() {
    const modal = document.getElementById('filePreviewModal');
    modal.classList.remove('show');
    currentFileData = null;
    currentTargetTextarea = null;
}

// Load file content into textarea
function loadFileContent(file, textareaId) {
    // Check file size limit
    if (file.size > FILE_SIZE_LIMIT) {
        showError(`❌ File is too large. Maximum size is ${formatFileSize(FILE_SIZE_LIMIT)}.`);
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        const textarea = document.getElementById(textareaId);
        textarea.value = content;

        // Update character count
        const countId = textareaId === 'string1' ? 'charCount1' : 'charCount2';
        const warningId = textareaId === 'string1' ? 'warning1' : 'warning2';
        updateCharCount(textareaId, countId, warningId);

        // Check stale results
        checkStaleResults();

        // Announce success
        announceToScreenReader(`File ${file.name} loaded successfully into ${textareaId === 'string1' ? 'String 1' : 'String 2'}`);
    };
    reader.onerror = function() {
        showError('❌ Error reading file. Please try again.');
    };
    reader.readAsText(file);
}

// Handle file selection from button
function handleFileSelect(event, textareaId) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!isValidFileType(file.name)) {
        showError(`❌ Invalid file type. Supported formats: ${ALLOWED_EXTENSIONS.join(', ')}`);
        event.target.value = ''; // Reset file input
        return;
    }

    // Show preview modal
    showFilePreview(file, textareaId);

    // Reset file input so the same file can be selected again
    event.target.value = '';
}

// Handle file drop
function handleFileDrop(event, textareaId) {
    event.preventDefault();
    event.stopPropagation();

    // Remove drag-over styling
    const dropZone = document.getElementById(textareaId === 'string1' ? 'dropZone1' : 'dropZone2');
    dropZone.classList.remove('drag-over');

    // Get dropped files
    const files = event.dataTransfer.files;
    if (files.length === 0) return;

    const file = files[0]; // Only handle first file

    // Validate file type
    if (!isValidFileType(file.name)) {
        showError(`❌ Invalid file type. Supported formats: ${ALLOWED_EXTENSIONS.join(', ')}`);
        return;
    }

    // Show preview modal
    showFilePreview(file, textareaId);
}

// Handle drag over
function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
}

// Handle drag enter
function handleDragEnter(event, dropZoneId) {
    event.preventDefault();
    event.stopPropagation();
    const dropZone = document.getElementById(dropZoneId);
    dropZone.classList.add('drag-over');
}

// Handle drag leave
function handleDragLeave(event, dropZoneId) {
    event.preventDefault();
    event.stopPropagation();

    // Only remove class if leaving the drop zone itself, not child elements
    const dropZone = document.getElementById(dropZoneId);
    const rect = dropZone.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;

    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
        dropZone.classList.remove('drag-over');
    }
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

    // Algorithm selector event listener
    const algorithmSelector = document.getElementById('algorithmSelector');
    if (algorithmSelector) {
        algorithmSelector.addEventListener('change', function() {
            algorithmMode = this.value;
            comparisonMode = this.value; // Keep legacy variable in sync
            checkStaleResults();
        });
    }

    // Compute button event listener
    const computeButton = document.getElementById('computeButton');
    if (computeButton) {
        computeButton.addEventListener('click', function() {
            computeLCS();
        });
    }

    // Legacy button support (for backwards compatibility)
    const findLcsButton = document.getElementById('findLcsButton');
    if (findLcsButton) {
        findLcsButton.addEventListener('click', function() {
            setComparisonMode('lcs');
            computeLCS();
        });
    }

    const compareStringsButton = document.getElementById('compareStringsButton');
    if (compareStringsButton) {
        compareStringsButton.addEventListener('click', function() {
            setComparisonMode('char-compare');
            computeLCS();
        });
    }

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

    // Load state from URL parameters if present
    loadFromURLParams();

    // Share button event listener
    const shareButton = document.getElementById('shareButton');
    if (shareButton) {
        shareButton.addEventListener('click', shareURL);
    }

    // QR code button event listener
    const qrButton = document.getElementById('qrButton');
    if (qrButton) {
        qrButton.addEventListener('click', generateQRCode);
    }

    // Export button event listener
    const exportButton = document.getElementById('exportButton');
    if (exportButton) {
        exportButton.addEventListener('click', toggleExportMenu);
    }

    // Export format button event listeners
    const exportTextBtn = document.getElementById('exportText');
    const exportJsonBtn = document.getElementById('exportJson');
    const exportCsvBtn = document.getElementById('exportCsv');
    const exportHtmlBtn = document.getElementById('exportHtml');
    const exportMdBtn = document.getElementById('exportMd');

    if (exportTextBtn) exportTextBtn.addEventListener('click', exportToText);
    if (exportJsonBtn) exportJsonBtn.addEventListener('click', exportToJSON);
    if (exportCsvBtn) exportCsvBtn.addEventListener('click', exportToCSV);
    if (exportHtmlBtn) exportHtmlBtn.addEventListener('click', exportToHTML);
    if (exportMdBtn) exportMdBtn.addEventListener('click', exportToMarkdown);

    // File upload event listeners
    const uploadButton1 = document.getElementById('uploadButton1');
    const uploadButton2 = document.getElementById('uploadButton2');
    const fileInput1 = document.getElementById('fileInput1');
    const fileInput2 = document.getElementById('fileInput2');
    const dropZone1 = document.getElementById('dropZone1');
    const dropZone2 = document.getElementById('dropZone2');

    // Upload button clicks
    if (uploadButton1) {
        uploadButton1.addEventListener('click', () => fileInput1.click());
    }
    if (uploadButton2) {
        uploadButton2.addEventListener('click', () => fileInput2.click());
    }

    // File input change events
    if (fileInput1) {
        fileInput1.addEventListener('change', (e) => handleFileSelect(e, 'string1'));
    }
    if (fileInput2) {
        fileInput2.addEventListener('change', (e) => handleFileSelect(e, 'string2'));
    }

    // Drag and drop events for drop zone 1
    if (dropZone1) {
        dropZone1.addEventListener('dragover', handleDragOver);
        dropZone1.addEventListener('dragenter', (e) => handleDragEnter(e, 'dropZone1'));
        dropZone1.addEventListener('dragleave', (e) => handleDragLeave(e, 'dropZone1'));
        dropZone1.addEventListener('drop', (e) => handleFileDrop(e, 'string1'));
    }

    // Drag and drop events for drop zone 2
    if (dropZone2) {
        dropZone2.addEventListener('dragover', handleDragOver);
        dropZone2.addEventListener('dragenter', (e) => handleDragEnter(e, 'dropZone2'));
        dropZone2.addEventListener('dragleave', (e) => handleDragLeave(e, 'dropZone2'));
        dropZone2.addEventListener('drop', (e) => handleFileDrop(e, 'string2'));
    }

    // File preview modal event listeners
    const closePreview = document.getElementById('closePreview');
    const cancelLoad = document.getElementById('cancelLoad');
    const confirmLoad = document.getElementById('confirmLoad');
    const filePreviewModal = document.getElementById('filePreviewModal');

    if (closePreview) {
        closePreview.addEventListener('click', hideFilePreview);
    }

    if (cancelLoad) {
        cancelLoad.addEventListener('click', hideFilePreview);
    }

    if (confirmLoad) {
        confirmLoad.addEventListener('click', () => {
            if (currentFileData && currentTargetTextarea) {
                loadFileContent(currentFileData, currentTargetTextarea);
                hideFilePreview();
            }
        });
    }

    // Close modal when clicking outside
    if (filePreviewModal) {
        filePreviewModal.addEventListener('click', (e) => {
            if (e.target === filePreviewModal) {
                hideFilePreview();
            }
        });
    }

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && filePreviewModal.classList.contains('show')) {
            hideFilePreview();
        }
    });

    // Text Processing Options event listeners
    const toggleProcessingOptionsBtn = document.getElementById('toggleProcessingOptions');
    if (toggleProcessingOptionsBtn) {
        toggleProcessingOptionsBtn.addEventListener('click', toggleProcessingOptions);
    }

    // Add change event listeners to processing option checkboxes to mark results as stale
    const processingOptionCheckboxes = [
        'optionIgnoreCase',
        'optionIgnoreWhitespace',
        'optionIgnorePunctuation',
        'optionIgnoreNumbers',
        'optionRemoveDuplicateSpaces',
        'optionLineByLine'
    ];

    processingOptionCheckboxes.forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            checkbox.addEventListener('change', () => {
                checkStaleResults();
            });
        }
    });
});
