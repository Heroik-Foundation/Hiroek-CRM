import { useEffect } from "react";
import useCurrentUser from "../../hooks/useUser";
import { Sidebar, Navbar } from "../common";
import { Outlet } from "react-router-dom";
import { useAtom } from "jotai";
import { userAtom } from "../../utils/atom/user";

export default function DashboardLayout() {
    const { useGetUsersData } = useCurrentUser();
    const { data } = useGetUsersData();
    const [_, setUser] = useAtom(userAtom);

    useEffect(() => {
        if (data?.eventPartner) {
            setUser(data.eventPartner);
        }
    }, [data, setUser]);

    return (
        <section className="w-full flex h-screen overflow-hidden">
            <section className="w-fit h-screen border-r border-r-[#00000026]">
                <div className="w-85">
                    <Sidebar />
                </div>
            </section>
            <section className="w-full flex h-screen overflow-auto flex-col relative">
                <div className="  sticky top-0 w-full h-fit " >
                    <Navbar />
                </div>
                <div className="flex bg-[#F5F3F9] flex-1 gap-3 flex-col p-6">
                    <Outlet />
                </div>
            </section>
        </section>
    );
}
