using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FixItNow.Api.Data;
using FixItNow.Api.Models;

namespace FixItNow.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class NotificationsController : ControllerBase
{
    private readonly AppDbContext _context;

    public NotificationsController(AppDbContext context)
    {
        _context = context;
    }

    // Lấy toàn bộ thông báo của người dùng thông qua Số điện thoại (Sắp xếp mới nhất)
    // Endpoint: GET /api/notifications/user/{phone}
    [HttpGet("user/{phone}")]
    public async Task<IActionResult> GetUserNotifications(string phone)
    {
        var notifications = await _context.Notifications
            .Where(n => n.UserPhone == phone)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();

        return Ok(notifications);
    }

    // Đánh dấu một thông báo là "Đã đọc", tắt hiệu ứng chưa xem
    // Endpoint: PATCH /api/notifications/{id}/read
    [HttpPatch("{id}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var notification = await _context.Notifications.FindAsync(id);
        if (notification == null) return NotFound();

        notification.IsRead = true;
        await _context.SaveChangesAsync();

        return NoContent();
    }
}