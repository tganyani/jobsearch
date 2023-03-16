import Footer from "./footer";
import NavBar from "./navbar";

export default function Layout({children}:any){
    return(
       <>
        <NavBar/>
        <main>{children}</main>
        <Footer/>
       </>
    )
}