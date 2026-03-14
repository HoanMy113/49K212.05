namespace FixItNow.Api.Models;

public enum UserRole
{
    Customer = 0,
    Worker = 1,
    Admin = 2
}

public class User
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public int? WorkerProfileId { get; set; } // Link to WorkerProfile if Role is Worker
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}
