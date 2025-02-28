
import apJsonFileData from '../SampleDataset/apDataset.json'

//This function will read ap data and return the base path 
export const fnGetBaseURI = () => {
    let apJson: any = apJsonFileData;
    let apJsonData = apJson.filter((element: any) => {
        return element.GroupName === "Licensee"
            && element.SubGroupName === "deployment" && element._AP === "BasePath"
    });

    if (apJsonData && apJsonData.length === 1) {
        return apJsonData[0].Value;
    }
}