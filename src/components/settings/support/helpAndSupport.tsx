import { AiOutlineQuestionCircle } from "react-icons/ai";
import { FiArrowRightCircle } from "react-icons/fi";

export default function HelpAndSupport() {
    const items = [
        {
            title: "Help Center",
            description: "Browse articles, tutorials & platform guides",
            icon: AiOutlineQuestionCircle,
            href: "https://www.hiroek.io",
            external: true,
        },
        // {
        //     title: "Contact Support",
        //     description: "Get in touch directly with our support team",
        //     icon: FiMail,
        //     href: "mailto:support@hiroek.io",
        //     external: false,
        // },
    ];

    return (
        <div className="max-w-175 w-full bg-white rounded-2xl p-5 sm:p-6 flex flex-col gap-5 border border-gray-100 shadow-xs">
            <div>
                <p className="text-lg font-bold text-gray-900">Help & Support</p>
                <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
                    Find answers or reach out to our team for assistance
                </p>
            </div>

            <div className="w-full flex flex-col gap-3">
                {items.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                        <a
                            key={idx}
                            href={item.href}
                            target={item.external ? "_blank" : undefined}
                            rel={item.external ? "noopener noreferrer" : undefined}
                            className="w-full flex p-4 px-5 justify-between border border-gray-200/80 hover:border-purple-300 hover:bg-purple-50/20 rounded-xl items-center transition-all duration-200 group cursor-pointer"
                        >
                            <div className="flex gap-3.5 items-center min-w-0">
                                <div className="w-10 h-10 rounded-full bg-[#37137F15] text-[#37137F] flex justify-center items-center shrink-0 group-hover:bg-[#37137F] group-hover:text-white transition-colors duration-200">
                                    <Icon size={20} />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-gray-900 text-sm sm:text-base group-hover:text-[#37137F] transition-colors">
                                        {item.title}
                                    </p>
                                    <p className="font-medium text-xs sm:text-sm text-gray-500 truncate">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                            <FiArrowRightCircle
                                className="text-[#37137F] shrink-0 group-hover:translate-x-0.5 transition-transform"
                                size={22}
                            />
                        </a>
                    );
                })}
            </div>
        </div>
    );
}