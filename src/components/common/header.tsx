

export default function Header(
    {
        title,
        body
    }: {
        title: string,
        body?: string
    }
) {
    return (
        <div className=" flex flex-col " >
            <p className=" lg:text-xl text-sm text-[#1E1E1E] font-bold " >{title}</p>
            <p className=" lg:text-sm text-xs text-[#1E1E1E] font-medium " >{body}</p>
        </div>
    )
}