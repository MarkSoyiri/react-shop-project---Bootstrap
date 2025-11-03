
export function HomeHeadingWL (props) {

    return (
        <>
            <div className="heading">
                <div className="container-lg">
                    <div className="horizontalHeading">
                        
                        <h1 className={props.className}>{props.heading}</h1>
                        
                    </div>
                </div>

            </div>
        </>
    );
}




export function HomeHeadingNL (props) {

    return (
        <>
            <div className="heading">
                <div className="PageContainer">
                    <div className="horizontalHeading">
                        <h1>{props.heading}</h1>
                    </div>
                </div>

            </div>
        </>
    );
}