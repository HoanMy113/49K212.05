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


    // ====== US_06: Từ chối yêu cầu ======
    [HttpPut("{id}/reject")]
    public async Task<IActionResult> RejectRequest(int id, [FromQuery] int? workerId)
    {
        var request = await _context.RepairRequests.FindAsync(id);
        if (request == null)
            return NotFound(new { message = "Không tìm thấy yêu cầu" });

        if (request.Status != RequestStatus.Pending)
            return BadRequest(new { message = "Chỉ có thể từ chối yêu cầu đang chờ" });

        // Logic xử lý từ chối cho Đơn Multi-select hoặc Broadcast
        if (request.IsBroadcast || !string.IsNullOrEmpty(request.TargetWorkerIds))
        {
            if (workerId.HasValue && !string.IsNullOrEmpty(request.TargetWorkerIds))
            {
                // Xóa thợ khỏi danh sách mục tiêu
                request.TargetWorkerIds = request.TargetWorkerIds.Replace($",{workerId.Value},", ",");
                
                // Nếu không còn thợ nào trong danh sách mục tiêu -> Hủy luôn đơn
                if (request.TargetWorkerIds == "," || string.IsNullOrWhiteSpace(request.TargetWorkerIds.Replace(",", "")))
                {
                    request.Status = RequestStatus.Cancelled;
                    request.UpdatedAt = DateTime.Now;
                    
                    var notif = new Notification
                    {
                        UserPhone = request.CustomerPhone,
                        Title = "❌ Yêu cầu bị từ chối",
                        Message = $"Tất cả thợ được chọn đã từ chối yêu cầu \"{request.Category}\"",
                        Type = "rejected",
                        RelatedRequestId = request.Id,
                        CreatedAt = DateTime.Now
                    };
                    _context.Notifications.Add(notif);
                }
            }
            // Với Broadcast thực sự (không có danh sách), lưu lại ID thợ để ẩn đơn
            else if (request.IsBroadcast && workerId.HasValue)
            {
                if (string.IsNullOrEmpty(request.RejectedWorkerIds))
                {
                    request.RejectedWorkerIds = $",{workerId.Value},";
                }
                else if (!request.RejectedWorkerIds.Contains($",{workerId.Value},"))
                {
                    request.RejectedWorkerIds += $"{workerId.Value},";
                }
            }
        }
        else
        {
            // Đơn 1-kèm-1 (Single worker)
            request.Status = RequestStatus.Cancelled;
            request.UpdatedAt = DateTime.Now;

            // US_08: Thông báo cho khách hàng
            var notification = new Notification
            {
                UserPhone = request.CustomerPhone,
                Title = "❌ Yêu cầu bị từ chối",
                Message = $"Thợ {request.WorkerName} đã từ chối yêu cầu \"{request.Category}\"",
                Type = "rejected",
                RelatedRequestId = request.Id,
                CreatedAt = DateTime.Now
            };
            _context.Notifications.Add(notification);
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Đã từ chối yêu cầu", request });
    }

    // ====== US_13: Hủy yêu cầu (Khách) ======
    [HttpPut("{id}/cancel")]
    public async Task<IActionResult> CancelRequest(int id)
    {
        var request = await _context.RepairRequests.FindAsync(id);
        if (request == null)
            return NotFound(new { message = "Không tìm thấy yêu cầu" });

        if (request.Status != RequestStatus.Pending)
            return BadRequest(new { message = "Chỉ có thể hủy yêu cầu đang ở trạng thái 'Đang chờ'" });

        request.Status = RequestStatus.Cancelled;
        request.UpdatedAt = DateTime.Now;

        // Thông báo cho thợ (nếu đã có thợ nhận hoặc đơn broadcast/multi)
        if (request.WorkerId != null)
        {
            var worker = await _context.WorkerProfiles.FindAsync(request.WorkerId);
            var workerUser = await _context.Users.FirstOrDefaultAsync(u => u.WorkerProfileId == request.WorkerId);
            string targetPhone = workerUser?.Phone ?? worker?.PhoneNumber ?? "";
            if (!string.IsNullOrEmpty(targetPhone))
            {
                _context.Notifications.Add(new Notification
                {
                    UserPhone = targetPhone,
                    Title = "🚫 Khách đã huỷ yêu cầu",
                    Message = $"{request.CustomerName} đã huỷ yêu cầu \"{request.Category}\" tại {request.Address}",
                    Type = "customer_cancelled",
                    RelatedRequestId = request.Id,
                    CreatedAt = DateTime.Now
                });
            }
        }

        await _context.SaveChangesAsync();

        return Ok(new { message = "Đã hủy yêu cầu thành công", request });
    }

    // ====== US_14: Hoàn thành yêu cầu (Thợ) ======
    [HttpPut("{id}/complete")]
    public async Task<IActionResult> CompleteRequest(int id)
    {
        var request = await _context.RepairRequests.FindAsync(id);
        if (request == null)
            return NotFound(new { message = "Không tìm thấy yêu cầu" });

        if (request.Status != RequestStatus.Confirmed)
            return BadRequest(new { message = "Chỉ có thể hoàn thành yêu cầu đã được xác nhận" });

        request.Status = RequestStatus.Completed;
        request.UpdatedAt = DateTime.Now;

        // US_08: Thông báo cho khách hàng
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

    // ====== US_12: Cập nhật trạng thái công việc (Thợ) ======
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusDto dto)
    {
        var request = await _context.RepairRequests.FindAsync(id);
        if (request == null)
            return NotFound(new { message = "Không tìm thấy yêu cầu" });

        if (request.Status == RequestStatus.Cancelled)
            return BadRequest(new { message = "Không thể cập nhật yêu cầu đã hủy" });

        request.Status = (RequestStatus)dto.Status;
        request.UpdatedAt = DateTime.Now;

        // Thông báo cho khách hàng
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

}

