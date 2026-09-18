import { FormikProvider } from "formik";
import useSettings from "../../hooks/settings/useSettings";
import { CustomButton, CustomField, FilePicker, FormikField } from "../ui"; 
import { useEffect } from "react";
import { useAtomValue } from "jotai";
import { userAtom } from "../../utils/atom/user";

export default function Account() {
    const { formik, isLoading } = useSettings(); 

    const user = useAtomValue(userAtom)

    useEffect(() => {
        if(!formik.values?.name){
            formik.setValues({
                ...formik.values,
                name: user?.name ?? "",
                address: user?.address ?? "",
                telephone: user?.telephone ?? "",
                bio: user?.bio ?? ""
            })
        }
    }, [user]) 

    return (
        <section className=" flex-1 ">
            <form onSubmit={formik.handleSubmit} className=" max-w-175 w-full bg-white rounded-2xl p-4 sm:p-6 flex flex-col gap-6 border border-gray-100 shadow-xs ">
                <p className=" font-semibold text-lg ">Account & Profile</p>
                <FormikProvider value={formik}>
                    <section className=" w-full flex flex-col gap-4 ">
                        <FilePicker preview={user?.logo} name={"logo"} />
                        <FormikField
                            name="name"
                            label="Company Name or Full Name"
                        /> 
                        <CustomField disabled value={user?.email} label="Email" /> 
                        <FormikField name="telephone" label="Phone Number" />
                        <FormikField name="address" label="Address/Location" />
                        <FormikField name="bio" label="Bio" as="textarea" /> 
                        <div className="flex flex-col gap-2 pt-1">
                            <p className="text-xs font-bold text-gray-900">Notification Preferences</p>
                            <label className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    defaultChecked
                                    className="w-4 h-4 rounded text-[#37137F] accent-[#37137F]"
                                />
                                <span>Email Notifications</span>
                            </label>
                            <label className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    defaultChecked
                                    className="w-4 h-4 rounded text-[#37137F] accent-[#37137F]"
                                />
                                <span>In-App Notifications</span>
                            </label>
                        </div>
                        <CustomButton type="submit" loading={isLoading} fullWidth>Save Changes</CustomButton>
                    </section>
                </FormikProvider>
            </form>
        </section>
    );
}
