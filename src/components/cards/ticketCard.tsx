

export default function TicketCard() {
    return (
        <div className=" h-40.5 bg-white border border-[#37137F26] rounded-2xl p-5 flex flex-col justify-between w-full " >
            <div className=" w-full flex justify-between " >
                <div className="  w-11 h-11 bg-[#37137F] rounded-lg flex justify-center items-center " >

                </div> 
            </div>
            <div className=" flex flex-col " >
                <p className=" text-xs font-medium " >Total Tickets</p> 
                <p className=" text-sm font-semibold " >3,600</p>
            </div>
        </div>
    );
}
