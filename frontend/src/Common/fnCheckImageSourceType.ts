
// check the source type from source data 
export const fnCheckImageSourceType = (source: string) => {

    if (!source || typeof source !== "string") {
        return "invalid";
    }

    // Check for SVG content
    const isSVG = source.trim().includes("<svg") && source.trim().includes("</svg>");
    if (isSVG) {
        return "svg";
    }

    if (source.startsWith("/assets"))
        return "uri";

    // Check if it's a URI (local file or URL)
    try {
        const url = new URL(source);
        if (url.protocol === "http:" || url.protocol === "https:") {
            return "uri";
        }
    } catch (error: any) {
        console.log('error occured in URI generation :', error);
        // URL construction fails
    }

    // If it doesn't match SVG or URI, classify as encrypted
    return "encrypted";
}
