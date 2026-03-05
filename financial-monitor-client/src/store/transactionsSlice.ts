import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Transaction } from "../types/transaction";
import { fetchTransactions, updateTransactionAmount, deleteTransaction } from "./transactionsThunks";

type FilterType = "all" | "pending" | "completed" | "failed";

interface TransactionsState {
  transactions: Transaction[];
  filter: FilterType;
  lastAddedId: string | null;
}

const initialState: TransactionsState = {
  transactions: [],
  filter: "all",
  lastAddedId: null,
};

const transactionsSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    updateTransaction(state, action: PayloadAction<Transaction>) {
      const index = state.transactions.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.transactions[index] = action.payload;
      }
    },
    
    removeTransaction(state, action: PayloadAction<string>) {
      state.transactions = state.transactions.filter(t => t.id !== action.payload);
    },

    setFilter(state, action: PayloadAction<FilterType>) {
      state.filter = action.payload;
    },



addTransaction(state, action: PayloadAction<Transaction>) {
  const incomingTransaction = action.payload;
  const existingIndex = state.transactions.findIndex(t => t.id === incomingTransaction.id);

  state.lastAddedId = incomingTransaction.id;

  if (existingIndex !== -1) {
    state.transactions[existingIndex] = incomingTransaction;
  } else {
    
    state.transactions.unshift(incomingTransaction);
    
    if (state.transactions.length > 10) {
      state.transactions.pop();
    }
  }
}
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.transactions = action.payload;
        state.lastAddedId = null;
      })
      .addCase(updateTransactionAmount.fulfilled, (state, action) => {
        const transaction = state.transactions.find(t => t.id === action.payload.id);
        if (transaction) {
          transaction.amount = action.payload.amount;
        }
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.transactions = state.transactions.filter(t => t.id !== action.payload);
      });
  }
});

export const {
  addTransaction,
  updateTransaction, 
  removeTransaction, 
  setFilter
} = transactionsSlice.actions;

export default transactionsSlice.reducer;