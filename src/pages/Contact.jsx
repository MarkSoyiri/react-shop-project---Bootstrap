
function Contact (){

    return(

        <>
            <div>
                <div className="container-lg topMargin-150">
                    <div className="contactContent">
                        <form className="contactForm" action="">
                            <h1>CONTACT OUR CUSTOMER CARE TEAM</h1>
                            <p>We prioritise the views of our customers very much that we are always pleased to receive your contact.
                                Please fill in the prompts below to send in your request.Thank You!
                            </p>
                            <fieldset>
                                <label htmlFor="">Name*</label>
                                <input type="text" />

                                <label htmlFor="">Email*</label>
                                <input type="email" />

                                <label htmlFor="">Message*</label>
                                <textarea className="TA" type="text" />

                                <button>Send</button>
                            </fieldset>
                        </form>

                    </div>
                </div>
            </div>
        </>
    );
}

export default Contact