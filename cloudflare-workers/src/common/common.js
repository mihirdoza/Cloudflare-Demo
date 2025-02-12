



// Split the keywords by spaces and escape single quotes for safety
export const HandleSearchWord=async(word)=>{
    const Sword = await word.trim().split(/\s+/).map((word) => word.replace(/'/g, "''"));
    return Sword ;
  }


  export function sanitize(value) {
    if (value === undefined || value === null) return "NULL"; // Use "NULL" for SQL
    if (typeof value === 'string') {
      return value.replace(/'/g, "''"); 
    }
    return value;
  }


  export class ErrorMessage extends Error{
    constructor(statusCode,message ){
      super(message)
      this.name="ErrMSG";
    }
  }