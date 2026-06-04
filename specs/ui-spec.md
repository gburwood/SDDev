# Hello Sudoku

## UI Specification v1.0

### 1. Visual Style

Modern card-based interface.

The application should feel lightweight, friendly and puzzle-focused.

---

## 2. Page Layout

```text
+------------------------------------------------+
| Hello Sudoku                                   |
| A simple Sudoku helper for solving puzzles     |
+------------------------------------------------+

+-----------------------+------------------------+
| Sudoku Grid           | Controls               |
|                       |                        |
| 9 x 9 grid             | Difficulty             |
|                       | Generate Puzzle        |
|                       | Paste Puzzle           |
|                       | Check Puzzle           |
|                       | Solve One Cell         |
|                       | Solve All              |
|                       | Reset                  |
|                       | Clear                  |
|                       | Copy Puzzle String     |
+-----------------------+------------------------+

+------------------------------------------------+
| Status / Messages                              |
+------------------------------------------------+
```

---

## 3. Responsive Layout

### Desktop

Two-column layout:

* Left: Sudoku grid
* Right: controls

### Tablet

Grid above controls or narrower two-column layout.

### Phone

Single-column layout:

1. Grid
2. Controls
3. Status panel

No horizontal scrolling.

---

## 4. Header

Displays:

```text
Hello Sudoku
Complete, check or generate Sudoku puzzles.
```

Optional small badge:

```text
Client-side only
```

---

## 5. Sudoku Grid

### Structure

* 9 rows
* 9 columns
* Strong borders around each 3 x 3 box
* Square cells
* Large readable numbers

### Cell Types

| Cell Type     | Behaviour                        |
| ------------- | -------------------------------- |
| Empty         | Editable                         |
| Given         | Locked after generation or paste |
| User-entered  | Editable                         |
| Solver-filled | Highlighted                      |
| Invalid       | Error highlight                  |

---

## 6. Cell Behaviour

Users can:

* Type numbers 1-9
* Clear cell using Delete or Backspace
* Move between cells using Tab
* Use arrow keys if implemented
* Tap cells on mobile

Blocked:

* Letters
* Symbols
* Numbers outside 1-9

---

## 7. Controls

### Difficulty Selector

Options:

* Easy
* Medium
* Hard

### Buttons

Primary buttons:

* Generate Puzzle
* Solve All

Secondary buttons:

* Solve One Cell
* Check Puzzle
* Paste Puzzle
* Copy Puzzle String
* Reset
* Clear

---

## 8. Paste Puzzle Dialog

Opened from **Paste Puzzle**.

Fields:

```text
Puzzle String
```

Expected format:

```text
81 characters using 0 or . for blanks
```

Buttons:

* Load Puzzle
* Cancel

---

## 9. Status Panel

Shows messages such as:

```text
Puzzle is valid.
Row 3 contains two 5s.
Solved in 48ms using 27 steps.
No logical move available.
```

---

## 10. Completion Display

When solved:

* Filled cells remain visible
* Solver-added cells are highlighted
* Status panel shows:

  * Solved message
  * Solving time
  * Step count
  * Whether backtracking was used

---

## 11. Error Display

Invalid cells should be visibly marked.

The status panel should explain the first or most important conflict.

Example:

```text
Column 7 contains two 8s.
```

---

## 12. Button Availability

| State          | Solve    | Solve One | Reset    | Clear   |
| -------------- | -------- | --------- | -------- | ------- |
| Empty          | Disabled | Disabled  | Disabled | Enabled |
| Valid puzzle   | Enabled  | Enabled   | Enabled  | Enabled |
| Invalid puzzle | Disabled | Disabled  | Enabled  | Enabled |
| Solved         | Disabled | Disabled  | Enabled  | Enabled |

---

## 13. Suggested HTML Containers

```html
<div id="helloSudokuApp">
  <div class="hs-card hs-header"></div>
  <div class="hs-layout">
    <div class="hs-card">
      <div id="sudokuGrid"></div>
    </div>
    <div class="hs-card">
      <div id="sudokuControls"></div>
    </div>
  </div>
  <div class="hs-card">
    <div id="sudokuStatus"></div>
  </div>
</div>
```

---

## 14. Suggested CSS Classes

```text
.hs-cell
.hs-cell-given
.hs-cell-user
.hs-cell-solved
.hs-cell-invalid
.hs-cell-highlight
.hs-status-error
.hs-status-success
.hs-status-info
```

---

## 15. Accessibility Requirements

Each cell should have a label:

```text
Row 1 Column 1
```

Buttons should have meaningful text.

Error messages should be readable without relying on colour alone.

---
