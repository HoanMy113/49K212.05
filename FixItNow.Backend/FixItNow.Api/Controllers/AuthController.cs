[HttpPost("register")]
public async Task<IActionResult> Register([FromBody] RegisterDto dto)
{
    // 1. Kiểm tra SĐT đã tồn tại chưa
    if (await _context.Users.AnyAsync(u => u.Phone == dto.Phone))
        return BadRequest("Số điện thoại đã được đăng ký.");

    // 2. Xác định vai trò
    var role = UserRole.Worker; // Mặc định xử lý cho thợ

    var user = new User
    {
        FullName = dto.FullName,
        Phone = dto.Phone,
        PasswordHash = dto.Password,
        Role = role
    };

    // 3. NẾU LÀ THỢ: Tạo thêm hồ sơ năng lực (WorkerProfile)
    if (role == UserRole.Worker)
    {
        var profile = new WorkerProfile
        {
            NameOrStore = dto.FullName,
            PhoneNumber = dto.Phone,
            Address = dto.Address ?? string.Empty,
            // Lưu kỹ năng vào danh sách Services
            Services = new List<string> { dto.Category ?? "General" },
            IsActive = true
        };

        _context.WorkerProfiles.Add(profile);
        await _context.SaveChangesAsync(); // Lưu để lấy ProfileId tự sinh

        // Liên kết tài khoản User với hồ sơ thợ vừa tạo
        user.WorkerProfileId = profile.Id;
    }

    // 4. Lưu tài khoản người dùng
    _context.Users.Add(user);
    await _context.SaveChangesAsync();

    return Ok(new { message = "Đăng ký thợ sửa chữa thành công" });
}