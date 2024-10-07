"use client";

import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Upload, FileText, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";
import React from "react";
import axios from "axios";
import cookie from "js-cookie";
import usePropertyStore from "@/lib/zustand/propertyStore";
import { AvaAlquiler } from "@/lib/types";

interface FileUploaderProps {
  disabled: boolean;
  selectedRental: AvaAlquiler | null;
}

export default function FileUploader({
  disabled,
  selectedRental,
}: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(
    selectedRental?.alq_contrato || null
  );
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateRental, setSelectedRental } = usePropertyStore((state) => ({
    updateRental: state.updateRental,
    setSelectedRental: state.setSelectedRental,
  }));

  useEffect(() => {
    setFileUrl(selectedRental?.alq_contrato || null);
  }, [selectedRental]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      alert("Por favor, selecciona un archivo PDF.");
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedRental) return;

    try {
      const token = cookie.get("token");
      if (!token) {
        console.error("No hay token disponible");
        return;
      }

      const formDataFile = new FormData();
      formDataFile.append("file", file);

      const response = await axios.post(
        "/api/cloudinary/upload",
        formDataFile,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const { url } = response.data;

      const updatedRentalData = {
        alq_contrato: url,
      };

      const rentalResponse = await axios.put(
        `/api/rent/${selectedRental.alq_id}`,
        updatedRentalData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (rentalResponse.data) {
        updateRental(selectedRental.alq_id, rentalResponse.data);
        setSelectedRental(rentalResponse.data);
        setFileUrl(url);
        setFile(null);
        alert("Archivo subido y alquiler actualizado correctamente.");
      }
    } catch (error) {
      console.error("Error al subir el archivo:", error);
      alert("Error al subir el archivo.");
    }
  };

  const handleDelete = async () => {
    if (!fileUrl || !selectedRental) return;

    try {
      const token = cookie.get("token");
      if (!token) {
        console.error("No hay token disponible");
        return;
      }

      const publicId = extractPublicIdFromUrl(fileUrl);
      console.log("Eliminando archivo con public ID:", publicId);
      await axios.post(
        "/api/cloudinary/delete",
        { publicId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const updatedRentalData = {
        alq_contrato: "",
      };

      const rentalResponse = await axios.put(
        `/api/rent/${selectedRental.alq_id}`,
        updatedRentalData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (rentalResponse.data) {
        updateRental(selectedRental.alq_id, rentalResponse.data);
        setSelectedRental(rentalResponse.data);
        setFileUrl(null);
        alert("Archivo eliminado y alquiler actualizado correctamente.");
      }
    } catch (error) {
      console.error("Error al eliminar el archivo:", error);
      alert("Error al eliminar el archivo.");
    }
  };

  function extractPublicIdFromUrl(url: string): string {
    const parts = url.split("/");
    const index = parts.findIndex((part) => part === "upload");
    if (index !== -1 && index + 1 < parts.length) {
      const publicIdWithVersionAndExtension = parts.slice(index + 2).join("/");
      return publicIdWithVersionAndExtension;
    }
    return "";
  }

  return (
    <Card className="w-full shadow-md dark:shadow-gray-800">
      <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800">
        <CardTitle className="text-xl font-semibold text-blue-800 dark:text-blue-100">
          Archivo PDF
        </CardTitle>
        <CardDescription className="text-blue-600 dark:text-blue-300">
          {!file && !fileUrl
            ? "Selecciona un archivo PDF para enviar"
            : "Archivo PDF del contrato"}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {fileUrl ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-blue-500 dark:text-blue-400" />
              <span className="truncate flex-1 font-medium text-gray-700 dark:text-gray-300">
                {fileUrl.split("/").pop()}
              </span>
            </div>
            <div className="flex gap-3">
              <Link
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button
                  variant="outline"
                  type="button"
                  className="w-full"
                  aria-label="Abrir archivo PDF"
                >
                  <ExternalLink className="h-4 w-4 mr-2" /> Abrir PDF
                </Button>
              </Link>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={disabled}
                className="flex-1"
                aria-label="Eliminar archivo"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Eliminar
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={`relative flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed rounded-lg transition-colors ${
              isDragging
                ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/50"
                : "border-gray-300 hover:border-blue-400 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-blue-500 dark:hover:bg-gray-800/50"
            } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            onClick={() => !disabled && fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              !disabled && setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (!disabled && e.dataTransfer.files[0]) {
                handleFileChange({
                  target: { files: e.dataTransfer.files },
                } as React.ChangeEvent<HTMLInputElement>);
              }
            }}
          >
            <Upload className="h-12 w-12 text-blue-500 dark:text-blue-400" />
            <p className="text-center text-gray-600 dark:text-gray-300">
              Arrastra y suelta un archivo PDF o haz clic para seleccionar
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              disabled={disabled}
              aria-label="Seleccionar archivo PDF"
            />
          </div>
        )}

        {file && !fileUrl && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                <span className="truncate max-w-[200px] font-medium text-gray-700 dark:text-gray-300">
                  {file.name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setFile(null)}
                disabled={disabled}
                type="button"
                aria-label="Eliminar archivo seleccionado"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="default"
              onClick={handleUpload}
              disabled={disabled}
              type="button"
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" /> Guardar Archivo
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
