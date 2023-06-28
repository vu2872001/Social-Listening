import { useState } from 'react';
import { Input } from 'antd';
import './floatInput.scss';

export default function FloatInput(props) {
  const {
    label = '',
    id = '',
    type,
    formName,
    className = '',
    ...other
  } = props;
  const [focus, setFocus] = useState(false);
  const [active, setActive] = useState(false);

  const labelClass = focus ? 'as-label' : 'as-placeholder';
  const activeLabelClass = focus && active ? 'active-label' : '';

  return (
    <div
      className="float-input-wrapper"
      onBlur={() => {
        setActive(false);
        if (!document.getElementById(id)?.value) {
          setFocus(false);
        }
      }}
      onFocus={() => {
        setActive(true);
        setFocus(true);
      }}
    >
      <Input
        id={id}
        className={`float-input ${className} ${label}`}
        type={type}
        autoComplete="off"
        {...other}
      />
      <label
        className={`float-label ${activeLabelClass} ${labelClass}`}
      >
        {label}
      </label>
    </div>
  );
}
