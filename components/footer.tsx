import TelegramIcon from "@mui/icons-material/Telegram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";


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
          developed by <span style={{ fontWeight: "700" }}>Tganyani </span>, a
          student at Rudn
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
            linkedIn
            <LinkedInIcon />
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
            Contact us
            <TelegramIcon />
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
            Subscribe TeleBot
            <TelegramIcon />
          </a>
        </li>
        <li>Tgb &copy; 2023</li>
      </ul>
    </div>
  );
}
