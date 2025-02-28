// import { IactionLabel } from "../interfaces/IactionLabel";
import { sampleData, sampleData2 } from "../sampleData/TestActionLabel";
// import { sampleData2 } from "../sampleData/TestActionLabel";
import ActionLabel from "../ActionLabel";
import { IactionLabel } from "../interfaces/IactionLabel";

const TestContainer = () => {
  // Label Action can be Modified using below link.

  const handleMouse = (
    event: React.MouseEvent<Element>,
    actionCode?: string
  ) => {
    alert(`Mouse event From Parent:${event.type} ,data passed : ${actionCode}`);
  };
  const combinedProps: IactionLabel = { ...sampleData, handleMouse };

  const combinedProps2: IactionLabel = { ...sampleData2, handleMouse };

  return (
    <div className="psr-parent-container">
      <h4 className="psr-h4">Action Label With Image</h4>
      <ActionLabel {...combinedProps} />

      <br/><br/>      
      <h4 className="psr-h4">
        Below Acion Label is the example with props: selected: true,
        allowIcon:true, isSuccess:true
      </h4>
      <ActionLabel {...combinedProps2} />
    </div>
  );
};

export default TestContainer;
