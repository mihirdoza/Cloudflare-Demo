import { Ilabel } from "./interfaces/Ilabel";
import "./style/Style.css";

const Label = (labelProps: Ilabel) => {
  return (
    <label
      className={`psr-label ${
        labelProps?.styleClasses ? labelProps.styleClasses : ""
      }`}
      htmlFor={labelProps?.forHtml}
      key={labelProps.uniqueName}
      title={labelProps.tooltip}
    >
      {labelProps.label}
    </label>
  );
};

export default Label;
