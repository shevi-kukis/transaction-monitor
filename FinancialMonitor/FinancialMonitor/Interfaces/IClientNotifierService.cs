using FinancialMonitor.Models;

namespace FinancialMonitor.Interfaces;

public interface IClientNotifierService
{

    Task NotifyTransactionUpdatedAsync(Transaction transaction);
    
    Task NotifyAmountChangedAsync(Transaction transaction);
}