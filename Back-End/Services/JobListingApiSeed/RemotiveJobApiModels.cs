using System.Text.Json.Serialization;

namespace BackEnd.Services.JobListingApiSeed;

public sealed class RemotiveJobsResponse
{
    [JsonPropertyName("jobs")]
    public List<RemotiveJob>? Jobs { get; set; }
}

public sealed class RemotiveJob
{
    [JsonPropertyName("id")]
    public long Id { get; set; }

    [JsonPropertyName("url")]
    public string? Url { get; set; }

    [JsonPropertyName("title")]
    public string? Title { get; set; }

    [JsonPropertyName("company_name")]
    public string? CompanyName { get; set; }

    [JsonPropertyName("category")]
    public string? Category { get; set; }

    [JsonPropertyName("tags")]
    public List<string>? Tags { get; set; }

    [JsonPropertyName("job_type")]
    public string? JobType { get; set; }

    [JsonPropertyName("candidate_required_location")]
    public string? CandidateRequiredLocation { get; set; }

    [JsonPropertyName("salary")]
    public string? Salary { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }
}
