import * as React from 'react';

/**
 * Campo de Input usado na tela de login.
 */
export default function LoginInput(
  props: Readonly<{
    label?: string;
    name?: string;
    type?: string;
    value?: string;
    placeholder?: string;
    customClasses?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }>
) {
  const {
    label,
    name,
    type = 'text',
    value,
    placeholder,
    customClasses,
    onChange,
  } = props;
  const classes = `outline outline-1 outline-border shadow-[0_4px_0px_#230633] p-6 w-full py-3 text-black bg-white rounded-full font-semibold text-lg ${
    customClasses || ''
  } ${label ? '' : 'mt-3'}`;

  return (
    <div className="w-full mb-4 flex flex-col items-start">
      {label && <label className="font-light mb-2">{label}</label>}
      <input
        className={classes}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
