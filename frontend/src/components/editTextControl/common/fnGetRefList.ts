import { fnProcessStringToCompare } from "./fnProcessStringToCompare";
import jsonData from "../sampleData/refTable.json";
import { IrefData, IrefTableData } from "../interfaces/RefData";

//This function read data from cache and if not found it will call API to get the data and return
export const fnGetRefList = async (refName: string) => {
  // let data = await getTableDataFromRedux("NZPG.Ref", false)

  const filterData: IrefData[] = [];
  if (jsonData) {
    const resultArray = await refName?.split(";");
    const notFoundInTable = [];
    for (let index = 0; index < resultArray.length; index++) {
      const element = resultArray[index];
      const filterObj = jsonData?.filter((item: IrefTableData) => {
        return (
          fnProcessStringToCompare(item.GroupName, "Reference List") &&
          fnProcessStringToCompare(item.SubGroupName, element)
        );
      });
      if (filterObj.length > 0) {
        const cleanArr: IrefData[] = [];
        for (let index = 0; index < filterObj.length; index++) {
          const element: IrefTableData = filterObj[index];
          cleanArr.push({
            Name: element.SubGroupName,
            Value: element.Name,
            Label: element.Label,
            SortOrder: element.SortOrder,
            Description: element.Description,
            EntID: element.EntID,
            RefValue: element.RefValue,
          });
        }
        filterData.push(...cleanArr);
      } else {
        notFoundInTable.push(element);
      }
    }
    if (filterData.length > 0) {
      // filterData.sort((a: any, b: any) => a.SortOrder > b.SortOrder ? 1 : -1)
      filterData.sort((a: IrefData, b: IrefData) =>
        a.SortOrder != undefined && b.SortOrder != undefined
          ? a.SortOrder > b.SortOrder
            ? 1
            : -1
          : 0
      );
    }
    if (notFoundInTable.length > 0) {
      //call api to get reflist data here
      // let stringNotFoundIntbl = notFoundInTable.join(';');
      //     await getRefList(stringNotFoundIntbl).then((resp: any) => {
      //         if (checkIsSuccess(resp) && resp.data && resp.data.jsonString?.length > 0) {
      //             let data = JSON.parse(resp.data.jsonString);
      //             if (data.length > 0) {
      //                 filterData.push(...data)
      //             }
      //         }
      //     })
    }

    return filterData;
  } else return filterData;
};
