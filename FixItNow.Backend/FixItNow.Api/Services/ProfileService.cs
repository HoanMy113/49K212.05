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
            // For now, if profile doesn't exist, we will create a new one to simulate a profile creation via update payload logic matching the frontend form
            profile = new WorkerProfile { Id = id };
            _context.WorkerProfiles.Add(profile);
        }

        profile.NameOrStore = request.NameOrStore;
        profile.PhoneNumber = request.PhoneNumber;
        profile.Address = request.Address;
        profile.Description = request.Description;
        profile.Services = request.Services;
        profile.Location = request.Location;
        profile.Rating = request.Rating;

        await _context.SaveChangesAsync();
        return profile;
    }

    public async Task<List<WorkerProfile>> SearchProfilesAsync(string? category, string? location)
    {
        var query = _context.WorkerProfiles.AsQueryable();

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
}
