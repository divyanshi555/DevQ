import { PDFParse } from 'pdf-parse';


/**
 * Extract text from PDF file
 * @param {Buffer} buffer - PDF file contents
 * @returns {Promise<{text:string , numPages:number}>}
 */
export const extractTextFromPDF = async (buffer) => {
  try {
    const parser = new PDFParse({ data: buffer });
    const data = await parser.getText();
    await parser.destroy();
    
    return {
      text: data.text,
      numPages: data.numPages,
      info: data.info
    };
  } catch (error) {
    console.error("PDF parsing error:", error);
    throw new Error("Failed to extract new PDF");
  }
};

export default extractTextFromPDF;