<script>
  // 默认设置
  let rows = 8;
  let cols = 10;
  let colorsName = ['空', '蓝', '红', '黄', '绿'];
  let colorsValue = ['#ffffff', '#4980b9', '#d2463e', '#f5db82', '#59a68d'];
  let selectedColor = 1;
  let targetColor = 1;
  let maxSteps = 4;
  let editMode = true;
  let moveHistory = [];
  let solution = undefined;
  let solvingSteps = [];
  let currentStep = 0;
  let stepGrids = []; // 新增中间变量
  let isAutoSolved = false; // 新增状态变量

  // 示例矩阵
  const exampleGrid = [
    [1, 1, 2, 1, 2, 1, 1, 2, 1, 1],
    [1, 3, 3, 3, 2, 3, 3, 3, 3, 1],
    [1, 1, 2, 1, 2, 1, 1, 2, 1, 1],
    [1, 1, 2, 1, 2, 1, 1, 2, 1, 1],
    [1, 1, 2, 1, 2, 1, 1, 2, 1, 1],
    [1, 3, 3, 3, 3, 3, 3, 2, 3, 1],
    [1, 1, 2, 1, 2, 1, 1, 2, 1, 1],
    [1, 1, 2, 1, 2, 1, 1, 2, 1, 1],
  ];

  // 初始化方格
  let grid = exampleGrid.map(row => [...row]);

  function resetMoves() {
    moveHistory = [];
    grid = exampleGrid.map(row => [...row]);
    solution = undefined;
    solvingSteps = [];
    stepGrids = []; // 清空中间变量
    currentStep = 0;
    isAutoSolved = false; // 重置状态变量
    grid = [...grid];
  }

  function loadExample() {
    grid = exampleGrid.map(row => [...row]);
    moveHistory = [];
    solution = undefined;
    solvingSteps = [];
    stepGrids = []; // 清空中间变量
    currentStep = 0;
    isAutoSolved = false; // 重置状态变量
    grid = [...grid];
  }

  function clearGrid() {
    grid = Array.from({ length: rows }, () =>
            Array.from({ length: cols }, () => 0)
    );
    moveHistory = [];
    solution = undefined;
    solvingSteps = [];
    stepGrids = []; // 清空中间变量
    currentStep = 0;
    isAutoSolved = false; // 重置状态变量
    grid = [...grid];
  }

  function hasEmptyColor() {
    return grid.some(row => row.some(cell => cell === 0));
  }

  function saveToHistory() {
    const puzzles = JSON.parse(localStorage.getItem('puzzles') || '[]');
    puzzles.push({
      grid: grid,
      targetColor,
      maxSteps,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('puzzles', JSON.stringify(puzzles));
  }

  function generatePuzzle() {
    saveToHistory();
    // TODO: 先不用
    fillEmpty()
  }

  function fillEmpty() {
    grid = grid.map(row => row.map(cell => cell === 0 ? selectedColor : cell));
    grid = [...grid];
  }

  // 游戏操作相关
  let isDragging = false;

  function handleMouseDown(row, col) {
    isDragging = true;
    if (editMode) {
      changeColor(row, col);
    } else {
      tryMove(row, col);
    }
  }

  function handleMouseEnter(row, col) {
    if (isDragging && editMode) {
      changeColor(row, col);
    }
  }

  function handleMouseUp() {
    isDragging = false;
  }

  function changeColor(row, col) {
    grid[row][col] = selectedColor;
    grid = [...grid];
  }

  function cloneMatrix(matrix) {
    return matrix.map(row => [...row]);
  }

  // 获取矩阵的唯一标识（字符串形式）
  function matrixToString(matrix) {
    return matrix.map(row => row.join(',')).join(';');
  }

  // 改进的染色操作
  function floodFill(currentGrid, newColor, row, col) {
    const oldColor = currentGrid[row][col];
    if (oldColor === newColor) return currentGrid;

    const queue = [[row, col]];
    const visited = Array(rows).fill().map(() => Array(cols).fill(false));
    visited[row][col] = true;

    while (queue.length > 0) {
      const [r, c] = queue.shift();
      currentGrid[r][c] = newColor;

      const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dr, dc] of directions) {
        const newR = r + dr;
        const newC = c + dc;

        if (
                newR >= 0 &&
                newR < rows &&
                newC >= 0 &&
                newC < cols &&
                !visited[newR][newC] &&
                currentGrid[newR][newC] === oldColor
        ) {
          queue.push([newR, newC]);
          visited[newR][newC] = true;
        }
      }
    }

    return currentGrid;
  }

  function tryMove(row, col) {
    if (moveHistory.length >= maxSteps) return;
    if (grid[row][col] === selectedColor) return;

    const newGrid = floodFill(cloneMatrix(grid), selectedColor, row, col);

    // 使用扩展运算符重新赋值 moveHistory 以触发响应式更新
    moveHistory = [
      ...moveHistory,
      {
        position: [row, col],
        color: selectedColor,
        oldColor: grid[row][col]
      }
    ];

    grid = newGrid;
    solution = undefined;
    checkWinCondition();
  }

  function checkWinCondition() {
    if (isGoalState(grid)) {
      setTimeout(() => {
        alert(`恭喜！您用了 ${moveHistory.length} 步完成了游戏！`);
      }, 100);
    } else if (moveHistory.length >= maxSteps) {
      setTimeout(() => {
        alert('已达到最大步数限制，请重试！');
      }, 100);
    }
  }

  function isGoalState(state) {
    return state.every(row => row.every(cell => cell === targetColor));
  }

  // 检查矩阵是否全部为目标颜色
  function isAllTargetColor(matrix, targetColor) {
    for (let row of matrix) {
      for (let cell of row) {
        if (cell !== targetColor) return false;
      }
    }
    return true;
  }

  // 应用操作：将点击的B及其上下左右相邻的B替换为A
  function applyOperation(matrix, A, x, y) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const B = matrix[x][y];
    const newMatrix = cloneMatrix(matrix);
    const queue = [[x, y]];
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    visited[x][y] = true;

    while (queue.length > 0) {
      const [i, j] = queue.shift();
      if (newMatrix[i][j] === B) {
        newMatrix[i][j] = A;
        // 上下左右
        const directions = [
          [i - 1, j],
          [i + 1, j],
          [i, j - 1],
          [i, j + 1],
        ];
        for (let [ni, nj] of directions) {
          if (
                  ni >= 0 &&
                  ni < rows &&
                  nj >= 0 &&
                  nj < cols &&
                  !visited[ni][nj] &&
                  newMatrix[ni][nj] === B
          ) {
            queue.push([ni, nj]);
            visited[ni][nj] = true;
          }
        }
      }
    }

    return newMatrix;
  }

  // 广度优先搜索，最多4步
  function bfs(initialMatrix, targetColor) {
    const queue = [];
    const visited = new Set();
    const availableColors = new Set(initialMatrix.flat());
    queue.push({ matrix: initialMatrix, steps: [], depth: 0 });
    visited.add(matrixToString(initialMatrix));

    while (queue.length > 0) {
      const current = queue.shift();
      const { matrix, steps, depth } = current;

      // 检查是否全部为目标颜色
      if (isAllTargetColor(matrix, targetColor)) {
        return { type: 'success', steps: steps };
      }

      if (depth >= 4) continue; // 超过4步则跳过

      // 尝试所有可能的操作
      for (let A of availableColors) { // A 可以选择所有颜色
        for (let x = 0; x < matrix.length; x++) {
          for (let y = 0; y < matrix[0].length; y++) {
            const B = matrix[x][y];
            if (A === B) continue;
            const newMatrix = applyOperation(matrix, A, x, y);
            const matrixStr = matrixToString(newMatrix);
            if (!visited.has(matrixStr)) {
              visited.add(matrixStr);
              queue.push({
                matrix: newMatrix,
                steps: [...steps, { A, B, position: [x, y] }],
                depth: depth + 1,
              });
            }
          }
        }
      }
    }

    return { type: 'failure', message: "在4步内无法将所有数字变成目标颜色。" };
  }

  // 执行解题步骤
  function executeStep() {
    if (currentStep < solvingSteps.length) {
      const { A, B, position } = solvingSteps[currentStep];
      const [row, col] = position;
      grid = floodFill(cloneMatrix(grid), A, row, col);
      currentStep++;
    }
  }

  // 显示解题步骤
  function showSolution() {
    if (solution && solution.steps && solution.steps.length > 0) {
      solvingSteps = solution.steps;
      currentStep = 0;
      grid = cloneMatrix(stepGrids[0]); // 设置为初始状态
    }
  }

  // 广度优先搜索解题
  function solvePuzzle() {
    const result = bfs(cloneMatrix(grid), targetColor);
    solution = result;

    if (result.type === 'success') {
      // 生成每一步的棋盘状态
      stepGrids = [cloneMatrix(grid)]; // 初始状态
      let tempGrid = cloneMatrix(grid);
      for (let step of result.steps) {
        const { A, B, position } = step;
        const [row, col] = position;
        tempGrid = floodFill(cloneMatrix(tempGrid), A, row, col);
        stepGrids.push(cloneMatrix(tempGrid));
      }
      isAutoSolved = true; // 设置为自动解题状态
    }
  }

  // 新增还原题目的函数
  function restorePuzzle() {
    if (stepGrids.length > 0) {
      grid = cloneMatrix(stepGrids[0]); // 恢复到自动解题前的状态
      solvingSteps = [];
      stepGrids = [];
      solution = undefined;
      currentStep = 0;
      isAutoSolved = false; // 重置自动解题状态
    }
  }
