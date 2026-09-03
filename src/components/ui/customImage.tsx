import React, { useState, useCallback, useEffect, useRef } from "react";
// import { ModalLayout } from "../layouts";

type ImgSrc = string;

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: ImgSrc;
    alt: string;
    fallbackSrc?: ImgSrc;
    fillContainer?: boolean;
    aspectRatio?: number;
    overlay?: boolean;
    disablePreview?: boolean;
    className?: string;
    imageClassName?: string;
    priority?: boolean;
    onError?: () => void;
    lazyLoad?: boolean;
    threshold?: number;
}

const DEFAULT_FALLBACK = "/images/fallback.png";

export default function CustomImage({
    src,
    alt,
    fallbackSrc = DEFAULT_FALLBACK,
    fillContainer = false,
    aspectRatio,
    overlay = false,
    disablePreview = false,
    className = "",
    imageClassName = "",
    priority = false,
    onError,
    width,
    height,
    style,
    loading: loadingProp,
    lazyLoad = true,
    threshold = 0.1,
    ...rest
}: Props) {
    const [imgSrc, setImgSrc] = useState<ImgSrc>(src);
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(priority);
    const [previewSrc, setPreviewSrc] = useState<ImgSrc | null>(null);

    const imgRef = useRef<HTMLDivElement>(null);

    console.log(previewSrc);


    // Intersection Observer for lazy loading
    useEffect(() => {
        if (priority || !lazyLoad) {
            setIsVisible(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, [priority, lazyLoad, threshold]);

    // Reset state when src changes
    useEffect(() => {
        setImgSrc(src);
        setIsError(false);
        setIsLoading(true);
    }, [src]);

    const handleError = useCallback(() => {
        if (!isError && imgSrc !== fallbackSrc) {
            setImgSrc(fallbackSrc);
            setIsError(true);
            setIsLoading(false);
            onError?.();
        }
    }, [imgSrc, fallbackSrc, isError, onError]);

    const handleLoad = useCallback(() => {
        setIsLoading(false);
    }, []);

    const openPreview = useCallback(() => {
        if (!disablePreview && imgSrc) {
            setPreviewSrc(imgSrc);
        }
    }, [disablePreview, imgSrc]);

    const closePreview = useCallback(() => {
        setPreviewSrc(null);
    }, []);

    const renderOverlay = useCallback(() => {
        if (!overlay) return null;
        return (
            <div
                className="absolute inset-0 bg-black/40 rounded-lg pointer-events-none"
                aria-hidden="true"
            />
        );
    }, [overlay]);

    const renderLoadingSkeleton = useCallback(() => {
        if (!isLoading) return null;
        return (
            <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
        );
    }, [isLoading]);

    const imageProps = {
        src: isVisible ? imgSrc : undefined,
        alt,
        onError: handleError,
        onLoad: handleLoad,
        loading: priority ? "eager" : (loadingProp || "lazy"),
        className: imageClassName || "w-full h-full object-cover",
        ...rest,
    };

    const renderImage = () => (
        <img
            {...imageProps}
            width={width}
            height={height}
            className={imageClassName}
        />
    );

    // FILL MODE
    if (fillContainer) {
        return (
            <>
                <div
                    ref={imgRef}
                    onClick={openPreview}
                    className={`relative w-full h-full cursor-pointer ${className}`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && openPreview()}
                    onKeyUp={(e) => e.key === "Escape" && closePreview()}
                    aria-label={`Preview ${alt}`}
                    style={style}
                >
                    {renderLoadingSkeleton()}
                    {isVisible && renderImage()}
                    {renderOverlay()}
                </div>
            </>
        );
    }

    // ASPECT RATIO MODE
    if (aspectRatio) {
        const paddingTop = `${(1 / aspectRatio) * 100}%`;

        return (
            <>
                <div
                    ref={imgRef}
                    onClick={openPreview}
                    className={`relative w-full cursor-pointer ${className}`}
                    style={{ paddingTop, ...style }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && openPreview()}
                    onKeyUp={(e) => e.key === "Escape" && closePreview()}
                    aria-label={`Preview ${alt}`}
                >
                    <div className="absolute inset-0">
                        {renderLoadingSkeleton()}
                        {isVisible && (
                            <img
                                {...imageProps}
                                className={imageClassName || "w-full h-full object-cover"}
                            />
                        )}
                        {renderOverlay()}
                    </div>
                </div>
            </>
        );
    }

    // DEFAULT MODE
    return (
        <>
            <div
                ref={imgRef}
                onClick={openPreview}
                className={`relative w-fit cursor-pointer ${className}`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && openPreview()}
                onKeyUp={(e) => e.key === "Escape" && closePreview()}
                aria-label={`Preview ${alt}`}
                style={style}
            >
                {renderLoadingSkeleton()}
                {isVisible && renderImage()}
                {renderOverlay()}
            </div>
        </>
    );
}

CustomImage.displayName = "CustomImage";