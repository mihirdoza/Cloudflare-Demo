import { IeditComboControl } from "../interfaces/IeditComboControl";
import { sampleData } from "../sampleData/TestEditComboControlData";
import { EditComboControl } from "../EditComboControl"; //'../Components/EditComboControl/EditComboControl';

const TestContainer = () => {
  const handleValueChange: IeditComboControl["handleValueChange"] = (
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
    <div className="psr-parent-container">
      <div className={`flex border-1 border-solid flex-row`}>
        <div className="sticky float-left">
          <EditComboControl {...combineObject} />
        </div>
        <div className="sticky float-left flex-grow min-h-100"></div>
      </div>
    </div>
  );
};

export default TestContainer;
