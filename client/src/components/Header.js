export default function Header({ balance }) {
  return (
    <header className="header">
      <div>
        <h1>Mines</h1>
        <div className="subtitle">Telegram WebApp — демо</div>
      </div>
      <div className="balance-box header-balance">
        <div className="small">Баланс</div>
        <div className="big">{Number(balance).toFixed(2)} ★</div>
      </div>
    </header>
  );
}
