using FixItNow.Api.DTOs;
using FixItNow.Api.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FixItNow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProfilesController : ControllerBase
{
    private readonly IProfileService _profileService;

    public ProfilesController(IProfileService profileService)
    {
        _profileService = profileService;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProfile(int id)
    {
        var profile = await _profileService.GetProfileAsync(id);
        if (profile == null)
            return NotFound(new { message = "Profile not found" });

        return Ok(profile);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProfile(int id, [FromBody] UpdateProfileRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var updatedProfile = await _profileService.UpdateProfileAsync(id, request);
        return Ok(updatedProfile);
    }
}
