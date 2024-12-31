// to protact routes middleware function
export const protactedRoutes = (req, res,next)=>{
    if(!req.session.user){
        return res.redirect('/login');
    }
    next();

}



// guest routes middleware function
export  const guestRoutes = (req, res,next)=>{
    if(req.session.user){
        return res.redirect('/profile');
    }
    next();
}
