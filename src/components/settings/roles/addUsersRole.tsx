import { Header } from "../../common";
import useRoles from "../../../hooks/settings/useRoles";
import { CustomButton, DateOfBirthField, FilePicker, FormikField } from "../../ui";
import { FormikProvider } from "formik";

export default function AddUsersRole() {
    const { formik, isLoading } = useRoles();
    return (
        <form
            onSubmit={formik.handleSubmit}
            className=" flex-1 rounded-2xl p-5 bg-white flex flex-col gap-6 max-w-125 "
        >
            <Header
                title="Add New User"
                body="Add & Manage team access and permissions"
            />
            <FormikProvider value={formik}>
                <section className=" w-full flex flex-col gap-4 ">
                    <FilePicker name={"photo"} />
                    <FormikField name="fullname" label="Full name" />
                    <FormikField name="email" label="Email" />
                    <FormikField name="phone" label="Phone Number" />
                    <DateOfBirthField name="birthDate" label="Date of Birth" />
                    <FormikField
                        as="select"
                        options={[
                            {
                                label: "Admin",
                                value: "admin",
                            },
                            {
                                label: "Viewer",
                                value: "viewer",
                            }
                        ]}
                        name="role"
                        label="Role"
                    />
                    <CustomButton fullWidth type="submit" loading={isLoading}>
                        Add New Member
                    </CustomButton>
                </section>
            </FormikProvider>
        </form>
    );
}
