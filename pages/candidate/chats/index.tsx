import NestedLayoutCandidateChats from "@/components/candidateChatsLayout";
import type { ReactElement } from 'react'
import type { NextPageWithLayout } from "@/pages/_app";

const CandidateChats:NextPageWithLayout = ()=>{
    
    return(
            <div>
                click any recruiter to start conversation.
                if there are no recruiters you can apply for a position first to start conversations
            </div>
    )
}


CandidateChats.getLayout = function getLayout(page: ReactElement) {
    return (
        <NestedLayoutCandidateChats>{page}</NestedLayoutCandidateChats>
    )
  }
  
  export default CandidateChats




