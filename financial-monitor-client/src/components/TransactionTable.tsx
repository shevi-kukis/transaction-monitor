import { useSelector } from "react-redux";
import { useState } from "react";
import type { RootState } from "../store/store";
import { TransactionStatus, type Transaction } from "../types/transaction";
import "../styles/monitor.css";

interface Props {
  transactions: Transaction[];
  onEdit: (id: string, amount: number) => void;
  onDelete: (id: string) => void;
}

function TransactionTable({ transactions, onEdit, onDelete }: Props) {

  const lastAddedId = useSelector(
    (state: RootState) => state.transactions.lastAddedId
  );

  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempAmount, setTempAmount] = useState<number>(0);

  const handleSave = (id: string) => {
    onEdit(id, tempAmount);
    setEditingId(null);
  };

  return (
    <div className="table-container">
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Amount</th>
            <th>Currency</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => {

            const statusClass =
              t.status === TransactionStatus.Failed
                ? "status-failed"
                : t.status === TransactionStatus.Pending
                ? "status-pending"
                : "status-completed";

      
           const isNew = t.id === lastAddedId;
            const isEditing = editingId === t.id;

            return (
              <tr
                key={`${t.id}-${t.status}`} 
      className={`transaction-row ${statusClass} ${isNew ? "new-transaction" : ""}`}
    >
              
                <td>
                  {isEditing ? (
                    <input
                      type="number"
                      className="inline-input"
                      value={tempAmount}
                      onChange={(e) => setTempAmount(Number(e.target.value))}
                      autoFocus
                    />
                  ) : (
                    `$${t.amount.toLocaleString()}`
                  )}
                </td>
                <td>{t.currency}</td>
                <td>
                  <span className="status-badge">{t.status}</span>
                </td>
                <td>
                  {isEditing ? (
                    <div className="action-btns">
                      <button className="btn-save" onClick={() => handleSave(t.id)}>Save</button>
                      <button className="btn-cancel" onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  ) : (
                    <div className="action-btns">
                      <button 
                        className="btn-edit" 
                        onClick={() => { setEditingId(t.id); setTempAmount(t.amount); }}
                      >
                        Edit
                      </button>
                      <button className="btn-delete" onClick={() => onDelete(t.id)}>Delete</button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionTable;