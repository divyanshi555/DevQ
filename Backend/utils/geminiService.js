import dotenv from 'dotenv';
import {GoogleGenAI} from "@google/genai";
import { response } from 'express';

dotenv.config();

const ai = new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});

if(!process.env.GEMINI_API_KEY){
  console.error('FATAL ERROR: GEMINI_API_KEY is not set');
  process.exit(1);
}

/**
 * Generate flashcards from text
 * @param {string} Text - Document text
 * @param {number} count - Number of flashcards to generate
 * @returns {PromiseArrays<{question:string,answer:string,difficulty:string}>}
 */
export const generateFlashcards = async (Text,count=10)=>{
  const prompt = `Generate exactly ${count} educational flashcards from the following text.Format each flashcard as :
  Q: [Clear,specific question]
  A: [Concise,accurate answer]
  D: [Difficulty level : easy ,medium, or hard]
  
  Seperate each flashcard with "---"
  Text:
  ${Text.substring(0,15000)}`;

  try{
    const response = await ai.models.generateContent({
      model:"gemini-3.5-flash-lite",
      contents:prompt
    });

    const generateText= response.text;

    //Parse the response
    const flashcards=[];
    const cards = generateText.split('---').filter(c=>c.trim());

    for(const card of cards ){
      const lines = card.trim().split('\n');
      let question ='',answer='',difficulty='medium';

      for(const line of lines){
        if(line.startsWith('Q:')){
          question= line.substring(2).trim();
        }else if(line.startsWith('A:')){
          const diff = line.substring(2).trim().toLowerCase();
          if(['easy','medium','hard'].includes(diff)){
            difficulty=diff;
          }
        }
      }
      if(question && answer){
        flashcards.push({question,answer,difficulty});
      }
    }
    return flashcards.slice(0,count);
  }catch(error){
    console.error('Gemini API error',error);
    throw new Error('Failed to generate flashcards');
  }
};

/**
 * Generate quiz question
 * @param {string} Text - Document text
 * @param {number} numQuestions - Number of Questions
 * @returns {PromiseArrays<{question:string,options:Array,correctAnswer:string,explanation:string,difficulty:string}>}
 */
export const generateQuiz = async (text, numQuestions = 5) => {
  const prompt = `Generate exactly ${numQuestions} MCQs from the following text. Format each question as:
Q: [Question]
O1: [Option 1]
O2: [Option 2]
O3: [Option 3]
O4: [Option 4]
C: [Correct option - e.g., O1, O2, O3, or O4]
E: [Brief explanation]
D: [Difficulty: easy, medium, or hard]

Separate questions with "---"

Text:
${text.substring(0, 1500)}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt,
    });

    const generatedText = response.text;
    const questions = [];
    const questionBlocks = generatedText.split('---').filter((q) => q.trim());

    for (const block of questionBlocks) {
      const lines = block.trim().split('\n');
      let question = '';
      const options = [];
      let correctAnswer = '';
      let explanation = '';
      let difficulty = 'medium';

      for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith('Q:')) {
          question = trimmed.substring(2).trim();
        } else if (trimmed.match(/^O\d:/)) {
          options.push(trimmed.substring(3).trim());
        } else if (trimmed.startsWith('C:')) {
          correctAnswer = trimmed.substring(2).trim();
        } else if (trimmed.startsWith('E:')) {
          explanation = trimmed.substring(2).trim();
        } else if (trimmed.startsWith('D:')) {
          difficulty = trimmed.substring(2).trim().toLowerCase();

          const diff = trimmed.substring(2).trim().toLocaleLowerCase();

          if(['easy','medium','hard'].includes(diff)){
            difficulty=diff;
          }
        }
      }

      if (question && options.length === 4 && correctAnswer) {
        questions.push({
          question,
          options,
          correctAnswer,
          explanation,
          difficulty,
        });
      }
    }

    return questions.slice(0, numQuestions);
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to generate quiz');
  }
};



/**
 * Generate document summary
 * @param {string} Text - Document text
 * @returns {PromiseArrays<string>}
 */
export const generateSummary = async (text)=>{
  const prompt = `Provide a concise summary of the following text , highlighting the ky concepts,main ideas,and important points.Keep the summary clear and structured.'

  Text:
  ${text.substring(0,2000)}`;

  try{
    const response = await ai.models.generateContent({
      model:"gemini-3.5-flash-lite",
      contents:prompt
    });
    const generateText = response.text;
    return generateText

  }catch(error){
    console.error('Gemini API error:',error);
    throw new Error('Failed to generated summary');
  }
};


/**
 * Chat with document content 
 * @param {string} question - User question
 * @param {Array<Object>} chunks - Relevant document chunks
 * @returns {PromiseArrays<string>}
 */
export const chatWithContext = async (question,chunks)=>{
  const context = chunks.map((c,i)=>`[Chunk ${i+1}]\n ${c.content}`).join('\n\n');

  console.log("context____",context);

  const prompt = `Based on the following context from a document, Analyze tge context and answer the user's questions.If the answer is not in the context , say so.
  Context:${context}
  Question:${question}
  Answer:
  `;
  try{
    const response = await ai.models.generateContent({
      model : "gemini-3.5-flash-lite",
      contents: prompt,
    });
    const generateText = response.text;
    return generateText;

  }catch(error){
    console.error('Gemini API error:',error);
    throw new Error ('Failed to process chat request');
  }
};

/**
 * Explain a specific concept 
 * @param {string} concept - Concept to explain
 * @param {number} context - Relevant context
 * @returns {PromiseArrays<string>}
 */
export const explainConcept= async (concept,context)=>{
  const prompt = `Expalin the concept of "${concept}" based on the following context, include examples if relevant

  Context:
  ${context.substring(0,1000)}`;

  try{
    const resonse = await ai.models.generateContent({
      model:"gemini-3.5-flash-lite",
      contents:prompt,
    });
    const generateText=response.text;
    return generateText;
    
  }catch(error){
    console.error("Gemini API error",error);
    throw new Error ("Failed to explain concept");
  }
};