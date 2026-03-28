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

    // ====== US_14: Gửi bài Đánh giá (Customer) ======
    // Endpoint: POST /api/reviews
    [HttpPost]
    public async Task<IActionResult> AddReview([FromBody] ReviewDto dto)
    {
        // 1. NGĂN CHẶN SPAM: Kiểm tra xem đơn này đã được đánh giá trước đó hay chưa?
        var existingReview = await _context.Reviews
            .FirstOrDefaultAsync(r => r.RequestId == dto.RequestId);
            
        if (existingReview != null)
            return BadRequest(new { message = "Bạn đã đánh giá đơn này rồi." });

        // 2. TẠO RECORD ĐÁNH GIÁ MỚI
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

        // 3. TÍNH LẠI ĐIỂM SỐ CHUYÊN GIA
        // Lấy tất cả bài review cũ của thợ này và tính lại trị số Sao trung bình cộng
        var workerReviews = await _context.Reviews.Where(r => r.WorkerId == dto.WorkerId).ToListAsync();
        var avg = workerReviews.Average(r => r.Rating);

        // Nạp số Sao trung bình vừa tính vào tận Hồ sơ của người thợ
        var profile = await _context.WorkerProfiles.FindAsync(dto.WorkerId);
        if (profile != null)
        {
            profile.Rating = (float)avg;
        }

        await _context.SaveChangesAsync();

        return Ok(review);
    }
}