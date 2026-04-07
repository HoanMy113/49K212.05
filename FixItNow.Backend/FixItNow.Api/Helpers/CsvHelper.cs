namespace FixItNow.Api.Helpers;

/// <summary>
/// Helper xử lý chuỗi CSV an toàn (thay vì dùng string.Contains() dễ gây lỗi logic)
/// Chuỗi CSV lưu dạng: ",1,2,3," — bọc đầu và cuối bằng dấu phẩy
/// </summary>
public static class CsvHelper
{
    /// <summary>
    /// Kiểm tra ID có nằm trong chuỗi CSV không (chính xác, không bị lẫn ID con)
    /// VD: CsvContains(",1,12,", 1) => true, CsvContains(",12,", 1) => false
    /// </summary>
    public static bool CsvContains(string? csvString, int id)
    {
        if (string.IsNullOrEmpty(csvString)) return false;
        // Split ra mảng int rồi so sánh chính xác, tránh sai logic khi ID trùng chữ số
        var ids = csvString.Split(',', StringSplitOptions.RemoveEmptyEntries);
        return ids.Any(s => int.TryParse(s.Trim(), out int parsed) && parsed == id);
    }

    /// <summary>
    /// Xóa 1 ID ra khỏi chuỗi CSV
    /// </summary>
    public static string CsvRemove(string? csvString, int id)
    {
        if (string.IsNullOrEmpty(csvString)) return ",";
        var ids = csvString.Split(',', StringSplitOptions.RemoveEmptyEntries)
            .Where(s => int.TryParse(s.Trim(), out int parsed) && parsed != id)
            .ToList();
        return ids.Count > 0 ? "," + string.Join(",", ids) + "," : ",";
    }

    /// <summary>
    /// Thêm 1 ID vào chuỗi CSV (không trùng)
    /// </summary>
    public static string CsvAdd(string? csvString, int id)
    {
        if (CsvContains(csvString, id)) return csvString!;
        if (string.IsNullOrEmpty(csvString) || csvString == ",")
            return $",{id},";
        return csvString.TrimEnd(',') + $",{id},";
    }

    /// <summary>
    /// Kiểm tra chuỗi CSV có rỗng (không còn ID nào) không
    /// </summary>
    public static bool CsvIsEmpty(string? csvString)
    {
        if (string.IsNullOrEmpty(csvString)) return true;
        return !csvString.Split(',', StringSplitOptions.RemoveEmptyEntries)
            .Any(s => int.TryParse(s.Trim(), out _));
    }
}
