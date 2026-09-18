

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
            <p className=" lg:text-xl text-sm font-bold " >{title}</p>
            <p className=" lg:text-sm text-xs font-medium " >{body}</p>
        </div>
    )
}