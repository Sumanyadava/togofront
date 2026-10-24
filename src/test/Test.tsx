import React, { useState } from 'react'

const Test = () => {

    let arr = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
        11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
        31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
        41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
        51, 52, 53, 54, 55, 56, 57, 58, 59, 60,
        61, 62, 63, 64, 65, 66, 67, 68, 69, 70,
        71, 72, 73, 74, 75, 76, 77, 78, 79, 80,
        81, 82, 83, 84, 85, 86, 87, 88, 89, 90,
        91, 92, 93, 94, 95, 96, 97, 98, 99, 100
    ];

    const [parts, setParts] = useState(8);
    const [pages, setPages] = useState(2);

    let lastIndex = pages * parts;
    let firstIndex = lastIndex - parts;

    function addpage() {
        setPages(pages + 1)
    }
    
    function subpage (){
        setPages(pages - 1)
    }
    return (
        <div>Test

            {
                arr && arr.slice(firstIndex,lastIndex).map((e) => (

                    <div className='m-2 bg-red-400'> hii{e} </div>
                ))


            }
            <button onClick={addpage}>click to add</button>
            <button onClick={subpage}>click to sub</button>


        </div>



    )
}

export default Test