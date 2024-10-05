import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    const { publicId } = await request.json();

    if (!publicId) {
      return NextResponse.json({ error: "Public ID no proporcionado" }, { status: 400 });
    }

    const url = cloudinary.url(publicId, { resource_type: "raw", format: "pdf" });

    return NextResponse.json({ url: url });
  } catch (error) {
    console.error("Error al obtener la URL:", error);
    return NextResponse.json(
      { error: "Error al obtener la URL" },
      { status: 500 }
    );
  }
}
