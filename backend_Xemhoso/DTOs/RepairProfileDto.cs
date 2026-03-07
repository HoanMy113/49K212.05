namespace FixItNow.DTOs
{
    public class RepairProfileDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Phone { get; set; }
        public string Address { get; set; }
        public string Description { get; set; }
        
        // Trả về List thực thụ để Frontend dùng vòng lặp dễ dàng
        public List<string> Skills { get; set; } = new();
        public List<string> ServiceAreas { get; set; } = new();
        public List<string> Services { get; set; } = new();
        
        public double Rating { get; set; }
        //public int TotalReviews { get; set; }
    }
}