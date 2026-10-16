import { useEffect } from "react";
import useCurrentUser from "../../hooks/useUser";
import { Sidebar, Navbar, Drawer } from "../common";
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
        <section className="w-full flex h-screen h-[100dvh] overflow-hidden bg-[#F5F3F9]">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-72 xl:w-85 h-full shrink-0 border-r border-[#00000026] bg-white">
                <Sidebar />
            </aside>

            {/* Main Area: Navbar Fixed at Top + Scrollable Content */}
            <div className="w-full flex-1 flex flex-col h-full min-w-0 min-h-0 overflow-hidden">
                {/* Navbar at top on both desktop & mobile */}
                <header className="w-full shrink-0 z-20 bg-white">
                    <Navbar />
                </header>

                {/* Page Content scrollable independently */}
                <main className="w-full flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 flex flex-col gap-4 sm:gap-6 bg-[#F5F3F9]">
                    <Outlet />
                </main>
            </div>

            <Drawer />
        </section>
    );
}
