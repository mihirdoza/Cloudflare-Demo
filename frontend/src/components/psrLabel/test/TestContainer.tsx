import { sampleData1 } from "../sampleData/TestJson";
import Label from "../Label";
const PsrTestContainer = () => {
  return (
    <div className="psr-parent-container">
      <Label {...sampleData1} />
    </div>
  );
};

export default PsrTestContainer;
