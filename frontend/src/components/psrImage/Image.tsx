/*
"npm i react-svg" needed to run this component
*/
import { ReactSVG } from "react-svg";
import { Iimage } from "./interfaces/Iimage";
import { CheckImageSourceType } from "./common/CheckImageSourceType";
import { CreateDisplayUri } from "./common/CreateDisplayUri";
import "./style/Style.css";

const Image = (imageProps: Iimage) => {
  let sourceType = "";
  let encryptedUri = "";
  let imageType = imageProps.type ? imageProps.type : "svg";

  if (typeof imageProps.source == "string") {
    sourceType = CheckImageSourceType(imageProps.source);
    if (sourceType === "base64") {
      encryptedUri =
        sourceType === "base64"
          ? CreateDisplayUri(imageProps.source, imageProps.type)
          : "";
      imageType = imageProps.type ? imageProps.type : "png";
    } else if (sourceType == "svg") {
      // console.log("DoNothing");
      imageType = "svg";
    } else {
      const imageExtensionTemp = imageProps.source.split(".").pop();
      if (imageExtensionTemp != undefined && imageExtensionTemp.length > 2) {
        imageType = imageExtensionTemp;
      }
    }
  }

  // console.log("imageType", imageType);
  // console.log("sourceType", sourceType);

  if (typeof imageProps.source == "string") {
    return (
      <div
        key={imageProps.uniqueName}
        title={imageProps?.tooltip}
        className={`psr-image ${
          imageProps?.styleClasses ? imageProps.styleClasses : ""
        }`}
      >
        {/* sourceType: encrypted || uri || svg */}

        {/* for imageType:svg and sourceType:uri */}
        {imageType == "svg" && sourceType == "uri" ? (
          <ReactSVG
            fallback={() =>
              imageProps.altSource ? (
                <img src={imageProps.altSource} alt={imageProps.uniqueName} />
              ) : null
            }
            src={imageProps.source}
          />
        ) : null}

        {/* for imageType:svg and sourceType:svg */}
        {imageType == "svg" && sourceType == "svg" ? (
          <div dangerouslySetInnerHTML={{ __html: imageProps.source }} />
        ) : null}

        {/* for sourceType="base64" and Other */}
        {imageType != "svg" || (sourceType == "base64" && encryptedUri) ? (
          <img
            src={
              sourceType === "base64" && encryptedUri
                ? encryptedUri
                : imageProps.source
            }
            alt={imageProps?.uniqueName}
          />
        ) : null}
      </div>
    );
  } else {
    //object type
    return (
      <div
        className={`psr-image ${
          imageProps?.styleClasses ? imageProps.styleClasses : ""
        }`}
        key={imageProps.uniqueName}
        title={imageProps?.tooltip}
      >
        {imageProps.source}
      </div>
    );
  }
};

export default Image;
