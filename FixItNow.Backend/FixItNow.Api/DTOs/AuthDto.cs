namespace FixItNow.Api.DTOs;

public class RegisterDto
{
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Role { get; set; } = "Customer"; // Customer or Worker
    public string? Category { get; set; } // for workers
    
    // 3-tier location for workers
    public string? Address { get; set; }
    public string? Location { get; set; }
}

public class LoginDto
{
    public string Phone { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Role { get; set; } = "Customer"; // Verify requested role against actual role
}

public class UserUpdateDto
{
    public string FullName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
}

public class ChangePasswordDto
{
    public string OldPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

public class ReviewDto
{
    public int RequestId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public int WorkerId { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
}
