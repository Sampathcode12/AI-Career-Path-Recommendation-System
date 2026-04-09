namespace BackEnd.Services;

/// <summary>Built-in careers used when AI/DB generation falls back — ordered by broad domain; runtime code reorders by survey/ML signal.</summary>
internal static class RecommendationTemplateCatalog
{
    public static readonly (string Title, string Desc, string Category)[] Careers =
    {
        // Marketing
        ("Digital Marketing Specialist", "Plan and run campaigns across search, social, and content; measure performance and optimize for growth.", "Marketing"),
        ("Marketing Analyst", "Turn market, campaign, and customer data into insights that guide positioning and revenue.", "Marketing"),
        ("Content Strategist", "Plan messaging and content across channels; align stories with brand, audience, and business goals.", "Marketing"),
        // Technology
        ("Software Developer", "Build applications and systems. Strong fit if you like problem-solving and coding.", "Technology"),
        ("DevOps Engineer", "Bridge development and operations; focus on CI/CD and cloud infrastructure.", "Technology"),
        // Data
        ("Data Analyst", "Analyze data to drive decisions. Good fit for analytical and detail-oriented people.", "Data"),
        ("Data Scientist", "Use statistics, machine learning, and programming to build models, run experiments, and deliver insights.", "Data"),
        // Product & design
        ("Product Manager", "Define product vision and work with engineering and design.", "Product"),
        ("UX Designer", "Design user experiences and interfaces. Ideal for creative and user-focused individuals.", "Design"),
        // Legal
        ("Corporate Counsel", "Advise the business on contracts, risk, and regulatory matters; partner with leadership on strategy.", "Legal"),
        ("Litigation Associate", "Prepare cases, research precedent, and represent clients in disputes or support trial teams.", "Legal"),
        ("Compliance Officer", "Design and monitor policies so the organization meets laws and industry regulations.", "Legal"),
        ("Legal Technology Specialist", "Implement e-discovery, contract automation, and legal workflows with modern tools.", "Legal"),
        ("Paralegal / Legal Analyst", "Support attorneys with research, filings, case files, and document preparation.", "Legal"),
        // Healthcare
        ("Healthcare Administrator", "Coordinate operations, quality, and resources in clinics, hospitals, or health systems.", "Healthcare"),
        ("Clinical Research Associate", "Run studies and trials; ensure protocols, data integrity, and participant safety.", "Healthcare"),
        ("Registered Nurse (Care Coordination)", "Guide patient care plans, education, and handoffs across care teams.", "Healthcare"),
        // Education
        ("Instructional Designer", "Build learning experiences, assessments, and curricula for schools or corporate training.", "Education"),
        ("K-12 Educator / Curriculum Lead", "Teach or lead subject and curriculum development in schools or learning programs.", "Education"),
        // HR
        ("HR Business Partner", "Align people strategy with managers: hiring, performance, engagement, and policy.", "Human Resources"),
        ("Talent Acquisition Specialist", "Source, interview, and hire candidates; improve employer brand and hiring process.", "Human Resources"),
        // Finance & business
        ("Financial Analyst", "Model revenue, costs, and forecasts; support budgeting, reporting, and investment decisions.", "Finance"),
        ("Business Analyst", "Translate business needs into requirements, processes, and solutions with stakeholders and tech teams.", "Business"),
    };
}
