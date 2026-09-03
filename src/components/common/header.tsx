

export default function Header(
    {
        title,
        body
    }:{
        title: string,
        body?: string
    }
) {
    return(
        <div className=" flex flex-col " >
            <p className=" text-xl font-bold " >{title}</p>
            <p className=" text-sm font-medium " >{body}</p>
        </div>
    )
}