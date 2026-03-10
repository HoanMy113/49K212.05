using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using FixItNow.Models;
using System;
using System.Linq;

namespace FixItNow.Controllers;

public class HomeController : Controller
{
    private readonly AppDbContext _context;

    public HomeController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult Index(string category, string location)
    {
        // Bước 1: Gọi dữ liệu ra List trước để dễ dàng dùng các hàm xử lý chuỗi nâng cao của C#
        var workers = _context.Workers.ToList();

        // Bước 2: Lọc theo danh mục (2 chiều)
        if (!string.IsNullOrEmpty(category))
        {
            var categories = category.Split(",");

            workers = workers.Where(w =>
                categories.Any(c =>
                    w.Category.Contains(c, StringComparison.OrdinalIgnoreCase) ||
                    c.Contains(w.Category, StringComparison.OrdinalIgnoreCase)
                )
            ).ToList();
        }

        // Bước 3: Lọc theo địa điểm (2 chiều)
        if (!string.IsNullOrEmpty(location))
        {
            workers = workers.Where(w =>
                w.Location.Contains(location, StringComparison.OrdinalIgnoreCase) ||
                location.Contains(w.Location, StringComparison.OrdinalIgnoreCase)
            ).ToList();
        }

        return View(workers);
    }
    [HttpGet]
    public IActionResult WorkerDetail(int id)
    {
        // Tìm thợ trong database dựa vào Id
        var worker = _context.Workers.FirstOrDefault(w => w.Id == id);

        if (worker == null)
        {
            // Nếu không thấy (bị xóa hoặc id sai)
            return NotFound("Không tìm thấy thông tin thợ này!");
        }

        // Trả về trang chi tiết kèm theo thông tin của người thợ đó
        return View(worker);
    }
}