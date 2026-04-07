[HttpPut("{phone}")]
public async Task<IActionResult> UpdateProfile(string phone, [FromBody] UserUpdateDto dto)
{
	var user = await _context.Users.FirstOrDefaultAsync(u => u.Phone == phone);
	if (user == null) return NotFound("Người dùng không tồn tại.");

	user.FullName = dto.FullName;
	user.AvatarUrl = dto.AvatarUrl;

	// Đồng bộ cập nhật thông tin nếu người dùng cũng là thợ
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