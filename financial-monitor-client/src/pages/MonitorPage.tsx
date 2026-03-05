import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { setFilter } from "../store/transactionsSlice";
import { fetchTransactions, updateTransactionAmount, deleteTransaction } from "../store/transactionsThunks"; 
import type { RootState, AppDispatch } from "../store/store";
import TransactionTable from "../components/TransactionTable";
import { TransactionStatus } from "../types/transaction";
import "./../styles/monitor.css";

function MonitorPage() {
  const dispatch = useDispatch<AppDispatch>();

  const { transactions, filter } = useSelector(
    (state: RootState) => state.transactions
  );

  useEffect(() => {
    dispatch(fetchTransactions());
  }, [dispatch]);

  const handleEdit = (id: string, newAmount: number) => {
 
  dispatch(updateTransactionAmount({ id, amount: newAmount }));
};
  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      dispatch(deleteTransaction(id));
    }
  };

  const filteredTransactions =
    filter === "all"
      ? transactions
      : transactions.filter(
          (t) => t.status.toLowerCase() === filter
        );

  const failedCount = transactions.filter(
    (t) => t.status === TransactionStatus.Failed
  ).length;

  const pendingCount = transactions.filter(
    (t) => t.status === TransactionStatus.Pending
  ).length;

  const completedCount = transactions.filter(
    (t) => t.status === TransactionStatus.Completed
  ).length;

  return (
    <div className="page-container">
      <h1>Live Financial Monitor!!</h1>

      <div className="controls">
        <button onClick={() => dispatch(setFilter("all"))}>All</button>
        <button onClick={() => dispatch(setFilter("pending"))}>Pending</button>
        <button onClick={() => dispatch(setFilter("completed"))}>Completed</button>
        <button onClick={() => dispatch(setFilter("failed"))}>Failed</button>
      </div>

      <div className="stats">
        Total: {transactions.length} | Pending: {pendingCount} |
        Completed: {completedCount} | Failed: {failedCount}
      </div>


      <TransactionTable 
        transactions={filteredTransactions} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
      />
    </div>
  );
}

export default MonitorPage;