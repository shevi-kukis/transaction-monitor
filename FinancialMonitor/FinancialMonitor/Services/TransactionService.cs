using FinancialMonitor.Data;
using FinancialMonitor.DTO;
using FinancialMonitor.Hubs;
using FinancialMonitor.Interfaces;
using FinancialMonitor.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;
using System.Threading; 

namespace FinancialMonitor.Services;

public class TransactionService : ITransactionService
{
    private readonly AppDbContext _context;
    private readonly IClientNotifierService _notifier;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IDistributedCache _cache;
    
    private static readonly SemaphoreSlim _cacheSemaphore = new SemaphoreSlim(1, 1);

    private readonly ILogger<TransactionService> _logger;
    
    private const string CacheKey = "transactions_top_10";
public TransactionService(
        AppDbContext context,
        IClientNotifierService notifier, 
        IServiceScopeFactory scopeFactory,
        IDistributedCache cache,
        ILogger<TransactionService> logger) 
    {
        _context = context;
        _notifier = notifier;
        _scopeFactory = scopeFactory;
        _cache = cache;
        _logger = logger;
    }

    public async Task<List<Transaction>> GetAllAsync()
    {
        var cachedData = await _cache.GetStringAsync(CacheKey);
        if (!string.IsNullOrEmpty(cachedData))
        {
            return JsonSerializer.Deserialize<List<Transaction>>(cachedData)!;
        }

        await _cacheSemaphore.WaitAsync();
        try
        {
            cachedData = await _cache.GetStringAsync(CacheKey);
            if (!string.IsNullOrEmpty(cachedData))
            {
                return JsonSerializer.Deserialize<List<Transaction>>(cachedData)!;
            }

            var transactions = await _context.Transactions
                .OrderByDescending(t => t.CreatedAt)
                .Take(10) 
                .ToListAsync();

            var cacheOptions = new DistributedCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromMinutes(5));

            await _cache.SetStringAsync(CacheKey, JsonSerializer.Serialize(transactions), cacheOptions);

            return transactions;
        }
        finally
        {
            _cacheSemaphore.Release(); 
        }
    }

    public async Task<Transaction> AddTransactionAsync(TransactionDto dto)
    {
        var transaction = new Transaction
        {
            Id = Guid.NewGuid(),
            Amount = dto.Amount,
            Currency = dto.Currency,
            Status = TransactionStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();
        
        await _cache.RemoveAsync(CacheKey); 

        await _notifier.NotifyTransactionUpdatedAsync(transaction);

         _ = ProcessTransactionAsync(transaction.Id);

        return transaction;
    }

    public async Task<bool> DeleteTransactionAsync(Guid id)
    {
        var transaction = await _context.Transactions.FindAsync(id);
        if (transaction == null) return false;

        _context.Transactions.Remove(transaction);
        await _context.SaveChangesAsync();
        
        await _cache.RemoveAsync(CacheKey);
        return true;
    }

    public async Task<bool> UpdateTransactionAmountAsync(Guid id, decimal newAmount)
    {
        var transaction = await _context.Transactions.FindAsync(id);
        if (transaction == null) return false;

        transaction.Amount = newAmount;
        await _context.SaveChangesAsync();

        await _cache.RemoveAsync(CacheKey); 
        await _notifier.NotifyAmountChangedAsync(transaction);
        return true;
    }

  private async Task ProcessTransactionAsync(Guid transactionId)
    {
        try 
        {
            await Task.Delay(3000); 
            
            using var scope = _scopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var notifier = scope.ServiceProvider.GetRequiredService<IClientNotifierService>();

            var transaction = await context.Transactions.FindAsync(transactionId);
            if (transaction == null) return;

            var random = new Random();
            transaction.Status = random.Next(0, 2) == 0 ? TransactionStatus.Completed : TransactionStatus.Failed;

            await context.SaveChangesAsync();
            await _cache.RemoveAsync(CacheKey); 
            await notifier.NotifyTransactionUpdatedAsync(transaction);
        }
        catch (Exception ex)
        {
            try 
            {
                using var errorScope = _scopeFactory.CreateScope();
                var errorContext = errorScope.ServiceProvider.GetRequiredService<AppDbContext>();
                var errorNotifier = errorScope.ServiceProvider.GetRequiredService<IClientNotifierService>();

                var transaction = await errorContext.Transactions.FindAsync(transactionId);
                if (transaction != null)
                {
                    transaction.Status = TransactionStatus.Failed;
                    await errorContext.SaveChangesAsync();
                    await errorNotifier.NotifyTransactionUpdatedAsync(transaction);
                }
            }
            catch (Exception innerEx)
            { 
                _logger.LogCritical(innerEx, "Critical failure in background processing for transaction {Id}. Original error: {Msg}", transactionId, ex.Message);
            }
        }
    }

}