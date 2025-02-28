    //  common fn for return value of selected filter attribute
    export const valueOfKey = (arr:Array<any>, selectedVal:String) => {
        console.log("vok", arr, selectedVal);
      
        // Find the index of selectedVal in arr
        const index = arr.findIndex((val) => val === selectedVal);
      
        return index !== -1 ? index : null; // Return index if found, else null
      };