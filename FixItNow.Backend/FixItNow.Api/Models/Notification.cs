namespace FixItNow.Api.Models;

public class Notification
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string UserPhone { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // e.g., "new_request", "broadcast_request", "accepted"
    public int? RelatedRequestId { get; set; }
    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}