public class WorkerProfile
{
    public int Id { get; set; }
    public string NameOrStore { get; set; } = string.Empty; // Tên thợ hoặc tên tiệm
    public string PhoneNumber { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public List<string> Services { get; set; } = new List<string>(); // Danh sách kỹ năng
    public string Location { get; set; } = string.Empty; // Khu vực hoạt động
    public double Rating { get; set; } = 0.0; // Đánh giá sao
    public bool IsActive { get; set; } = true;
}