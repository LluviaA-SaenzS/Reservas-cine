import { db } from "C:\Users\PC1\OneDrive - Instituto Tecnologico de Durango\Escritorio\Proyecto Cine\Reservas-cine\api\src\db.js";

export const obtenerCines = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM cines");
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener los cines" });
    }
};

