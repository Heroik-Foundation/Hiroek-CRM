import { BiTrash } from "react-icons/bi";
import { CustomButton } from "../ui";

export default function UserRolesCard() {
    return (
        <div className=" w-full h-full border border-[#37137F26] rounded-xl px-5 py-4 flex justify-between items-center gap-4 ">
            <div className=" flex items-center gap-3 ">
                <div className=" w-20 h-20 bg-[#37137F26] rounded-full "></div>
                <div className=" flex flex-col gap-2 ">
                    <p className=" text-sm font-semibold ">Dumo Charles</p>
                    <p className=" text-sm font-medium text-gray-500 ">
                    dumocharles@email.com
                    </p>
                    <p className=" text-xs font-medium text-gray-500 ">Full Access</p>
                </div>
            </div>
            <div className=" flex items-center gap-2 " > 
                <CustomButton>
                    Creator
                </CustomButton>
                <CustomButton>
                    Send Scanner
                </CustomButton>
                <CustomButton variant="outline" >
                    Viewer
                </CustomButton>
                <button className=" w-10 h-10 bg-[#37137F26] flex justify-center items-center text-red-500 rounded-full " >
                    <BiTrash size={20} />
                </button>
            </div>
            {/* <ModalLayout>

            </ModalLayout> */}
        </div>
    );
}
