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
        // ====== BẢO MẬT: Validate Rating phải nằm trong khoảng 1–5 ======
        if (dto.Rating < 1 || dto.Rating > 5)
            return BadRequest(new { message = "Điểm đánh giá phải từ 1 đến 5 sao." });

        // ====== BẢO MẬT: Chỉ cho đánh giá đơn đã Hoàn thành ======
        var request = await _context.RepairRequests.FindAsync(dto.RequestId);
        if (request == null)
            return NotFound(new { message = "Không tìm thấy yêu cầu." });
        if (request.Status != Models.RequestStatus.Completed)
            return BadRequest(new { message = "Chỉ có thể đánh giá yêu cầu đã hoàn thành." });

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

    // Kiểm tra đã đánh giá cho requestId chưa
    [HttpGet("request/{requestId}")]
    public async Task<IActionResult> GetReviewByRequest(int requestId)
    {
        var review = await _context.Reviews
            .FirstOrDefaultAsync(r => r.RequestId == requestId);
        if (review == null)
            return NotFound(new { message = "Chưa có đánh giá cho đơn này." });
        return Ok(review);
    }

    [HttpGet("worker/{workerId}")]
    public async Task<IActionResult> GetWorkerReviews(int workerId)
    {
        var reviews = await _context.Reviews
            .Where(r => r.WorkerId == workerId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        var averageRating = reviews.Any() ? reviews.Average(r => r.Rating) : 0;

        return Ok(new 
        { 
            averageRating = averageRating,
            totalReviews = reviews.Count,
            reviews = reviews
        });
    }
}
