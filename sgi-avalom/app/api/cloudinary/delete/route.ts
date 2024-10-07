import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { authenticate } from "@/lib/auth";

export async function POST(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const { publicId } = await request.json();

      if (!publicId) {
        return NextResponse.json(
          { error: "Public ID no proporcionado" },
          { status: 400 }
        );
      }

      console.log("Eliminando archivo con public ID:", publicId);
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: "raw",
      });

      if (result.result !== "ok") {
        return NextResponse.json(
          { error: "Error eliminando archivo" },
          { status: 400 }
        );
      }

      return NextResponse.json({ message: "Archivo eliminado correctamente" });
    } catch (error) {
      console.error("Error al eliminar archivo:", error);
      return NextResponse.json(
        { error: "Error eliminando archivo" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
