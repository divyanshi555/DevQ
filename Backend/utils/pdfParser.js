import { readFile } from 'fs';
import fs from 'fs/promises';
import {PDFParse} from 'pdf-parse';


/**
 * Extract text from PDF file
 * @param {string} filePath - path to pdf file 
 * @returns {Promise<{text:string , numPages:number}>}
 */
export const extractTextFromPDF = async (filePath) => {
  //pdf parser expects a Uint8Array not buffer
  try {
    const dataBuffer = readFile(filePath);
    const parser = new PDFParser(new Uint8Array(dataBuffer));
    
    const data = await parser.getText();
    
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