using FixItNow.Api.Data;
using FixItNow.Api.DTOs;
using FixItNow.Api.Models;
using FixItNow.Api.Services;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace FixItNow.Tests;

public class ProfileServiceTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly ProfileService _profileService;

    public ProfileServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new AppDbContext(options);
        _profileService = new ProfileService(_context);
    }

    [Fact]
    public async Task UpdateProfileAsync_CreatesNewProfile_WhenProfileDoesNotExist()
    {
        // Arrange
        var request = new UpdateProfileRequest
        {
            NameOrStore = "Test Store",
            PhoneNumber = "0123456789",
            Address = "Test Address",
            Description = "Test Description",
            Services = new List<string> { "Sửa điện" }
        };

        // Act
        var result = await _profileService.UpdateProfileAsync(1, request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(1, result.Id);
        Assert.Equal("Test Store", result.NameOrStore);
        Assert.Equal("Sửa điện", result.Services.First());
        
        var profileInDb = await _context.WorkerProfiles.FindAsync(1);
        Assert.NotNull(profileInDb);
    }

    [Fact]
    public async Task UpdateProfileAsync_UpdatesExistingProfile_WhenProfileExists()
    {
        // Arrange
        var initialProfile = new WorkerProfile
        {
            Id = 2,
            NameOrStore = "Old Name",
            PhoneNumber = "0000",
            Address = "Old Address",
            Description = "Old Description",
            Services = new List<string> { "Sửa nước" }
        };
        _context.WorkerProfiles.Add(initialProfile);
        await _context.SaveChangesAsync();

        var request = new UpdateProfileRequest
        {
            NameOrStore = "New Name",
            PhoneNumber = "1111",
            Address = "New Address",
            Description = "New Description",
            Services = new List<string> { "Sửa Tủ Lạnh" }
        };

        // Act
        var result = await _profileService.UpdateProfileAsync(2, request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Id);
        Assert.Equal("New Name", result.NameOrStore);
        Assert.Equal("Sửa Tủ Lạnh", result.Services.First());
    }

    [Fact]
    public async Task GetProfileAsync_ReturnsNull_WhenProfileDoesNotExist()
    {
        // Act
        var result = await _profileService.GetProfileAsync(99);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task GetProfileAsync_ReturnsProfile_WhenProfileExists()
    {
        // Arrange
        var initialProfile = new WorkerProfile
        {
            Id = 3,
            NameOrStore = "Jane Doe",
            PhoneNumber = "0987654321",
            Address = "123 Main St",
            Description = "Expert Plumber",
            Services = new List<string> { "Sửa ống nước" }
        };
        _context.WorkerProfiles.Add(initialProfile);
        await _context.SaveChangesAsync();

        // Act
        var result = await _profileService.GetProfileAsync(3);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Jane Doe", result.NameOrStore);
        Assert.Single(result.Services);
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }
}
