# Longest Common Subsequence (LCS) Web Application

A powerful, accessible, client-side web application that finds the longest common subsequence between two strings using dynamic programming.

![LCS Application Screenshot](docs/screenshots/main-view.png)
*Screenshot placeholder: Main application interface*

## Features

### Core Functionality
- **Two Input Areas**: Enter any two strings to compare with live character counting
- **LCS Computation**: Uses the classic dynamic programming algorithm with backtracking
- **Visual Alignment**: Multiple visualization modes to understand string differences
- **Client-Side Only**: No backend required - runs entirely in your browser
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Visualization Modes
- **Alignment View**: See both strings aligned with color-coded matches, mismatches, and gaps
- **Side-by-Side Comparison**: Compare strings in a diff-style layout to see additions and deletions

![Visualization Modes](docs/screenshots/visualization-modes.png)
*Screenshot placeholder: Alignment and side-by-side comparison views*

### Accessibility Features
- **High Contrast Mode**: Toggle high contrast for better visibility
- **ARIA Labels**: Full screen reader support
- **Keyboard Navigation**: Ctrl+Enter to compute results
- **Live Regions**: Real-time updates for character counts and warnings

### Additional Features
- **Preset Examples**: Quick-start with DNA sequences, code snippets, natural language, or short string examples
- **Copy to Clipboard**: One-click copy for LCS results and alignments
- **Performance Warnings**: Alerts for very large inputs
- **Stale Result Indicators**: Visual feedback when inputs change after computation
- **Loading Indicators**: Clear feedback during computation

## Usage

### Getting Started
1. Open `index.html` in any modern web browser
2. Enter your first string in the left textarea
3. Enter your second string in the right textarea
4. Click "Find LCS" or press **Ctrl+Enter**

### Understanding Results
The application displays:
- **Longest Common Subsequence**: The actual LCS string with copy button
- **LCS Length**: Number of characters in the subsequence
- **Alignment View**: Both strings aligned with color coding:
  - 🟢 Green: Common subsequence (matching)
  - 🔴 Red: Mismatch (different characters)
  - 🟡 Yellow: Only in String 1 (gap in String 2)
  - 🔵 Blue: Only in String 2 (gap in String 1)
- **Side-by-Side View**: Diff-style comparison showing additions and deletions

![Results Display](docs/screenshots/results-view.png)
*Screenshot placeholder: Results with alignment and legends*

## Algorithm

The application implements the Longest Common Subsequence algorithm using:
- **Dynamic Programming**: Efficiently computes LCS length in O(m×n) time
- **Backtracking Matrix**: Reconstructs the actual subsequence
- **Alignment Generation**: Creates visual representations of how strings match

## Example

**Input:**
- String 1: `ABCDGH`
- String 2: `AEDFHR`

**Output:**
- LCS: `ADH`
- Length: 3
- Alignment:
  - String 1: `A B C D - G H`
  - String 2: `A - - D F - H R`

## Technical Details

- Pure HTML/CSS/JavaScript
- No external dependencies
- Works offline
- Mobile-responsive layout
- Comprehensive accessibility support (WCAG compliant)
- Performance optimizations for large strings

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Opera (latest)

## Bug Reports & Feature Requests

Found a bug or have a feature request? Please [open an issue](https://github.com/zzawadz/string-lcs-app/issues) on GitHub.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Credits

Created by Zygmunt Zawadzki with Claude Code.
