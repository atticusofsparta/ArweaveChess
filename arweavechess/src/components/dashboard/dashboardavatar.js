
const DashboardAvatar = ({allUsers}) => {


    return(
        <div id="dashboard-avatars">
            {allUsers.map((user, index) =>
             <div className="avatar" key={index} style={{backgroundImage: `linear-gradient(to top, green,black,black,navy)`}}>
                 <div className="avatar-pic" style={{backgroundImage:`url(${user.avatar})`, zIndex:"8"}}></div>
                 <p className="avatar-header">{user.username}</p>
             </div>) }
        </div>
    );

}


export default DashboardAvatar