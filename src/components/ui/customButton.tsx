import { Button } from "@heroui/react";
import clsx from "clsx";
import type { ComponentProps, ReactNode } from "react";

type HeroVariants = NonNullable<ComponentProps<typeof Button>["variant"]>;

type CustomVariants = HeroVariants | "primary" | "inactive";

interface AppButtonProps extends Omit<
    ComponentProps<typeof Button>,
    | "children"
    | "onPress"
    | "type"
    | "variant"
    | "size"
    | "className"
    | "startContent"
    | "endContent"
> {
    children: ReactNode;
    onPress?: () => void;
    type?: "button" | "submit" | "reset";
    variant?: CustomVariants;
    size?: "sm" | "md" | "lg";
    loading?: boolean;
    disabled?: boolean;
    className?: string;
    startContent?: ReactNode;
    endContent?: ReactNode;
    role?: string;
    "aria-label"?: string;
    "aria-selected"?: boolean;
}

export function AppButton({
    children,
    onPress,
    type = "button",
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    className,
    startContent,
    endContent,
    ...rest
}: AppButtonProps) {
    // ✅ Real HeroUI variants
    const heroVariants: HeroVariants[] = [
        "ghost",
        "outline",
        "secondary",
        "danger",
        "danger-soft",
        "tertiary",
    ];

    const isHeroVariant = heroVariants.includes(variant as HeroVariants);
    const isCustomPrimary = variant === "primary";

    // ✅ Custom styles
    const customClasses = clsx({
        "bg-[#37137F] text-white transition-all duration-200 hover:bg-grey-04 disabled:bg-grey-01 disabled:text-grey-02":
            variant === "primary",
        "border border-foreground bg-transparent text-foreground transition-all duration-300 ease-in-out hover:bg-grey-02 disabled:border-grey-02 disabled:text-grey-02 disabled:bg-transparent":
            variant === "outline",
        "border border-grey-02 bg-grey-01 text-grey-05! transition-all duration-300 ease-in-out hover:bg-grey-02 disabled:border-grey-02 disabled:text-grey-02 disabled:bg-transparent":
            variant === "inactive",
    });

    return (
        <Button
            type={type}
            onPress={onPress}
            isDisabled={disabled || loading}
            isPending={loading}
            variant={isHeroVariant ? (variant as HeroVariants) : "ghost"} // ✅ fallback
            size={size}
            {...rest}
            className={clsx(
                (isCustomPrimary || !isHeroVariant || variant === "outline") &&
                    customClasses, // apply for custom variants
                "h-11.25 rounded-lg ", // base styles
                className,
            )}
        >
            {loading && <>Loading...</>}
            {!loading && (
                <>
                    {startContent}
                    {children}
                    {endContent}
                </>
            )}
        </Button>
    );
}
