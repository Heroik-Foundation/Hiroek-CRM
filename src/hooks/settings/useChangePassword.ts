import { useFormik } from "formik";
import * as Yup from "yup";
import httpService from "../../config/httpService";
import { useMutation } from "@tanstack/react-query";
import { URLS } from "../../utils/urls";
import { toast } from "@heroui/react";
import useMembership from "../useMembership";

export interface ChangePasswordFormValues {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

const initialValues: ChangePasswordFormValues = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
};

const validationSchema = Yup.object({
    currentPassword: Yup.string()
        .required("Current password is required"),
    newPassword: Yup.string()
        .required("New password is required")
        .min(6, "New password must be at least 6 characters")
        .notOneOf(
            [Yup.ref("currentPassword")],
            "New password must be different from current password"
        ),
    confirmPassword: Yup.string()
        .required("Please confirm your new password")
        .oneOf([Yup.ref("newPassword")], "Passwords must match"),
});

export function useChangePassword() {
    const { canChangePassword } = useMembership();

    const changePasswordMutation = useMutation({
        mutationFn: async (payload: { currentPassword: string; newPassword: string }) => {
            if (!canChangePassword) {
                throw new Error("Unauthorized: Only account owners can change the account password.");
            }
            const res = await httpService.patch(URLS.CHANGE_PASSWORD, payload);
            return res.data;
        },
        onSuccess: (data: any) => {
            const message = data?.message || "Password updated successfully";
            toast.success(message);
        },
        onError: (err: any) => {
            const message =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                "Failed to update password. Please check your current password and try again.";
            toast.danger(message);
        },
    });

    const formik = useFormik<ChangePasswordFormValues>({
        initialValues,
        validationSchema,
        onSubmit: async (values, { resetForm }) => {
            if (!canChangePassword) {
                toast.danger("Access denied: Only account owners can change the account password.");
                return;
            }
            try {
                await changePasswordMutation.mutateAsync({
                    currentPassword: values.currentPassword,
                    newPassword: values.newPassword,
                });
                resetForm();
            } catch {
                // Handled in onError
            }
        },
    });

    return {
        formik,
        changePasswordMutation,
        isLoading: changePasswordMutation.isPending,
        canChangePassword,
    };
}

export default useChangePassword;
