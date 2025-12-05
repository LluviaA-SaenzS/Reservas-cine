import { db } from "../db.js";

export const getDescuento = async(req,res) =>{
    try{
        const[descuentos] = await db.query(`
            SELECT id_descuento, tipo, dias_aplicables, fecha_inicio, fecha_fin, activo, porcentaje
            FROM descuentos
            ORDER BY id_descuento
            
            `);
            res.json(descuentos)

    }catch(error){
        console.error("error al obtener descuentos:", error);
        res.status(500).json({error:"error al obtener descuentos"});
    }

};