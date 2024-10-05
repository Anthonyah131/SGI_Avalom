import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { authenticate } from "@/lib/auth";

export async function POST(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const formData = await req.formData();
      const file = formData.get("file") as File | null; // Cast a File

      if (!file) {
        return NextResponse.json(
          { error: "Archivo no encontrado" },
          { status: 400 }
        );
      }

      // Convertir el Blob a un buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Subir el archivo a Cloudinary sin establecer public_id
      // Cloudinary usará el nombre original y agregará un sufijo aleatorio automáticamente
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: "raw", format: "pdf" }, // No public_id specified
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        uploadStream.end(buffer);
      });

      return NextResponse.json({
        url: (result as any).secure_url,
        publicId: (result as any).public_id,
      });
    } catch (error) {
      console.error("Error al subir archivo:", error);
      return NextResponse.json(
        { error: "Error subiendo archivo" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
