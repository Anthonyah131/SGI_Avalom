import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CancelPaymentForm } from "@/components/accounting/payments/cancelpayment/monthlyRentCancelPayment/cancelPaymentForm";
import { useCancelPaymentForm } from "@/hooks/accounting/monthlyRentPayment/useCancelPaymentForm";
import { useUser } from "@/lib/UserContext";
import { useForm } from "react-hook-form";

jest.mock("@/hooks/accounting/monthlyRentPayment/useCancelPaymentForm");
jest.mock("@/lib/UserContext");

const mockOnSubmit = jest.fn();
const mockHandleSubmit = (cb: any) => (e?: any) =>
  cb({
    anp_motivo: "Error de facturación",
    anp_descripcion: "Se duplicó el pago",
  });

const fakePayment = {
  pag_id: "1",
  pag_monto: "250000",
  pag_fechapago: "2024-04-01T12:00:00.000Z",
  pag_estado: "A" as const,
  pag_descripcion: "Pago de prueba mensual",
};

describe("CancelPaymentForm", () => {
  let mockForm: ReturnType<typeof useForm<{ anp_motivo: string; anp_descripcion: string }>>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockForm = useForm<{ anp_motivo: string; anp_descripcion: string }>({
      defaultValues: {
        anp_motivo: "",
        anp_descripcion: "",
      },
    });

    (useUser as jest.Mock).mockReturnValue({
      user: { usu_id: 99 },
    });

    (useCancelPaymentForm as jest.Mock).mockReturnValue({
      form: mockForm,
      onSubmit: mockOnSubmit,
      handleSubmit: mockForm.handleSubmit,
    });
  });

  it("muestra los campos del formulario y datos del pago", () => {
    render(<CancelPaymentForm payment={fakePayment} onClose={() => {}} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("₡250,000.00")).toBeInTheDocument();
    expect(screen.getByText("Activo")).toBeInTheDocument();
    expect(screen.getByLabelText("Motivo de Anulación *")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Descripción de Anulación *")
    ).toBeInTheDocument();
  });

  it("envía el formulario correctamente", async () => {
    render(<CancelPaymentForm payment={fakePayment} onClose={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /anular pago/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        anp_motivo: "Error de facturación",
        anp_descripcion: "Se duplicó el pago",
        usu_id: 99,
      });
    });
  });

});
