# Hello Sudoku

## Functional Specification v1.0

### Overview

Hello Sudoku is a client-side Sudoku solving application designed to run within SharePoint Online.

The application allows users to:

* Enter Sudoku puzzles manually
* Paste Sudoku puzzles as text strings
* Generate random puzzles
* Validate puzzles
* Solve puzzles
* Solve individual cells
* Receive feedback about mistakes

No server-side processing or data storage is required.

---

## User Roles

### User

The application contains a single user role.

Permissions:

* Create puzzle
* Edit puzzle
* Generate puzzle
* Validate puzzle
* Solve puzzle

---

## Platform

### Hosting

SharePoint Online

### Technology Stack

* HTML
* JavaScript
* jQuery
* Bootstrap
* jQuery UI

### Persistence

None

No SharePoint lists, libraries, databases or APIs are required.

---

## Main Screen

### Layout

Card-based responsive layout.

Sections:

1. Toolbar
2. Sudoku Grid
3. Status Panel

---

## Toolbar Actions

### Generate Puzzle

Allows generation of a new puzzle.

Difficulty options:

* Easy
* Medium
* Hard

### Paste Puzzle

Allows entry of an 81-character Sudoku string.

Example:

530070000600195000098000060800060003400803001700020006060000280000419005000080079

### Copy Puzzle String

Copies the current puzzle to the clipboard as an 81-character string.

### Check Puzzle

Validates the puzzle.

### Solve One Cell

Fills a single logically solvable cell.

### Solve All

Completes the puzzle.

### Reset

Returns the puzzle to its original state.

### Clear

Clears the entire puzzle.

---

## Sudoku Grid

### Size

9 x 9

### Structure

* 81 cells
* 9 rows
* 9 columns
* 9 sub-grids

### Input

Allowed values:

* Blank
* 1-9

### Invalid Entry Handling

Invalid values are highlighted.

Conflicts include:

* Duplicate value in row
* Duplicate value in column
* Duplicate value in sub-grid

Invalid entries may be entered but are highlighted.

---

## Validation

### Check Puzzle

When executed:

1. Validate rows
2. Validate columns
3. Validate sub-grids

If errors exist:

* Highlight affected cells
* Display explanation
* Disable solving

Example:

"Row 3 contains two 5s"

---

## Solving Engine

### Strategy

1. Human-style solving techniques
2. Backtracking fallback

### Human Techniques

Initial version:

* Single candidate
* Hidden single
* Naked single

Future versions may include:

* Naked pairs
* Hidden pairs
* X-Wing
* Swordfish

---

## Solve One Cell

The system shall:

1. Find a logically solvable cell
2. Populate the value
3. Highlight the solved cell

If no logical move exists:

Display message:

"No logical move available."

---

## Solve All

The system shall:

1. Validate puzzle
2. Solve puzzle
3. Populate remaining cells

---

## Puzzle Generation

### Difficulty Levels

Easy

* More givens
* Simpler logic

Medium

* Moderate givens
* Intermediate logic

Hard

* Fewer givens
* Advanced solving required

### Constraints

Generated puzzles must:

* Be valid
* Have one unique solution

---

## Completion Behaviour

When solved:

* Display completed puzzle
* Highlight solver-added cells
* Display elapsed solving time
* Display solving statistics
* Allow generation of a new puzzle

---

## Responsive Behaviour

### Desktop

Full-sized grid.

### Tablet

Responsive scaling.

### Mobile

Touch-friendly controls.

Grid remains fully usable without horizontal scrolling.

---

## Error Messages

Examples:

* Invalid puzzle detected
* Puzzle has no solution
* Puzzle has multiple solutions
* No logical move available

---

## Non-Functional Requirements

### Performance

Solve typical puzzle in under 1 second.

### Browser Support

* Edge
* Chrome
* Firefox
* Safari

### Accessibility

* Keyboard navigation
* High contrast support
* Screen reader friendly labels

---

## Future Enhancements

### Planned

* Hint system
* Explain move
* Difficulty analysis
* Dark mode
* Puzzle import/export formats
* Printing support
