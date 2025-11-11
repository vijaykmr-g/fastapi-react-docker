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
test("submits updated product successfully", async () => {
  // Mock API responses
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

  axios.put.mockResolvedValueOnce({ status: 200 });

  render(<App />);

  // Wait for the Update button to appear and click it
  const updateBtn = await screen.findByText(/update/i);
  fireEvent.click(updateBtn);

  // ✅ Wait for the modal to appear by checking the heading
  await waitFor(() => screen.getByText(/Update Product/i));

  // Now get the Save button and click
  const saveButton = screen.getByTestId("save-btn");
  fireEvent.click(saveButton);

  // Verify axios.put was called
  await waitFor(() => {
    expect(axios.put).toHaveBeenCalledTimes(1);
  });
});


});
