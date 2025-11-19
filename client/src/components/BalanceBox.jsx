export default function BalanceBox({ balance }) {
  return (
    <div className="balance-box">
      <div className="small">Ваш баланс</div>
      <div className="big">{Number(balance).toFixed(2)} ★</div>
    </div>
  );
}
