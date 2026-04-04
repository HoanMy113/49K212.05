public class RegisterDto {
    public string FullName { get; set; } = "";
    public string Phone { get; set; } = "";
    public string Password { get; set; } = "";
    public string Role { get; set; } = "Customer";
    public string? Category { get; set; }
    public string? Address { get; set; }
}