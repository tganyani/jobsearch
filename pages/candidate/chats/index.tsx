import NestedLayoutCandidateChats from "@/components/candidateChatsLayout";
import type { ReactElement } from "react";
import type { NextPageWithLayout } from "@/pages/_app";
import { Typography } from "@mui/material";

const CandidateChats: NextPageWithLayout = () => {
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
        click any recruiter to start conversation. if there are no recruiters
        you can apply for a position first to start conversations
      </Typography>
    </div>
  );
};

CandidateChats.getLayout = function getLayout(page: ReactElement) {
  return <NestedLayoutCandidateChats>{page}</NestedLayoutCandidateChats>;
};

export default CandidateChats;
