import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { authenticate } from "@/lib/auth";

export async function POST(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          { error: "Archivo no encontrado" },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: "raw", format: "pdf" },
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
