import { IactionLabel } from "../interfaces/IactionLabel";
export const sampleData: IactionLabel = {
  uniqueName: "AL-1",
  label: { // Label properties
    uniqueName: "atnLblK1",
    label: "Submit",
    tooltip: "Click to submit the form",
  },
  image:{
    uniqueName:"atnImgK1",
    source:"https://cdn-icons-png.flaticon.com/128/3449/3449752.png",
  },
  tabIndex:0,
  actionCode: "actionCode1", // Action code to handle event
  selected: false, // to set it selected
  align: "center", // Alignment of the component (e.g., center, left, right)
  imageAlign:"start",
  styleClasses:"border-1 border-solid",
  handleMouse: (
    event: React.MouseEvent<Element>,
    actionCode?: string
  ) => {
    console.log("handleMouse", event, actionCode);
  },
  tooltip: "This is test",
  // allowIcon:true,
  // isSuccess:true,
};

export const sampleData2: IactionLabel = {
  uniqueName: "AL-2",
  label: { // Label properties
    uniqueName: "atnLblK2",
    label: "Submit Two",
    tooltip: "Click to submit the form",
  },
  tabIndex:0,
  actionCode: "actionCode2", // Action code to handle event
  selected: true, // to set it selected
  align: "start", // Alignment of the component (e.g., center, left, right)  
  imageAlign:"start",
  handleMouse: (
    event: React.MouseEvent<Element>,
    actionCode?: string
  ) => {
    console.log("handleMouse", event, actionCode);
    alert(`"Mouse event from props :${event.type} ,data passed : ${actionCode}`);
  },
  tooltip: "This is test",
  allowIcon:true,
  isSuccess:true,
};
