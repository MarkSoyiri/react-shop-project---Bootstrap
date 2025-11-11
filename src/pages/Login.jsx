import zestylogo from '../images/zestylogo.png'
import { useState } from 'react';

function Login () {

    const [Email,SetEmail] = useState("");
    const [Password,SetPassword] = useState("");
    const [EmailError,SetEmailError] = useState("");
    const [PasswordError,SetPasswordError] = useState("");
    

    const formHandler = (event)=>{

        event.preventDefault();
        if(Email == ""){

            SetEmailError("Invalid Email");
            if(Password == ""){

            SetPasswordError("Invalid Password");
        }
        }

        

    }
    

    return (
        <>
           <div className="LoginBox">
                <div className='formArrange'>
                    <a href="/"><img className='logo' src={zestylogo} alt="logo image"  /></a>
                    <h1>SIGN IN OR CREATE ACCOUNT WITH <br/> YOUR EMAIL</h1>
                    <form onSubmit={formHandler} method='post'>
                        <fieldset>
                            <label htmlFor="">Email address *</label>
                            <input type="email" name='email' id='email' onChange={(e)=>{SetEmail(e.target.value)}} value={Email}/>
                            <p className='errorMsg'>{Email == "" ? EmailError : null }</p>
                            <label htmlFor="">Password *</label>
                            <input type="password" name='password' id='password' onChange={(e)=>{SetPassword(e.target.value)}} value={Password}/>
                            <p className='errorMsg'>{Password == "" ? PasswordError : null }</p>
                            <p>By signing in, you agree to our <a href="">Privacy Policy</a><br></br> and <a href="">Terms and Conditions</a></p>
                            <button type='submit'>Submit</button>
                            <p>Already have an account?<span>Register</span></p>
                        </fieldset>
                    </form>
                </div>
           </div>
        </>
    );
}

export default Login