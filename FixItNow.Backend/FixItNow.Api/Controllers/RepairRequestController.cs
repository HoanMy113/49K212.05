using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FixItNow.Api.Data;
using FixItNow.Api.Models;

namespace FixItNow.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class RepairRequestsController : ControllerBase
{
    private readonly AppDbContext _context;

    public RepairRequestsController(AppDbContext context)
    {
        _context = context;
    }

    // ====== US_06 & US_07: Chấp nhận yêu cầu và Xác nhận thợ đầu tiên ======
    // Endpoint: PUT /api/repairrequests/{id}/accept?workerId={workerId}
    [HttpPut("{id}/accept")]
    public async Task<IActionResult> AcceptRequest(int id, [FromQuery] int? workerId)
    {
        var request = await _context.RepairRequests.FindAsync(id);
        if (request == null)
            return NotFound(new { message = "Không tìm thấy yêu cầu" });

        // 🛑 BƯỚC 1: XỬ LÝ RACE CONDITION (Tính năng thợ đầu tiên)
        // Nếu ông thợ thứ 2 gọi API này, Status lúc này đã bị ông thứ 1 đổi thành 'Confirmed'
        // -> Hệ thống chặn lại và văng lỗi.
        if (request.Status != RequestStatus.Pending)
            return BadRequest(new { message = "Yêu cầu này đã được xử lý bởi thợ khác" });

        // 🟢 BƯỚC 2: GÁN QUYỀN CHO THỢ THỨ 1
        // Nếu là đơn Broadcast hoặc yêu cầu Multi-select, tiến hành gán thợ nhận vào đơn sửa chữa
        if ((request.IsBroadcast || !string.IsNullOrEmpty(request.TargetWorkerIds)) && workerId.HasValue)
        {
            var worker = await _context.WorkerProfiles.FindAsync(workerId.Value);
            if (worker != null)
            {
                // Kiểm tra lại xem thợ này có nằm trong tệp thợ được nhắm đến không (Nếu không phải Broadcast)
                if (!request.IsBroadcast && !string.IsNullOrEmpty(request.TargetWorkerIds) && !request.TargetWorkerIds.Contains($",{workerId.Value},"))
                {
                    return BadRequest(new { message = "Bạn không có quyền nhận yêu cầu này" });
                }

                // Chốt thợ
                request.WorkerId = workerId.Value;
                request.WorkerName = worker.NameOrStore;
            }
        }

        // Cập nhật trạng thái Database thành Đã xác nhận (Confirmed)
        request.Status = RequestStatus.Confirmed;
        request.UpdatedAt = DateTime.Now;

        // 🔔 BƯỚC 3: US_08 - GỬI THÔNG BÁO CHO KHÁCH HÀNG
        var notification = new Notification
        {
            UserPhone = request.CustomerPhone,
            Title = "✅ Yêu cầu đã được chấp nhận",
            Message = $"Thợ {request.WorkerName} đã chấp nhận yêu cầu \"{request.Category}\"",
            Type = "accepted",
            RelatedRequestId = request.Id,
            CreatedAt = DateTime.Now
        };
        _context.Notifications.Add(notification);

        // Lưu toàn bộ phiên làm việc xuống Database
        await _context.SaveChangesAsync();

        return Ok(new { message = "Đã chấp nhận yêu cầu", request });
    }
}