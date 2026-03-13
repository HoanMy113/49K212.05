namespace FixItNow.Api.Models;

public class Notification
{
    public int Id { get; set; }
    public string UserPhone { get; set; } = string.Empty; // Use Phone to link instead of ID for ease of use with restored logic
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // e.g., "new_request", "accepted", "status_update"
    public int? RelatedRequestId { get; set; }
    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}
