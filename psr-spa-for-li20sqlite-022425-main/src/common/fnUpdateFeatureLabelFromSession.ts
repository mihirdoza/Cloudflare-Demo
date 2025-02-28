
import { fnGetSessionVariableFromStorage } from "./fnGetSessionVariableFromStorage";

// this return update feature label from session
export const fnUpdateFeatureLabelFromSession = (featureData: any) => {
    const extractPlaceholder = (input: string): string | null => {
      const match = input.match(/\{([^}]+)\}/);
      return match ? match[1] : null;
    };
    const replacePlaceholder = (input: string, replacement: string): string => {
      return input.replace(/\{[^}]+\}/, replacement);
    };
    for (let index = 0; index < featureData.length; index++) {
      const element = featureData[index];
      if (element && element.Label && element.Label.includes("{")) {
        let extractedData = extractPlaceholder(element.Label);
        let sessionData = fnGetSessionVariableFromStorage("", extractedData?.replace("#", ""));
        if (sessionData && sessionData.length > 0) {
          let sessionValue = sessionData[0].SessionValue;
          element.Label = replacePlaceholder(element.Label, sessionValue);
        }
  
      }
  
    }
    return featureData;
  }
  
 