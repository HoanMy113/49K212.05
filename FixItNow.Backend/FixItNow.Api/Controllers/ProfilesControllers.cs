[HttpPut("{id}")]
public async Task<IActionResult> UpdateProfile(int id, [FromBody] UpdateProfileRequest request)
{
    if (!ModelState.IsValid)
        return BadRequest(ModelState);

    var updatedProfile = await _profileService.UpdateProfileAsync(id, request);
    return Ok(updatedProfile);
}
