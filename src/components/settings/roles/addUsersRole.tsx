import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FormikProvider } from "formik";
import { LuChevronLeft } from "react-icons/lu";
import useRoles from "../../../hooks/settings/useRoles";
import { CustomButton, DateOfBirthField, FilePicker, FormikField } from "../../ui";

export default function AddUsersRole() {
    const navigate = useNavigate();
    const { formik, isLoading, addTeamMember } = useRoles();

    // Default role to "admin" if not set yet (matches UI mockup)
    useEffect(() => {
        if (!formik.values.role) {
            formik.setFieldValue("role", "admin");
        }
    }, [formik]);

    // On successful addition, reset form and navigate back to team list
    useEffect(() => {
        if (addTeamMember.isSuccess) {
            formik.resetForm();
            addTeamMember.reset();
            navigate("/dashboard/settings?tab=permissions");
        }
    }, [addTeamMember.isSuccess, navigate]);

    // Clean up mutation state when leaving component
    useEffect(() => {
        return () => {
            addTeamMember.reset();
        };
    }, []);

    const role = formik.values.role || "admin";

    return (
        <form
            onSubmit={formik.handleSubmit}
            className="flex-1 rounded-2xl p-6 sm:p-7 bg-white flex flex-col gap-6 max-w-xl border border-gray-100 shadow-xs"
        >
            {/* Navigation Header */}
            <div className="flex items-center gap-3.5">
                <button
                    type="button"
                    onClick={() => navigate("/dashboard/settings?tab=permissions")}
                    className="w-10 h-10 rounded-xl bg-[#2E0F74] hover:bg-[#37137F] text-white flex items-center justify-center transition shrink-0 cursor-pointer"
                    aria-label="Back to Team Members"
                >
                    <LuChevronLeft size={22} />
                </button>
                <div className="flex flex-col">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                        Add New User
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
                        Add & Manage Team Access And Permissions
                    </p>
                </div>
            </div>

            <FormikProvider value={formik}>
                <section className="w-full flex flex-col gap-4">
                    {/* Avatar / Photo */}
                    <FilePicker name="photo" />

                    {/* Member Details */}
                    <FormikField
                        name="fullname"
                        label="Full Name"
                    />

                    <FormikField
                        name="phone"
                        label="Phone Number"
                        type="tel"
                    />

                    <FormikField
                        name="email"
                        label="Email"
                        type="email"
                    />

                    <DateOfBirthField
                        name="birthDate"
                        label="Date Of Birth"
                    />

                    {/* Select Access Type */}
                    <div className="flex flex-col gap-3 pt-1">
                        <label className="text-sm font-bold text-gray-900">
                            Select Access Type
                        </label>
                        <div className="flex flex-col gap-3.5">
                            <label
                                onClick={() => formik.setFieldValue("role", "admin")}
                                className="flex items-center gap-3 cursor-pointer select-none w-fit"
                            >
                                <div
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                        role === "admin"
                                            ? "border-[#2E0F74]"
                                            : "border-gray-400"
                                    }`}
                                >
                                    {role === "admin" && (
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#2E0F74]" />
                                    )}
                                </div>
                                <span className="text-sm font-semibold text-gray-900">
                                    Admin
                                </span>
                            </label>

                            <label
                                onClick={() => formik.setFieldValue("role", "viewer")}
                                className="flex items-center gap-3 cursor-pointer select-none w-fit"
                            >
                                <div
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                        role === "viewer"
                                            ? "border-[#2E0F74]"
                                            : "border-gray-400"
                                    }`}
                                >
                                    {role === "viewer" && (
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#2E0F74]" />
                                    )}
                                </div>
                                <span className="text-sm font-semibold text-gray-900">
                                    Viewer
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <CustomButton
                        type="submit"
                        loading={isLoading}
                        fullWidth
                        className="w-full h-12 bg-[#2E0F74] hover:bg-[#37137F] text-white font-semibold rounded-xl mt-3 transition"
                    >
                        Add New Member
                    </CustomButton>
                </section>
            </FormikProvider>
        </form>
    );
}
