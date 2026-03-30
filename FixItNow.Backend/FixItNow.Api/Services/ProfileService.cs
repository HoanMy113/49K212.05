using FixItNow.Api.Data;
using FixItNow.Api.DTOs;
using FixItNow.Api.Interfaces;
using FixItNow.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FixItNow.Api.Services;

public class ProfileService : IProfileService
{
    private readonly AppDbContext _context;

    public ProfileService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<WorkerProfile> GetProfileAsync(int id)
    {
        return await _context.WorkerProfiles.FindAsync(id);
    }

    public async Task<WorkerProfile> UpdateProfileAsync(int id, UpdateProfileRequest request)
    {
        var profile = await _context.WorkerProfiles.FindAsync(id);
        
        if (profile == null)
        {
            // Create new profile — let SQL Server auto-generate the ID
            profile = new WorkerProfile();
            _context.WorkerProfiles.Add(profile);
        }

        profile.NameOrStore = request.NameOrStore;
        profile.PhoneNumber = request.PhoneNumber;
        profile.Address = request.Address;
        profile.Description = request.Description;
        profile.Services = request.Services ?? new List<string>();
        profile.Location = request.Location ?? string.Empty;
        profile.AvatarUrl = request.AvatarUrl;
        profile.IsActive = request.IsActive;
        // ====== BẢO MẬT: KHÔNG cho thợ tự đặt Rating — chỉ ReviewsController mới được cập nhật ======
        // profile.Rating = request.Rating;  // ĐÃ XÓA ĐỂ CHỐNG GIẢ MẠO ĐIỂM

        await _context.SaveChangesAsync();
        return profile;
    }

    public async Task<List<WorkerProfile>> SearchProfilesAsync(string? category, string? location)
    {
        var query = _context.WorkerProfiles.Where(w => w.IsActive).AsQueryable();

        // 1. Fetch all to memory if needed, or query directly. In-memory DB evaluates locally anyway.
        // For standard databases, it's better to fetch all and filter if using complex string splits, 
        // but EF Core handles basic `Contains` translating to `LIKE`.
        var workers = await query.ToListAsync();

        if (!string.IsNullOrEmpty(category))
        {
            var categories = category.Split(",", StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            workers = workers.Where(w =>
                w.Services != null && 
                categories.Any(c => w.Services.Any(s => s.Contains(c, StringComparison.OrdinalIgnoreCase) || c.Contains(s, StringComparison.OrdinalIgnoreCase)))
            ).ToList();
        }

        if (!string.IsNullOrEmpty(location))
        {
            workers = workers.Where(w =>
                !string.IsNullOrEmpty(w.Location) &&
                (w.Location.Contains(location, StringComparison.OrdinalIgnoreCase) || location.Contains(w.Location, StringComparison.OrdinalIgnoreCase))
            ).ToList();
        }

        return workers;
    }

    public async Task<bool> DeleteProfileAsync(int id)
    {
        var profile = await _context.WorkerProfiles.FindAsync(id);
        if (profile == null) return false;

        _context.WorkerProfiles.Remove(profile);
        await _context.SaveChangesAsync();
        return true;
    }
}
