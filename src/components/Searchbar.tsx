import React, { useState } from 'react'
import { Button } from './ui/button'
import {shortTodoContainerAtom , ShortTodoContainer, LongTodoContainerAtom, LongTodoContainer} from '.././state'
import { useAtom } from 'jotai'


const Searchbar = () => {

  const [searchText, setSearchText] = useState('')
  const [shortContainers, setShortContainers] = useAtom(shortTodoContainerAtom);
  const [LongContainers, setLongContainers] = useAtom(LongTodoContainerAtom)


  const handleShortContainer = () => {
    if (searchText.trim()) {
      const newContainer: ShortTodoContainer = {
        id: Date.now(), 
      shortContainername: searchText,
      shortTodos: [], 
      completed: false,
      }


      //update and reset
      setShortContainers(prev => [...prev,newContainer]);
      setSearchText('')
      
      
      
    }
    //old value because it render after a cycle useEffect to fix 
    // console.log(shortContainers);
    
  }

  const handleLongContainer = () => {
    if (searchText.trim()) {
    const newContainer: LongTodoContainer ={
      id: Date.now(),
      LongContainerName: searchText,
      LongTodo: [],
      completed: false
    }  

    setLongContainers(prev => [...prev,newContainer]);
    setSearchText("")
    }
  }
  return (
    <div className='border rounded-lg flex gap-2 p-2  md:w-[50%]'>
      <input type="text" name="" id="" className='bg-inherit focus:outline-none w-full' value={searchText} onChange={e => setSearchText(e.target.value)}/>
      <Button variant={"outline"} onClick={handleLongContainer}>L</Button>
      <Button onClick={handleShortContainer}>S</Button>
    </div>
  )
}

export default Searchbar
