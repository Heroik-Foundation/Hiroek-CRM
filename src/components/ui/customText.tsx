import type { ElementType, ReactNode } from "react"; 
import { cn } from "../../lib/utils";

interface TextProps {
    children: ReactNode;
    type?: "display" | "display-sub" | "header" | "headertwo" | "subheader" | "content" | "xs";
    as?: ElementType;
    className?: string;
}

export default function Text({ children, type = "content", as, className }: TextProps) {
    const defaultElement =
        type === "display" ? "h2"
        : type === "display-sub" ? "h2"
        : type === "header" ? "h1"
        : type === "headertwo" ? "h2"
        : type === "subheader" ? "h2"
        : "p";

    const Element = as ?? defaultElement;

    const baseStyles =
        type === "display" ? "font-heading text-3xl font-normal leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-display"
        : type === "display-sub" ? "font-heading text-3xl font-light leading-[64.99px] tracking-tight sm:text-5xl md:text-[64px]"
        : type === "header" ? "font-heading text-2xl font-bold text-black"
        : type === "headertwo" ? "font-heading text-xl font-medium text-black"
        : type === "subheader" ? "font-heading text-sm font-medium text-grey-03"
        : type === "content" ? "text-sm text-grey-03"
        : type === "xs" ? "text-xs text-grey-03"
        : "text-grey-03";

    return <Element className={cn(baseStyles, className)}>{children}</Element>;
}