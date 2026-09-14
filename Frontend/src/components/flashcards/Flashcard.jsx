import {useState} from 'react'

const Flashcard = ({flashcard,onToggleStar}) => {
  
  const [isFlipped,setIsFlipped]=useState(false);
  const handleFlip=()=>{
    setIsFlipped(!isFlipped);
  }
  return (
    <div>
      
    </div>
  )
}

export default Flashcard
