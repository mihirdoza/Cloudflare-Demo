async function ReadFileAsBinary(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = () => reject(new Error("Error reading file"));
        reader.readAsArrayBuffer(file);
    });
}

  export default ReadFileAsBinary;