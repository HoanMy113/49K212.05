namespace FixItNow.Api.DTOs;

public class UpdateProfileRequest
{
    public string NameOrStore { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string> Services { get; set; } = new List<string>();
}
