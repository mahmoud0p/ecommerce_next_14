'use client'
import ControlBar from "./components/controlbar";
import AdminTabs from "./components/tabs";
import AdminModal from "./components/adminModal";
import { useAtom } from "jotai";
import { isAdminAtom } from "@/app/state";


export default function AdminDashboard (){
    const [isAdmin] = useAtom(isAdminAtom)

    return(
        <>
            {isAdmin ? 
                    (<div className="min-h-screen relative  p-0  ">  
                        <ControlBar/>
                        <AdminTabs/>
                    </div>)
                    :
                    (<AdminModal  />)

            }
        </>
    )
}