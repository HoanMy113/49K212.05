using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FixItNow.Api.Data;
using FixItNow.Api.Models;
using FixItNow.Api.DTOs;

namespace FixItNow.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;

    public AuthController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Phone) || dto.Phone.Length != 10 || !dto.Phone.All(char.IsDigit))
            return BadRequest("Số điện thoại phải bao gồm đúng 10 chữ số.");

        if (await _context.Users.AnyAsync(u => u.Phone == dto.Phone))
            return BadRequest("Số điện thoại đã được đăng ký.");

        var roleStr = dto.Role.ToLower();
        var role = (roleStr == "worker" || roleStr == "repairman") ? UserRole.Worker : UserRole.Customer;
        
        var user = new User
        {
            FullName = dto.FullName,
            Phone = dto.Phone,
            PasswordHash = dto.Password, // Simply storing clear text for now as per plan context
            Role = role,
            CreatedAt = DateTime.Now
        };

        if (role == UserRole.Worker)
        {
            var profile = new WorkerProfile
            {
                NameOrStore = dto.FullName,
                PhoneNumber = dto.Phone,
                Address = dto.Address ?? string.Empty,
                Location = dto.Location ?? string.Empty,
                Services = new List<string> { dto.Category ?? "General" }
            };
            _context.WorkerProfiles.Add(profile);
            await _context.SaveChangesAsync();
            user.WorkerProfileId = profile.Id;
        }

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Đăng ký thành công" });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Phone == dto.Phone);
        
        if (user == null || user.PasswordHash != dto.Password)
            return Unauthorized("Số điện thoại hoặc mật khẩu không chính xác.");

        // Validate role explicitly
        var reqRole = dto.Role?.ToLower() == "worker" || dto.Role?.ToLower() == "repairman" ? UserRole.Worker : UserRole.Customer;
        if (user.Role != reqRole)
            return Unauthorized($"Tài khoản này được đăng ký dưới tư cách {(user.Role == UserRole.Worker ? "Thợ sửa chữa" : "Khách hàng")}. Vui lòng chọn đúng vai trò.");

        return Ok(new 
        { 
            fullName = user.FullName, 
            phone = user.Phone, 
            role = user.Role.ToString(),
            workerProfileId = user.WorkerProfileId
        });
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        // Extract phone number from User Claim or Identity in a real app.
        // For our simplified app, we need the phone number to identify the user. 
        // We'll require it to be passed in a header or we can modify the DTO.
        // Assuming we pass phone in header for simplicity, or we add Phone to ChangePasswordDto.
        // Let's modify the endpoint to expect the phone number in the request headers.
        
        var requestPhone = Request.Headers["X-User-Phone"].FirstOrDefault();
        if (string.IsNullOrEmpty(requestPhone))
            return BadRequest("Thiếu thông tin số điện thoại người dùng.");

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Phone == requestPhone);
        if (user == null)
            return NotFound("Người dùng không tồn tại.");

        if (user.PasswordHash != dto.OldPassword)
            return BadRequest("Mật khẩu hiện tại không chính xác.");

        if (string.IsNullOrWhiteSpace(dto.NewPassword) || dto.NewPassword.Length < 6)
            return BadRequest("Mật khẩu mới phải có ít nhất 6 ký tự.");

        user.PasswordHash = dto.NewPassword;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Đổi mật khẩu thành công." });
    }
}
