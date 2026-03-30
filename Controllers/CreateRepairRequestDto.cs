using System.ComponentModel.DataAnnotations;

namespace FixItNow.Api.DTOs;

public class CreateRepairRequestDto
{
    [Required(ErrorMessage = "Vui lòng nhập tên")]
    public string CustomerName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vui lòng nhập số điện thoại")]
    public string CustomerPhone { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vui lòng nhập địa chỉ")]
    public string Address { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vui lòng chọn danh mục")]
    public string Category { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    // Single worker (backward-compatible, optional now)
    public int? WorkerId { get; set; }

    // Multi-worker: danh sách ID thợ được chọn
    public List<int>? WorkerIds { get; set; }

    // Broadcast: gửi cho toàn bộ thợ trong khu vực
    public bool IsBroadcast { get; set; } = false;
}
