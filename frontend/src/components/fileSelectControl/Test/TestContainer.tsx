import { IfileSelectControl } from "../interfaces/IfileSelectControl";
import { sampleData } from "../sampleData/TestFileSelectControlData";
import { FileSelectControl } from "../FileSelectControl";

const TestContainer = () => {
  const handleValueChange: IfileSelectControl["handleValueChange"] = (
    newValue,
    name,
    isDefault
  ) => {
    console.log(
      `Value changed for ${name}:`,
      newValue,
      "Default status:",
      isDefault
    );
  };
  const combineObject = { ...sampleData, handleValueChange: handleValueChange };
  return (
    <div className="h-screen w-full flex p-1 border-1 border-solid mx-1">
      <div className="h-screen w-full">
        <FileSelectControl {...combineObject} />
      </div>
      <div></div>
    </div>
  );
};

export default TestContainer;
