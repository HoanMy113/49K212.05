namespace FixItNow.Api.Models;

public class WorkerProfile
{
    public int Id { get; set; }
    public string NameOrStore { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    
    // Services like "Sửa điện", "Sửa nước", ...
    public List<string> Services { get; set; } = new List<string>();

    public string Location { get; set; } = string.Empty;
    public double Rating { get; set; } = 0.0;
}
