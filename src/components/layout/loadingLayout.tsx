"use client";

import React from "react";
import { Spinner } from "@heroui/react";
import clsx from "clsx";

interface LoaderProps {
    loading: boolean;
    text?: string;
    children?: React.ReactNode;
    length?: number | null;
}

export default function LoadingLayout({
    loading,
    text = "Please wait...",
    children,
    length,
}: LoaderProps) {
    return (
        <>
            {loading ? (
                <div
                    className={clsx(
                        "relative z-10",
                        "bg-white rounded-2xl px-6 py-10",
                        " h-full flex flex-col items-center gap-3",
                        " w-full ",
                    )}
                >
                    {/* Spinner */}
                    <Spinner size="lg" />

                    {/* Default text */}
                    {text && (
                        <p className="text-sm text-gray-600 text-center">
                            {text}
                        </p>
                    )}

                    {/* Custom content */}
                </div>
            ) : (
                <>
                    {length === 0 && (
                        <div className=" flex-1 flex flex-col justify-center items-center ">
                            <p className=" text-lg font-semibold text-black ">
                                No Record found
                            </p>
                            {/* <p className=" text-sm text-center text-gray-600 max-w-61 ">
                                Schedule one to connect with a provider.
                            </p>
                            <div className=" max-w-61 mt-2 ">
                                <CustomButton>
                                    Schedule a Consultation
                                </CustomButton>
                            </div> */}
                        </div>
                    )}
                    {length !== 0 && <>{children}</>}
                </>
            )}
        </>
    );
}
