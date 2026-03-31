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
    // ====== US_09: Xem danh sách yêu cầu đã tạo (Khách) ======
    [HttpGet]
    public async Task<IActionResult> GetRequests([FromQuery] string? phone)
    {
        // Tạo câu Query ban đầu
        var query = _context.RepairRequests.AsQueryable();

        // Lọc theo số điện thoại của người dùng nếu có truyền lên
        if (!string.IsNullOrEmpty(phone))
            query = query.Where(r => r.CustomerPhone == phone);

        // Trả về danh sách, sắp xếp theo thời gian mới nhất
        var requests = await query
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return Ok(requests);
    }
    // ====== US_12: CÁCH 1 - Cập nhật trạng thái công việc chung (Tùy biến) ======
    // Nhận Payload JSON chứa thông tin Status mã số bao nhiêu. Dùng cho việc đa trạng thái.
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusDto dto)
    {
        var request = await _context.RepairRequests.FindAsync(id);
        if (request == null)
            return NotFound(new { message = "Không tìm thấy yêu cầu" });

        // Không cho phép vọc vạch sửa đơn đã Hủy
        if (request.Status == RequestStatus.Cancelled)
            return BadRequest(new { message = "Không thể cập nhật yêu cầu đã hủy" });

        request.Status = (RequestStatus)dto.Status; // Cast từ số sang Enum
        request.UpdatedAt = DateTime.Now;

        // Bắn Push Noti về cho Khách hàng biết là thợ vừa bấm điện thoại đổi trạng thái
        var statusLabel = request.Status == RequestStatus.Completed ? "Hoàn thành" : "Đang xử lý";
        var notification = new Notification
        {
            UserPhone = request.CustomerPhone,
            Title = $"🔄 Cập nhật trạng thái",
            Message = $"Yêu cầu \"{request.Category}\" đã được cập nhật: {statusLabel}",
            Type = "status_update",
            RelatedRequestId = request.Id,
            CreatedAt = DateTime.Now
        };
        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Đã cập nhật trạng thái", request });
    }

    // ====== US_12 & US_14: CÁCH 2 - Báo cáo Hoàn Thành Chuyên Biệt ======
    // (Được sử dụng nhiều trên UI hiện tại)
    [HttpPut("{id}/complete")]
    public async Task<IActionResult> CompleteRequest(int id)
    {
        var request = await _context.RepairRequests.FindAsync(id);
        if (request == null) return NotFound(new { message = "Không tìm thấy yêu cầu" });

        // Phải là đơn đã chốt thợ nhận (Confirmed) thì mới được bấm Xong
        if (request.Status != RequestStatus.Confirmed)
            return BadRequest(new { message = "Chỉ có thể hoàn thành yêu cầu đã được xác nhận" });

        request.Status = RequestStatus.Completed; // Chuyển chốt mã quy ước
        request.UpdatedAt = DateTime.Now;

        // Bắn Push Noti nhắc khách hàng chuẩn bị Vào App đánh giá sao cho thợ
        var notification = new Notification
        {
            UserPhone = request.CustomerPhone,
            Title = "✅ Yêu cầu đã hoàn thành",
            Message = $"Thợ {request.WorkerName} đã hoàn thành yêu cầu \"{request.Category}\". Hãy để lại đánh giá nhé!",
            Type = "completed",
            RelatedRequestId = request.Id,
            CreatedAt = DateTime.Now
        };
        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Đã hoàn thành yêu cầu", request });
    }
    }