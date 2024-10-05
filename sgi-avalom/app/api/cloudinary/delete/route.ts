import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    const { publicId } = await request.json();

    if (!publicId) {
      return NextResponse.json({ error: "Public ID no proporcionado" }, { status: 400 });
    }

    const result = await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });

    if (result.result !== "ok") {
      return NextResponse.json({ error: "Error eliminando archivo" }, { status: 400 });
    }

    return NextResponse.json({ message: "Archivo eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar archivo:", error);
    return NextResponse.json(
      { error: "Error eliminando archivo" },
      { status: 500 }
    );
  }
}
