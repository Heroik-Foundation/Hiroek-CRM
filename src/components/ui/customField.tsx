"use client";

import {
    InputGroup,
    Label,
    TextField,
    Select,
    ListBox,
    TextArea,
} from "@heroui/react";
import { useState, type ReactNode } from "react";
import { Danger, Eye, EyeSlash, InfoCircle } from "iconsax-reactjs"; 
import { cn } from "../../lib/utils";

interface Option {
    label: string;
    value: string;
}

interface FieldProps<T = unknown> {
    label?: string;
    placeholder?: string;
    type?: string;
    as?: "input" | "textarea" | "select";
    options?: Option[];
    info?: string;

    multiple?: boolean;

    value?: T;
    onChange?: (value: T) => void;
    onBlur?: () => void;

    error?: string;
    touched?: boolean;

    prefix?: ReactNode;
    suffix?: ReactNode;
    disabled?: boolean;
    loading?: boolean;
    className?: string;
    inputGroupClassName?: string;
    inputClassName?: string;
    isPassword?: boolean;

    selectClassName?: string;
    selectTriggerClassName?: string;
    selectPopoverClassName?: string;
    selectIndicatorClassName?: string;
}

export default function Field<T = unknown>({
    label,
    placeholder,
    type = "text",
    as = "input",
    options = [],
    value,
    onChange,
    onBlur,
    prefix,
    suffix,
    disabled = false,
    loading = false,
    className,
    inputGroupClassName,
    inputClassName,
    isPassword,
    selectClassName,
    selectTriggerClassName,
    selectPopoverClassName,
    selectIndicatorClassName,
    info,
    multiple,
    error,
    touched,
}: FieldProps<T>) {
    const [showPassword, setShowPassword] = useState(false);

    const hasError = Boolean(error && touched);

    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    const inputValue = value ?? "";

    const accessibleLabel = label || placeholder || "Field";

    const handleChange = (val: unknown) => {
        onChange?.(val as T);
    };

    const getSelectedLabel = () => {
        if (!inputValue) return placeholder || "Select option";

        if (multiple && Array.isArray(inputValue)) {
            return options
                .filter((opt) => inputValue.includes(opt.value))
                .map((opt) => opt.label)
                .join(", ");
        }

        const selected = options.find(
            (opt) => String(opt.value) === String(inputValue),
        );

        return selected?.label || String(inputValue);
    };

    return (
        <div className={cn("w-full flex flex-col gap-1", className)}>
            {label && (
                <Label className="text-sm font-medium text-grey-04">
                    {label}
                </Label>
            )}

            {/* INPUT */}
            {as === "input" && (
                <TextField aria-label={accessibleLabel}>
                    <InputGroup
                        className={cn(
                            "bg-grey-01 rounded-lg p-px border h-fit border-[#CBCAD7BF]",
                            hasError && "border-red-500",
                            inputGroupClassName,
                        )}
                    >
                        {prefix && (
                            <InputGroup.Prefix>{prefix}</InputGroup.Prefix>
                        )}

                        <InputGroup.Input
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck={false}
                            aria-label={accessibleLabel}
                            value={String(inputValue)}
                            type={inputType}
                            placeholder={placeholder}
                            disabled={disabled || loading}
                            onChange={(e) => handleChange(e.target.value)}
                            onBlur={onBlur}
                            className={cn(
                                "w-full bg-grey-01 h-11 text-sm",
                                isPassword
                                    ? "rounded-l-lg"
                                    : "rounded-lg",
                                inputClassName,
                            )}
                        />

                        {loading ? (
                            <InputGroup.Suffix>
                                <span className="animate-spin text-gray-400 text-sm">
                                    ⏳
                                </span>
                            </InputGroup.Suffix>
                        ) : isPassword ? (
                            <InputGroup.Suffix>
                                <button
                                    type="button"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    className="h-[45px] w-full flex items-center justify-center"
                                    onClick={() =>
                                        setShowPassword((prev) => !prev)
                                    }
                                >
                                    {showPassword ? (
                                        <EyeSlash size="20" />
                                    ) : (
                                        <Eye size="20" />
                                    )}
                                </button>
                            </InputGroup.Suffix>
                        ) : (
                            suffix && (
                                <InputGroup.Suffix>{suffix}</InputGroup.Suffix>
                            )
                        )}
                    </InputGroup>
                </TextField>
            )}

            {/* TEXTAREA */}
            {as === "textarea" && (
                <TextArea
                    value={String(inputValue)}
                    onChange={(e) => handleChange(e.target.value)}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    aria-label={accessibleLabel}
                    disabled={disabled || loading}
                    className={cn(
                        "w-full h-[100px] bg-grey-01",
                        hasError && "border-red-500",
                    )}
                />
            )}

            {/* SINGLE SELECT */}
            {as === "select" && !multiple && (
                <Select
                    value={inputValue ? (inputValue as string) : undefined}
                    onChange={(key) => {
                        handleChange(key ? String(key) : "");
                        onBlur?.();
                    }}
                    placeholder={placeholder || "Select option"}
                    aria-label={accessibleLabel}
                    isDisabled={disabled || loading}
                    className={cn(
                        "rounded-md bg-greyone h-[40px]",
                        selectClassName,
                    )}
                >
                    <Select.Trigger
                        className={cn(
                            "rounded-md bg-greyone h-[40px]",
                            selectTriggerClassName,
                        )}
                    >
                        <Select.Value>
                            {inputValue ? getSelectedLabel() : null}
                        </Select.Value>

                        <Select.Indicator
                            className={selectIndicatorClassName}
                        />
                    </Select.Trigger>

                    <Select.Popover
                        className={cn("rounded-md", selectPopoverClassName)}
                    >
                        <ListBox>
                            {options.map((opt) => (
                                <ListBox.Item
                                    key={opt.value}
                                    id={opt.value}
                                    textValue={opt.label}
                                >
                                    {opt.label}
                                    <ListBox.ItemIndicator />
                                </ListBox.Item>
                            ))}
                        </ListBox>
                    </Select.Popover>
                </Select>
            )}

            {/* MULTIPLE SELECT */}
            {as === "select" && multiple && (
                <Select
                    selectionMode="multiple"
                    value={
                        Array.isArray(inputValue)
                            ? [...inputValue]
                            : undefined
                    }
                    onChange={(keys) => {
                        handleChange(keys as T);
                        onBlur?.();
                    }}
                    placeholder={placeholder || "Select option"}
                    aria-label={accessibleLabel}
                    isDisabled={disabled || loading}
                    className={cn(
                        "rounded-md bg-greyone h-[40px]",
                        selectClassName,
                    )}
                >
                    <Select.Trigger
                        className={cn(
                            "rounded-md bg-greyone h-[40px]",
                            selectTriggerClassName,
                        )}
                    >
                        <Select.Value>
                            {inputValue ? getSelectedLabel() : null}
                        </Select.Value>

                        <Select.Indicator
                            className={selectIndicatorClassName}
                        />
                    </Select.Trigger>

                    <Select.Popover
                        className={cn("rounded-md", selectPopoverClassName)}
                    >
                        <ListBox selectionMode="multiple">
                            {options.map((opt) => (
                                <ListBox.Item
                                    key={opt.value}
                                    id={opt.value}
                                    textValue={opt.label}
                                >
                                    {opt.label}
                                    <ListBox.ItemIndicator />
                                </ListBox.Item>
                            ))}
                        </ListBox>
                    </Select.Popover>
                </Select>
            )}

            {/* ERROR */}
            {hasError && (
                <div className="flex gap-1 items-center text-red-500">
                    <Danger size={18} color="#fb2c36" />
                    <p className="text-xs capitalize">{error}</p>
                </div>
            )}

            {/* INFO */}
            {info && !hasError && (
                <div className="flex gap-1 items-center text-grey-03">
                    <InfoCircle size={18} color="#A3A3A3" />
                    <p className="text-xs font-medium">{info}</p>
                </div>
            )}
        </div>
    );
}