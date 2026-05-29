import React from 'react';

export function FormField({
  as: Component = 'input',
  label,
  hint,
  error,
  children,
  className = '',
  ...props
}) {
  return (
    <div className={`field ${error ? 'field-has-errors' : ''} ${className}`.trim()}>
      <label htmlFor={props.id}>{label}</label>
      <Component {...props}>{children}</Component>
      {hint ? <p className="help-text">{hint}</p> : null}
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}
