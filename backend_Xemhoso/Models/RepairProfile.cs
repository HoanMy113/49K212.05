using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FixItNow.Models
{
    [Table("RepairProfiles")] // Để EF Core biết tìm đúng bảng này
    public class RepairProfile
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
        public string Phone { get; set; }
        public string Address { get; set; }
        public string Description { get; set; }
        
        // Các cột lưu chuỗi JSON từ SQL
        public string? SkillsJson { get; set; }
        public string? ServiceAreasJson { get; set; }
        public string? ServicesJson { get; set; }
        
        public double Rating { get; set; }
       // public int TotalReviews { get; set; }
        
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}