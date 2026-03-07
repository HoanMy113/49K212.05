using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FixItNow.Data;
using FixItNow.DTOs;
using System.Text.Json;

namespace FixItNow.Controllers
{
    // Định tuyến (Route): URL để gọi API này sẽ bắt đầu bằng /api/repairprofiles
    [Route("api/[controller]")]
    [ApiController]
    public class RepairProfilesController : ControllerBase
    {
        private readonly AppDbContext _context;

        // Dependency Injection: Tiêm AppDbContext vào để Controller có thể làm việc với Database
        public RepairProfilesController(AppDbContext context)
        {
            _context = context;
        }

        // Endpoint: GET /api/repairprofiles/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<RepairProfileDto>> GetProfile(int id)
        {
            // 1. Dùng Entity Framework Core để tìm thợ sửa trong Database theo Id
            var profile = await _context.RepairProfiles.FindAsync(id);

            // 2. Nếu không tìm thấy (Id không tồn tại), trả về lỗi 404 Not Found
            if (profile == null)
            {
                return NotFound(new { message = $"Không tìm thấy thợ sửa có ID = {id}" });
            }

            // 3. Nếu tìm thấy, chuyển đổi dữ liệu từ Model sang DTO
            var profileDto = new RepairProfileDto
            {
                Id = profile.Id,
                Name = profile.Name,
                Phone = profile.Phone,
                Address = profile.Address,
                Description = profile.Description,
                Rating = profile.Rating ,
                //TotalReviews = profile.TotalReviews ,
                
                // QUAN TRỌNG: Dùng JsonSerializer để biến chuỗi JSON trong SQL thành mảng List<string> trong C#
                // Dùng ?? "[]" để phòng hờ trường hợp dữ liệu trong DB bị NULL thì không bị lỗi crash app
                Skills = JsonSerializer.Deserialize<List<string>>(profile.SkillsJson ?? "[]")!,
                ServiceAreas = JsonSerializer.Deserialize<List<string>>(profile.ServiceAreasJson ?? "[]")!,
                Services = JsonSerializer.Deserialize<List<string>>(profile.ServicesJson ?? "[]")!
            };

            // 4. Trả về kết quả JSON với HTTP Status 200 OK
            return Ok(profileDto);
        }
    }
}