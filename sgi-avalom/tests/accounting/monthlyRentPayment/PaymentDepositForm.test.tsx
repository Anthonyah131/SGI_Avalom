import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PaymentForm } from "@/components/accounting/payments/payment/depositPayment/paymentForm";
import { usePaymentForm } from "@/hooks/accounting/depositPayment/usePaymentForm";
import { useForm } from "react-hook-form";

jest.mock("@/hooks/accounting/depositPayment/usePaymentForm");

describe("PaymentForm", () => {
  const mockHandlePaymentSubmit = jest.fn();
  const mockReset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (usePaymentForm as jest.Mock).mockImplementation(() => {
      const form = useForm({
        defaultValues: {
          pag_cuenta: "",
          pag_descripcion: "",
        },
      });
      return {
        form: { ...form, reset: mockReset },
        isSubmitting: false,
        handlePaymentSubmit: mockHandlePaymentSubmit,
      };
    });
  });

  it("renderiza correctamente los campos obligatorios", () => {
    render(<PaymentForm amountToPay="1000" setAmountToPay={jest.fn()} />);
    expect(screen.getByLabelText("Cuenta *")).toBeInTheDocument();
    expect(screen.getByLabelText("Descripción *")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /guardar pago/i })).toBeInTheDocument();
  });

  it("envía el formulario correctamente con datos válidos", async () => {
    const setAmountToPay = jest.fn();

    render(<PaymentForm amountToPay="2000" setAmountToPay={setAmountToPay} />);

    fireEvent.change(screen.getByLabelText("Cuenta *"), {
      target: { value: "Cuenta123" },
    });

    fireEvent.change(screen.getByLabelText("Descripción *"), {
      target: { value: "Pago de prueba" },
    });

    fireEvent.click(screen.getByRole("button", { name: /guardar pago/i }));

    await waitFor(() => {
      expect(mockHandlePaymentSubmit).toHaveBeenCalledWith({
        pag_cuenta: "Cuenta123",
        pag_descripcion: "Pago de prueba",
        amountToPay: 2000,
      });
      expect(setAmountToPay).toHaveBeenCalledWith("");
      expect(mockReset).toHaveBeenCalled();
    });
  });

  it("lanza error si el monto es 0 o negativo", async () => {
    render(<PaymentForm amountToPay="0" setAmountToPay={jest.fn()} />);

    fireEvent.change(screen.getByLabelText("Cuenta *"), {
      target: { value: "CuentaError" },
    });

    fireEvent.change(screen.getByLabelText("Descripción *"), {
      target: { value: "Descripción inválida" },
    });

    fireEvent.click(screen.getByRole("button", { name: /guardar pago/i }));

    await waitFor(() => {
      expect(mockHandlePaymentSubmit).not.toHaveBeenCalled();
    });
  });
});
