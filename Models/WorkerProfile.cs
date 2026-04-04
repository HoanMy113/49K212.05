public class WorkerProfile {
    public int Id { get; set; }
    public string NameOrStore { get; set; } = "";
    public string Address { get; set; } = "";
    public List<string> Services { get; set; } = new List<string>();
}