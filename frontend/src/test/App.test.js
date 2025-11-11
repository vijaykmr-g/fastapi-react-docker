const { render, screen, waitFor, fireEvent } = require("@testing-library/react");
const axios = require("axios");
const React = require("react");
const App = require("../App").default; // ✅ CommonJS import

jest.mock("axios"); // ✅ Mock Axios requests

describe("App Component CRUD Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders Product List heading", () => {
    render(<App />);
    const heading = screen.getByText(/Product List/i);
    expect(heading).toBeInTheDocument();
  });

  test("fetches and displays products from API", async () => {
    axios.get.mockResolvedValue({
      data: [
        {
          product_id: 1,
          name: "Test Product",
          description: "Nice one",
          price: 100,
          stock_quantity: 5,
        },
      ],
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Test Product/i)).toBeInTheDocument();
    });
  });

  test("opens Add Product popup when button clicked", async () => {
    render(<App />);
    const addButton = screen.getByText(/Add Product/i);
    fireEvent.click(addButton);

    const addForm = await screen.findByText(/Add Product/i);
    expect(addForm).toBeInTheDocument();
  });

  test("opens Update popup on update button click", async () => {
    axios.get.mockResolvedValue({
      data: [
        {
          product_id: 1,
          name: "Test Product",
          description: "Good product",
          price: 99,
          stock_quantity: 10,
        },
      ],
    });

    render(<App />);

    await waitFor(() => screen.getByText(/update/i));
    const updateBtn = screen.getByText(/update/i);
    fireEvent.click(updateBtn);

    const updateForm = await screen.findByText(/Update Product/i);
    expect(updateForm).toBeInTheDocument();
  });

  test("submits updated product successfully", async () => {
    axios.get.mockResolvedValue({
      data: [
        {
          product_id: 1,
          name: "Test Product",
          description: "Good product",
          price: 99,
          stock_quantity: 10,
        },
      ],
    });

    axios.put.mockResolvedValue({ status: 200 });

    render(<App />);

    await waitFor(() => screen.getByText(/update/i));
    const updateBtn = screen.getByText(/update/i);
    fireEvent.click(updateBtn);

    const saveButton = await screen.findByText(/save/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledTimes(1);
    });
  });
});
