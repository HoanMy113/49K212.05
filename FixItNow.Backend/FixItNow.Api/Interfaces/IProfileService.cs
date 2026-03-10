using FixItNow.Api.DTOs;
using FixItNow.Api.Models;

namespace FixItNow.Api.Interfaces;

public interface IProfileService
{
    Task<WorkerProfile> GetProfileAsync(int id);
    Task<WorkerProfile> UpdateProfileAsync(int id, UpdateProfileRequest request);
    Task<List<WorkerProfile>> SearchProfilesAsync(string? category, string? location);
}
