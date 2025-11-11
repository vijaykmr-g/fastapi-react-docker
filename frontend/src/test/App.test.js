/**
 * @jest-environment jsdom
 */

const React = require("react");
const { render, screen, waitFor, fireEvent } = require("@testing-library/react");
const axios = require("axios");
const App = require("../App").default;

// ✅ Proper Axios mock setup
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

    expect(await screen.findByText(/Add Product/i)).toBeInTheDocument();
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

    // Wait for update button to appear
    const updateBtn = await screen.findByText(/update/i);
    fireEvent.click(updateBtn);

    expect(await screen.findByText(/Update Product/i)).toBeInTheDocument();
  });

  // 🧩 Test — Submit updated product successfully
  test("submits updated product successfully and updates table", async () => {
    // 1. Mock initial GET response (products to display)
    axios.get.mockResolvedValueOnce({
      data: [
        {
          product_id: 1,
          name: "Old Name", // Use distinct name for better verification
          description: "Good product",
          price: 99,
          stock_quantity: 10,
        },
      ],
    });

    // 2. Mock successful PUT response
    axios.put.mockResolvedValueOnce({ status: 200 });

    // 3. Render the component
    render(<App />);

    // Wait for the initial product to load and get the 'update' button
    const updateBtn = await screen.findByText(/update/i);
    fireEvent.click(updateBtn); // Opens the modal

    // 4. Wait for the modal title to appear
    const updateHeading = await screen.findByText(/Update Product/i);
    expect(updateHeading).toBeInTheDocument();

    // 5. Change the product name in the form
    const nameInput = screen.getByLabelText(/Name:/i);
    fireEvent.change(nameInput, { target: { value: "New Updated Name" } });

    // 6. Get the Save button and click
    const saveButton = screen.getByTestId("save-btn");
    fireEvent.click(saveButton);

    // 7. Verify the PUT request was called with the updated data
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledTimes(1);
      expect(axios.put).toHaveBeenCalledWith(
        "http://localhost:8000/products/1",
        expect.objectContaining({ name: "New Updated Name" })
      );
    });

    // 8. Verify the table is updated without a re-fetch (optimistic update logic)
    // The 'Update Product' modal should be gone
    expect(updateHeading).not.toBeInTheDocument(); 
    
    // The new name should appear in the table
    expect(screen.getByText("New Updated Name")).toBeInTheDocument();
  });


});
