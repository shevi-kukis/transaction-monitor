import { useState } from "react";
import { transactionsService } from "../services/transactionsService";
import "./../styles/monitor.css";

function AddPage() {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [loading, setLoading] = useState(false);

  const generateOne = async () => {
    setLoading(true);
    await transactionsService.create(
      Math.floor(Math.random() * 1000),
      "USD"
    );
    setLoading(false);
  };

  const generateHundred = async () => {
    setLoading(true);
    const requests = Array.from({ length: 100 }, () =>
      transactionsService.create(
        Math.floor(Math.random() * 1000),
        "USD"
      )
    );
    await Promise.all(requests);
    setLoading(false);
  };

  const submitManual = async () => {
    if (!amount) return;

    setLoading(true);
    await transactionsService.create(Number(amount), currency);
    setAmount("");
    setLoading(false);
  };

 return (
    <div className="simulator-container">
      <header className="simulator-header">
        <h1>Transaction Simulator</h1>
        <p>Manage and generate financial data in real-time</p>
      </header>

      <div className="simulator-grid">
    
        <section className="glass-card">
          <div className="card-icon">⌨️</div>
          <h3>Manual Entry</h3>
          <div className="input-group">
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading}
            />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              disabled={loading}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          <button className="primary-btn" onClick={submitManual} disabled={loading || !amount}>
            {loading ? "Processing..." : "Add Transaction"}
          </button>
        </section>

        <section className="glass-card">
          <div className="card-icon">⚡</div>
          <h3>Stress Testing</h3>
          <div className="btn-stack">
            <button className="secondary-btn" onClick={generateOne} disabled={loading}>
              Generate Single
            </button>
            <button className="accent-btn" onClick={generateHundred} disabled={loading}>
              Bulk Generate (100)
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}



export default AddPage;