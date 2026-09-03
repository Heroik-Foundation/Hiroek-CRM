import { FormikProvider } from "formik";
import useSettings from "../../hooks/settings/useSettings";
import { Header } from "../common";
import { CustomButton, FormikField } from "../ui";

export default function Messaging() {
    const { formikMessaging } = useSettings();

    return (
        <FormikProvider value={formikMessaging}>
            <section className=" flex-1 rounded-2xl text-[#1E1E1E] p-5 bg-white flex flex-col gap-6 ">
                <div className=" w-full flex justify-between items-center ">
                    <Header
                        title="Send New Message"
                        body="Send Mass Notifications, In-app Messages or Email."
                    />
                </div>
                <p className=" text-sm font-semibold ">Select Messsage Type</p>
                <div className=" w-full flex flex-col gap-4 ">
                    <FormikField name="title" label="Message Title" />
                    <FormikField
                        as="textarea"
                        name="title"
                        label="Message Body"
                    />
                    <div className=" flex w-full flex-col gap-1 ">
                        <p className=" text-sm font-semibold " >Select Recipients</p>
                        <button className=" w-full h-16 rounded-xl border border-[#CBCAD7] px-5 flex items-center justify-between  ">
                            <p className=" text-sm font-semibold " >0 Recipients Selected</p>
                        </button>
                    </div>
                    <CustomButton fullWidth >Send Message</CustomButton>
                </div>
            </section>
        </FormikProvider>
    );
}
