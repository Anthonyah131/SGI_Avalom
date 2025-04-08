import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DepositForm from "@/components/mantRent/edit/depositForm";
import { useForm } from "react-hook-form";
import cookie from "js-cookie";

jest.mock("js-cookie", () => ({
  get: jest.fn(() => "fake-token"),
}));

jest.mock("@/lib/zustand/useRentalStore", () => ({
  __esModule: true,
  default: () => ({
    deposit: null,
    selectedRental: { alq_id: 1, alq_monto: "1000" },
    setDeposit: jest.fn(),
  }),
}));

jest.mock("axios", () => ({
  post: jest.fn(() =>
    Promise.resolve({
      data: { success: true, data: { depo_id: 1, depo_total: "500" } },
    })
  ),
}));

describe("DepositForm", () => {
  it("renderiza el formulario correctamente", () => {
    render(<DepositForm onSuccess={jest.fn()} />);
    expect(screen.getByText("Depósito")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Monto Total del Depósito")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Crear deposito/i })
    ).toBeInTheDocument();
  });

  it("llama a onSubmit al enviar el formulario", async () => {
    const onSuccess = jest.fn();
    render(<DepositForm onSuccess={onSuccess} />);

    const input = screen.getByLabelText(
      "Monto Total del Depósito"
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "500" } });

    const button = screen.getByRole("button", {
      name: /Crear deposito/i,
    });
    fireEvent.click(button);

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
  });
});
