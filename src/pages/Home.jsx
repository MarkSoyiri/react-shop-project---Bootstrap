import React from 'react'
import Button from '../component/Button'
import LoadingIndicator from '../component/LoadingIndicator'
import { useState } from 'react'
import Coverpage from '../component/Coverpage'

 
function Home({name,age,birth,database}) {

   const [loading,SetLoading] = useState(1);
 






 

    return (

        <>
        <Coverpage/>
       {/* <form  action="" method="post" > */}
        {/* <input type="text"  name="done"/> */}

        
        {  loading &&   <LoadingIndicator></LoadingIndicator>}
        <Button  />
        <Button  name={"Salamatu"}/>
       <div className="div" style={{fontSize:"120px"}}>
        {loading}
       </div>
        <Button  name={"Mariam"}/>
       {/* </form> */}
        {/* <MyDatabase database={message}/> */}



 <img src="/vite.svg" alt="dome" srcset="" />

        <h1>{name}</h1>
        <h1>{age}</h1>
        <h1>{birth}</h1>
        <div className="">
           
        </div>
        
        </>
    )
    
}

export default Home