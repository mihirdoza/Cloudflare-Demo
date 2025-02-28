import EditTextControl from "../EditTextControl";
import { sampleData } from "../sampleData/TestEditTextControlData";
import { IeditTextControl } from "../interfaces/IeditTextControl";

const TestContainer = () => {
  const handleValueChange: IeditTextControl["handleValueChange"] = (
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
        <EditTextControl {...combineObject} />
      </div>
      <div></div>
    </div>
  );
};

export default TestContainer;
