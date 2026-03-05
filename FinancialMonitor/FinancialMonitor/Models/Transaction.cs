namespace FinancialMonitor.Models;

public class Transaction
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public decimal Amount { get; set; }

    public string Currency { get; set; } = string.Empty;

    public TransactionStatus Status { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public uint xmin { get; set; }
}

public enum TransactionStatus
{
    Pending,
    Completed,
    Failed
}