
import { APP } from "../Interfaces/Defaults";

export const fnGetImagePath = (imageName: string, folderName: string) => {
    var imagePath = "";
    if (APP && APP.IMAGE_BASE_PATH && imageName) {
        imagePath = `${APP.IMAGE_BASE_PATH}${folderName === "" ? "" : `${folderName}/`}${imageName}`;
    } else {
        imagePath = `${APP.IMAGE_BASE_PATH}misc/Default_128x128.svg`;
    }
    return imagePath;
}