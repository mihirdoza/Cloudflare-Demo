import { IlistBoxControl } from "../interfaces/IlistBoxControl";
import { sampleData } from "../sampleData/TestListBoxControlData";
import { PsrListBoxControl } from "../PsrListBoxControl";

const TestContainer = () => {
  const handleValueChange: IlistBoxControl["handleValueChange"] = (
    newValue,
    name,
    isDefault
  ) => {
    console.log(
      `Value changed for ${name}: ${newValue} with Default?:${isDefault}`
    );
  };
  const combineObject = { ...sampleData, handleValueChange: handleValueChange };
  return (
    <div className="psr-parent-container flex p-1 border-1 border-solid mx-1">
      <div className="h-screen w-full">
        <PsrListBoxControl {...combineObject} />
      </div>
      <div></div>
    </div>
  );
};

export default TestContainer;
