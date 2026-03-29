import React, { useMemo, useCallback } from 'react';
import {
  INTAKE_OTHER,
  UG_COURSE_OPTIONS,
  UG_SPECIALIZATION_OPTIONS,
  getSuggestedInterestsForSpecialization,
  intakeSelectValue,
} from '../constants/careerIntakeOptions';
import SearchableIntakeSelect from './SearchableIntakeSelect';

function IntakeSelectWithOther({
  id,
  label,
  options,
  value,
  setValue,
  otherPlaceholder,
}) {
  const flatOptions = options ?? [];
  const predefinedValues = flatOptions.map((o) => o.value);
  const selectVal = intakeSelectValue(value, predefinedValues);

  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        value={selectVal}
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

  const specPredefinedValues = useMemo(
    () => UG_SPECIALIZATION_OPTIONS.map((o) => o.value),
    []
  );

  const interestSuggestions = useMemo(
    () => getSuggestedInterestsForSpecialization(recForm.ugSpecialization, specPredefinedValues),
    [recForm.ugSpecialization, specPredefinedValues]
  );

  const specializationDisplayLabel = useMemo(() => {
    const v = (recForm.ugSpecialization ?? '').trim();
    if (!v) return 'your major (select your UG specialization above)';
    const hit = UG_SPECIALIZATION_OPTIONS.find((o) => o.value === v);
    return hit ? hit.label : v;
  }, [recForm.ugSpecialization]);

  const appendInterestSuggestion = useCallback(
    (phrase) => {
      const pTrim = phrase.trim();
      if (!pTrim) return;
      setRecForm((f) => {
        const cur = f.interests.trim();
        if (cur.toLowerCase().includes(pTrim.toLowerCase())) return f;
        const sep = cur ? ', ' : '';
        return { ...f, interests: `${cur}${sep}${pTrim}` };
      });
    },
    [setRecForm]
  );

  const interestsPlaceholder = useMemo(() => {
    const v = (recForm.ugSpecialization ?? '').trim();
    if (!v) return 'Choose your specialization above, then add interests (or type freely here)';
    return `Career areas that fit ${specializationDisplayLabel} — use suggestions or write your own`;
  }, [recForm.ugSpecialization, specializationDisplayLabel]);

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
          setValue={(v) => setRecForm((f) => ({ ...f, ugSpecialization: v }))}
          otherPlaceholder="e.g. Aerospace Engineering, Fine Arts"
        />
        <div className="form-group career-intake-interests-block" style={{ gridColumn: '1 / -1' }}>
          <label htmlFor={`${p}-interests`}>What are your interests?</label>
          <p className="career-intake-interests-lede">
            {(recForm.ugSpecialization ?? '').trim() ? (
              <>
                Suggestions aligned with <strong>{specializationDisplayLabel}</strong>. Tap to add; edit or type freely
                in the box.
              </>
            ) : (
              <>
                Select your <strong>UG specialization</strong> above for tailored suggestions. Until then, here are
                general ideas you can add:
              </>
            )}
          </p>
          <div className="career-intake-suggestion-chips" role="group" aria-label="Suggested interests">
            {interestSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                className="career-intake-chip"
                onClick={() => appendInterestSuggestion(s)}
              >
                + {s}
              </button>
            ))}
          </div>
          <textarea
            id={`${p}-interests`}
            rows={3}
            value={recForm.interests}
            onChange={(e) => setRecForm((f) => ({ ...f, interests: e.target.value }))}
            placeholder={interestsPlaceholder}
          />
        </div>
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label htmlFor={`${p}-skills`}>What are your skills? (list several; separate with commas or semicolons)</label>
          <textarea
            id={`${p}-skills`}
            rows={4}
            value={recForm.skillsText}
            onChange={(e) => setRecForm((f) => ({ ...f, skillsText: e.target.value }))}
            placeholder="e.g. Python; SQL; Java — or Critical Thinking, Communication, Excel"
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
