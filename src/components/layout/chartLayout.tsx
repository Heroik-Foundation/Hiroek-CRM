

export default function ChartLayout(
    { children, title } : {
        children: React.ReactNode,
        title: string
    }
) {
    return(
        <div className=" w-full bg-white rounded-2xl flex flex-col gap-5 p-5 border border-[#37137F26] " >
            <p className=" font-semibold " >{title}</p>
            {children}
        </div>
    )
}