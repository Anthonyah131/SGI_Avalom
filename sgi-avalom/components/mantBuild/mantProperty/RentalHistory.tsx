import React from 'react';
import { AvaAlquiler } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'; // Suponiendo que tienes estos componentes de ShadCN
import { Card, CardContent } from '../../ui/card';

interface RentalHistoryProps {
  rentals: AvaAlquiler[];
}

const RentalHistory: React.FC<RentalHistoryProps> = ({ rentals }) => {
  if (rentals.length === 0) return <p>No hay historial de alquileres.</p>;

  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Fecha de Pago</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rentals.map((rental) => (
              <TableRow key={rental.alq_id}>
                <TableCell>{rental.alq_id}</TableCell>
                <TableCell>{rental.alq_monto}</TableCell>
                <TableCell>{rental.alq_fechapago}</TableCell>
                <TableCell>{rental.alq_estado}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RentalHistory;