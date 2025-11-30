import zestylogo from '../images/zestylogo.png'
import { useState } from 'react';
import fetch from '../fetchAPI';

function Login () {

    const [Email,SetEmail] = useState("");
    const [Password,SetPassword] = useState("");
    const [Username,SetUsername] = useState("");
    const [EmailError,SetEmailError] = useState("");
    const [PasswordError,SetPasswordError] = useState("");
    const [UsernameError,SetUsernameError] = useState("");
    
    

    // FORM VALIDATION
    const loginHandler = (event)=>{

        event.preventDefault();
        if(Email == ""){

            SetEmailError("Invalid Email");
            
        }

        if(Password == ""){

            SetPasswordError("Invalid Password");
        }

    }

    const registerHandler = async (event)=>{

        event.preventDefault();
       try {
         if(Email == ""){
 
             SetEmailError("Invalid Email");
             
         }
 
         if(Password == ""){
 
             SetPasswordError("Invalid Password");
         }
 
         if (Username == "") {
             SetUsernameError("Username cannot be empty")
         }
 
         const regResponse = await fetch.post('/register',{
             username:Username,
             email:Email,
             password:Password
         })
 
 
         if (regResponse.status === 201) {
 
             console.log(regResponse.data);
             
         } 
       } catch (error) {

        console.error(error.response.data)
        
       }

    }
    
    // LOGIN & REGISTER SWITCHER
    const [showLogin,SetShowLogin] = useState(true);

    function regclick(){
        SetShowLogin(true)
    }
    function logclick(){
        SetShowLogin(false)
    }

    

    return (
        <div className='registry'>
           {showLogin ? 
                // REGISTER FORM
                <div className='loginBox'>
                    <a href="/"><img className='logo' src={zestylogo} alt="logo image"  /></a>
                    <h1>SIGN UP</h1>
                    <form onSubmit={registerHandler} method='post'>
                        <fieldset>
                            <label htmlFor="">Username*</label>
                            <input type="text" name='username' id='username' onChange={(e)=>{SetUsername(e.target.value)}} value={Username}/>
                            <p className='errorMsg'>{Username == "" ? UsernameError : null }</p>
                            <label htmlFor="">Email address *</label>
                            <input type="email" name='email' id='email' onChange={(e)=>{SetEmail(e.target.value)}} value={Email}/>
                            <p className='errorMsg'>{Email == "" ? EmailError : null }</p>
                            <label htmlFor="">Password *</label>
                            <input type="password" name='password' id='password' onChange={(e)=>{SetPassword(e.target.value)}} value={Password}/>
                            <p className='errorMsg'>{Password == "" ? PasswordError : null }</p>
                            <p className='TnC'>By signing in, you agree to our <a href="">Privacy Policy</a><br></br> and <a href="">Terms and Conditions</a></p>
                            <button type='submit' className='send-btn'>Submit</button>
                            <p className='log-switch'>Already have an account?<span onClick={logclick}>Login</span></p>
                        </fieldset>
                    </form>
                </div>
            
            :
            

                //    LOGIN FORM
            <div className='loginBox'>
                <a href="/"><img className='logo' src={zestylogo} alt="logo image"  /></a>
                <h1>SIGN IN</h1>
                <form onSubmit={loginHandler} method='post'>
                    <fieldset>
                        <label htmlFor="">Email address *</label>
                        <input type="email" name='email' id='email' onChange={(e)=>{SetEmail(e.target.value)}} value={Email}/>
                        <p className='errorMsg'>{Email == "" ? EmailError : null }</p>
                        <label htmlFor="">Password *</label>
                        <input type="password" name='password' id='password' onChange={(e)=>{SetPassword(e.target.value)}} value={Password}/>
                        <p className='errorMsg'>{Password == "" ? PasswordError : null }</p>
                        <p className='TnC'>By signing in, you agree to our <a href="">Privacy Policy</a><br></br> and <a href="">Terms and Conditions</a></p>
                        <button type='submit' className='send-btn'>Submit</button>
                        <p className='log-switch'>Already have an account?<span onClick={regclick}>Register</span></p>
                    </fieldset>
                </form>
            </div>
                }
                
           

        </div>
    );
}

export default Login