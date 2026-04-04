[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    public AuthController(AppDbContext context) { _context = context; }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (await _context.Users.AnyAsync(u => u.Phone == dto.Phone))
            return BadRequest("Số điện thoại đã được đăng ký.");

        var role = (dto.Role.ToLower() == "repairman") ? UserRole.Worker : UserRole.Customer;
        var user = new User {
            FullName = dto.FullName,
            Phone = dto.Phone,
            PasswordHash = dto.Password, // Lưu ý: Nên mã hóa mật khẩu trong thực tế
            Role = role
        };

        if (role == UserRole.Worker) {
            var profile = new WorkerProfile {
                NameOrStore = dto.FullName,
                PhoneNumber = dto.Phone,
                Address = dto.Address ?? "",
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
}