"use client";
import { InputOTP, Label } from "@heroui/react";
import { useField, useFormikContext } from "formik";
import { useEffect, useState } from "react";
import clsx from "clsx";

interface OTPInputProps {
  name: string;
  label?: string;
  description?: string;
  length?: number;
  error?: boolean;
  isLoading?: boolean;
}

function OTPInput({
  name,
  label,
  description,
  length = 6,
  error,
  isLoading
}: OTPInputProps) {
  const [field, meta, helpers] = useField<string>(name);

  const { setFieldTouched, submitForm } =
    useFormikContext();

    const [current, setCurrent] = useState("") 

  const [shake, setShake] = useState(false);

  const handleChange = (value: string) => {
    helpers.setValue(value);
    setFieldTouched(name, true);
  };

  /** ✅ Auto submit AFTER state update */
  useEffect(() => {
    if (
      field.value &&
      field.value.length === length &&
      current !== field.value
    ) {  

        submitForm();
        setCurrent(field.value) 

    }
  }, [field.value, length, submitForm, current]);

  /** 🔥 Shake on external error */
  useEffect(() => {
    if (error) {
      setShake(true);

      const timeout = setTimeout(() => {
        setShake(false);
        helpers.setValue(""); // clear after error
      }, 400);

      return () => clearTimeout(timeout);
    }
  }, [error, helpers]);

  return (
    <div className="flex w-fit flex-col gap-2">
      {/* Label */}
      <div className="flex flex-col gap-1">
        {label && (
          <Label className="text-sm font-medium text-grey-04">
            {label}
          </Label>
        )}
        {description && (
          <p className="text-sm text-muted">{description}</p>
        )}
      </div>

      {/* OTP Input */}
      <div
        className={clsx(
          "transition-all",
          shake && "animate-shake"
        )}
      >
        <InputOTP
          maxLength={length}
          value={field.value || ""}
          onChange={handleChange}
          autoFocus
          aria-label={label || "One-time password"}
        >
          <InputOTP.Group>
            {Array.from({ length: length / 2 }).map((_, i) => (
              <InputOTP.Slot className=" size-12 bg-gray-100 " key={i} index={i} />
            ))}
          </InputOTP.Group>

          <InputOTP.Separator />

          <InputOTP.Group>
            {Array.from({ length: length / 2 }).map((_, i) => (
              <InputOTP.Slot
               className=" size-12 bg-gray-100 "
                key={i + length / 2}
                index={i + length / 2}
              />
            ))}
          </InputOTP.Group>
        </InputOTP>
      </div>

      {/* Loading */}
      {isLoading && (
        <p className="text-xs text-muted text-center">
          Verifying code...
        </p>
      )}

      {/* Error */}
      {meta.touched && meta.error && (
        <p className="text-sm text-danger text-center">
          {meta.error}
        </p>
      )}
    </div>
  );
}

export default OTPInput;