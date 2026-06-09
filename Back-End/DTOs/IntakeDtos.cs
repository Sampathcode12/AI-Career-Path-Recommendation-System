namespace BackEnd.DTOs;

public record CareerPathOptionDto(string Value, string Label);

public record CareerPathsResponseDto(
    string Specialization,
    string ResolvedSpecialization,
    IReadOnlyList<CareerPathOptionDto> Paths);

public record SpecializationOptionDto(string Value, string Label);
