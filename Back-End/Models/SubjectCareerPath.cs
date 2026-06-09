namespace BackEnd.Models;

/// <summary>Career interest path option linked to a UG specialization (major subject).</summary>
public class SubjectCareerPath
{
    public int Id { get; set; }

    /// <summary>Canonical specialization key, e.g. "Mathematics" or "Computer Science / IT".</summary>
    public string Specialization { get; set; } = string.Empty;

    /// <summary>Display label shown in the career survey path picker.</summary>
    public string PathLabel { get; set; } = string.Empty;

    public int SortOrder { get; set; }
}
