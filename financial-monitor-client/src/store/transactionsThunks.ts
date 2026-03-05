import { createAsyncThunk } from "@reduxjs/toolkit";
import type { Transaction } from "../types/transaction";
import { transactionsService } from "../services/transactionsService";

export const fetchTransactions = createAsyncThunk<Transaction[]>(
  "transactions/fetchTransactions",
  async () => {
    return await transactionsService.getAll();
  }
);

export const updateTransactionAmount = createAsyncThunk(
  "transactions/updateAmount",
  async ({ id, amount }: { id: string; amount: number }) => {
    await transactionsService.updateAmount(id, amount);
    return { id, amount }; 
  }
);

export const deleteTransaction = createAsyncThunk(
  "transactions/delete",
  async (id: string) => {
    await transactionsService.delete(id);
    return id; 
  }
);