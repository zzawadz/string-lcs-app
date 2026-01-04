# Longest Common Subsequence (LCS) Web Application

A client-side web application that finds the longest common subsequence between two strings using dynamic programming.

## Features

- **Two Input Areas**: Enter any two strings to compare
- **LCS Computation**: Uses the classic dynamic programming algorithm with backtracking
- **Visual Alignment**: Shows aligned strings with color-coded matches and gaps
- **Client-Side Only**: No backend required - runs entirely in your browser
- **Responsive Design**: Works on desktop and mobile devices

## Usage

1. Open `index.html` in any modern web browser
2. Enter your first string in the left textarea
3. Enter your second string in the right textarea
4. Click "Find LCS" or press Ctrl+Enter
5. View the results:
   - The longest common subsequence
   - The length of the LCS
   - Both strings aligned with matches (green) and gaps (red)

## Algorithm

The application implements the LCS algorithm based on the C++ implementation from [stringproc](https://github.com/zzawadz/stringproc/blob/master/src/lcs.cpp).

The algorithm uses:
- Dynamic programming to compute the LCS length
- Backtracking matrix to reconstruct the actual subsequence
- Alignment generation to show how the strings match

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

## License

This implementation is based on the algorithm from the stringproc repository.
