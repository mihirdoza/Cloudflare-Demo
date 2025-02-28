import { ItextControl } from "../interfaces/ItextControl";
import { sampleData } from "../sampleData/TestTextControlData"; //'../SampleDataset/TestTextControlData';
import { TextControl } from "../TextControl"; //'../Components/TextControl/TextControl';

const TestContainer = () => {
  const handleValueChange: ItextControl["handleValueChange"] = (
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
    <div className="psr-parent-container">
      <TextControl {...combineObject} />
    </div>
  );
};

export default TestContainer;
