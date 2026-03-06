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

        await _context.SaveChangesAsync();
        return profile;
    }
}
