/*
Hello Sudoku
Generated from Development Specification v1.0

Source of truth: dev-spec.yaml
Manual code changes should be reflected in the specification first.
*/

(function ($) {
    "use strict";

    const SIZE = 9;
    const BOX = 3;
    const BLANK = 0;

    const messages = {
        row_duplicate: "Row {row} contains two {value}s.",
        column_duplicate: "Column {column} contains two {value}s.",
        box_duplicate: "Box {box} contains two {value}s.",
        invalid_string_length: "The pasted puzzle must contain exactly 81 characters.",
        invalid_string_character: "The pasted puzzle contains invalid characters.",
        no_solution: "This puzzle has no valid solution.",
        multiple_solutions: "This puzzle has multiple possible solutions.",
        no_logical_move: "No logical move available."
    };

    let originalGrid = emptyGrid();
    let currentGrid = emptyGrid();
    let givenCells = createBooleanGrid(false);
    let solvedCells = createBooleanGrid(false);
    let lastStepCount = 0;
    let lastBacktrackingUsed = false;

    $(document).ready(function () {
        renderGrid();
        wireEvents();
        updateButtons();
    });

    function wireEvents() {
        $("#generatePuzzle").on("click", function () {
            generatePuzzle($("#hsDifficulty").val());
        });

        $("#pastePuzzle").on("click", function () {
            openPasteDialog();
        });

        $("#checkPuzzle").on("click", function () {
            checkPuzzle(true);
        });

        $("#solveOneCell").on("click", function () {
            solveOneCellAction();
        });

        $("#solveAll").on("click", function () {
            solveAllAction();
        });

        $("#resetPuzzle").on("click", function () {
            resetPuzzle();
        });

        $("#clearPuzzle").on("click", function () {
            clearPuzzle();
        });

        $("#copyPuzzleString").on("click", function () {
            copyPuzzleString();
        });
    }

    function renderGrid() {
        const $grid = $("#sudokuGrid");
        $grid.empty();

        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const $cell = $("<input>", {
                    type: "text",
                    inputmode: "numeric",
                    maxlength: 1,
                    role: "gridcell",
                    "aria-label": `Row ${r + 1} Column ${c + 1}`,
                    "data-row": r,
                    "data-col": c,
                    class: "hs-cell"
                });

                $cell.on("input", onCellInput);
                $cell.on("keydown", onCellKeyDown);

                $grid.append($cell);
            }
        }

        writeGridToUI();
    }

    function onCellInput() {
        const $cell = $(this);
        const r = Number($cell.attr("data-row"));
        const c = Number($cell.attr("data-col"));

        if (givenCells[r][c]) {
            writeGridToUI();
            return;
        }

        let value = ($cell.val() || "").replace(/[^1-9]/g, "");
        if (value.length > 1) value = value.substring(value.length - 1);

        $cell.val(value);

        currentGrid[r][c] = value ? Number(value) : BLANK;
        solvedCells[r][c] = false;

        checkPuzzle(false);
        updateButtons();
    }

    function onCellKeyDown(e) {
        const $cell = $(this);
        const r = Number($cell.attr("data-row"));
        const c = Number($cell.attr("data-col"));

        if (e.key === "Backspace" || e.key === "Delete") {
            if (!givenCells[r][c]) {
                currentGrid[r][c] = BLANK;
                solvedCells[r][c] = false;
                setTimeout(function () {
                    $cell.val("");
                    checkPuzzle(false);
                    updateButtons();
                }, 0);
            }
            return;
        }

        const move = {
            ArrowUp: [-1, 0],
            ArrowDown: [1, 0],
            ArrowLeft: [0, -1],
            ArrowRight: [0, 1]
        }[e.key];

        if (move) {
            e.preventDefault();
            focusCell(clamp(r + move[0], 0, 8), clamp(c + move[1], 0, 8));
        }
    }

    function focusCell(r, c) {
        $(`.hs-cell[data-row="${r}"][data-col="${c}"]`).focus();
    }

    function writeGridToUI(invalidCells) {
        invalidCells = invalidCells || [];

        $(".hs-cell").each(function () {
            const $cell = $(this);
            const r = Number($cell.attr("data-row"));
            const c = Number($cell.attr("data-col"));
            const value = currentGrid[r][c];

            $cell.val(value ? value : "");
            $cell
                .removeClass("hs-cell-given hs-cell-user hs-cell-solved hs-cell-invalid")
                .prop("readonly", false)
                .attr("aria-invalid", "false")
                .attr("title", "");

            if (givenCells[r][c]) {
                $cell.addClass("hs-cell-given").prop("readonly", true);
            } else if (solvedCells[r][c]) {
                $cell.addClass("hs-cell-solved");
            } else if (value) {
                $cell.addClass("hs-cell-user");
            }

            if (invalidCells.some(cell => cell[0] === r && cell[1] === c)) {
                $cell.addClass("hs-cell-invalid").attr("aria-invalid", "true");
            }
        });
    }

    function readGridFromUI() {
        const grid = emptyGrid();

        $(".hs-cell").each(function () {
            const $cell = $(this);
            const r = Number($cell.attr("data-row"));
            const c = Number($cell.attr("data-col"));
            const value = Number($cell.val());
            grid[r][c] = value >= 1 && value <= 9 ? value : BLANK;
        });

        currentGrid = grid;
        return cloneGrid(grid);
    }

    function validateGrid(grid) {
        const conflicts = [];

        for (let r = 0; r < SIZE; r++) {
            addDuplicateConflicts(conflicts, getRowCells(r), "row", r);
        }

        for (let c = 0; c < SIZE; c++) {
            addDuplicateConflicts(conflicts, getColumnCells(c), "column", c);
        }

        for (let br = 0; br < BOX; br++) {
            for (let bc = 0; bc < BOX; bc++) {
                addDuplicateConflicts(conflicts, getBoxCells(br, bc), "box", br * BOX + bc);
            }
        }

        function addDuplicateConflicts(target, cells, type, index) {
            const seen = {};
            cells.forEach(([r, c]) => {
                const value = grid[r][c];
                if (!value) return;

                if (!seen[value]) seen[value] = [];
                seen[value].push([r, c]);
            });

            Object.keys(seen).forEach(value => {
                if (seen[value].length > 1) {
                    let message;

                    if (type === "row") {
                        message = format(messages.row_duplicate, { row: index + 1, value });
                    } else if (type === "column") {
                        message = format(messages.column_duplicate, { column: index + 1, value });
                    } else {
                        message = format(messages.box_duplicate, { box: index + 1, value });
                    }

                    target.push({
                        type,
                        index,
                        value: Number(value),
                        message,
                        cells: seen[value]
                    });
                }
            });
        }

        return {
            isValid: conflicts.length === 0,
            conflicts
        };
    }

    function checkPuzzle(showSuccess) {
        const grid = readGridFromUI();
        const result = validateGrid(grid);

        const invalidCells = [];
        result.conflicts.forEach(conflict => {
            conflict.cells.forEach(cell => invalidCells.push(cell));
        });

        writeGridToUI(invalidCells);

        if (!result.isValid) {
            setStatus(result.conflicts[0].message, "error");
        } else if (showSuccess) {
            setStatus("Puzzle is valid.", "success");
        }

        updateButtons();
        return result;
    }

    function solveOneCellAction() {
        const validation = checkPuzzle(false);
        if (!validation.isValid) return;

        const result = solveOneCell(currentGrid);

        if (!result) {
            setStatus(messages.no_logical_move, "warning");
            return;
        }

        currentGrid[result.row][result.col] = result.value;
        solvedCells[result.row][result.col] = true;
        lastStepCount += 1;

        writeGridToUI();
        setStatus(`Solved row ${result.row + 1}, column ${result.col + 1}: ${result.value} using ${result.technique}.`, "success");
        updateButtons();
    }

    function solveAllAction() {
        const validation = checkPuzzle(false);
        if (!validation.isValid) return;

        const started = performance.now();
        const before = cloneGrid(currentGrid);
        const logical = solveWithHumanTechniques(currentGrid);
        let finalGrid = logical.grid;
        let usedBacktracking = false;
        let solved = isSolved(finalGrid);

        if (!solved) {
            const backtrackingGrid = cloneGrid(finalGrid);
            solved = backtrackSolve(backtrackingGrid);
            if (solved) {
                usedBacktracking = true;
                finalGrid = backtrackingGrid;
            }
        }

        if (!solved) {
            setStatus(messages.no_solution, "error");
            return;
        }

        const elapsedMs = Math.round(performance.now() - started);
        currentGrid = finalGrid;
        lastStepCount = logical.steps.length;
        lastBacktrackingUsed = usedBacktracking;

        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (!givenCells[r][c] && before[r][c] !== finalGrid[r][c]) {
                    solvedCells[r][c] = true;
                }
            }
        }

        writeGridToUI();
        setStatus(`Solved in ${elapsedMs}ms using ${lastStepCount} logical steps. Backtracking used: ${usedBacktracking ? "Yes" : "No"}.`, "success");
        updateButtons();
    }

    function solveOneCell(grid) {
        const candidates = getAllCandidates(grid);

        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (grid[r][c] === BLANK && candidates[r][c].length === 1) {
                    return { row: r, col: c, value: candidates[r][c][0], technique: "naked single" };
                }
            }
        }

        const hidden = findHiddenSingle(grid, candidates);
        if (hidden) return hidden;

        return null;
    }

    function solveWithHumanTechniques(grid) {
        const working = cloneGrid(grid);
        const steps = [];
        let progress = true;

        while (progress) {
            progress = false;

            const move = solveOneCell(working);
            if (move) {
                working[move.row][move.col] = move.value;
                steps.push(move);
                progress = true;
            }
        }

        return { grid: working, steps };
    }

    function findHiddenSingle(grid, candidates) {
        const units = [];

        for (let r = 0; r < SIZE; r++) units.push({ type: "row", index: r, cells: getRowCells(r) });
        for (let c = 0; c < SIZE; c++) units.push({ type: "column", index: c, cells: getColumnCells(c) });
        for (let br = 0; br < BOX; br++) {
            for (let bc = 0; bc < BOX; bc++) {
                units.push({ type: "box", index: br * BOX + bc, cells: getBoxCells(br, bc) });
            }
        }

        for (const unit of units) {
            for (let value = 1; value <= 9; value++) {
                const places = [];

                unit.cells.forEach(([r, c]) => {
                    if (grid[r][c] === BLANK && candidates[r][c].includes(value)) {
                        places.push([r, c]);
                    }
                });

                if (places.length === 1) {
                    return {
                        row: places[0][0],
                        col: places[0][1],
                        value,
                        technique: `hidden single in ${unit.type}`
                    };
                }
            }
        }

        return null;
    }

    function getAllCandidates(grid) {
        const candidates = [];

        for (let r = 0; r < SIZE; r++) {
            candidates[r] = [];
            for (let c = 0; c < SIZE; c++) {
                candidates[r][c] = grid[r][c] === BLANK ? getCandidates(grid, r, c) : [];
            }
        }

        return candidates;
    }

    function getCandidates(grid, r, c) {
        if (grid[r][c] !== BLANK) return [];

        const used = new Set();

        for (let i = 0; i < SIZE; i++) {
            used.add(grid[r][i]);
            used.add(grid[i][c]);
        }

        const br = Math.floor(r / BOX) * BOX;
        const bc = Math.floor(c / BOX) * BOX;

        for (let rr = br; rr < br + BOX; rr++) {
            for (let cc = bc; cc < bc + BOX; cc++) {
                used.add(grid[rr][cc]);
            }
        }

        const values = [];
        for (let n = 1; n <= 9; n++) {
            if (!used.has(n)) values.push(n);
        }

        return values;
    }

    function backtrackSolve(grid) {
        const empty = findBestEmptyCell(grid);
        if (!empty) return true;

        const [r, c] = empty;
        const candidates = shuffle(getCandidates(grid, r, c));

        for (const value of candidates) {
            grid[r][c] = value;

            if (validateGrid(grid).isValid && backtrackSolve(grid)) {
                return true;
            }

            grid[r][c] = BLANK;
        }

        return false;
    }

    function countSolutions(grid, limit) {
        limit = limit || 2;
        const working = cloneGrid(grid);
        let count = 0;

        function search() {
            if (count >= limit) return;

            const empty = findBestEmptyCell(working);
            if (!empty) {
                count++;
                return;
            }

            const [r, c] = empty;
            const candidates = getCandidates(working, r, c);

            for (const value of candidates) {
                working[r][c] = value;
                if (validateGrid(working).isValid) search();
                working[r][c] = BLANK;
                if (count >= limit) return;
            }
        }

        search();
        return count;
    }

    function findBestEmptyCell(grid) {
        let best = null;
        let bestCount = 10;

        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (grid[r][c] === BLANK) {
                    const count = getCandidates(grid, r, c).length;
                    if (count < bestCount) {
                        best = [r, c];
                        bestCount = count;
                        if (count === 1) return best;
                    }
                }
            }
        }

        return best;
    }

    function generatePuzzle(difficulty) {
        setStatus("Generating puzzle...", "info");

        setTimeout(function () {
            const started = performance.now();
            const solved = generateSolvedGrid();
            const puzzle = removeCellsForDifficulty(solved, difficulty);
            const elapsedMs = Math.round(performance.now() - started);

            currentGrid = puzzle;
            originalGrid = cloneGrid(puzzle);
            givenCells = createBooleanGrid(false);
            solvedCells = createBooleanGrid(false);

            for (let r = 0; r < SIZE; r++) {
                for (let c = 0; c < SIZE; c++) {
                    givenCells[r][c] = puzzle[r][c] !== BLANK;
                }
            }

            writeGridToUI();
            setStatus(`${difficulty} puzzle generated in ${elapsedMs}ms.`, "success");
            updateButtons();
        }, 20);
    }

    function generateSolvedGrid() {
        const grid = emptyGrid();

        function fill() {
            const empty = findBestEmptyCell(grid);
            if (!empty) return true;

            const [r, c] = empty;
            const candidates = shuffle(getCandidates(grid, r, c));

            for (const value of candidates) {
                grid[r][c] = value;
                if (fill()) return true;
                grid[r][c] = BLANK;
            }

            return false;
        }

        fill();
        return grid;
    }

    function removeCellsForDifficulty(solvedGrid, difficulty) {
        const ranges = {
            Easy: [36, 45],
            Medium: [30, 35],
            Hard: [24, 29]
        };

        const [minGivens, maxGivens] = ranges[difficulty] || ranges.Medium;
        const targetGivens = randomInt(minGivens, maxGivens);
        const puzzle = cloneGrid(solvedGrid);
        const cells = shuffle(allCellPositions());

        let givens = 81;

        for (const [r, c] of cells) {
            if (givens <= targetGivens) break;

            const backup = puzzle[r][c];
            puzzle[r][c] = BLANK;

            if (countSolutions(puzzle, 2) !== 1) {
                puzzle[r][c] = backup;
            } else {
                givens--;
            }
        }

        return puzzle;
    }

    function openPasteDialog() {
        $("#pastePuzzleText").val(gridToString(currentGrid));

        $("#pastePuzzleDialog").dialog({
            modal: true,
            width: Math.min(600, $(window).width() - 40),
            buttons: {
                "Load Puzzle": function () {
                    const value = $("#pastePuzzleText").val();
                    const result = loadPuzzleString(value);

                    if (result.ok) {
                        $(this).dialog("close");
                    }
                },
                "Cancel": function () {
                    $(this).dialog("close");
                }
            }
        });
    }

    function loadPuzzleString(value) {
        const cleaned = (value || "").replace(/\s/g, "");

        if (cleaned.length !== 81) {
            setStatus(messages.invalid_string_length, "error");
            return { ok: false };
        }

        if (!/^[1-9.0]{81}$/.test(cleaned)) {
            setStatus(messages.invalid_string_character, "error");
            return { ok: false };
        }

        const grid = emptyGrid();
        let index = 0;

        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const ch = cleaned[index++];
                grid[r][c] = ch === "." || ch === "0" ? BLANK : Number(ch);
            }
        }

        const validation = validateGrid(grid);
        if (!validation.isValid) {
            currentGrid = grid;
            originalGrid = cloneGrid(grid);
            givenCells = createBooleanGrid(false);
            solvedCells = createBooleanGrid(false);
            writeGridToUI(validation.conflicts.flatMap(x => x.cells));
            setStatus(validation.conflicts[0].message, "error");
            updateButtons();
            return { ok: false };
        }

        currentGrid = grid;
        originalGrid = cloneGrid(grid);
        givenCells = createBooleanGrid(false);
        solvedCells = createBooleanGrid(false);

        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                givenCells[r][c] = grid[r][c] !== BLANK;
            }
        }

        writeGridToUI();
        setStatus("Puzzle loaded.", "success");
        updateButtons();
        return { ok: true };
    }

    function resetPuzzle() {
        currentGrid = cloneGrid(originalGrid);
        solvedCells = createBooleanGrid(false);
        writeGridToUI();
        checkPuzzle(false);
        setStatus("Puzzle reset to starting position.", "info");
        updateButtons();
    }

    function clearPuzzle() {
        currentGrid = emptyGrid();
        originalGrid = emptyGrid();
        givenCells = createBooleanGrid(false);
        solvedCells = createBooleanGrid(false);
        lastStepCount = 0;
        lastBacktrackingUsed = false;
        writeGridToUI();
        setStatus("Puzzle cleared.", "info");
        updateButtons();
    }

    function copyPuzzleString() {
        const text = gridToString(currentGrid);

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function () {
                setStatus("Puzzle string copied to clipboard.", "success");
            }).catch(function () {
                fallbackCopy(text);
            });
        } else {
            fallbackCopy(text);
        }
    }

    function fallbackCopy(text) {
        const $temp = $("<textarea>").val(text).appendTo("body").select();
        try {
            document.execCommand("copy");
            setStatus("Puzzle string copied to clipboard.", "success");
        } catch (e) {
            setStatus("Unable to copy puzzle string.", "error");
        }
        $temp.remove();
    }

    function updateButtons() {
        const hasAnyValue = currentGrid.some(row => row.some(value => value !== BLANK));
        const valid = validateGrid(currentGrid).isValid;
        const solved = isSolved(currentGrid);

        $("#solveAll").prop("disabled", !hasAnyValue || !valid || solved);
        $("#solveOneCell").prop("disabled", !hasAnyValue || !valid || solved);
        $("#checkPuzzle").prop("disabled", !hasAnyValue);
        $("#resetPuzzle").prop("disabled", !hasAnyValue && !originalGrid.some(row => row.some(value => value !== BLANK)));
        $("#copyPuzzleString").prop("disabled", !hasAnyValue);
    }

    function setStatus(message, type) {
        const $status = $("#sudokuStatus");
        $status
            .removeClass("hs-status-info hs-status-success hs-status-warning hs-status-error")
            .addClass(`hs-status-${type || "info"}`)
            .text(message);
    }

    function isSolved(grid) {
        if (!validateGrid(grid).isValid) return false;
        return grid.every(row => row.every(value => value >= 1 && value <= 9));
    }

    function gridToString(grid) {
        return grid.flat().map(value => value || "0").join("");
    }

    function emptyGrid() {
        return Array.from({ length: SIZE }, () => Array(SIZE).fill(BLANK));
    }

    function createBooleanGrid(value) {
        return Array.from({ length: SIZE }, () => Array(SIZE).fill(value));
    }

    function cloneGrid(grid) {
        return grid.map(row => row.slice());
    }

    function getRowCells(r) {
        return Array.from({ length: SIZE }, (_, c) => [r, c]);
    }

    function getColumnCells(c) {
        return Array.from({ length: SIZE }, (_, r) => [r, c]);
    }

    function getBoxCells(br, bc) {
        const cells = [];
        const startRow = br * BOX;
        const startCol = bc * BOX;

        for (let r = startRow; r < startRow + BOX; r++) {
            for (let c = startCol; c < startCol + BOX; c++) {
                cells.push([r, c]);
            }
        }

        return cells;
    }

    function allCellPositions() {
        const cells = [];
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                cells.push([r, c]);
            }
        }
        return cells;
    }

    function shuffle(array) {
        const copy = array.slice();

        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }

        return copy;
    }

    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function format(template, data) {
        return template.replace(/\{([^}]+)\}/g, function (_, key) {
            return data[key];
        });
    }

})(jQuery);
