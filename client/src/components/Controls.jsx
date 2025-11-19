import React from "react";

export default function Controls({ size, setSize, mines, setMines }) {
  return (
    <div className="controls">
      <div className="control-section">
        <div className="label">Размер поля</div>
        <div className="btn-group">
          {[3, 4, 5].map((s) => (
            <button key={s} onClick={() => setSize(s)} className={size === s ? "active" : ""}>
              {s}×{s}
            </button>
          ))}
        </div>
      </div>

      <div className="control-section">
        <div className="label">Количество мин</div>
        <div className="btn-group">
          {[1, 3, 5, 7, 9].map((m) => (
            <button
              key={m}
              onClick={() => setMines(m)}
              className={mines === m ? "active" : ""}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

