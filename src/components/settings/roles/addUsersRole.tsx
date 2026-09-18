import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";
import { FormikProvider } from "formik";
import { Header } from "../../common";
import useRoles from "../../../hooks/settings/useRoles";
import { CustomButton, DateOfBirthField, FilePicker, FormikField } from "../../ui";

export default function AddUsersRole() {
    const navigate = useNavigate();
    const { formik, isLoading, addTeamMember } = useRoles();

    // Default role to "viewer" if not set yet
    useEffect(() => {
        if (!formik.values.role) {
            formik.setFieldValue("role", "viewer");
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

    return (
        <form
            onSubmit={formik.handleSubmit}
            className="flex-1 rounded-2xl p-6 sm:p-7 bg-white flex flex-col gap-6 max-w-xl border border-gray-100 shadow-xs"
        >
            {/* Navigation Header */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => navigate("/dashboard/settings?tab=permissions")}
                    className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition shrink-0"
                    aria-label="Back to Team Members"
                >
                    <BiArrowBack size={18} />
                </button>
                <Header
                    title="Add New Team Member"
                    body="Add a new member and configure their access permissions"
                />
            </div>

            <FormikProvider value={formik}>
                <section className="w-full flex flex-col gap-4">
                    {/* Avatar / Photo */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-700">
                            Profile Photo (Optional)
                        </label>
                        <FilePicker name="photo" />
                    </div>

                    {/* Member Details */}
                    <FormikField
                        name="fullname"
                        label="Full Name"
                        placeholder="e.g. Alex Johnson"
                    />

                    <FormikField
                        name="email"
                        label="Email Address"
                        type="email"
                        placeholder="e.g. alex@example.com"
                    />

                    <FormikField
                        name="phone"
                        label="Phone Number"
                        type="tel"
                        placeholder="e.g. +44 7123 456789"
                    />

                    <DateOfBirthField
                        name="birthDate"
                        label="Date of Birth"
                    />

                    <FormikField
                        as="select"
                        options={[
                            {
                                label: "Admin - Full management access",
                                value: "admin",
                            },
                            {
                                label: "Viewer - Read-only dashboard access",
                                value: "viewer",
                            },
                        ]}
                        name="role"
                        label="Assigned Role"
                    />

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 mt-2">
                        <button
                            type="button"
                            onClick={() => navigate("/dashboard/settings?tab=permissions")}
                            disabled={isLoading}
                            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <CustomButton
                            type="submit"
                            loading={isLoading}
                        >
                            Add Team Member
                        </CustomButton>
                    </div>
                </section>
            </FormikProvider>
        </form>
    );
}
