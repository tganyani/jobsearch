import NestedLayoutRecruiterChats from "@/components/recruiterChatsLayout";
import type { ReactElement } from 'react'
import type { NextPageWithLayout } from "@/pages/_app";

const RecruiterChats:NextPageWithLayout = ()=>{
    
    return(
            <div>
                click any candidate to start conversation.
                if there are no candidates post a job, so that 
                candidates can connect and start conversations
            </div>
    )
}


RecruiterChats.getLayout = function getLayout(page: ReactElement) {
    return (
        <NestedLayoutRecruiterChats>{page}</NestedLayoutRecruiterChats>
    )
  }
  
  export default RecruiterChats