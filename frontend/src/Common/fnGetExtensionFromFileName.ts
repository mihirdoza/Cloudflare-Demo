
// This function returns file extension from name 
export function fnGetExtensionFromFileName(name: string) {
    if (name?.length > 0) {
        let arr = name.split(".");
        if (arr?.length > 0) {
            return name.split(".").pop();
        }
        else {
            return name;
        }
    }
    else {
        return name;
    }
}