import { render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import HomePage from "@/components/homePage/homePage"

// Mocks
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

jest.mock("js-cookie", () => ({
  get: jest.fn(() => "fake-token"),
}))

jest.mock("@/lib/UserContext", () => ({
  useUser: () => ({
    user: { id: 1, name: "Test User", email: "test@email.com" },
  }),
}))

jest.mock("@/components/homePage/bodyHomePage", () => {
  return () => <div>BodyHomePage Renderizado</div>
})

jest.mock("@/components/SideNavbar", () => {
  return () => <nav>SideNavbar Mock</nav>
})

jest.mock("@/components/AuthRoute", () => {
  return ({ children }: { children: React.ReactNode }) => <>{children}</>
})

describe("HomePage", () => {
  it("renderiza correctamente el dashboard", () => {
    render(<HomePage />)

    expect(screen.getByText("SideNavbar Mock")).toBeInTheDocument()
    expect(screen.getByText("BodyHomePage Renderizado")).toBeInTheDocument()
  })
})
