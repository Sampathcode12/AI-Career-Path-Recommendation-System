namespace BackEnd.Services;

/// <summary>
/// Maps seeded <see cref="Models.JobListing.Location"/> strings to canonical country names used by job filters.
/// Locations outside the supported filter set resolve to null (still shown when filter is &quot;all countries&quot;).
/// </summary>
public static class JobLocationCountryResolver
{
    private static readonly Dictionary<string, string> CityToCountry = CreateMap();

    private static Dictionary<string, string> CreateMap()
    {
        var m = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        void us(params string[] cities) { foreach (var c in cities) m[c] = "United States"; }
        void ca(params string[] cities) { foreach (var c in cities) m[c] = "Canada"; }

        us("New York", "Chicago", "Seattle", "Washington DC", "Boston", "Austin", "Cupertino", "Atlanta", "Charlotte",
            "Dallas", "Denver", "Houston", "Miami", "Minneapolis", "Philadelphia", "Phoenix", "San Francisco", "Los Angeles",
            "Detroit", "Cleveland", "Indianapolis", "Milwaukee", "Nashville", "Portland", "San Antonio", "San Diego",
            "Columbus", "Pittsburgh", "Ann Arbor", "Greenville", "Iowa City", "Elko", "Wichita", "Brooklyn");
        ca("Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa", "Saskatoon");

        m["London"] = "United Kingdom";
        m["Bristol"] = "United Kingdom";

        m["Paris"] = "France";
        m["Toulouse"] = "France";

        m["Berlin"] = "Germany";
        m["Munich"] = "Germany";
        m["Frankfurt"] = "Germany";

        m["Madrid"] = "Spain";
        m["Barcelona"] = "Spain";

        m["Milan"] = "Italy";

        m["Amsterdam"] = "Netherlands";
        m["Rotterdam"] = "Netherlands";

        m["Geneva"] = "Switzerland";

        m["Istanbul"] = "Turkey";

        m["Tokyo"] = "Japan";
        m["Seoul"] = "South Korea";

        m["Shanghai"] = "China";
        m["Hong Kong"] = "China";

        m["Mumbai"] = "India";
        m["Bangalore"] = "India";
        m["Delhi"] = "India";

        m["Singapore"] = "Singapore";

        m["Jakarta"] = "Indonesia";

        m["Mexico City"] = "Mexico";
        m["São Paulo"] = "Brazil";
        m["Sao Paulo"] = "Brazil";

        m["Sydney"] = "Australia";
        m["Melbourne"] = "Australia";
        m["Brisbane"] = "Australia";
        m["Perth"] = "Australia";
        m["Canberra"] = "Australia";

        m["Riyadh"] = "Saudi Arabia";

        m["Colombo"] = "Sri Lanka";
        m["Kandy"] = "Sri Lanka";
        m["Negombo"] = "Sri Lanka";
        m["Galle"] = "Sri Lanka";

        return m;
    }

    /// <summary>Returns a filter country name, or null for Remote / unknown / outside the supported set.</summary>
    public static string? Resolve(string? location)
    {
        if (string.IsNullOrWhiteSpace(location)) return null;
        var t = location.Trim();
        if (t.Equals("Remote", StringComparison.OrdinalIgnoreCase)) return null;

        if (CityToCountry.TryGetValue(t, out var country)) return country;

        var lower = t.ToLowerInvariant();
        if (lower.Contains("sri lanka", StringComparison.Ordinal)) return "Sri Lanka";

        return null;
    }
}
