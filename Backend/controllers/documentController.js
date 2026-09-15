import Document from  '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import {extractTextFromPDF} from '../utils/pdfParser.js';
import {chunkText} from '../utils/textChunker.js';
import {uploadBufferToCloudinary, deleteFromCloudinary} from '../utils/cloudinaryUpload.js';
import mongoose from 'mongoose';

/*
* @desc Upload pdf document
* @route POST/api/douments/upload
* @access Private
 */
export const uploadDocument=async (req,res,next)=>{
  let cloudinaryPublicId;
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
      return res.status(400).json({
        success:false,
        error:'Please provide document title',
        statusCode:404
      })
    }
    const uploadResult = await uploadBufferToCloudinary(
      req.file.buffer,
      `devq/${req.user._id}`,
      req.file.originalname
    );
    cloudinaryPublicId = uploadResult.public_id;

    // Create document 
    const document = await Document.create({
      userId:req.user._id,
      title,
      fileName: req.file.originalname,
      cloudinaryUrl: uploadResult.secure_url,
      cloudinaryPublicId: uploadResult.public_id,
      fileSize: req.file.size,
      status: 'processing'
    });

    // Process pdf in background 
    processPDF(document._id,req.file.buffer).catch(err=>{
      console.error('PDF processing error:',err);
    });

    res.status(201).json({
      success:true,
      data:document,
      message:'Document uploaded successfully.Processing in process...'
    });

  }catch(error){
    if(cloudinaryPublicId){
      await deleteFromCloudinary(cloudinaryPublicId).catch(()=>{});
    }
    next(error);
  }

};

// hepler function to process the pdf
const processPDF=async (documentId ,buffer)=>{
  try{
    const{text}=await extractTextFromPDF(buffer);
    // Create chunks
    const chunks=chunkText(text,500,50);

    // Update the document
    await Document.findByIdAndUpdate(documentId,{
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
          userId: new mongoose.Types.ObjectId(request.user._id)
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
          uploadDate: -1
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
      _id: request.params.id,
      userId: request.user._id
    });
    if(!document ){
      return response.status(404).json({
        success:false,
        error:'Document not found',
        statusCode:404
      });
    }

    // Get count of associated flashcards and quizzes
    const flashcardCount = await Flashcard.countDocuments({ documentId: document._id, userId: request.user._id });
    const quizCount = await Quiz.countDocuments({ documentId: document._id, userId: request.user._id });

    //Update last Accessed
    document.lastAccessed=Date.now();
    await document.save();

    // Combine document data with counts
    const documentData=document.toObject();
    documentData.flashcardCount=flashcardCount;
    documentData.quizCount=quizCount;

    response.status(200).json({
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

    await deleteFromCloudinary(document.cloudinaryPublicId).catch(()=>{});
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
