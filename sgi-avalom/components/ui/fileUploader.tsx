"use client";

import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Link from "next/link";
import React from "react";

interface FileUploaderProps {
  disabled: boolean;
  onFileSelect: (file: File | null) => void;
  resetFile: boolean;
  onResetComplete: () => void;
  existingFileUrl?: string;
}

export default function FileUploader({
  disabled,
  onFileSelect,
  resetFile,
  onResetComplete,
  existingFileUrl,
}: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Actualizar fileUrl y limpiar el archivo local cuando cambia el alquiler
  useEffect(() => {
    if (existingFileUrl) {
      setFile(null); // Si hay un link, eliminamos el archivo local
      setFileUrl(existingFileUrl);
    } else {
      setFileUrl(null);
    }
  }, [existingFileUrl]);

  // Resetear archivo local y URL cuando se restablece el formulario
  useEffect(() => {
    if (resetFile) {
      setFile(null);
      setFileUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onResetComplete();
    }
  }, [resetFile, onResetComplete]);

  // Manejar el archivo cargado manualmente
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setFileUrl(null); // Si cargamos un archivo nuevo, quitamos la URL del archivo existente
      onFileSelect(selectedFile);
    } else {
      alert("Por favor, selecciona un archivo PDF.");
    }
  };

  // Eliminar el archivo local o el archivo existente en la base de datos
  const handleDelete = () => {
    setFile(null);
    setFileUrl(null);
    onFileSelect(null); // Notificamos que ya no hay archivo
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Permitir la funcionalidad de arrastrar y soltar
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
      setFileUrl(null);
      onFileSelect(droppedFile);
    } else {
      alert("Por favor, suelta un archivo PDF.");
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Archivo PDF</CardTitle>
        <CardDescription>
          {!file && !fileUrl
            ? "Selecciona un archivo PDF para enviar"
            : "Puedes abrir o eliminar el archivo cargado"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {file ? (
            // Mostrar si hay un archivo local cargado
            <div className="flex items-center justify-between w-full px-4">
              <div className="flex items-center gap-2">
                <FileIcon className="h-6 w-6 text-muted-foreground" />
                <span className="truncate max-w-[200px]">{file.name}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="mt-2"
                onClick={handleDelete}
                disabled={disabled}
                type="button"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : fileUrl ? (
            // Mostrar si hay un archivo en la base de datos (fileUrl)
            <div className="flex flex-col items-center w-full px-4">
              <div className="flex items-center gap-2">
                <FileIcon className="h-6 w-6 text-muted-foreground" />
                <span className="truncate max-w-[200px]">
                  {fileUrl.split("/").pop()}
                </span>
              </div>
              <div className="mt-2">
                <Link href={fileUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="link" type="button">
                    Abrir archivo PDF
                  </Button>
                </Link>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="mt-2"
                onClick={handleDelete}
                disabled={disabled}
              >
                <X className="h-4 w-4" /> Eliminar archivo
              </Button>
            </div>
          ) : (
            // Si no hay archivo local ni en la base de datos, permitir cargar uno nuevo
            <div
              className={`relative flex flex-col items-center justify-center gap-2 py-12 border-2 border-dashed rounded-lg transition-colors ${
                isDragging ? "border-primary bg-primary/10" : "border-muted"
              } hover:border-primary hover:bg-primary/5`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => !disabled && fileInputRef.current?.click()}
              style={{ cursor: disabled ? "not-allowed" : "pointer" }}
            >
              <CloudUploadIcon className="h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground text-center">
                Arrastra y suelta un archivo PDF o haz clic para seleccionar
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                disabled={disabled}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CloudUploadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
      <path d="M12 12v9" />
      <path d="m16 16-4-4-4 4" />
    </svg>
  );
}

function FileIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  );
}
