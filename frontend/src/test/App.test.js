/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import axios from "axios";
import App from "../App";

// ✅ Mock Axios
jest.mock("axios", () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

describe("App Component CRUD Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 🧩 Test 1 — Heading renders
  test("renders Product List heading", () => {
    render(<App />);
    expect(screen.getByText(/Product List/i)).toBeInTheDocument();
  });

  // 🧩 Test 2 — Fetch and display products
  test("fetches and displays products from API", async () => {
    axios.get.mockResolvedValueOnce({
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

    await waitFor(() =>
      expect(screen.getByText(/Test Product/i)).toBeInTheDocument()
    );
  });

  // 🧩 Test 3 — Open Add Product popup
  test("opens Add Product popup when button clicked", async () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Add Product/i));
    expect(await screen.findByText(/ADD/i)).toBeInTheDocument();
  });

  // 🧩 Test 4 — Open Update popup
  test("opens Update popup on update button click", async () => {
    axios.get.mockResolvedValueOnce({
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
    await screen.findByText("Test Product");

    const updateBtn = screen.getByRole("button", { name: /update/i });
    fireEvent.click(updateBtn);

    expect(await screen.findByText(/Update Product/i)).toBeInTheDocument();
  });

  // 🧩 Test 5 — Update product successfully
  test("submits updated product and updates table", async () => {
    axios.get.mockResolvedValueOnce({
      data: [
        {
          product_id: 1,
          name: "Old Test Product",
          description: "Good product",
          price: 99,
          stock_quantity: 10,
        },
      ],
    });

    axios.put.mockResolvedValueOnce({ status: 200 });

    render(<App />);
    await screen.findByText("Old Test Product");

    const updateBtn = screen.getByRole("button", { name: /update/i });
    fireEvent.click(updateBtn);

    const nameInput = screen.getByLabelText(/Name:/i);
    fireEvent.change(nameInput, { target: { value: "New Updated Name" } });

    const saveButton = screen.getByTestId("save-btn");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledTimes(1);
      expect(axios.put).toHaveBeenCalledWith(
        "http://localhost:8000/products/1",
        expect.objectContaining({ name: "New Updated Name" })
      );
    });

    await waitFor(() => {
      expect(screen.getByText("New Updated Name")).toBeInTheDocument();
      expect(screen.queryByText("Old Test Product")).not.toBeInTheDocument();
    });

    expect(screen.queryByText(/Update Product/i)).not.toBeInTheDocument();
  });

  // 🧩 Test 6 — Add new product
  test("adds a new product successfully", async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    axios.post.mockResolvedValueOnce({
      data: { product_id: 2, name: "New Product", description: "Desc", price: 50, stock_quantity: 3 },
    });
    axios.get.mockResolvedValueOnce({
      data: [
        { product_id: 2, name: "New Product", description: "Desc", price: 50, stock_quantity: 3 },
      ],
    });

    render(<App />);

    fireEvent.click(screen.getByText(/Add Product/i));

    fireEvent.change(screen.getByLabelText(/Name:/i), { target: { value: "New Product" } });
    fireEvent.change(screen.getByLabelText(/Description:/i), { target: { value: "Desc" } });
    fireEvent.change(screen.getByLabelText(/Price:/i), { target: { value: "50" } });
    fireEvent.change(screen.getByLabelText(/Stock Quantity/i), { target: { value: "3" } });

    fireEvent.click(screen.getByText(/ADD/i));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:8000/products",
        expect.objectContaining({ name: "New Product" })
      );
    });

    await waitFor(() => {
      expect(screen.getByText("New Product")).toBeInTheDocument();
    });

    expect(screen.queryByText(/ADD/i)).not.toBeInTheDocument();
  });

  // 🧩 Test 7 — Delete a product
  test("deletes a product successfully", async () => {
    axios.get.mockResolvedValueOnce({
      data: [{ product_id: 1, name: "Delete Me", description: "", price: 10, stock_quantity: 1 }],
    });
    axios.delete.mockResolvedValueOnce({});
    axios.get.mockResolvedValueOnce({ data: [] });

    render(<App />);
    await screen.findByText("Delete Me");

    window.confirm = jest.fn(() => true); // Mock confirm dialog
    const deleteBtn = screen.getByRole("button", { name: /delete/i });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith("http://localhost:8000/products/1");
    });

    await waitFor(() => {
      expect(screen.queryByText("Delete Me")).not.toBeInTheDocument();
    });
  });
});
