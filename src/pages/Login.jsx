import zestylogo from '../images/zestylogo.png'

function Login () {

    return (
        <>
           <div className="LoginBox">
                <div className='formArrange'>
                    <a href="/"><img className='logo' src={zestylogo} alt="logo image"  /></a>
                    <h1>SIGN IN OR CREATE ACCOUNT WITH <br/> YOUR EMAIL</h1>
                    <form action="">
                        <fieldset>
                            <label htmlFor="">Email address *</label>
                            <input type="email" />
                            <label htmlFor="">Password *</label>
                            <input type="password" />
                            <p>By signing in, you agree to our <a href="">Privacy Policy</a><br></br> and <a href="">Terms and Conditions</a></p>
                            <button>Submit</button>
                            <p>Already have an account?<span>Register</span></p>
                        </fieldset>
                    </form>
                </div>
           </div>
        </>
    );
}

export default Login