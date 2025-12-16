"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import FileUploader from "@/components/ui/fileUploader";
import useRentalStore from "@/lib/zustand/useRentalStore";

const ContractCard: React.FC<{ isFormDisabled?: boolean }> = ({ isFormDisabled = false }) => {
  const { selectedRental } = useRentalStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-primary font-bold">
          Contrato
        </CardTitle>
        <CardDescription>
          Adjuntar contrato del alquiler
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Label>Archivo del Contrato</Label>
        <FileUploader
          disabled={isFormDisabled}
          selectedRental={selectedRental}
        />
      </CardContent>
    </Card>
  );
};

export default ContractCard;

