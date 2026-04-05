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

    [HttpPost("login")]
public async Task<IActionResult> Login([FromBody] LoginDto dto)
{
    // Tìm người dùng theo số điện thoại
    var user = await _context.Users.FirstOrDefaultAsync(u => u.Phone == dto.Phone);
    
    // Kiểm tra mật khẩu (đang để dạng clear text theo cấu hình hiện tại)
    if (user == null || user.PasswordHash != dto.Password)
        return Unauthorized("Số điện thoại hoặc mật khẩu không chính xác.");

    // Kiểm tra vai trò (Khách hàng hoặc Thợ)
    var reqRole = dto.Role?.ToLower() == "worker" || dto.Role?.ToLower() == "repairman" ? UserRole.Worker : UserRole.Customer;
    if (user.Role != reqRole)
        return Unauthorized($"Tài khoản này được đăng ký dưới tư cách {(user.Role == UserRole.Worker ? "Thợ sửa chữa" : "Khách hàng")}. Vui lòng chọn đúng vai trò.");

    // Trả về thông tin người dùng
    return Ok(new 
    { 
        fullName = user.FullName, 
        phone = user.Phone, 
        role = user.Role.ToString(),
        workerProfileId = user.WorkerProfileId,
        avatarUrl = user.AvatarUrl
    });
}
}