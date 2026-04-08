namespace BackEnd.Services;

/// <summary>Built-in careers used when AI/DB generation falls back — same titles as the frontend sample list where possible.</summary>
internal static class RecommendationTemplateCatalog
{
    public static readonly (string Title, string Desc, string Category)[] Careers =
    {
        ("Digital Marketing Specialist", "Plan and run campaigns across search, social, and content; measure performance and optimize for growth.", "Marketing"),
        ("Marketing Analyst", "Turn market, campaign, and customer data into insights that guide positioning and revenue.", "Marketing"),
        ("Content Strategist", "Plan messaging and content across channels; align stories with brand, audience, and business goals.", "Marketing"),
        ("Software Developer", "Build applications and systems. Strong fit if you like problem-solving and coding.", "Technology"),
        ("Data Analyst", "Analyze data to drive decisions. Good fit for analytical and detail-oriented people.", "Data"),
        ("Data Scientist", "Use statistics, machine learning, and programming to build models, run experiments, and deliver insights.", "Data"),
        ("Product Manager", "Define product vision and work with engineering and design.", "Product"),
        ("UX Designer", "Design user experiences and interfaces. Ideal for creative and user-focused individuals.", "Design"),
        ("DevOps Engineer", "Bridge development and operations; focus on CI/CD and cloud infrastructure.", "Technology")
    };
}
