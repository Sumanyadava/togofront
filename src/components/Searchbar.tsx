import { useState } from 'react'
import { Button } from './ui/button'
import {shortTodoContainerAtom , ShortTodoContainer, LongTodoContainerAtom, LongTodoContainer} from '../state/state'
import { useAtom } from 'jotai'
import {db, auth} from '@/firebase'
import { collection, addDoc } from 'firebase/firestore'
import { toast } from 'sonner'



const Searchbar = () => {

  const [searchText, setSearchText] = useState('')
  const [, setShortContainers] = useAtom(shortTodoContainerAtom);
  const [, setLongContainers] = useAtom(LongTodoContainerAtom)


  const handleShortContainer = () => {
    if (searchText.trim()) {
      const newContainer: ShortTodoContainer = {
      id: Date.now(), 
      shortContainername: searchText,
      shortTodos: [], 
      completed: false,
      Notes: "",
      createdAt: new Date(),
      
      }


      // 1) Update Jotai locally for instant feedback
      setShortContainers(prev => [...prev,newContainer]);
      setSearchText('')
      
      // 2) Send to Firebase Cloud
      const userId = auth.currentUser?.uid;
      if (userId) {
        addDoc(collection(db, `users/${userId}/shortTodoContainers`), newContainer)
          .then(() => toast.success('Successfully saved to firebase!'))
          .catch(e => toast.error(e));
          
      } else {
        console.warn("User is not logged in, data wasn't saved to cloud");
      }
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

    const userId = auth.currentUser?.uid;
    if (userId) {
      addDoc(collection(db, `users/${userId}/longTodoContainers`), newContainer).then(() => toast.success('Successfully saved to firebase!'))
          .catch(e => toast.error(e));
    }
    }
  }
  return (
    <div className='border rounded-lg flex gap-2 p-2 focus-within:ring-2 focus-within:ring-white/20 transition-all md:w-[50%]'>
      <input
        type="text"
        name="containerName"
        id="containerName"
        className='bg-inherit focus:outline-none w-full'
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
        placeholder="Create new container..."
        aria-label="New container name"
      />
      <Button
        variant={"outline"}
        onClick={handleLongContainer}
        title="Add Long Container"
        aria-label="Add Long Container"
      >
        L
      </Button>
      <Button
        onClick={handleShortContainer}
        title="Add Short Container"
        aria-label="Add Short Container"
      >
        S
      </Button>
    </div>
  )
}

export default Searchbar
