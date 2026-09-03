"use client";

import { Checkbox, CheckboxGroup, Description, Label } from "@heroui/react";

import { useField, useFormikContext, type FormikContextType, getIn } from "formik";

import { Danger } from "iconsax-reactjs";

interface CheckboxOption {
    label?: string;
    value: string;
    description?: string;
    disabled?: boolean;
}

interface FormikCheckboxGroupProps {
    name?: string;
    label?: string;
    description?: string;
    options: CheckboxOption[];

    // controlled mode
    value?: string[];
    onChange?: (value: string[]) => void;

    disabled?: boolean;
    className?: string;
    itemClassName?: string;
}

export default function FormikCheckboxGroup({
    name,
    label,
    description,
    options,
    value,
    onChange,
    disabled = false,
    className,
}: FormikCheckboxGroupProps) {
    const isFormik = Boolean(name);

    const fieldTuple = isFormik ? useField<string[]>(name!) : null;

    const field = fieldTuple?.[0];

    const formik = isFormik
        ? (useFormikContext() as FormikContextType<Record<string, unknown>>)
        : null;

    const inputValue = (isFormik ? field?.value : value) || [];

    const error =
        isFormik && formik && name ? getIn(formik.errors, name) : undefined;

    const touched =
        isFormik && formik && name ? getIn(formik.touched, name) : undefined;

    const hasError = Boolean(error && touched);

    const handleChange = (values: string[]) => {
        if (isFormik && formik && name) {
            formik.setFieldValue(name, values);

            formik.setFieldTouched(name, true);
        } else if (onChange) {
            onChange(values);
        }
    };

    return (
        <div className={`flex flex-col gap-2 ${className || ""}`}>
            <CheckboxGroup
                name={name}
                value={inputValue}
                onChange={handleChange}
                isDisabled={disabled}
            >
                {label && (
                    <Label className="text-sm font-medium text-grey-04">
                        {label}
                    </Label>
                )}

                {description && (
                    <Description className="text-xs text-grey-03">
                        {description}
                    </Description>
                )}

                <div className="flex flex-col gap-2">
                    {options.map((item) => (
                        <Checkbox
                            key={item.value}
                            value={item.value}
                            isDisabled={item.disabled}
                            className={" items-center gap-2 "}
                        >
                            <Checkbox.Control>
                                <Checkbox.Indicator />
                            </Checkbox.Control>

                            <Checkbox.Content>
                                {item.label && (
                                    <Label className="text-sm font-medium">
                                        {item.label}
                                    </Label>
                                )}

                                {item.description && (
                                    <Description className="text-xs mt-1 text-grey-04">
                                        {item.description}
                                    </Description>
                                )}
                            </Checkbox.Content>
                        </Checkbox>
                    ))}
                </div>
            </CheckboxGroup>

            {/* ERROR */}
            {hasError && (
                <div className="flex gap-1 items-center text-red-500">
                    <Danger size={18} color="#fb2c36" />

                    <p className="text-xs capitalize">{String(error)}</p>
                </div>
            )}
        </div>
    );
}
