import { render, screen, fireEvent } from "@testing-library/react";
import { PaymentForm } from "@/components/accounting/payments/payment/monthlyRentPayment/paymentForm";
import { useForm } from "react-hook-form";
import cookie from "js-cookie";

jest.mock("js-cookie", () => ({
  get: jest.fn(),
}));

const mockHandlePaymentSubmit = jest.fn();

jest.mock("@/hooks/accounting/monthlyRentPayment/usePaymentForm", () => {
  const actualUseForm = jest.requireActual("react-hook-form");

  return {
    usePaymentForm: () => {
      const form = actualUseForm.useForm();
      return {
        form,
        isSubmitting: false,
        handlePaymentSubmit: mockHandlePaymentSubmit,
        amountToPay: "500",
        setAmountToPay: jest.fn(),
      };
    },
  };
});

describe("PaymentForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (cookie.get as jest.Mock).mockReturnValue("fake-token");
  });

  it("renderiza el formulario correctamente", () => {
    render(<PaymentForm amountToPay="500" setAmountToPay={jest.fn()} />);
    expect(screen.getByText("Detalles del Pago")).toBeInTheDocument();
    expect(screen.getByLabelText("Cuenta *")).toBeInTheDocument();
    expect(screen.getByLabelText("Descripción *")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Guardar Pago/i })
    ).toBeInTheDocument();
  });

  it("envía el formulario al hacer submit", async () => {
    render(<PaymentForm amountToPay="500" setAmountToPay={jest.fn()} />);

    fireEvent.change(screen.getByLabelText("Cuenta *"), {
      target: { value: "Cuenta1" },
    });

    fireEvent.change(screen.getByLabelText("Descripción *"), {
      target: { value: "Pago mensual" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /Guardar Pago/i })
    );

    await new Promise((r) => setTimeout(r, 0));

    expect(mockHandlePaymentSubmit).toHaveBeenCalledWith({
      pag_cuenta: "Cuenta1",
      pag_descripcion: "Pago mensual",
      amountToPay: 500,
    });
  });
});
