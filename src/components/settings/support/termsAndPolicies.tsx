import { LuFileText, LuShieldCheck } from "react-icons/lu";
// import { FaCookie } from "react-icons/fa6";
import { FiArrowRightCircle } from "react-icons/fi";

export default function TermsAndPolicies() {
    const policies = [
        {
            title: "Terms of Service",
            description: "Read our terms, conditions, and acceptable use policies",
            icon: LuFileText,
            href: "https://www.hiroek.io/pdf/TAndC.pdf",
        },
        {
            title: "Privacy Policy",
            description: "Learn how we collect, use, and protect your personal data",
            icon: LuShieldCheck,
            href: "https://www.hiroek.io/pdf/PAndP.pdf",
        },
        // {
        //     title: "Cookie Policy",
        //     description: "Understand our use of cookies and tracking technologies",
        //     icon: FaCookie,
        //     href: "https://www.hiroek.io/pdf/PAndP.pdf",
        // },
    ];

    return (
        <div className="max-w-175 w-full bg-white rounded-2xl p-5 sm:p-6 flex flex-col gap-5 border border-gray-100 shadow-xs">
            <div>
                <p className="text-lg font-bold text-gray-900">Terms & Policies</p>
                <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
                    Review our legal agreements and data privacy commitments
                </p>
            </div>

            <div className="w-full flex flex-col gap-3">
                {policies.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                        <a
                            key={idx}
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
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