import React from 'react';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    name?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options?: SelectOption[];
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    className?: string;
    children?: React.ReactNode;
    id?: string;
    'aria-label'?: string;
}

const Select: React.FC<SelectProps> = ({
    name,
    value,
    onChange,
    options,
    placeholder = 'Select an option',
    disabled = false,
    required = false,
    className = '',
    children,
    id,
    'aria-label': ariaLabel,
}) => {
    // Generate id from name if not provided
    const selectId = id || name || 'select-' + Math.random().toString(36).substr(2, 9);

    return (
        <select
            id={selectId}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            aria-label={ariaLabel || name || 'Select option'}
            className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed bg-white ${className}`}
        >
            {children ? (
                // If children are provided, use them directly
                children
            ) : (
                // Otherwise, use options array
                <>
                    <option value="">{placeholder}</option>
                    {options?.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </>
            )}
        </select>
    );
};

export default Select;
