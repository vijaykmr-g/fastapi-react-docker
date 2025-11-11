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

  test("submits updated product successfully and updates table (Revised)", async () => {
  // Mock API responses
  axios.get.mockResolvedValueOnce({
    data: [
      {
        product_id: 1,
        name: "Old Test Product", // Ensure this name appears first
        description: "Good product",
        price: 99,
        stock_quantity: 10,
      },
    ],
  });

  axios.put.mockResolvedValueOnce({ status: 200 });
  
  // 1. Render the component
  render(<App />);

  // 2. 🎯 CRITICAL: Wait for the product to appear to confirm the GET was successful
  await screen.findByText("Old Test Product");

  // 3. Find the 'update' button associated with the product and click it
  // Since there's only one product, we can safely find the 'update' text
  const updateBtn = screen.getByRole('button', { name: /update/i });
  fireEvent.click(updateBtn); 

  // 4. ✅ FIX: Wait for the modal title to appear
  // We use findByText again, but we are more confident the click worked now.
  const updateHeading = await screen.findByText(/Update Product/i);
  expect(updateHeading).toBeInTheDocument();

  // 5. Change the product name in the form
  // You need to find the input by its associated label text
  const nameInput = screen.getByLabelText(/Name:/i);
  fireEvent.change(nameInput, { target: { value: "New Updated Name" } });

  // 6. Get the Save button (using data-testid for reliability) and click
  const saveButton = screen.getByTestId("save-btn");
  fireEvent.click(saveButton);

  // 7. Verify the PUT request was called 
  await waitFor(() => {
    expect(axios.put).toHaveBeenCalledTimes(1);
    expect(axios.put).toHaveBeenCalledWith(
      "http://localhost:8000/products/1",
      expect.objectContaining({ name: "New Updated Name" })
    );
  });

  // 8. Verify the optimistic update (New name appears, old name is gone)
  await waitFor(() => {
      expect(screen.getByText("New Updated Name")).toBeInTheDocument();
      expect(screen.queryByText("Old Test Product")).not.toBeInTheDocument();
  });
  
  // 9. Verify the modal is closed
  expect(screen.queryByText(/Update Product/i)).not.toBeInTheDocument();

});


});