</script>

<style>
  /* 您的样式保持不变 */
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: Arial, sans-serif;
    padding: 20px;
  }

  .controls {
    margin-bottom: 20px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
  }

  .grid-container {
    display: flex;
    flex-direction: column;
  }

  .grid-header, .grid-row {
    display: flex;
  }

  .grid-header {
    margin-left: 30px; /* 为了对齐纵轴标签 */
  }

  .grid-header div {
    width: 40px;
    height: 40px;
    line-height: 40px;
    border: 1px solid rgba(204, 204, 204, 0);
    text-align: center;
    font-weight: bold;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(var(--cols), 40px);
    grid-gap: 2px;
    user-select: none;
  }

  .cell {
    width: 40px;
    height: 40px;
    border: 1px solid #ccc;
    cursor: pointer;
    border-radius: 4px;
    position: relative;
  }

  .cell-id {
    position: absolute;
    bottom: 2px;
    right: 2px;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.7);
  }

  .color-picker {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .color-option {
    width: 30px;
    height: 30px;
    border: 2px solid #000;
    cursor: pointer;
    border-radius: 4px;
    position: relative;
  }

  .color-option.selected {
    border: 4px solid #000;
  }

  .solution {
    margin-top: 20px;
    max-width: 600px;
    word-wrap: break-word;
  }

  .button {
    padding: 10px 20px;
    background-color: #007bff;
    border: none;
    color: white;
    cursor: pointer;
    border-radius: 4px;
  }

  .button:hover {
    background-color: #0056b3;
  }

  .settings {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .mode-switch {
    margin: 10px 0;
  }

  .error-message {
    color: #dc3545;
    margin-top: 10px;
  }

  .button-group {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
  }

  .moves-counter {
    margin-top: 10px;
    font-size: 1.1em;
    font-weight: bold;
  }

  .solution-step {
    margin-bottom: 5px;
  }

  .row-label {
    width: 30px;
    height: 40px;
    border: 1px solid rgba(204, 204, 204, 0);
    line-height: 40px;
    text-align: center;
    font-weight: bold;
  }
</style>

<div
        class="container"
        on:mouseup={handleMouseUp}
        on:mouseleave={handleMouseUp}
>
  <h1>溢彩画高手|鸣潮|解题工具</h1>

  <div class="mode-switch">
    <label>
      <input type="checkbox" bind:checked={editMode} />
      编辑题目
    </label>
  </div>

  <div class="controls">
    <div class="color-picker">
      <span>选择颜色:</span>
      {#each colorsValue.slice(1) as color, i}
        <div
                class="color-option {selectedColor === i + 1 ? 'selected' : ''}"
                style="background-color: {color};"
                on:click={() => selectedColor = i + 1}
        >
          <span class="cell-id">{i + 1}</span>
        </div>
      {/each}
    </div>

    <div class="color-picker">
      <span>目标颜色:</span>
      {#each colorsValue.slice(1) as color, i}
        <div
                class="color-option {targetColor === i + 1 ? 'selected' : ''}"
                style="background-color: {color};"
                on:click={() => targetColor = i + 1}
        >
          <span class="cell-id">{i + 1}</span>
        </div>
      {/each}
    </div>

    <div class="settings">
      <label for="steps">最大步骤:</label>
      <input id="steps" type="number" min="1" max="10" bind:value={maxSteps} />
    </div>
  </div>

  <div class="button-group">
    <button class="button" on:click={loadExample}>加载示例</button>
    <button class="button" on:click={clearGrid}>清空画板</button>
    <button class="button" on:click={generatePuzzle}>新建题目</button>
    <button class="button" on:click={fillEmpty}>填充空白</button>
    <!-- 修改自动解题按钮，根据 isAutoSolved 显示不同的标签和功能 -->
    <button class="button" on:click={isAutoSolved ? restorePuzzle : solvePuzzle}>
      {isAutoSolved ? '还原题目' : '自动解题'}
    </button>
    {#if !editMode}
      <button class="button" on:click={resetMoves}>重新开始</button>
    {/if}
    {#if solution && solution.type === 'success'}
      <button class="button" on:click={showSolution}>查看解题步骤</button>
    {/if}
  </div>

  {#if !editMode}
    <div class="moves-counter">
      当前步数: {moveHistory.length} / {maxSteps}
    </div>
  {/if}

  <div class="grid-container">
    <div class="grid-header">
      <!-- 横轴标号 -->
      {#each Array(cols).fill(0).map((_, i) => i + 1) as colLabel}
        <div>{colLabel}</div>
      {/each}
    </div>
    <div class="grid">
      {#each grid as row, rowIndex}
        <div class="grid-row" style="display: flex;">
          <!-- 纵轴标号 -->
          <div class="row-label">{rowIndex + 1}</div>
          {#each row as cell, colIndex}
            <div
                    class="cell"
                    style="background-color: {colorsValue[cell]};"
                    on:mousedown={() => handleMouseDown(rowIndex, colIndex)}
                    on:mouseenter={() => handleMouseEnter(rowIndex, colIndex)}
            >
              <span class="cell-id">{cell}</span>
            </div>
          {/each}
        </div>
      {/each}
    </div>
  </div>

  {#if solution}
    <div class="solution">
      {#if solution.type === 'success'}
        {#if solution.steps.length > 0}
          <h2>找到解决方案，共 {solution.steps.length} 步：</h2>
          <ol>
            {#each solution.steps as step, index}
              <li class="solution-step">
                选择{colorsName[step.A]}色({step.A})，点击位置 ({step.position[0] + 1}, {step.position[1] + 1})
              </li>
            {/each}
          </ol>
          {#if solvingSteps.length > 0}
            <button class="button" on:click={executeStep} disabled={currentStep >= solvingSteps.length}>执行下一步</button>
            <p>当前步骤: {currentStep} / {solvingSteps.length}</p>
          {/if}
        {:else}
          <h2>当前方格已经全部为目标颜色，无需操作。</h2>
        {/if}
      {:else}
        <div class="error-message">
          <h2>{solution.message}</h2>
        </div>
      {/if}
    </div>
  {/if}
</div>
