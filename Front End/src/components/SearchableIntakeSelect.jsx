import React, { useState, useRef, useEffect, useMemo, useId, useCallback } from 'react';
import { INTAKE_OTHER, intakeSelectValue } from '../constants/careerIntakeOptions';

/**
 * Searchable list + "Other" for long option sets (e.g. worldwide UG courses).
 */
export default function SearchableIntakeSelect({
  id,
  label,
  options,
  value,
  setValue,
  otherPlaceholder,
}) {
  const predefinedValues = useMemo(() => options.map((o) => o.value), [options]);
  const selectVal = intakeSelectValue(value, predefinedValues);
  const listId = useId();
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(-1);
  /** True after user picks "Other" so the text field shows even before they type. */
  const [otherPicked, setOtherPicked] = useState(false);

  const selectedLabel = useMemo(() => {
    const v = (value ?? '').trim();
    if (!v) return '';
    const hit = options.find((o) => o.value === v);
    return hit ? hit.label : v;
  }, [value, options]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.value.toLowerCase().includes(q)
    );
  }, [options, query]);

  const otherRowIndex = filtered.length;
  const totalRows = filtered.length + 1;

  const matchesPredefined = predefinedValues.includes((value ?? '').trim());
  const showOtherField =
    selectVal === INTAKE_OTHER || (otherPicked && !matchesPredefined);

  const closePanel = useCallback(() => {
    setOpen(false);
    setQuery('');
    setHighlightIndex(-1);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) closePanel();
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open, closePanel]);

  const pickOption = (o) => {
    setOtherPicked(false);
    setValue(o.value);
    closePanel();
    inputRef.current?.blur();
  };

  const pickOther = () => {
    const cur = (value ?? '').trim();
    setValue(predefinedValues.includes(cur) ? '' : value ?? '');
    setOtherPicked(true);
    closePanel();
    inputRef.current?.blur();
  };

  const applyHighlight = (next) => {
    if (next < -1) next = -1;
    if (next >= totalRows) next = totalRows - 1;
    setHighlightIndex(next);
  };

  const confirmHighlight = () => {
    if (highlightIndex >= 0 && highlightIndex < filtered.length) {
      pickOption(filtered[highlightIndex]);
    } else if (highlightIndex === otherRowIndex) {
      pickOther();
    }
  };

  const onKeyDown = (e) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setOpen(true);
        setQuery('');
        setHighlightIndex(0);
      }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        applyHighlight(highlightIndex < 0 ? 0 : highlightIndex + 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        applyHighlight(highlightIndex <= 0 ? -1 : highlightIndex - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightIndex >= 0) confirmHighlight();
        else if (filtered.length === 1) pickOption(filtered[0]);
        break;
      case 'Escape':
        e.preventDefault();
        closePanel();
        inputRef.current?.blur();
        break;
      default:
        break;
    }
  };

  const inputDisplay = open ? query : selectedLabel;

  return (
    <div className="form-group searchable-intake-select" ref={rootRef} style={{ gridColumn: '1 / -1' }}>
      <label htmlFor={id}>{label}</label>
      <div className="searchable-intake-select__wrap">
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          value={inputDisplay}
          placeholder="Search all courses, then pick one…"
          onFocus={() => {
            setOpen(true);
            setQuery('');
            setHighlightIndex(-1);
          }}
          onChange={(e) => {
            setOpen(true);
            setHighlightIndex(-1);
            setQuery(e.target.value);
          }}
          onKeyDown={onKeyDown}
        />
        {open && (
          <ul id={listId} className="searchable-intake-select__list" role="listbox">
            {filtered.length === 0 && (
              <li className="searchable-intake-select__empty" role="presentation">
                No matches — use &quot;Other&quot; below or adjust your search.
              </li>
            )}
            {filtered.map((o, i) => (
              <li
                key={o.value}
                role="option"
                aria-selected={value === o.value}
                className={i === highlightIndex ? 'is-highlighted' : ''}
                onMouseEnter={() => setHighlightIndex(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pickOption(o)}
              >
                {o.label}
              </li>
            ))}
            <li
              role="option"
              className={
                highlightIndex === otherRowIndex
                  ? 'is-highlighted searchable-intake-select__other'
                  : 'searchable-intake-select__other'
              }
              onMouseEnter={() => setHighlightIndex(otherRowIndex)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={pickOther}
            >
              Other — not listed (type your degree below)
            </li>
          </ul>
        )}
      </div>
      {showOtherField && (
        <>
          <label htmlFor={`${id}-other`} style={{ marginTop: '0.75rem', display: 'block' }}>
            Please specify your course
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
