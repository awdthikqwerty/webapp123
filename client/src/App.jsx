import { useState, useEffect } from "react";
import Header from "./components/Header";
import GameBoard from "./components/GameBoard";
import Controls from "./components/Controls";
import Stats from "./components/Stats";
import BalanceBox from "./components/BalanceBox";

/**
 * Simple Telegram WebApp integration:
 * If running inside Telegram, window.Telegram?.WebApp is available.
 * For demo (local) we use a demo telegramId.
 */

export default function App() {
  const [balance, setBalance] = useState(1000);
  const [tab, setTab] = useState("game");
  const [size, setSize] = useState(5);
  const [mines, setMines] = useState(7);
  const [bet, setBet] = useState(20);

  // In real use, telegramId must come from Telegram.WebApp.initDataUnsafe.user.id or server
  const telegramId = "demo_user_123";

  useEffect(() => {
    // register/get user from backend
    fetch(`${import.meta.env.VITE_API}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telegramId })
    })
      .then((r) => r.json())
      .then((user) => {
        if (user?.balance !== undefined) setBalance(Number(user.balance));
      })
      .catch(() => {});
  }, []);

  function handleLose() {
    // deduct bet
    fetch(`${import.meta.env.VITE_API}/api/update-balance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telegramId, change: -Math.abs(bet) })
    })
      .then((r) => r.json())
      .then((user) => user?.balance && setBalance(Number(user.balance)))
      .catch(() => {});
    // record game with negative profit
    fetch(`${import.meta.env.VITE_API}/api/game`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telegramId, profit: -Math.abs(bet) })
    }).catch(() => {});
    alert("Вы проиграли!");
  }

  function handleWin(profit) {
    // profit is positive amount to add
    fetch(`${import.meta.env.VITE_API}/api/update-balance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telegramId, change: Number(profit) })
    })
      .then((r) => r.json())
      .then((user) => user?.balance && setBalance(Number(user.balance)))
      .catch(() => {});
    // record game
    fetch("/api/game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telegramId, profit: Number(profit) })
    }).catch(() => {});
    alert(`Вы выиграли ${profit} ★`);
  }

  return (
    <div className="container">
      <Header balance={balance} />
      <nav className="tabs">
        <button onClick={() => setTab("game")} className={tab === "game" ? "active" : ""}>Игра</button>
        <button onClick={() => setTab("stats")} className={tab === "stats" ? "active" : ""}>Статистика</button>
      </nav>

      {tab === "game" && (
        <>
          <Controls size={size} setSize={setSize} mines={mines} setMines={setMines} />
          <div className="bet-row">
            <div className="bet-left">
              <div className="bet-title">Ставка</div>
              <input type="number" min="1" value={bet} onChange={(e) => setBet(Number(e.target.value))} />
              <div className="quick-buttons">
                {[20, 50, 100, 200].map((b) => (
                  <button key={b} onClick={() => setBet(b)} className={bet === b ? "active" : ""}>{b}</button>
                ))}
              </div>
            </div>
            <BalanceBox balance={balance} />
          </div>

          <GameBoard
            size={size}
            mines={mines}
            bet={bet}
            onLose={handleLose}
            onWin={(openedCount, multiplier) => {
              // profit = bet * (multiplier - 1)
              const profit = +(bet * (multiplier - 1)).toFixed(2);
              handleWin(profit);
            }}
          />
        </>
      )}

      {tab === "stats" && <Stats />}

      <footer className="footer">Mines WebApp — demo. Telegram WebApp integration: tg.sendData() on real deployment.</footer>
    </div>
  );
}

