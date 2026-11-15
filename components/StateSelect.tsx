"use client";

import { useEffect, useState } from "react";

type StateOption = { name: string; code: string };

type Props = {
  country: string;
  name: string;
  id?: string;
  defaultValue?: string;
  className?: string;
  optional?: boolean;
  required?: boolean;
};

/**
 * State/province picker that follows the selected country. Falls back to a free
 * text field when the dataset has no regions for that country.
 */
export default function StateSelect({
  country,
  name,
  id,
  defaultValue = "",
  className = "",
  optional = true,
  required = false,
}: Props) {
  const [states, setStates] = useState<StateOption[]>([]);
  const [value, setValue] = useState(defaultValue);
  const [loading, setLoading] = useState(Boolean(country));

  useEffect(() => {
    if (!country) {
      setStates([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    fetch(`/api/states?country=${encodeURIComponent(country)}`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : { states: [] }))
      .then((data: { states?: StateOption[] }) => {
        const next = Array.isArray(data.states) ? data.states : [];
        setStates(next);
        setValue((current) => (current && next.some((state) => state.name === current) ? current : ""));
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setStates([]);
          setValue("");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [country]);

  if (loading) {
    return (
      <select id={id} name={name} disabled aria-busy="true" className={className}>
        <option>Loading states…</option>
      </select>
    );
  }

  if (states.length === 0) {
    return (
      <input
        id={id}
        name={name}
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        maxLength={90}
        required={required}
        placeholder="State / province"
        className={className}
      />
    );
  }

  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={(event) => setValue(event.target.value)}
      required={required}
      className={className}
    >
      {optional ? <option value="">Not set</option> : null}
      {states.map((state) => (
        <option key={state.code || state.name} value={state.name}>
          {state.name}
        </option>
      ))}
    </select>
  );
}
