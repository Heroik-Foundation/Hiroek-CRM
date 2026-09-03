import { FormikProvider } from "formik";
import useSettings from "../../hooks/settings/useSettings";
import { FormikField, CustomButton } from "../ui";

export default function Security() {
    const { formik } = useSettings();

    return (
        <section className=" flex-1 ">
            <form className=" max-w-175 w-full bg-white rounded-xl p-6 flex flex-col gap-6 ">
                <p className=" font-semibold text-lg ">Account & Profile</p>
                <FormikProvider value={formik}>
                    <section className=" w-full flex flex-col gap-4 ">
                        <div className=" flex flex-col gap-2 ">
                            <p className=" font-medium ">Change Password</p>
                            <FormikField name="test" label="Current Password" />
                            <FormikField name="test" label="New Password" />
                            <FormikField name="test" label="Confirm Password" />
                        </div>
                        <div className=" flex flex-col gap-2 ">
                            <p className=" font-medium ">Change Email</p>
                            <FormikField
                                name="test"
                                label="Current Email"
                                placeholder="creator@aerionlabs.com"
                            />
                            <div className=" w-full flex flex-col gap-1 ">
                                <p className=" text-sm font-medium text-[#00000080] ">
                                    New Email
                                </p>
                                <div className=" w-full rounded-xl h-12 bg-[#FFD2D7] flex items-center px-3 ">
                                    <p className=" text-sm font-semibold text-[#E50004] ">
                                        PLEASE CONTACT SUPPORT
                                    </p>
                                </div>
                            </div>
                            <div className=" w-full flex flex-col gap-1 ">
                                <p className=" text-sm font-medium text-[#00000080] ">
                                    Two-factor Autthentication
                                </p>
                                <div className=" w-full rounded-xl bg-[#E50004] py-5 flex items-center justify-between px-4 text-white ">
                                    <div className=" flex-col gap-2 flex text-sm ">
                                        <p className=" font-semibold ">
                                            Two-factor authentication is
                                            disabled
                                        </p>

                                        <p className=" font-medium ">
                                            Add an extra layer of security to
                                            your account
                                        </p>
                                    </div>
                                    <button className=" px-5 h-12 rounded-2xl font-semibold text-xs bg-white text-[#37137F]  ">
                                        Enable
                                    </button>
                                </div>
                            </div>
                        </div>
                        <CustomButton fullWidth>Save Changes</CustomButton>
                    </section>
                </FormikProvider>
            </form>
        </section>
    );
}
