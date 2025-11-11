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

// --- Mock Data ---
const mockProducts = [
  { product_id: 1, name: 'Laptop', description: 'Powerful', price: 1200, stock_quantity: 10 },
  { product_id: 2, name: 'Mouse', description: 'Wireless', price: 25, stock_quantity: 50 },
];

describe('App Component Basic Tests 🧪', () => {

  beforeEach(() => {
    // Reset all mock function calls before each test
    jest.clearAllMocks();
    
    // Default mock response for the initial useEffect fetch
    axios.get.mockResolvedValue({ data: mockProducts });
  });

  // --- Test 1: Initial Render and Data Fetch ---
  test('1. Renders the header and displays fetched products after load', async () => {
    render(<App />);

    // 1. Initial State Check (Synchronous)
    expect(screen.getByRole('heading', { name: /product list/i })).toBeInTheDocument();

    // 2. Check API Call
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith("http://localhost:8000/products/");

    // 3. Check Data Rendering (Asynchronous)
    await waitFor(() => {
      // The product name should appear in the table
      expect(screen.getByText('Laptop')).toBeInTheDocument();
      expect(screen.getByText('Mouse')).toBeInTheDocument();

      // Check for table structure integrity (2 products + 1 header row = 3 rows)
      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(mockProducts.length + 1); 
    });
  });

  // --- Test 2: Basic Interaction - Opening Update Popup ---
  test('2. Opens the Update Product popup and pre-populates the form', async () => {
    render(<App />);

    // Wait for the products to load before interacting
    await waitFor(() => {
        expect(screen.getByText('Laptop')).toBeInTheDocument();
    });

    // Find the 'update' button for the first product ('Laptop')
    const updateButtons = screen.getAllByRole('button', { name: /update/i });
    
    // Click the first update button
    fireEvent.click(updateButtons[0]);

    // Check if the update popup heading is visible
    expect(screen.getByRole('heading', { name: /update product/i })).toBeInTheDocument();
    
    // Check if the form inputs are pre-filled with the correct product data (Laptop details)
    expect(screen.getByDisplayValue('Powerful')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1200')).toBeInTheDocument();
  });
});