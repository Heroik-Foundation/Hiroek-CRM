import { useState } from "react";
import { FormikProvider, useFormik } from "formik";
import * as Yup from "yup";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@heroui/react";
import httpService from "../../../config/httpService";
import { URLS } from "../../../utils/urls";
import { CustomButton, CustomInput } from "../../ui";
import { ModalLayout } from "../../layout";
import { FiArrowRightCircle, FiMail } from "react-icons/fi";

interface HelpAndSupportProps {
    type?: boolean | string;
}

interface GetInTouchFormValues {
    fullname: string;
    email: string;
    organizationName: string;
    message: string;
}

const initialValues: GetInTouchFormValues = {
    fullname: "",
    email: "",
    organizationName: "",
    message: "",
};

const validationSchema = Yup.object({
    fullname: Yup.string().trim().required("Full Name is required"),
    email: Yup.string()
        .trim()
        .email("Please enter a valid email address")
        .required("Email is required"),
    organizationName: Yup.string().trim().required("Phone number is required"),
    message: Yup.string().trim().required("Message is required"),
});

export default function HelpAndSupport({ }: HelpAndSupportProps) {
    const [open, setOpen] = useState(false);

    const { mutate: submitGetInTouch, isPending } = useMutation({
        mutationFn: async (payload: GetInTouchFormValues) => {
            const response = await httpService.post(URLS.GET_IN_TOUCH, payload);
            return response.data;
        },
        onSuccess: (data: any) => {
            toast.success(
                data?.message || "Message sent successfully! Our team will get back to you shortly."
            );
            formik.resetForm();
            setOpen(false);
        },
        onError: (err: any) => {
            const message =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                "Failed to send your message. Please try again.";
            toast.danger(message);
        },
    });

    const formik = useFormik<GetInTouchFormValues>({
        initialValues,
        validationSchema,
        onSubmit: (values) => {
            submitGetInTouch(values);
        },
    });

    return (
        <div className="max-w-175 w-full bg-white rounded-2xl p-5 sm:p-6 flex flex-col gap-6 border border-gray-100 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <p className="text-lg font-bold text-gray-900">Help & Support</p>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
                        Find answers or reach out to our team for assistance
                    </p>
                </div>

                {/* <div className="lg:w-[200px] w-full flex flex-col gap-2">
                    {!type && (
                        <CustomButton onClick={() => setOpen(true)}>
                            Visit Help Center
                        </CustomButton>
                    )}
                    {type && (
                        <CustomButton onClick={() => setOpen(true)} variant="outline">
                            Get Expert Support
                        </CustomButton>
                    )}
                </div> */}
            </div>

            <div className="w-full flex flex-col gap-3">
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="w-full flex p-4 px-5 justify-between border border-gray-200/80 hover:border-purple-300 hover:bg-purple-50/20 rounded-xl items-center transition-all duration-200 group cursor-pointer text-left"
                >
                    <div className="flex gap-3.5 items-center min-w-0">
                        <div className="w-10 h-10 rounded-full bg-[#37137F15] text-[#37137F] flex justify-center items-center shrink-0 group-hover:bg-[#37137F] group-hover:text-white transition-colors duration-200">
                            <FiMail size={20} />
                        </div>
                        <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-sm sm:text-base group-hover:text-[#37137F] transition-colors">
                                Contact Support
                            </p>
                            <p className="font-medium text-xs sm:text-sm text-gray-500 truncate">
                                Get in touch directly with our support team
                            </p>
                        </div>
                    </div>
                    <FiArrowRightCircle
                        className="text-[#37137F] shrink-0 group-hover:translate-x-0.5 transition-transform"
                        size={22}
                    />
                </button>
            </div>

            <FormikProvider value={formik}>
                <ModalLayout
                    isOpen={open}
                    onClose={() => setOpen(false)}
                    title="Get In Touch"
                >
                    <form
                        onSubmit={formik.handleSubmit}
                        className="w-full flex flex-col gap-4"
                    >
                        <CustomInput
                            label="Full Name"
                            name="fullname"
                            placeholder="Full Name"
                        />
                        <CustomInput
                            label="Email"
                            name="email"
                            placeholder="Email"
                        />
                        <CustomInput
                            label="Phone Number"
                            name="organizationName"
                            type="tel"
                            placeholder="Phone Number"
                        />
                        <CustomInput
                            label="Message"
                            textarea
                            name="message"
                            placeholder="Message"
                        />
                        <div className="mt-4 w-full">
                            <CustomButton
                                type="submit"
                                fullWidth
                                isLoading={isPending}
                            >
                                Submit
                            </CustomButton>
                        </div>
                    </form>
                </ModalLayout>
            </FormikProvider>
        </div>
    );
}
