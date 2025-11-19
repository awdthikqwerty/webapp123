import { useEffect, useState } from "react";

export default function Stats() {
  const [day, setDay] = useState([]);
  const [week, setWeek] = useState([]);

  useEffect(() => {
    fetch("/api/stats/day").then((r) => r.json()).then(setDay).catch(() => {});
    fetch("/api/stats/week").then((r) => r.json()).then(setWeek).catch(() => {});
  }, []);

  return (
    <div className="stats-container">
      <h2>Топ — День</h2>
      <div className="stat-list">
        {day.length === 0 && <div className="muted">Нет данных</div>}
        {day.map((r, i) => (
          <div key={i} className="stat-item">
            <div className="s-left">ID: {r.telegram_id}</div>
            <div className="s-right">Профит: {Number(r.total).toFixed(2)}</div>
          </div>
        ))}
      </div>

      <h2>Топ — Неделя</h2>
      <div className="stat-list">
        {week.length === 0 && <div className="muted">Нет данных</div>}
        {week.map((r, i) => (
          <div key={i} className="stat-item">
            <div className="s-left">ID: {r.telegram_id}</div>
            <div className="s-right">Профит: {Number(r.total).toFixed(2)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
