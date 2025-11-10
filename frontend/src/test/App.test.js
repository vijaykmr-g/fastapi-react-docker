import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import axios from "axios";
import App from "../App";

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
    // Mock API response
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
      const productName = screen.getByText(/Test Product/i);
      expect(productName).toBeInTheDocument();
    });
  });

  test("opens Add Product popup when button clicked", async () => {
    render(<App />);
    const addButton = screen.getByText(/Add Product/i);
    fireEvent.click(addButton);

    const addForm = await screen.findByText(/ADD/i);
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

    await waitFor(() => {
      const updateBtn = screen.getByText(/update/i);
      fireEvent.click(updateBtn);
    });

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

    await waitFor(() => {
      const updateBtn = screen.getByText(/update/i);
      fireEvent.click(updateBtn);
    });

    const saveButton = await screen.findByText(/save/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledTimes(1);
    });
  });
});
