using Microsoft.EntityFrameworkCore;
using FixItNow.Models;

namespace FixItNow.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // Khai báo tập hợp các bản ghi trong bảng
        public DbSet<RepairProfile> RepairProfiles { get; set; }
    }
}