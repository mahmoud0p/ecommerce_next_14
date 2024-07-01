import { SetStateAction } from "jotai"
import { Dispatch, FormEvent } from "react"

export const CheckBox = ({onCheck , onUnCheck} : {onCheck : ()=>void , onUnCheck:()=>void})=>{
    const handleCheck = (e:FormEvent<HTMLInputElement>)=>{
        if(e.currentTarget.checked){
            onCheck()
        }else{
            onUnCheck()
        }
    }
    return(
        <div>
            <label className="container">
                <input type="checkbox"  onChange={handleCheck} />
                <div className="checkmark"></div>
            </label>
        </div>
    )
}

