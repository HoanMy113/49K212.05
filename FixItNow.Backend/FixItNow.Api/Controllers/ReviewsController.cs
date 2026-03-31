using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FixItNow.Api.Data;
using FixItNow.Api.Models;

namespace FixItNow.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ReviewsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReviewsController(AppDbContext context)
    {
        _context = context;
    }

    // GET /api/Reviews/worker/{workerId}
    [HttpGet("worker/{workerId}")]
    public async Task<IActionResult> GetWorkerReviews(int workerId)
    {
        // Lấy danh sách đánh giá của thợ, sắp xếp mới nhất lên đầu
        var reviews = await _context.Reviews
            .Where(r => r.WorkerId == workerId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        // Tính toán điểm sao trung bình
        var averageRating = reviews.Any() ? reviews.Average(r => r.Rating) : 0;

        // Cấu trúc Data JSON trả về cho Frontend
        return Ok(new
        {
            averageRating = averageRating,
            totalReviews = reviews.Count,
            reviews = reviews
        });
    }
}