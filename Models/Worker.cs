using Microsoft.AspNetCore.Mvc;

namespace FixItNow.Models
{
    public class Worker
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public string Category { get; set; }

        public string Phone { get; set; }
        public string Location { get; set; }
        public double Rating { get; set; }
    }
}
