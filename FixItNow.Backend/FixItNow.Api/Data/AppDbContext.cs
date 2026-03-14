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
    public DbSet<Review> Reviews { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<WorkerProfile>()
            .Property(e => e.Services)
            .HasConversion(
                v => string.Join(',', v),
                v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList());

        // SEED DATA: 5 Worker Profiles
        modelBuilder.Entity<WorkerProfile>().HasData(
            new WorkerProfile { Id = 101, NameOrStore = "Thợ Điện Nguyễn Văn A", PhoneNumber = "0900000001", Address = "123 Lê Lợi, Quận 1", Location = "Hồ Chí Minh", Services = new List<string> { "Sửa điện", "Máy lạnh" }, Rating = 4.8, Description = "Sửa điện nhanh chóng, an toàn" },
            new WorkerProfile { Id = 102, NameOrStore = "Trần Thị B Dịch Vụ Nước", PhoneNumber = "0900000002", Address = "456 Trần Hưng Đạo, Hoàn Kiếm", Location = "Hà Nội", Services = new List<string> { "Sửa nước" }, Rating = 4.5, Description = "Chuyên sửa ống nước, vòi sen" },
            new WorkerProfile { Id = 103, NameOrStore = "Cửa hàng Sửa Chữa C", PhoneNumber = "0900000003", Address = "789 Nguyễn Văn Linh, Hải Châu", Location = "Đà Nẵng", Services = new List<string> { "Điện gia dụng", "Máy lạnh" }, Rating = 5.0, Description = "Thay lốc tủ lạnh, kiểm tra tivi" },
            new WorkerProfile { Id = 104, NameOrStore = "Lê Văn D - Đa năng", PhoneNumber = "0900000004", Address = "101 Lý Tự Trọng, Ninh Kiều", Location = "Cần Thơ", Services = new List<string> { "Sửa điện", "Sửa nước", "Điện gia dụng" }, Rating = 4.2, Description = "Nhận sửa mọi thứ trong nhà" },
            new WorkerProfile { Id = 105, NameOrStore = "Phạm Văn E Mộc", PhoneNumber = "0900000005", Address = "202 Đồng Khởi, Biên Hòa", Location = "Đồng Nai", Services = new List<string> { "Khác" }, Rating = 4.7, Description = "Chuyên sửa cửa gỗ, tủ gỗ" }
        );

        // SEED DATA: 5 Workers Users (Links to above profiles)
        modelBuilder.Entity<User>().HasData(
            new User { Id = 101, FullName = "Nguyễn Văn A", Phone = "0900000001", PasswordHash = "123456", Role = UserRole.Worker, WorkerProfileId = 101, CreatedAt = new DateTime(2025, 1, 1) },
            new User { Id = 102, FullName = "Trần Thị B", Phone = "0900000002", PasswordHash = "123456", Role = UserRole.Worker, WorkerProfileId = 102, CreatedAt = new DateTime(2025, 1, 2) },
            new User { Id = 103, FullName = "Phạm C", Phone = "0900000003", PasswordHash = "123456", Role = UserRole.Worker, WorkerProfileId = 103, CreatedAt = new DateTime(2025, 1, 3) },
            new User { Id = 104, FullName = "Lê Văn D", Phone = "0900000004", PasswordHash = "123456", Role = UserRole.Worker, WorkerProfileId = 104, CreatedAt = new DateTime(2025, 1, 4) },
            new User { Id = 105, FullName = "Phạm Văn E", Phone = "0900000005", PasswordHash = "123456", Role = UserRole.Worker, WorkerProfileId = 105, CreatedAt = new DateTime(2025, 1, 5) }
        );

        // SEED DATA: 5 Customers Users
        modelBuilder.Entity<User>().HasData(
            new User { Id = 106, FullName = "Khách Hàng Một", Phone = "0900000006", PasswordHash = "123456", Role = UserRole.Customer, CreatedAt = new DateTime(2025, 1, 6) },
            new User { Id = 107, FullName = "Khách Hàng Hai", Phone = "0900000007", PasswordHash = "123456", Role = UserRole.Customer, CreatedAt = new DateTime(2025, 1, 7) },
            new User { Id = 108, FullName = "Khách Hàng Ba", Phone = "0900000008", PasswordHash = "123456", Role = UserRole.Customer, CreatedAt = new DateTime(2025, 1, 8) },
            new User { Id = 109, FullName = "Khách Hàng Bốn", Phone = "0900000009", PasswordHash = "123456", Role = UserRole.Customer, CreatedAt = new DateTime(2025, 1, 9) },
            new User { Id = 110, FullName = "Khách Hàng Năm", Phone = "0900000010", PasswordHash = "123456", Role = UserRole.Customer, CreatedAt = new DateTime(2025, 1, 10) }
        );
    }
}
