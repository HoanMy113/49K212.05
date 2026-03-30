using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FixItNow.Api.Data;
using FixItNow.Api.Models;
using FixItNow.Api.DTOs;

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

    // ====== US_04: Tạo yêu cầu sửa chữa ======
    // Hỗ trợ 3 chế độ:
    //   1) WorkerId != null          → tạo 1 đơn cho 1 thợ cụ thể (cũ)
    //   2) WorkerIds != null/empty   → tạo N đơn cho N thợ đã chọn (multi-select)
    //   3) IsBroadcast = true        → tạo 1 đơn broadcast, ai nhận trước được
    [HttpPost]
    public async Task<IActionResult> CreateRequest([FromBody] CreateRepairRequestDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // ===== Chế độ 3: BROADCAST =====
        if (dto.IsBroadcast)
        {
            var request = new RepairRequest
            {
                CustomerName = dto.CustomerName,
                CustomerPhone = dto.CustomerPhone,
                Address = dto.Address,
                Category = dto.Category,
                Description = dto.Description,
                WorkerId = null,
                WorkerName = "Đang chờ thợ nhận...",
                IsBroadcast = true,
                Status = RequestStatus.Pending,
                CreatedAt = DateTime.Now
            };

            _context.RepairRequests.Add(request);
            await _context.SaveChangesAsync();

            // Gửi thông báo cho TẤT CẢ thợ có hồ sơ
            var allWorkerUsers = await _context.Users
                .Where(u => u.Role == UserRole.Worker && u.WorkerProfileId != null)
                .ToListAsync();

            foreach (var wu in allWorkerUsers)
            {
                _context.Notifications.Add(new Notification
                {
                    UserPhone = wu.Phone,
                    Title = "📢 Yêu cầu nhanh mới!",
                    Message = $"{dto.CustomerName} cần \"{dto.Category}\" tại {dto.Address}. Ai nhận trước được!",
                    Type = "broadcast_request",
                    RelatedRequestId = request.Id,
                    CreatedAt = DateTime.Now
                });
            }
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetRequest), new { id = request.Id }, request);
        }

        // ===== Chế độ 2: MULTI-SELECT (nhiều thợ - Grab style) =====
        if (dto.WorkerIds != null && dto.WorkerIds.Count > 0)
        {
            var targetIdsString = "," + string.Join(",", dto.WorkerIds) + ",";

            var request = new RepairRequest
            {
                CustomerName = dto.CustomerName,
                CustomerPhone = dto.CustomerPhone,
                Address = dto.Address,
                Category = dto.Category,
                Description = dto.Description,
                WorkerId = null,
                WorkerName = "Đang chờ thợ nhận...",
                TargetWorkerIds = targetIdsString,
                IsBroadcast = false,
                Status = RequestStatus.Pending,
                CreatedAt = DateTime.Now
            };

            _context.RepairRequests.Add(request);
            await _context.SaveChangesAsync();

            // Gửi thông báo cho từng thợ ưu tiên
            foreach (var wId in dto.WorkerIds)
            {
                var recipient = await _context.Users.FirstOrDefaultAsync(u => u.WorkerProfileId == wId);
                var workerProfile = await _context.WorkerProfiles.FindAsync(wId);
                string targetPhone = recipient?.Phone ?? workerProfile?.PhoneNumber ?? "";

                if (!string.IsNullOrEmpty(targetPhone))
                {
                    _context.Notifications.Add(new Notification
                    {
                        UserPhone = targetPhone,
                        Title = "📩 Yêu cầu chọn lọc mới",
                        Message = $"{dto.CustomerName} vừa chọn bạn cho dịch vụ \"{dto.Category}\". Ai nhận trước được!",
                        Type = "new_request",
                        RelatedRequestId = request.Id,
                        CreatedAt = DateTime.Now
                    });
                }
            }
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Đã gửi yêu cầu đến {dto.WorkerIds.Count} thợ", requests = new[] { request } });
        }

        // ===== Chế độ 1: SINGLE WORKER (cũ, backward-compatible) =====
        if (dto.WorkerId == null || dto.WorkerId == 0)
            return BadRequest(new { message = "Vui lòng chọn thợ hoặc bật chế độ yêu cầu nhanh" });

        var singleWorker = await _context.WorkerProfiles.FindAsync(dto.WorkerId);
        if (singleWorker == null)
            return BadRequest(new { message = "Thợ sửa không tồn tại" });

        var singleRequest = new RepairRequest
        {
            CustomerName = dto.CustomerName,
            CustomerPhone = dto.CustomerPhone,
            Address = dto.Address,
            Category = dto.Category,
            Description = dto.Description,
            WorkerId = dto.WorkerId,
            WorkerName = singleWorker.NameOrStore,
            IsBroadcast = false,
            Status = RequestStatus.Pending,
            CreatedAt = DateTime.Now
        };

        _context.RepairRequests.Add(singleRequest);
        await _context.SaveChangesAsync();

        // US_05: Tạo thông báo cho thợ
        var singleRecipient = await _context.Users.FirstOrDefaultAsync(u => u.WorkerProfileId == dto.WorkerId);
        string singleTargetPhone = singleRecipient?.Phone ?? singleWorker.PhoneNumber;

        var notification = new Notification
        {
            UserPhone = singleTargetPhone,
            Title = "📩 Yêu cầu sửa chữa mới",
            Message = $"{dto.CustomerName} gửi yêu cầu \"{dto.Category}\" tại {dto.Address}",
            Type = "new_request",
            RelatedRequestId = singleRequest.Id,
            CreatedAt = DateTime.Now
        };
        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetRequest), new { id = singleRequest.Id }, singleRequest);
    }

    // ====== US_09: Xem danh sách yêu cầu đã tạo (Khách) ======
    [HttpGet]
    public async Task<IActionResult> GetRequests([FromQuery] string? phone)
    {
        var query = _context.RepairRequests.AsQueryable();

        if (!string.IsNullOrEmpty(phone))
            query = query.Where(r => r.CustomerPhone == phone);

        var requests = await query
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return Ok(requests);
    }

    // ====== US_11: Xem trạng thái yêu cầu ======
    [HttpGet("{id}")]
    public async Task<IActionResult> GetRequest(int id)
    {
        var request = await _context.RepairRequests.FindAsync(id);
        if (request == null)
            return NotFound(new { message = "Không tìm thấy yêu cầu" });

        return Ok(request);
    }

    // ====== US_10: Xem danh sách yêu cầu đã nhận (Thợ) ======
    // Bao gồm cả đơn Broadcast (WorkerId==null, IsBroadcast==true, Status==Pending)
    [HttpGet("worker/{workerId}")]
    public async Task<IActionResult> GetWorkerRequests(int workerId)
    {
        var directRequests = await _context.RepairRequests
            .Where(r => r.WorkerId == workerId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        // Lấy thêm đơn Broadcast và đơn Multi-select (Grab style) đang chờ
        var stringId = $",{workerId},";
        var broadcastRequests = await _context.RepairRequests
            .Where(r => (r.IsBroadcast || (r.TargetWorkerIds != null && r.TargetWorkerIds.Contains(stringId)))
                        && r.Status == RequestStatus.Pending && r.WorkerId == null)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        var combined = directRequests
            .Concat(broadcastRequests)
            .DistinctBy(r => r.Id)
            .OrderByDescending(r => r.CreatedAt)
            .ToList();

        return Ok(combined);
    }

    // ====== US_06: Chấp nhận yêu cầu ======
    // ====== US_07: Hệ thống xác nhận thợ đầu tiên ======
    [HttpPut("{id}/accept")]
    public async Task<IActionResult> AcceptRequest(int id, [FromQuery] int? workerId)
    {
        var request = await _context.RepairRequests.FindAsync(id);
        if (request == null)
            return NotFound(new { message = "Không tìm thấy yêu cầu" });

        // US_07: Chỉ thợ đầu tiên chấp nhận mới được xác nhận (Race condition safe)
        if (request.Status != RequestStatus.Pending)
            return BadRequest(new { message = "Yêu cầu này đã được xử lý bởi thợ khác" });

        // Nếu là đơn Broadcast hoặc Multi-select (Grab-style), gán thợ nhận
        if ((request.IsBroadcast || !string.IsNullOrEmpty(request.TargetWorkerIds)) && workerId.HasValue)
        {
            var worker = await _context.WorkerProfiles.FindAsync(workerId.Value);
            if (worker != null)
            {
                // Kiểm tra quyền đối với đơn Multi-select
                if (!request.IsBroadcast && !string.IsNullOrEmpty(request.TargetWorkerIds) && !request.TargetWorkerIds.Contains($",{workerId.Value},"))
                {
                    return BadRequest(new { message = "Bạn không có quyền nhận yêu cầu này" });
                }

                request.WorkerId = workerId.Value;
                request.WorkerName = worker.NameOrStore;
            }
        }

        request.Status = RequestStatus.Confirmed;
        request.UpdatedAt = DateTime.Now;

        // US_08: Thông báo cho khách hàng
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
