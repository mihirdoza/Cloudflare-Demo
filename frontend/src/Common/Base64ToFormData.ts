
const Base64ToFormData = (response: {
  extension: string;
  fileContentBlob: string;
  fileName: string;
  fullName: string;
}): FormData => {
  
    const { fileContentBlob, fileName, extension, fullName } = response;

    // Define MIME type based on the extension (you can expand this map as needed)
    console.log("dat",fileContentBlob, fileName, extension, fullName)
    const mimeTypes: Record<string, string> = {
      json: "application/json",
      txt: "text/plain",
      csv: "text/csv",
      xml: "application/xml",
    };
    const contentType = mimeTypes[extension] || "application/octet-stream";

    // Decode Base64 content
    const decodedData = atob(fileContentBlob);

    // Convert decoded string to a Uint8Array
    const uint8Array = new Uint8Array(decodedData.length);
    for (let i = 0; i < decodedData.length; i++) {
      uint8Array[i] = decodedData.charCodeAt(i);
    }

    // Create a Blob object
    const blob = new Blob([uint8Array], { type: contentType });

    // Create FormData and append the file
    const formData = new FormData();
    formData.append("file", blob, fullName || fileName);
console.log(formData)
    return formData;
  };
  

  export default Base64ToFormData