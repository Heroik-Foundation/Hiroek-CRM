import { LoadingLayout } from "../../layout";
import { Header } from "../../common";
import { CustomButton } from "../../ui";
import { UserRolesCard } from "../../cards";
import { useNavigate } from "react-router-dom";
import useRoles from "../../../hooks/settings/useRoles";


export default function GetUsersRole() {
    const navigate = useNavigate();

    const { useGetUsersRoles } = useRoles();

    const { data } = useGetUsersRoles();

    console.log(data?.data);

    return (
        <LoadingLayout loading={false}>
            <section className=" flex-1 rounded-2xl p-5 bg-white flex flex-col gap-6 ">
                <div className=" w-full flex justify-between items-center ">
                    <Header
                        title="User Roles & Permissions"
                        body="Manage team access and permissions"
                    />
                    <CustomButton
                        onClick={() =>
                            navigate(
                                "/dashboard/settings?tab=permissions&action=add",
                            )
                        }
                    >
                        + Add Team Member
                    </CustomButton>
                </div>

                <div className=" w-full flex flex-col gap-3 ">
                    {data?.data?.map((item) => {
                        return <UserRolesCard key={item?._id} />;
                    })}
                </div>
            </section>
        </LoadingLayout>
    );
}
