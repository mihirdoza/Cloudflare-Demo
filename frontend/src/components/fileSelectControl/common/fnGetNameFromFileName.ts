
// This function returns the Name from File name 
export function fnGetNameFromFileName(name: string) {
    if (name?.length > 0) {
        let arr = name.split(".");
        if (arr?.length > 0) {
            arr.pop();
            return arr.join('.');
        }
        else {
            return name;
        }
    }
    else {
        return name;
    }
}