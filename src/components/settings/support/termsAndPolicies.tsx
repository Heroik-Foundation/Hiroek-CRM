import { AiOutlineQuestionCircle } from "react-icons/ai"; 
import { FaCookie } from "react-icons/fa6";
import { FiArrowRightCircle } from "react-icons/fi";

export default function HelpAndSupport() {
    return (
        <div className=" max-w-175 w-full rounded-xl p-6 flex flex-col gap-6 border border-[#37137F26] bg-white " >
            <p className=" text-lg font-semibold " >Terms & Policies</p>
            <div className=" w-full flex h-19 px-5 justify-between border border-[#37137F26] rounded-xl items-center " >
                <div className=" flex gap-3 items-center " >
                    <div className=" w-9 h-9 rounded-full bg-[#37137F26] text-[#37137F] flex justify-center items-center " >
                        <AiOutlineQuestionCircle size={24} />
                    </div>
                    <div>
                        <p className=" font-semibold text-[#1E1E1E] " >Terms of service</p> 
                    </div>
                </div>
                <FiArrowRightCircle color="#37137F" size={24} />
            </div>
            <div className=" w-full flex h-19 px-5 justify-between border border-[#37137F26] rounded-xl items-center " >
                <div className=" flex gap-3 items-center " >
                    <div className=" w-9 h-9 rounded-full bg-[#37137F26] text-[#37137F] flex justify-center items-center " >
                        <AiOutlineQuestionCircle size={24} />
                    </div>
                    <div>
                        <p className=" font-semibold text-[#1E1E1E] " >Privacy Policy</p> 
                    </div>
                </div>
                <FiArrowRightCircle color="#37137F" size={24} />
            </div>
            <div className=" w-full flex h-19 px-5 justify-between border border-[#37137F26] rounded-xl items-center " >
                <div className=" flex gap-3 items-center " >
                    <div className=" w-9 h-9 rounded-full bg-[#37137F26] text-[#37137F] flex justify-center items-center " >
                        <FaCookie size={24} />
                    </div>
                    <div>
                        <p className=" font-semibold text-[#1E1E1E] " >Cookie Policy</p> 
                    </div>
                </div>
                <FiArrowRightCircle color="#37137F" size={24} />
            </div>
        </div>
    )
}