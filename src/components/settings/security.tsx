import { FormikProvider } from "formik";
import useChangePassword from "../../hooks/settings/useChangePassword";
import useMembership from "../../hooks/useMembership";
import { FormikField, CustomButton } from "../ui";
import { LuKeyRound, LuShieldAlert, LuShieldCheck } from "react-icons/lu";

export default function Security() {
    const { formik, isLoading, canChangePassword } = useChangePassword();
    const { roleTag } = useMembership();

    return (
        <section className="flex-1">
            <div className="max-w-175 w-full bg-white rounded-2xl p-4 sm:p-6 flex flex-col gap-6 border border-gray-100 shadow-xs">
                <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#37137F] flex items-center justify-center shrink-0">
                            <LuKeyRound size={20} />
                        </div>
                        <div>
                            <p className="font-semibold text-lg text-gray-900 leading-tight">
                                Login & Security
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Manage your password and account credentials
                            </p>
                        </div>
                    </div>

                    <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <LuShieldCheck size={14} />
                        <span>Protected</span>
                    </span>
                </div>

                {!canChangePassword ? (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 text-xs leading-relaxed">
                        <LuShieldAlert size={18} className="text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-amber-900">
                                Restricted ({roleTag || "Member"} Role)
                            </p>
                            <p className="text-amber-700 mt-0.5">
                                Only account owners have permission to change the account password. Please contact your account owner to request credential updates.
                            </p>
                        </div>
                    </div>
                ) : null}

                <form onSubmit={formik.handleSubmit} className="w-full flex flex-col gap-5">
                    <FormikProvider value={formik}>
                        <div className="flex flex-col gap-3.5">
                            <p className="text-sm font-bold text-gray-900">Change Password</p>
                            <FormikField
                                name="currentPassword"
                                label="Current Password"
                                placeholder="Enter current password"
                                isPassword
                                disabled={isLoading || !canChangePassword}
                            />
                            <FormikField
                                name="newPassword"
                                label="New Password"
                                placeholder="Enter new password (min. 6 characters)"
                                isPassword
                                disabled={isLoading || !canChangePassword}
                            />
                            <FormikField
                                name="confirmPassword"
                                label="Confirm Password"
                                placeholder="Confirm new password"
                                isPassword
                                disabled={isLoading || !canChangePassword}
                            />
                        </div>

                        <div className="pt-2">
                            <CustomButton
                                type="submit"
                                variant="primary"
                                loading={isLoading}
                                disabled={isLoading || !canChangePassword}
                                className="w-full"
                            >
                                {isLoading ? "Updating Password..." : "Update Password"}
                            </CustomButton>
                        </div>
                    </FormikProvider>
                </form>
            </div>
        </section>
    );
}
