import { useState } from "react";

import { sampleData } from "../sampleData/Test"; //'../SampleDataset/Test';
import ConfirmYesNo from "../ConfirmYesNo"; //'../Components/ConfirmYesNo/ConfirmYesNo';

const TestContainer = () => {
  // State to store the window size
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const handelYesButtonClick = () => {
    setIsOpen(false);
    alert("yes button click");
  };
  const handelNoButtonClick = () => {
    setIsOpen(false);
    alert("No button click");
  };
  return (
    <div className="psr-parent-container">
      <button className="cursor-pointer border-1 p-1 rounded-sm" onClick={() => setIsOpen(true)}>Open</button>
      <ConfirmYesNo
        isOpen={isOpen}
        {...sampleData}
        handelYesButtonClick={handelYesButtonClick}
        handelNoButtonClick={handelNoButtonClick}
      />
    </div>
  );
};

export default TestContainer;
