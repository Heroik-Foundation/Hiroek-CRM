import { FormikProvider } from "formik";
import useSettings from "../../hooks/settings/useSettings";
import { FormikField, CustomButton } from "../ui";

export default function Security() {
    const { formik } = useSettings();

    return (
        <section className=" flex-1 ">
            <form className=" max-w-175 w-full bg-white rounded-2xl p-4 sm:p-6 flex flex-col gap-6 border border-gray-100 shadow-xs ">
                <p className=" font-semibold text-lg ">Login & Security</p>
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
                        </div>
                        <CustomButton fullWidth>Update Security Settings</CustomButton>
                    </section>
                </FormikProvider>
            </form>
        </section>
    );
}
