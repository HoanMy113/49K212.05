namespace FixItNow.Api.Models;

public enum RequestStatus
{
	Pending = 0,      // Đang chờ
	Confirmed = 1,    // Đã xác nhận
	Completed = 2,    // Hoàn thành
	Cancelled = 3     // Đã hủy
}

public class RepairRequest
{
	public int Id { get; set; }

	// Thông tin khách hàng
	public string CustomerName { get; set; } = string.Empty;
	public string CustomerPhone { get; set; } = string.Empty;
	public string Address { get; set; } = string.Empty;

	// Thông tin yêu cầu
	public string Category { get; set; } = string.Empty;       // VD: "Sửa điện"
	public string Description { get; set; } = string.Empty;    // Mô tả chi tiết

	// Thợ được chọn (nullable cho Broadcast hoặc Multi-worker)
	public int? WorkerId { get; set; }
	public string WorkerName { get; set; } = string.Empty;     // Cache tên thợ

	// Lưu danh sách ID thợ mục tiêu cho chế độ Multi-select dạng chuỗi: ",1,2,3,"
	public string? TargetWorkerIds { get; set; }

	// DANH SÁCH THỢ TỪ CHỐI ĐƠN BROADCAST: ",1,2,3," (Mới thêm)
	public string? RejectedWorkerIds { get; set; }

	// Broadcast: gửi cho tất cả thợ trong khu vực
	public bool IsBroadcast { get; set; } = false;

	// Trạng thái
	public RequestStatus Status { get; set; } = RequestStatus.Pending;

	public DateTime CreatedAt { get; set; } = DateTime.Now;
	public DateTime? UpdatedAt { get; set; }
}
