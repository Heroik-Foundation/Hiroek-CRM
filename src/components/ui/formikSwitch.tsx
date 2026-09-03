"use client";

import { Switch, Label } from "@heroui/react";
import {
    useField,
    useFormikContext,
    getIn,
} from "formik";
import { useEffect } from "react";

interface Props {
    name: string;
    label?: string;
    disabled?: boolean;
    className?: string;
    day?: string;
    other?: string
}

export default function FormikSwitch({
    name,
    label,
    disabled,
    className,
    day,
    other
}: Props) {
    const { errors, touched, setFieldValue } =
        useFormikContext<any>();

    const [field] = useField(name);

    const error = getIn(errors, name);
    const isTouched = getIn(touched, name);

    useEffect(()=> {
        if(other) {
            setFieldValue(other, day)
        }
    }, [field.value])

    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            <Switch
                isSelected={field.value}
                isDisabled={disabled}
                onChange={(value) =>
                    setFieldValue(name, value)
                }
            >
                <Switch.Control>
                    <Switch.Thumb />
                </Switch.Control>

                {label && (
                    <Switch.Content>
                        <Label className="text-sm">
                            {label}
                        </Label>
                    </Switch.Content>
                )}
            </Switch>

            {isTouched && error && (
                <p className="text-xs text-red-500">
                    {error}
                </p>
            )}
        </div>
    );
}