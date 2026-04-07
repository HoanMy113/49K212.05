using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FixItNow.Api.Data;
using FixItNow.Api.Models;
using FixItNow.Api.DTOs;

namespace FixItNow.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("{phone}")]
    public async Task<IActionResult> GetUser(string phone)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Phone == phone);
        if (user == null) return NotFound("Người dùng không tồn tại.");

        return Ok(new 
        { 
            user.FullName, 
            user.Phone, 
            user.Role,
            user.AvatarUrl,
            user.WorkerProfileId
        });
    }

    [HttpPut("{phone}")]
    public async Task<IActionResult> UpdateProfile(string phone, [FromBody] UserUpdateDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Phone == phone);
        if (user == null) return NotFound("Người dùng không tồn tại.");

        user.FullName = dto.FullName;
        user.AvatarUrl = dto.AvatarUrl;
        
        // Also update WorkerProfile name and avatar if applicable
        if (user.WorkerProfileId.HasValue)
        {
            var profile = await _context.WorkerProfiles.FindAsync(user.WorkerProfileId.Value);
            if (profile != null) 
            {
                profile.NameOrStore = dto.FullName;
                profile.AvatarUrl = dto.AvatarUrl;
            }
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Cập nhật thành công" });
    }

    [HttpPut("{phone}/password")]
    public async Task<IActionResult> ChangePassword(string phone, [FromBody] ChangePasswordDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Phone == phone);
        if (user == null) return NotFound("Người dùng không tồn tại.");

        if (user.PasswordHash != dto.OldPassword)
            return BadRequest("Mật khẩu cũ không chính xác.");

        user.PasswordHash = dto.NewPassword;
        await _context.SaveChangesAsync();
        return Ok(new { message = "Đổi mật khẩu thành công" });
    }
}
