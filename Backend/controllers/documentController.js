import Document from  '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import {extractTextFromPDF} from '../utils/pdfParser.js';
import {chunkText} from '../utils/textChunker.js';
import fs from 'fs/promises';
import mongoose from 'mongoose';

/*
* @desc Upload pdf document
* @route POST/api/douments/upload
* @access Private
 */
export const uploadDocument=async (req,res,next)=>{
  try{
    if(!req.file){
      return res.status(400).json({
        success:false,
        error:'Please upload a PDF file',
        statusCode:404
      });
    }
    const {title}=req.body;
    if(!title){
      // If no title provided delete the upload file
      await fs.unlink(req.file.path);
      return res.status(400).json({
        success:false,
        error:'Please provide document title',
        statusCode:404
      })
    }
    // Construct the URL of the uploaded file
    const baseUrl=`http://localhost:$(process.env.PORT||8000)`;
    const fileUrl = `${baseUrl}/uploads/documents/${req.file.filename}`;

    // Create document 
    const document = await Document.create({
      userId:req.user._id,
      title,
      filename: req.file.originalname,
      filePath: fileUrl,
      fileSize: req.file.szie,
      status: 'processing'
    });

    // Process pdf in background 
    processPDF(document._id,req.file.path).catch(err=>{
      console.error('PDF processing error:',err);
    });

    res.status(201).json({
      success:true,
      data:document,
      message:'Document uploaded successfully.Processing in process...'
    });

  }catch(error){
    // Clean up file on error 
    if(req.file){
      await fs.unlink(req.file.path).catch(()=>{});
    }
    next(error);
  }

};

// hepler function to process the pdf
const processPDF=async (documentId ,filePath)=>{
  try{
    const{text}=await extractTextFromPDF(filePath);
    // Create chunks
    const chunks=chunkText(text,500,50);

    // Update the document
    await Document.findOneAndUpdate(documentId,{
      extractedText:text,
      chunks:chunks,
      status:'ready'
    });

    console.log(`Document ${documentId} processed successfully`);
  }catch(error){
    console.error(`Error processing document ${documentId}:`,error);

    await Document.findByIdAndUpdate(documentId,{
      status:'failed'
    });
  }
};


/*
* @desc Get all user documents
* @route GET/api/documents
* @access Private
 */
export const getDocuments = async (request, response, next) => {
  try {
    const documents = await Document.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(request.user_id)
        }
      },
      {
        $lookup: {
          from: 'flashcards',
          localField: '_id',
          foreignField: 'documentId',
          as: 'flashcardSets'
        }
      },
      {
        $lookup: {
          from: 'quizzes',
          localField: '_id',
          foreignField: 'documentId',
          as: 'quizzes'
        }
      },
      {
        $addFields: {
          flashcardCount: { $size: '$flashcardSets' },
          quizCount: { $size: '$quizzes' }
        }
      },
      {
        $project: {
          extractedText: 0,
          chunks: 0,
          flashcards: 0,
          quizzes: 0
        }
      },
      {
        $sort: {
          uploadDocument: -1
        }
      }
    ]);

    response.status(200).json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    next(error);
  }
};

/*
* @desc Get single document with chunks
* @route GET/api/documents/:id
* @access Private
 */
export const getDocument = async (request, response, next) => {
  try{
    const document = await Document.findOne({
      _id:req.params.id,
      userId:req.user._id
    });
    if(!document ){
      return res.status(404).json({
        success:false,
        error:'Document not found',
        statusCode:404
      });
    }

    // Get count of associated flashcards and quizzes
    const flashcardCount =await Flashcard.countDocuments({documentId:document._id,userId:req.user._id});
    const quizCount =await Quiz.countDocuments({documentId:document._id,userId:req.user._id});

    //Update last Accessed
    document.lastAccessed=Date.now();
    await document.save();

    // Combine document data with counts
    const documentData=document.toObject();
    documentData.flashcardCount=flashcardCount;
    documentData.quizCount=quizCount;

    res.status(200).json({
      success:true,
      data:documentData
    });
  }
  catch(error){
    next(error);
  }
};

/*
* @desc delete document
* @route DELETE/api/documents/:id
* @access Private
 */
export const deleteDocument = async (req,res,next)=>{
  try{
    const document=await Document.findOne({
      _id:req.params.id,
      userId:req.user._id
    })

    if(!document){
      return res.status(404).json({
        success:false,
        error:'Document not found',
        statusCode:404
      });
    }

    // Delete file from filesystem
    await fs.unlink(document.filePath).catch(()=>{});
    // Delete document
    await document.deleteOne();

    res.status(200).json({
      success:true,
      message:'Document deleted successfully'
    });
    
  }catch(error){
    next(error);
  }
};
