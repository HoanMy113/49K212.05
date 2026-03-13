using Microsoft.EntityFrameworkCore;
using FixItNow.Api.Models;

namespace FixItNow.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<WorkerProfile> WorkerProfiles { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<RepairRequest> RepairRequests { get; set; }
}
