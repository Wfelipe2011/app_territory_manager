import clsx from "clsx";
import { Dispatch, SetStateAction, useState } from "react";
import { Eye, EyeOff as NotEye } from "react-feather";

/* eslint-disable */
export interface IInput extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  customHeight?: boolean;
  errorMessage?: string;
  icon?: React.ReactNode;
  ref?: any;
}

export const Input: React.FC<IInput> = ({
  label,
  type,
  customHeight = false,
  errorMessage,
  className,
  icon,
  ...rest
}) => {
  const [currentType, setCurrentType] = useState(type);

  return (
    <div>
      {label && (<label className="block text-sm my-2 font-medium leading-6 text-gray-900">
        {label}
        {rest.required ? <span className="text-red-500"> *</span> : ""}
      </label>
      )}
      <div className="relative rounded-md shadow-sm">
        <input
          type={currentType}
          ref={rest.ref}
          {...rest}
          className={clsx(
            'block w-full rounded-md border-0 py-1.5 pl-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6',
            className
          )}
        />
        {type === "password" && (
          <div className="absolute inset-y-0  flex items-center right-2">
            <Password setCurrentType={setCurrentType} currentType={currentType} />
          </div>
        )}
        {icon && (
          <div className="absolute inset-y-0  flex items-center right-2">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

const Password = ({
  setCurrentType,
  currentType,
}: {
  setCurrentType: Dispatch<SetStateAction<IInput["type"]>>;
  currentType: IInput["type"];
}) => (
  <button
    type="button"
    className="text-slate-500 text-sm font-semibold"
    onClick={() => {
      setCurrentType(currentType === "password" ? "text" : "password");
    }}
  >
    {currentType === "password" ? <Eye size={16} /> : <NotEye size={16} />}
  </button>
);

