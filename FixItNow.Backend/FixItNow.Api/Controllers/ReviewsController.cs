using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FixItNow.Api.Data;
using FixItNow.Api.Models;
using FixItNow.Api.DTOs;

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

    [HttpPost]
    public async Task<IActionResult> AddReview([FromBody] ReviewDto dto)
    {
        // Kiểm tra đã đánh giá cho đơn này chưa
        var existingReview = await _context.Reviews
            .FirstOrDefaultAsync(r => r.RequestId == dto.RequestId);
        if (existingReview != null)
            return BadRequest(new { message = "Bạn đã đánh giá đơn này rồi." });

        var review = new Review
        {
            RequestId = dto.RequestId,
            CustomerName = dto.CustomerName,
            WorkerId = dto.WorkerId,
            Rating = dto.Rating,
            Comment = dto.Comment,
            CreatedAt = DateTime.Now
        };

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();

        // Update Worker average rating
        var workerReviews = await _context.Reviews.Where(r => r.WorkerId == dto.WorkerId).ToListAsync();
        var avg = workerReviews.Average(r => r.Rating);

        var profile = await _context.WorkerProfiles.FindAsync(dto.WorkerId);
        if (profile != null)
        {
            profile.Rating = (float)avg;
        }

        await _context.SaveChangesAsync();

        return Ok(review);
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
