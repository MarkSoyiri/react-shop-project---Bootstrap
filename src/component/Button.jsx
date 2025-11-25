import React from 'react'
import '../Custom.css'

function Button({onClick,name}) {
  return (
    <div>
     <button type="button"  onClick={onClick} className='customButton' >{name}</button>
    </div>
  )
}

export default Button




