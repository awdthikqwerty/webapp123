import { useState, useEffect, useMemo } from "react";

/**
 * Props:
 *  - size: number (3|4|5)
 *  - mines: number
 *  - bet: number
 *  - onLose(): called when stepped on mine
 *  - onWin(openedCount, multiplier): called when user cashouts / completes safe tiles
 *
 * Behavior:
 *  - Randomly place mines on init
 *  - On click: if mine -> onLose()
 *            else -> increase opened count and show ✔
 *  - Multiplier formula: simple table based on opened safe tiles and mine density
 */

export default function GameBoard({ size, mines, bet = 10, onLose, onWin }) {
  const total = size * size;
  const [cells, setCells] = useState([]); // {mine:boolean, opened:boolean}
  const [openedCount, setOpenedCount] = useState(0);
  const [isLost, setIsLost] = useState(false);
  const [isWon, setIsWon] = useState(false);

  useEffect(() => {
    reset();
    // eslint-disable-next-line
  }, [size, mines]);

  function reset() {
    const positions = new Set();
    while (positions.size < mines) positions.add(Math.floor(Math.random() * total));
    const arr = Array.from({ length: total }).map((_, idx) => ({
      mine: positions.has(idx),
      opened: false
    }));
    setCells(arr);
    setOpenedCount(0);
    setIsLost(false);
    setIsWon(false);
  }

  const multipliers = useMemo(() => {
    // build simple progression: base depends on density
    const density = mines / total;
    const base = 1 + (1 - density) * 0.2; // smaller density -> faster growth
    const arr = [1.0];
    for (let i = 1; i <= total; i++) {
      // multiplier increases as safe opened number grows
      const value = +(1 + i * (base * 0.2)).toFixed(2);
      arr.push(value);
    }
    return arr; // arr[n] is multiplier when n safe tiles opened
  }, [size, mines, total]);

  function handleClick(i) {
    if (isLost || isWon) return;
    if (cells[i].opened) return;

    const next = cells.slice();
    next[i] = { ...next[i], opened: true };
    setCells(next);

    if (next[i].mine) {
      setIsLost(true);
      onLose?.();
      return;
    }

    const newOpened = next.filter((c) => c.opened && !c.mine).length;
    setOpenedCount(newOpened);

    // If player opened all safe tiles -> win
    if (newOpened >= total - mines) {
      setIsWon(true);
      const multiplier = multipliers[newOpened] ?? multipliers[multipliers.length - 1];
      onWin?.(newOpened, multiplier);
    }
  }

  function handleCashout() {
    if (isLost || isWon) return;
    const multiplier = multipliers[openedCount] ?? 1;
    const profit = +(bet * (multiplier - 1)).toFixed(2);
    setIsWon(true);
    onWin?.(openedCount, multiplier);
  }

  return (
    <div>
      <div className="info-row">
        <div>Открыто: {openedCount}</div>
        <div>Множитель: x{(multipliers[openedCount] ?? 1).toFixed(2)}</div>
      </div>

      <div className="board-grid" style={{ gridTemplateColumns: `repeat(${size}, minmax(0,1fr))` }}>
        {cells.map((c, idx) => (
          <button
            key={idx}
            className={`cell ${c.opened ? "open" : ""} ${c.mine && c.opened ? "mine" : ""}`}
            onClick={() => handleClick(idx)}
            disabled={isLost || isWon}
          >
            {c.opened ? (c.mine ? "💣" : "✔") : ""}
          </button>
        ))}
      </div>

      <div className="action-row">
        <button className="cashout" onClick={handleCashout} disabled={isLost || isWon}>
          Забрать x{(multipliers[openedCount] ?? 1).toFixed(2)}
        </button>
        <button className="reset" onClick={reset}>Новая игра</button>
      </div>

      {isLost && <div className="message">Проигрыш — была мина 💥</div>}
      {isWon && <div className="message">Результат зафиксирован</div>}
    </div>
  );
}
