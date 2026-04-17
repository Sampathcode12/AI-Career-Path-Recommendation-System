using System.Text.Json;
using System.Text.Json.Serialization;

namespace BackEnd.Services.JobListingApiSeed;

public sealed class ArbeitnowJobsResponse
{
    [JsonPropertyName("data")]
    public List<ArbeitnowJob>? Data { get; set; }
}

public sealed class ArbeitnowJob
{
    [JsonPropertyName("slug")]
    public string? Slug { get; set; }

    [JsonPropertyName("company_name")]
    public string? CompanyName { get; set; }

    [JsonPropertyName("title")]
    public string? Title { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("remote")]
    public bool Remote { get; set; }

    [JsonPropertyName("url")]
    public string? Url { get; set; }

    [JsonPropertyName("tags")]
    public List<string>? Tags { get; set; }

    [JsonPropertyName("job_types")]
    public List<string>? JobTypes { get; set; }

    [JsonPropertyName("location")]
    public JsonElement Location { get; set; }
}
