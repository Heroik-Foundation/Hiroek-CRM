import { useFormik } from "formik";
import * as Yup from "yup";
import httpService from "../../config/httpService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { URLS } from "../../utils/urls";
import { toast } from "@heroui/react";
import useMembership from "../useMembership";

interface FormValues {
    bio: string;
    name: string;
    address: string;
    telephone: string;
    logo: string;
}

const initialValues: FormValues = {
    bio: "",
    name: "",
    address: "",
    telephone: "",
    logo: "",
};

const validationSchema = Yup.object({
    bio: Yup.string()
        .trim()
        .required("Bio is required")
        .min(10, "Bio must be at least 10 characters"),

    name: Yup.string()
        .trim()
        .required("Name is required")
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must not exceed 100 characters"),

    address: Yup.string()
        .trim()
        .required("Address is required")
        .min(5, "Address must be at least 5 characters")
        .max(200, "Address must not exceed 200 characters"),

    telephone: Yup.string()
        .trim()
        .required("Telephone number is required")
        .matches(
            /^\+?[0-9\s\-()]{7,20}$/,
            "Please enter a valid telephone number",
        ),
});

const useSettings = () => {
    const queryClient = useQueryClient();
    const { canUpdateUserInfo } = useMembership();

    /** 🔹 Update User Data */
    const editUserData = useMutation({
        mutationFn: (data: FormData) => {
            if (!canUpdateUserInfo) {
                throw new Error("Unauthorized: Only account owners can update user information.");
            }
            return httpService.patch(URLS.EDIT_USER, data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
        },
        onError: (err: any) => {
            toast.danger(err?.message || "Failed to update profile");
        },
        onSuccess: () => { 
            queryClient.invalidateQueries({ queryKey: [URLS.GET_USERS_DATA] });
            toast.success("Profile Updated");
        },
    });

    const formik = useFormik<FormValues>({
        initialValues,
        validationSchema,
        onSubmit: async (values) => {
            if (!canUpdateUserInfo) {
                toast.danger("Access denied: Only account owners can update user information.");
                return;
            }
            const formData = new FormData();

            formData.append("name", values.name);
            formData.append("bio", values.bio);
            formData.append("address", values.address);
            formData.append("telephone", values.telephone);

            if (values.logo) {
                formData.append("logo", values.logo);
            }
            editUserData.mutate(formData);
        },
    });

    const formikMessaging = useFormik({
        initialValues: {},
        // validationSchema: validationAppointmentSchema,
        onSubmit: () => {},
    });

    const isLoading = editUserData?.isPending;

    return {
        formik,
        formikMessaging,
        editUserData,
        isLoading,
    };
};

export { default as useChangePassword } from "./useChangePassword";
export default useSettings;
