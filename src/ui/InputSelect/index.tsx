/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import clsx from 'clsx';
import { SelectHTMLAttributes } from 'react';

export interface ISelect extends SelectHTMLAttributes<HTMLSelectElement> {
  name: string;
  label: string;
  list: any[];
  className?: string;
  value: any;
  onChange?: any;
  onBlur?: any;
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
  errorMessage?: string;
  errorStatus?: boolean;
  addNewField?: { label: string; value: number };
  onClick?: any;
  customHeight?: SelectHTMLAttributes<HTMLSelectElement>['className'];
}

export const InputSelect = ({
  label,
  list,
  className = '',
  value,
  onChange,
  onBlur,
  name,
  disabled,
  required,
  errorStatus,
  errorMessage,
  addNewField,
  customHeight,
  ...rest
}: ISelect) => {
  return (
    <div className={`flex w-full flex-col ${className}`}>
      {label && (
        <label className='font-normal text-slate-800 lg:text-xs xl:text-sm  2xl:text-lg'>
          {label}
          {required ? <span className='text-red-500'> *</span> : ''}
        </label>
      )}
      <select
        name={name}
        defaultValue={value}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        className={clsx(
          'mt-1 rounded-lg px-2 py-1 text-sm font-normal shadow-sm transition-all duration-300 ease-in-out hover:border-blue-500 focus:border-r-blue-500 focus:outline-none',
          {
            customHeight: customHeight,
            'h-7 xl:h-12': !customHeight,
            'cursor-not-allowed bg-white brightness-75 filter': disabled,
            'cursor-pointer': !disabled,
            'bg-white': value,
            'bg-secondary': !value,
          }
        )}
        {...rest}
      >
        {list?.length ? (
          list?.map((item: any, index: number) => {
            return (
              <option
                key={item.id}
                value={Number(item?.id) || item?.value || item?.id}
                disabled={item?.disabled || false}
                title={item?.title}
                className={item?.disabled && 'bg-gray-300'}
              >
                {item?.name || item?.label}
              </option>
            );
          })
        ) : (
          <option disabled>sem opções</option>
        )}
        {addNewField && (
          <option
            value={addNewField?.value}
            className='bg-primary-theme new-field'
          >
            + {addNewField?.label}
          </option>
        )}
      </select>
      {errorStatus && <span className='errorStatus'>{errorMessage}</span>}
    </div>
  );
};
