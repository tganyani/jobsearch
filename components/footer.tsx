import TelegramIcon from "@mui/icons-material/Telegram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import { Typography } from "@mui/material";


export default function Footer() {
  return (
    <div
      style={{
        background: "#3e424b",
        minHeight: "100px",
        color: "white",
        textAlign: "center",
        paddingTop: "50px",
        paddingLeft: "30px",
        paddingBottom: "20px",

      }}
    >
      <ul
        style={{
          display: "flex",
          flexFlow: "row wrap",
          listStyle: "none",
          columnGap: "30px",
          rowGap: "20px",
          alignItems: "center",
        }}
      >
        <li>
          
          <Typography variant="body2" component="div">developed by a<span style={{ fontWeight: "700" }}>   Zim Student</span>, at Rudn</Typography>
         
        </li>
        <li>
          <a
            href="https://www.linkedin.com/in/tatenda-ganyani-9160a0242/"
            style={{
              textDecoration: "none",
              display: "flex",
              flexFlow: "row nowrap",
              alignItems: "center",
            }}
          >
            
            <Typography variant="body2" component="div" sx={{color:"white","&:hover":{color:"lawngreen"}}}>linkedIn</Typography>
            <LinkedInIcon sx={{color:"#0A66C2"}}/>
          </a>
        </li>
        <li>
          <a
            href="https://t.me/tganyani"
            style={{
              textDecoration: "none",
              display: "flex",
              flexFlow: "row nowrap",
              alignItems: "center",
            }}
          >
           
            <Typography variant="body2" component="div" sx={{color:"white","&:hover":{color:"lawngreen"}}}> contact us</Typography>
            <TelegramIcon sx={{color:"#27A7E7"}}/>
          </a>
        </li>
        <li>
          <a
            href="http://t.me/Imisebenzibot"
            style={{
              textDecoration: "none",
              display: "flex",
              flexFlow: "row nowrap",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" component="div" sx={{color:"white","&:hover":{color:"lawngreen"}}}>  subscribe TeleBot</Typography>
            <TelegramIcon sx={{color:"#24A1DE"}}/>
          </a>
        </li>
        <li><Typography variant="body2" component="div" sx={{color:"white"}}><span style={{color:"lawngreen"}}>Imisebenzi</span> &copy; 2024</Typography></li>
      </ul>
    </div>
  );
}
