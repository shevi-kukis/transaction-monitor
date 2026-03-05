using FinancialMonitor.Hubs;
using FinancialMonitor.Interfaces;
using FinancialMonitor.Models;
using Microsoft.AspNetCore.SignalR;

namespace FinancialMonitor.Services;

public class SignalRNotifierService : IClientNotifierService
{
    private readonly IHubContext<TransactionHub> _hubContext;

    public SignalRNotifierService(IHubContext<TransactionHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task NotifyTransactionUpdatedAsync(Transaction transaction)
    {
        await _hubContext.Clients.All.SendAsync("ReceiveTransaction", transaction);
    }

    public async Task NotifyAmountChangedAsync(Transaction transaction)
    {
        await _hubContext.Clients.All.SendAsync("ReceiveTransactionUpdate", transaction);
    }
}