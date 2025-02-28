
import { fnGetBaseURI } from './fnGetBaseURI';

//This function will return file path based on filename and folder name
export const fnGetFilePath = (fileName: string, folderName: string) => {
    var filePath = "";
    let get_base_path = fnGetBaseURI();
    if (!fileName?.length)
        return filePath;
    if (get_base_path && get_base_path.length > 0) {
        filePath = `${get_base_path.endsWith('/') ? get_base_path : `${get_base_path}/`}${folderName === "" ? "" : `${folderName}/`}${fileName}`;
    } else {
        filePath = `/assets/${folderName === "" ? "" : `${folderName}/`}${fileName}`;
    }
    return filePath;
}
