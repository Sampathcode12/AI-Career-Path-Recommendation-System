import React, { useMemo, useCallback, useState, useEffect } from 'react';
import {
  INTAKE_OTHER,
  UG_COURSE_OPTIONS,
  UG_SPECIALIZATION_OPTIONS,
  getSuggestedSkillsForInterestPaths,
  parseInterestsList,
  parseSkillsList,
  skillsListToText,
  intakeSelectValue,
} from '../constants/careerIntakeOptions';
import { intakeAPI } from '../services/api';
import SearchableIntakeSelect from './SearchableIntakeSelect';

function RequiredMark() {
  return (
    <span className="form-required-mark" aria-hidden="true">
      *
    </span>
  );
}

function IntakeSelectWithOther({
  id,
  label,
  options,
  value,
  setValue,
  otherPlaceholder,
  required = false,
}) {
  const flatOptions = options ?? [];
  const predefinedValues = flatOptions.map((o) => o.value);
  const selectVal = intakeSelectValue(value, predefinedValues);

  return (
    <div className="form-group">
      <label htmlFor={id}>
        {label}
        {required && <RequiredMark />}
      </label>
      <select
        id={id}
        value={selectVal}
        aria-required={required || undefined}
        onChange={(e) => {
          const v = e.target.value;
          if (v === INTAKE_OTHER) {
            const cur = (value ?? '').trim();
            setValue(predefinedValues.includes(cur) ? '' : value ?? '');
          } else {
            setValue(v);
          }
        }}
      >
        <option value="">Select</option>
        {flatOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
        <option value={INTAKE_OTHER}>Other (specify below)</option>
      </select>
      {selectVal === INTAKE_OTHER && (
        <>
          <label htmlFor={`${id}-other`} style={{ marginTop: '0.75rem', display: 'block' }}>
            Please specify
          </label>
          <input
            id={`${id}-other`}
            type="text"
            value={value ?? ''}
            onChange={(e) => setValue(e.target.value)}
            placeholder={otherPlaceholder}
          />
        </>
      )}
    </div>
  );
}

/**
 * Survey fields (dropdowns where fixed choices help; free text elsewhere).
 * @param {object} props
 * @param {object} props.recForm
 * @param {function} props.setRecForm
 * @param {string} props.recFormError
 * @param {string} [props.idPrefix='rec']
 */
export default function CareerIntakeFormFields({
  recForm,
  setRecForm,
  recFormError,
  idPrefix = 'rec',
}) {
  const p = idPrefix;
  const [skillQuery, setSkillQuery] = useState('');
  const [interestQuery, setInterestQuery] = useState('');
  const [interestPathOptions, setInterestPathOptions] = useState([]);
  const [pathsLoading, setPathsLoading] = useState(false);
  const [pathsError, setPathsError] = useState('');

  const specPredefinedValues = useMemo(
    () => UG_SPECIALIZATION_OPTIONS.map((o) => o.value),
    []
  );

  const hasSubject = Boolean((recForm.ugSpecialization ?? '').trim());

  const interestPathValues = useMemo(
    () => new Set(interestPathOptions.map((o) => o.value)),
    [interestPathOptions]
  );

  const selectedInterestPath = useMemo(() => {
    const list = parseInterestsList(recForm.interests);
    if (list.length === 0) return '';
    const match = list.find((item) => interestPathValues.has(item));
    return match ?? list[0];
  }, [recForm.interests, interestPathValues]);

  useEffect(() => {
    if (!hasSubject) {
      setInterestPathOptions([]);
      setPathsLoading(false);
      setPathsError('');
      return undefined;
    }

    let cancelled = false;
    setInterestPathOptions([]);
    const timer = window.setTimeout(async () => {
      setPathsLoading(true);
      setPathsError('');
      try {
        const res = await intakeAPI.getCareerPaths(recForm.ugSpecialization, interestQuery);
        if (cancelled) return;
        const raw = res.paths ?? res.Paths ?? [];
        const options = raw.map((row) => ({
          value: row.value ?? row.Value ?? '',
          label: row.label ?? row.Label ?? row.value ?? row.Value ?? '',
        })).filter((o) => o.value);
        setInterestPathOptions(options);

        if (options.length > 0) {
          setRecForm((f) => {
            const current = parseInterestsList(f.interests)[0] ?? '';
            if (!current) return f;
            if (options.some((o) => o.value === current)) return f;
            return { ...f, interests: '' };
          });
        }
      } catch (err) {
        if (!cancelled) {
          setInterestPathOptions([]);
          setPathsError(err?.message || 'Could not load career paths. Check that the API is running.');
        }
      } finally {
        if (!cancelled) setPathsLoading(false);
      }
    }, interestQuery.trim() ? 300 : 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [hasSubject, recForm.ugSpecialization, interestQuery, setRecForm]);

  const specializationDisplayLabel = useMemo(() => {
    const v = (recForm.ugSpecialization ?? '').trim();
    if (!v) return 'your major (select your UG specialization above)';
    const hit = UG_SPECIALIZATION_OPTIONS.find((o) => o.value === v);
    return hit ? hit.label : v;
  }, [recForm.ugSpecialization]);

  const selectedInterests = useMemo(
    () => (selectedInterestPath ? [selectedInterestPath] : []),
    [selectedInterestPath]
  );

  const selectedSkills = useMemo(
    () => parseSkillsList(recForm.skillsText),
    [recForm.skillsText]
  );

  const selectedSkillKeys = useMemo(
    () => new Set(selectedSkills.map((s) => s.toLowerCase())),
    [selectedSkills]
  );

  const skillSuggestions = useMemo(() => {
    const base = getSuggestedSkillsForInterestPaths(
      recForm.interests,
      recForm.ugSpecialization,
      specPredefinedValues
    );
    const q = skillQuery.trim().toLowerCase();
    if (!q) return base;
    return base.filter((s) => s.toLowerCase().includes(q));
  }, [recForm.interests, recForm.ugSpecialization, specPredefinedValues, skillQuery]);

  const handleSpecializationChange = useCallback(
    (nextSpec) => {
      let specChanged = false;
      setRecForm((f) => {
        const prev = (f.ugSpecialization ?? '').trim();
        const next = (nextSpec ?? '').trim();
        specChanged = prev.toLowerCase() !== next.toLowerCase();
        if (!specChanged) {
          return { ...f, ugSpecialization: nextSpec };
        }
        return {
          ...f,
          ugSpecialization: nextSpec,
          interests: '',
          skillsText: '',
        };
      });
      if (specChanged) {
        setInterestQuery('');
        setSkillQuery('');
      }
    },
    [setRecForm]
  );

  const handleInterestPathChange = useCallback(
    (path) => {
      const trimmed = path.trim();
      if (!trimmed) return;
      setRecForm((f) => {
        const current = (f.interests ?? '').trim();
        return { ...f, interests: current.toLowerCase() === trimmed.toLowerCase() ? '' : trimmed };
      });
    },
    [setRecForm]
  );

  const toggleSkillSuggestion = useCallback(
    (skill) => {
      const trimmed = skill.trim();
      if (!trimmed) return;
      setRecForm((f) => {
        const list = parseSkillsList(f.skillsText);
        const key = trimmed.toLowerCase();
        const idx = list.findIndex((s) => s.toLowerCase() === key);
        if (idx >= 0) list.splice(idx, 1);
        else list.push(trimmed);
        return { ...f, skillsText: skillsListToText(list) };
      });
    },
    [setRecForm]
  );

  return (
    <div className="career-intake-form career-intake-form--panel">
      {recFormError && (
        <div className="error-message" style={{ marginBottom: '1rem' }} role="alert">
          {recFormError}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        <div className="form-group">
          <label htmlFor={`${p}-name`}>What is your name?</label>
          <input
            id={`${p}-name`}
            type="text"
            value={recForm.displayName}
            onChange={(e) => setRecForm((f) => ({ ...f, displayName: e.target.value }))}
            placeholder="Your name"
            autoComplete="name"
          />
        </div>
        <div className="form-group">
          <label htmlFor={`${p}-gender`}>What is your gender?</label>
          <select
            id={`${p}-gender`}
            value={recForm.gender}
            onChange={(e) => setRecForm((f) => ({ ...f, gender: e.target.value }))}
          >
            <option value="">Select</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Non-binary">Non-binary</option>
            <option value="Prefer not to say">Prefer not to say</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <SearchableIntakeSelect
          id={`${p}-ug-course`}
          label="What was your course in UG? (search the full list)"
          options={UG_COURSE_OPTIONS}
          value={recForm.ugCourse}
          setValue={(v) => setRecForm((f) => ({ ...f, ugCourse: v }))}
          otherPlaceholder="Type your exact degree name if not in the list"
        />
        <IntakeSelectWithOther
          id={`${p}-ug-spec`}
          label="What is your UG specialization? Major subject (e.g. Mathematics)"
          options={UG_SPECIALIZATION_OPTIONS}
          value={recForm.ugSpecialization}
          setValue={handleSpecializationChange}
          otherPlaceholder="e.g. Aerospace Engineering, Fine Arts"
          required
        />
        {hasSubject && (
          <div className="form-group career-intake-interests-block" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor={`${p}-interest-search`}>
              What is your career interest path?
              <RequiredMark />
            </label>
            <p className="career-intake-interests-lede">
              Search and choose one path for <strong>{specializationDisplayLabel}</strong>:
            </p>
            <input
              id={`${p}-interest-search`}
              type="search"
              className="career-intake-skill-search"
              value={interestQuery}
              onChange={(e) => setInterestQuery(e.target.value)}
              placeholder={`Search career paths for ${specializationDisplayLabel}…`}
              autoComplete="off"
              disabled={pathsLoading}
            />
            {pathsError && (
              <p className="career-intake-interests-lede" style={{ color: 'var(--danger, #b91c1c)' }} role="alert">
                {pathsError}
              </p>
            )}
            {pathsLoading ? (
              <p className="career-intake-interests-lede career-intake-interests-lede--hint">Loading career paths…</p>
            ) : (
            <div
              className="career-intake-suggestion-chips"
              role="radiogroup"
              aria-label="Career interest paths"
            >
              {interestPathOptions.length === 0 ? (
                <p className="career-intake-interests-lede career-intake-interests-lede--hint">
                  {interestQuery.trim()
                    ? 'No paths match your search — try different keywords or clear the search.'
                    : 'No career paths found for this subject yet.'}
                </p>
              ) : (
                interestPathOptions.map((o) => {
                  const selected = selectedInterestPath.toLowerCase() === o.value.toLowerCase();
                  return (
                    <button
                      key={o.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      className={`career-intake-chip${selected ? ' is-selected' : ''}`}
                      onClick={() => handleInterestPathChange(o.value)}
                    >
                      {selected ? '✓ ' : ''}
                      {o.label}
                    </button>
                  );
                })
              )}
            </div>
            )}
            {selectedInterestPath ? (
              <p className="career-intake-selected-summary">
                <strong>Selected:</strong> {selectedInterestPath}
              </p>
            ) : (
              <p className="career-intake-interests-lede career-intake-interests-lede--hint">
                Search above, then tap a path to select it.
              </p>
            )}
          </div>
        )}
        <div className="form-group career-intake-skills-block" style={{ gridColumn: '1 / -1' }}>
          <label htmlFor={`${p}-skill-search`}>
            What are your skills?
            <RequiredMark />
          </label>
          <p className="career-intake-interests-lede">
            {selectedInterests.length > 0 ? (
              <>Suggestions for your selected path. Tap to add or remove; search to filter.</>
            ) : hasSubject ? (
              <>
                Select an interest path above for tailored skills, or pick from general skills for{' '}
                <strong>{specializationDisplayLabel}</strong>.
              </>
            ) : (
              <>Select your UG specialization above to unlock the interest path and tailored skill suggestions.</>
            )}
          </p>
          <input
            id={`${p}-skill-search`}
            type="search"
            className="career-intake-skill-search"
            value={skillQuery}
            onChange={(e) => setSkillQuery(e.target.value)}
            placeholder="Search suggested skills…"
            autoComplete="off"
          />
          <div className="career-intake-suggestion-chips" role="group" aria-label="Suggested skills">
            {skillSuggestions.map((s) => {
              const selected = selectedSkillKeys.has(s.toLowerCase());
              return (
                <button
                  key={s}
                  type="button"
                  className={`career-intake-chip${selected ? ' is-selected' : ''}`}
                  aria-pressed={selected}
                  onClick={() => toggleSkillSuggestion(s)}
                >
                  {selected ? '✓ ' : '+ '}
                  {s}
                </button>
              );
            })}
          </div>
          <label htmlFor={`${p}-skills`} className="career-intake-skills-manual-label">
            Selected skills (edit freely; comma or semicolon separated)
          </label>
          <textarea
            id={`${p}-skills`}
            rows={3}
            value={recForm.skillsText}
            onChange={(e) => setRecForm((f) => ({ ...f, skillsText: e.target.value }))}
            placeholder="e.g. Python; SQL; Communication — tap chips above or type here"
          />
        </div>
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label htmlFor={`${p}-cgpa`}>What was the average CGPA or percentage obtained in under graduation?</label>
          <input
            id={`${p}-cgpa`}
            type="text"
            value={recForm.ugCgpaOrPercentage}
            onChange={(e) => setRecForm((f) => ({ ...f, ugCgpaOrPercentage: e.target.value }))}
            placeholder="e.g. 3.5, 85%, 71.25"
          />
        </div>
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label htmlFor={`${p}-has-certs`}>Did you do any certification courses additionally?</label>
          <select
            id={`${p}-has-certs`}
            value={recForm.hasCertsText}
            onChange={(e) => {
              const v = e.target.value;
              setRecForm((f) => ({
                ...f,
                hasCertsText: v,
                certTitles: v === 'Yes' ? f.certTitles : '',
              }));
            }}
          >
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
        {recForm.hasCertsText === 'Yes' && (
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor={`${p}-cert-titles`}>If yes, please specify your certificate course title.</label>
            <input
              id={`${p}-cert-titles`}
              type="text"
              value={recForm.certTitles}
              onChange={(e) => setRecForm((f) => ({ ...f, certTitles: e.target.value }))}
              placeholder="e.g. Linux, Git, AWS"
            />
          </div>
        )}
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label htmlFor={`${p}-working`}>Are you working?</label>
          <select
            id={`${p}-working`}
            value={recForm.isWorkingText}
            onChange={(e) => setRecForm((f) => ({ ...f, isWorkingText: e.target.value }))}
          >
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label htmlFor={`${p}-first-job`}>
            If yes, what is/was your first job title in your current field? If not applicable, write NA.
          </label>
          <input
            id={`${p}-first-job`}
            type="text"
            value={recForm.firstJobTitle}
            onChange={(e) => setRecForm((f) => ({ ...f, firstJobTitle: e.target.value }))}
            placeholder="e.g. Software Engineer or NA"
          />
        </div>
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label htmlFor={`${p}-masters`}>
            Have you done masters after undergraduation? If yes, mention your field (e.g. Masters in Mathematics)
          </label>
          <input
            id={`${p}-masters`}
            type="text"
            value={recForm.mastersField}
            onChange={(e) => setRecForm((f) => ({ ...f, mastersField: e.target.value }))}
            placeholder="Leave blank if none"
          />
        </div>
      </div>
    </div>
  );
}
