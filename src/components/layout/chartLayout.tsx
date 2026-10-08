

export default function ChartLayout(
    { children, title, action } : {
        children: React.ReactNode,
        title: string,
        action?: React.ReactNode
    }
) {
    return(
        <div className=" w-full bg-white rounded-2xl flex flex-col gap-5 p-5 border border-[#37137F26] " >
            <div className="w-full flex justify-between items-center">
                <p className=" font-bold text-base sm:text-lg text-black " >{title}</p>
                {action}
            </div>
            {children}
        </div>
    )
}