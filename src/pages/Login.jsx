import zestylogo from '../images/zestylogo.png'
import { useState,useContext } from 'react';
import axiosFetch from '../api/axiosFetchAPI';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';


function Login () {

    const navigate = useNavigate()

    const [Email,SetEmail] = useState("mark@gmail.com");
    const [Password,SetPassword] = useState("mark101");
    const [Username,SetUsername] = useState("Mark");
    const [EmailError,SetEmailError] = useState("");
    const [PasswordError,SetPasswordError] = useState("");
    const [UsernameError,SetUsernameError] = useState("");
    
    const { login } = useContext(AuthContext);

    // FORM VALIDATION
    const loginHandler = async (event)=>{

        
        event.preventDefault();
        try {
            if(Email === ""){
                SetEmailError("Invalid Email");
                return; 
            }
    
            if(Password === ""){
                SetPasswordError("Invalid Password");
                return;
            }
    
            const response = await axiosFetch.post('/user/login', {
                email:Email,
                password:Password
            })
    
            if (response.status === 200) {
                // alert("Login Successful!");
              
                localStorage.setItem("token",response.data.token);
                login(response.data.user,response.data.token)
                navigate('/')
              
            }
        } catch (error) {
    console.error(error.message)
}


    }

    const registerHandler = async (event)=>{

        event.preventDefault();
       try {
         if(Email === ""){
             SetEmailError("Invalid Email");
             return;
         }
 
         if(Password === ""){
             SetPasswordError("Invalid Password");
             return;
         }
 
         if (Username === "") {
             SetUsernameError("Username cannot be empty");
             return;
         }
 
         const response = await axiosFetch.post("/user/register",{
            username:Username,
            email:Email,
            password:Password
         })

         if (response.status === 201) {
            console.log(response.statusText);
        }
       } catch (error) {
    if (error.response) {
        console.error(error.response.data.message);
    } else {
        console.error(error.message);
    }
}


    }
    
    // LOGIN & REGISTER SWITCHER
    const [showLogin,SetShowLogin] = useState(true);

    function regClick(){
        SetShowLogin(false)
    }
    function logClick(){
        SetShowLogin(true)
    }

    

    return (
        <div className='registry'>
           {showLogin ? 
     
                //LOGIN FORM
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
                        <p className='log-switch'>Don't have an account?<span onClick={regClick}>Register</span></p>
                    </fieldset>
                </form>
            </div>
            
            :
            

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
                            <p className='log-switch'>Already have an account?<span onClick={logClick}>Login</span></p>
                        </fieldset>
                    </form>
                </div>
                }
                
           

        </div>
    );
}

export default Login;

