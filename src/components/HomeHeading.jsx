
export function HomeHeadingWL (props) {

    return (
        <>
            <div className="heading">
                <div className="PageContainer">
                    <div className="horizontalHeading">
                        {/* <hr /> */}
                        <h1 className={props.className}>{props.heading}</h1>
                        {/* <hr /> */}
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