import { plat } from "@/modele/plat";
import {useState } from "react";
import { supabase } from "@/lib/supabaseClient";



export async function ChargerListeDesPlats(){
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [plats, setPlats] = useState<plat[]>([]);
    const{data,error}= await supabase
    .from("plat")
    .select("*");

    if(error){
        console.log("erreur",error.message);
    }else{
        setPlats(data|| [])
        console.log("plats",plats);
        
    }
    
}