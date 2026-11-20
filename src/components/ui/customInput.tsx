import { FormikField } from "./FormikField";

interface CustomInputProps {
    label?: string;
    name: string;
    placeholder?: string;
    type?: string;
    textarea?: boolean;
    disabled?: boolean;
    className?: string;
}

export default function CustomInput({ textarea, ...props }: CustomInputProps) {
    return (
        <FormikField
            as={textarea ? "textarea" : "input"}
            {...props}
        />
    );
}
