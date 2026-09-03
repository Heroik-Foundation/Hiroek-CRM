import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "../../components/common";
import { settingLink } from "../../utils/dataBank";
import { Account, CurrentPlan, Security, SelectPlan, AddUsersRole, GetUsersRole, HelpAndSupport, TermsAndPolicies, Messaging } from "../../components/settings";

export default function Settings() {
    const pathname = useLocation();
    const navigate = useNavigate();

    return (
        <>
            {pathname?.search !== "?tab=plan" && (
                <section className=" w-full flex flex-col gap-6 ">
                    <Header
                        title="Settings"
                        body="Manage your account, security, and preferences"
                    />
                    <div className=" w-full flex gap-4 ">
                        <div className=" w-fit " >

                            <div className=" w-75 p-3 h-fit bg-white rounded-lg ">
                                {settingLink.map((item) => {
                                    return (
                                        <button
                                            onClick={() => navigate(item?.link)}
                                            className={` ${item?.link?.includes(pathname.search) ? " bg-[#37137F26] " : ""} w-full px-4 h-12 flex gap-3 items-center rounded-md `}
                                        >
                                            <div className=" w-5 ">
                                                <item.icon size={20} />
                                            </div>
                                            <p
                                                className={` ${item?.link?.includes(pathname.search) ? " font-semibold " : ""} text-sm `}
                                            >
                                                {item?.name}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        {pathname?.search === "?tab=profile" && <Account />}
                        {pathname?.search === "?tab=security" && <Security />}
                        {pathname?.search === "?tab=subscriptions" && (
                            <CurrentPlan />
                        )}
                        {pathname?.search === "?tab=permissions" && (
                            <GetUsersRole />
                        )}
                        {pathname?.search === "?tab=permissions&action=add" && (
                            <AddUsersRole />
                        )}
                        {pathname?.search === "?tab=legal" && (
                            <div className=" w-full flex flex-col gap-4 " > 
                                <HelpAndSupport />
                                <TermsAndPolicies />
                            </div>
                        )}
                        {pathname?.search === "?tab=notifications" && (
                            <Messaging />
                        )}
                    </div>
                </section>
            )}
            {pathname?.search === "?tab=plan" && (
                <SelectPlan />
            )}
        </>
    );
}
