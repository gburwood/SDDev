# Hello Sudoku

## Technical Specification v1.0

### 1. Purpose

Hello Sudoku is a browser-based Sudoku application hosted in SharePoint Online. It allows a user to enter, paste, generate, validate and solve Sudoku puzzles.

The application is entirely client-side.

No SharePoint lists, REST calls, databases, Power Automate flows or server-side services are required.

---

## 2. Technology Stack

### Required

* HTML
* JavaScript
* jQuery
* Bootstrap
* jQuery UI

### Optional

* Font Awesome for icons
* Local CSS file for styling

---

## 3. Hosting Model

The application will run inside a SharePoint Online page, most likely using:

* Modern Script Editor web part, or
* Content editor-style custom web part, or
* SiteAssets-hosted HTML/JS/CSS files loaded into a page

---

## 4. Architecture

```text
SharePoint Page
    ↓
HTML User Interface
    ↓
Sudoku Controller
    ↓
Validation Engine
    ↓
Solver Engine
    ↓
Puzzle Generator
```

---

## 5. Main Components

### 5.1 SudokuGrid

Responsible for:

* Rendering the 9 x 9 grid
* Capturing user input
* Updating cell values
* Highlighting errors
* Highlighting generated and solved cells

---

### 5.2 SudokuValidator

Responsible for:

* Checking row conflicts
* Checking column conflicts
* Checking 3 x 3 box conflicts
* Validating pasted puzzle strings
* Returning structured validation messages

---

### 5.3 SudokuSolver

Responsible for:

* Solving one logical cell
* Solving the full puzzle
* Applying human-style solving techniques first
* Falling back to backtracking if required

Initial techniques:

* Naked single
* Hidden single
* Single candidate

---

### 5.4 SudokuGenerator

Responsible for:

* Generating new puzzles
* Supporting Easy, Medium and Hard difficulty
* Ensuring generated puzzles have a unique solution

---

### 5.5 SudokuController

Responsible for:

* Wiring buttons to actions
* Managing current puzzle state
* Managing original puzzle state
* Enabling/disabling controls
* Updating status messages

---

## 6. Data Structures

### Puzzle Grid

```javascript
[
  [5,3,0,0,7,0,0,0,0],
  [6,0,0,1,9,5,0,0,0],
  ...
]
```

Zero represents a blank cell.

---

### Cell State

```javascript
{
  row: 0,
  col: 0,
  value: 5,
  isGiven: true,
  isSolved: false,
  isInvalid: false
}
```

---

### Validation Result

```javascript
{
  isValid: false,
  conflicts: [
    {
      type: "row",
      index: 2,
      value: 5,
      message: "Row 3 contains two 5s",
      cells: [[2,1], [2,7]]
    }
  ]
}
```

---

### Solve Result

```javascript
{
  solved: true,
  grid: [],
  steps: [],
  elapsedMs: 42,
  usedBacktracking: false
}
```

---

## 7. Core Functions

### renderGrid()

Renders the Sudoku grid into the page.

### readGrid()

Reads the current grid into a two-dimensional array.

### validateGrid(grid)

Returns validation status and conflicts.

### solveOneCell(grid)

Attempts to solve one logical cell.

### solveAll(grid)

Solves the full puzzle.

### generatePuzzle(difficulty)

Creates a new puzzle for the selected difficulty.

### resetPuzzle()

Restores the puzzle to the starting state.

### clearPuzzle()

Clears the grid.

### pastePuzzleString(value)

Validates and loads an 81-character puzzle string.

### copyPuzzleString()

Copies current puzzle state to clipboard.

---

## 8. Validation Rules

Allowed cell values:

* Blank
* 1 to 9

Invalid conditions:

* Duplicate number in row
* Duplicate number in column
* Duplicate number in 3 x 3 box
* Pasted string not 81 characters
* Pasted string contains invalid characters
* Puzzle has no solution
* Puzzle has multiple solutions

---

## 9. Solving Rules

The solver should attempt logical solving first.

Order:

1. Naked singles
2. Hidden singles
3. Single candidates
4. Backtracking fallback

For Solve One Cell:

* Only one cell should be filled
* Prefer logical techniques
* If no logical cell is available, show message

For Solve All:

* Validate first
* Complete puzzle if possible
* Highlight solver-filled cells
* Show elapsed time and step count

---

## 10. Puzzle Generation

Generation process:

1. Generate a complete solved grid
2. Remove values according to difficulty
3. Check puzzle remains valid
4. Check puzzle has one unique solution
5. Present puzzle to user

Difficulty targets:

| Difficulty | Approximate Givens |
| ---------- | -----------------: |
| Easy       |              36-45 |
| Medium     |              30-35 |
| Hard       |              24-29 |

---

## 11. UI States

### Empty

No puzzle loaded.

### Editing

User is entering values.

### Invalid

Puzzle contains conflicts.

### Ready

Puzzle is valid and can be solved.

### Solving

Solver is running.

### Solved

Puzzle has been completed.

---

## 12. Error Handling

Errors should be shown in the status panel.

Examples:

* "Row 3 contains two 5s."
* "The pasted puzzle must contain 81 characters."
* "This puzzle has no valid solution."
* "This puzzle has multiple possible solutions."
* "No logical move is currently available."

---

## 13. Accessibility

The grid should support:

* Keyboard navigation
* Tab movement between cells
* ARIA labels
* High contrast visible borders
* Clear focus state

Example label:

```text
Row 3, Column 5
```

---

## 14. Performance

Target:

* Validate instantly
* Solve typical puzzle in under 1 second
* Generate puzzle in under 3 seconds

---

## 15. Security

No user data is persisted.

No external API calls are made.

No elevated SharePoint permissions are required.

---

## 16. Deployment

Files may be stored in:

```text
SiteAssets/HelloSudoku/
```

Suggested files:

```text
hello-sudoku.html
hello-sudoku.js
hello-sudoku.css
```

---
