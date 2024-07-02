import NestedLayoutRecruiterChats from "@/components/recruiterChatsLayout";
import type { ReactElement } from "react";
import type { NextPageWithLayout } from "@/pages/_app";
import { Typography } from "@mui/material";

const RecruiterChats: NextPageWithLayout = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        height: "50vh",
      }}
    >
      <Typography component="div" variant="body2">
        click any candidate to start conversation. if there are no candidates
        post a job, so that candidates can connect and start conversations
      </Typography>
    </div>
  );
};

RecruiterChats.getLayout = function getLayout(page: ReactElement) {
  return <NestedLayoutRecruiterChats>{page}</NestedLayoutRecruiterChats>;
};

export default RecruiterChats;
