import { useState } from "react";
import { toast } from "sonner";
import cookie from "js-cookie";

export interface ContractData {
  // Campos existentes (obligatorios)
  arrendante: string;
  cedulaArrendante: string;
  arrendatario: string;
  cedulaArrendatario: string;
  estadoCivil: string;
  direccion: string;
  aptoNumero: string;
  contratoDesde: string;
  contratoHasta: string;
  montoTotal: number;
  diaPago: number;
  duracionAnios: number;
  
  // Nuevos campos obligatorios
  diaPrimerPago: number; // Día del mes del primer pago
  numeroMiembros: number; // Número de miembros del núcleo familiar
  depositoGarantia: number; // Monto del depósito de garantía
  
  // Nuevos campos opcionales
  fechaFirma?: string; // Fecha de firma del contrato
  matriculaFinca?: string; // Matrícula de la finca en el Registro Público
  planoFinca?: string; // Información del plano de la finca
  ubicacionFinca?: string; // Ubicación (distrito, cantón, provincia)
  linderosFinca?: string; // Linderos de la finca
  descripcionApartamento?: string; // Descripción detallada del apartamento
}

const initialFormData: ContractData = {
  arrendante: "",
  cedulaArrendante: "",
  arrendatario: "",
  cedulaArrendatario: "",
  estadoCivil: "",
  direccion: "",
  aptoNumero: "",
  contratoDesde: "",
  contratoHasta: "",
  montoTotal: 0,
  diaPago: 1,
  duracionAnios: 1,
  diaPrimerPago: 0,
  numeroMiembros: 0,
  depositoGarantia: 0,
  fechaFirma: "",
  matriculaFinca: "",
  planoFinca: "",
  ubicacionFinca: "",
  linderosFinca: "",
  descripcionApartamento: "",
};

export const useContractGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ContractData>(initialFormData);

  const handleChange = (field: keyof ContractData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    // Validar campos de texto obligatorios
    if (!formData.arrendante || formData.arrendante.trim() === "") {
      toast.error("El campo 'Arrendante' es obligatorio");
      return false;
    }

    if (!formData.cedulaArrendante || formData.cedulaArrendante.trim() === "") {
      toast.error("El campo 'Cédula Arrendante' es obligatorio");
      return false;
    }

    if (!formData.arrendatario || formData.arrendatario.trim() === "") {
      toast.error("El campo 'Arrendatario' es obligatorio");
      return false;
    }

    if (!formData.cedulaArrendatario || formData.cedulaArrendatario.trim() === "") {
      toast.error("El campo 'Cédula Arrendatario' es obligatorio");
      return false;
    }

    if (!formData.estadoCivil || formData.estadoCivil.trim() === "") {
      toast.error("El campo 'Estado Civil' es obligatorio");
      return false;
    }

    if (!formData.direccion || formData.direccion.trim() === "") {
      toast.error("El campo 'Dirección' es obligatorio");
      return false;
    }

    if (!formData.aptoNumero || formData.aptoNumero.trim() === "") {
      toast.error("El campo 'Número de Apartamento' es obligatorio");
      return false;
    }

    if (!formData.contratoDesde || formData.contratoDesde.trim() === "") {
      toast.error("El campo 'Fecha Desde' es obligatorio");
      return false;
    }

    if (!formData.contratoHasta || formData.contratoHasta.trim() === "") {
      toast.error("El campo 'Fecha Hasta' es obligatorio");
      return false;
    }

    // Validar campos numéricos obligatorios
    if (!formData.montoTotal || formData.montoTotal <= 0) {
      toast.error("El campo 'Monto Total Anual' es obligatorio y debe ser mayor a 0");
      return false;
    }

    if (!formData.diaPago || formData.diaPago < 1 || formData.diaPago > 31) {
      toast.error("El campo 'Día de Pago Mensual' es obligatorio y debe estar entre 1 y 31");
      return false;
    }

    if (!formData.duracionAnios || formData.duracionAnios <= 0) {
      toast.error("El campo 'Duración' es obligatorio y debe ser mayor a 0");
      return false;
    }

    // Validar nuevos campos obligatorios
    if (!formData.diaPrimerPago || formData.diaPrimerPago < 1 || formData.diaPrimerPago > 31) {
      toast.error("El campo 'Día del Primer Pago' es obligatorio y debe estar entre 1 y 31");
      return false;
    }

    if (!formData.numeroMiembros || formData.numeroMiembros < 1) {
      toast.error("El campo 'Número de Miembros del Núcleo Familiar' es obligatorio y debe ser mayor a 0");
      return false;
    }

    if (!formData.depositoGarantia || formData.depositoGarantia <= 0) {
      toast.error("El campo 'Depósito de Garantía' es obligatorio y debe ser mayor a 0");
      return false;
    }

    return true;
  };

  const generateContract = async (): Promise<boolean> => {
    if (!validateForm()) return false;

    setLoading(true);
    try {
      const token = cookie.get("token");
      if (!token) {
        toast.error("No hay token de autenticación");
        return false;
      }

      const response = await fetch("/api/generate-contract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al generar contrato");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `contrato_${formData.aptoNumero}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success("Contrato generado exitosamente");

      // Reset form
      setFormData(initialFormData);
      return true;
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Error al generar el contrato");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
  };

  return {
    loading,
    formData,
    handleChange,
    generateContract,
    resetForm,
  };
};

