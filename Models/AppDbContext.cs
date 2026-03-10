using Microsoft.EntityFrameworkCore;


namespace FixItNow.Models
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Worker> Workers { get; set; }
    }
}
