import React, { useEffect, useState } from "react";
import axios from 'axios';


function App() {


const [products, setProducts] = useState([]);
const [showPopup, setshowPopup] = useState(false);
const [selectedProduct, setselectedProduct] = 
useState({
  product_id:'',
  name:'',
  description:'',
  price:'',
  stock_quantity:''
});
const [showAddPopup, setAddPopup] = useState(false);
const [newProduct,setNewProduct] = useState({
  name:'',
  description:'',
  price:'',
  stock_quantity:''
})


  // Fetch data from FastAPI
  useEffect(() => {
    axios
      .get("http://localhost:8000/products/")  // 🔗 FastAPI endpoint
      .then((res) => {
        console.log(res.data); // ✅ Check data in console
        setProducts(res.data); // Store in state
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
      });
  }, []);

  const updateonclick = (product) =>{
    setselectedProduct(product);
    setshowPopup(true);
  }
  const handleChange = (e) => {
    const {name,value} = e.target;
    setselectedProduct((prev)=>({...prev,[name]:value}));
  }

   const handleAddchange = (e) => {
      
      setNewProduct({...newProduct,[e.target.name]:e.target.value});
    }
  // Submit updated data to backend using PUT
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `http://localhost:8000/products/${selectedProduct.product_id}`,
        selectedProduct
      );
      if (res.status === 200) {
        alert("Product updated!");
        setshowPopup(false);
        // Update table without refetching
        const updatedProducts = products.map((p) =>
          p.product_id === selectedProduct.product_id ? selectedProduct : p
        );
        setProducts(updatedProducts);
      }
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };
  const fetchproducts = async () => {
    const res = await axios.get("http://localhost:8000/products/");
    setProducts(res.data)
  }

  const handleaddsubmit = async (e) =>{
    e.preventDefault();
    try{
    await axios.post("http://localhost:8000/products",newProduct)
    alert("Product Added!");
    setAddPopup(false)
    setNewProduct({
      name: "", description: "", price: "", stock_quantity: ""
    })
    fetchproducts();
  }
  catch (err){
    console.error('err is',err)
  }
  }

  const handledelete = async (id) =>{
    try{
      await axios.delete(`http://localhost:8000/products/${id}`)
      alert("Product deleted!");
      fetchproducts();
    }
    catch (err){
      console.error(err)
    }
  };


  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <div style={{padding:"0 10px",display:"flex"}}>
        <h2 style={{flex:1,textAlign:"center",margin:0}}>Product List</h2>
        <button onClick={()=>setAddPopup(true)}>Add Product</button>
      </div>
    
      
      <table border="1" cellPadding="10" style={{ margin: "auto" }}>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Name</th>
            <th>Description</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Update</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, index) => (
            <tr key={p.product_id}>
              <td>{index + 1}</td>
              <td>{p.name}</td>
              <td>{p.description}</td>
              <td>{p.price}</td>
              <td>{p.stock_quantity}</td>
              <td><button onClick={()=>updateonclick(p)}>update</button></td>
              <td><button onClick={() => handledelete(p.product_id)}>delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      { showPopup && (
        <div
        style={popupOverlay}
        >
          <div
          style={popupBox}
          >
            <h3>Update Product</h3>
            <form onSubmit={handleSubmit}>
              <div>
              <label>Name:</label>
              <input type="text" name="name" value={selectedProduct.name}  onChange={handleChange}/>
              </div>
              <div>
              <label>Description:</label>
              <input type="text" name="description" value={selectedProduct.description} onChange={handleChange}/>
              </div>
              <div>
              <label>Price:</label>
              <input type="number" name="price" value={selectedProduct.price} onChange={handleChange}/>
              </div>
              <div>
              <label>Stock:</label>
              <input type="number" name="stock_quantity" value={selectedProduct.stock_quantity} onChange={handleChange}/>
              </div>
              <div
                style={{
                  marginTop:"10px"
                }}
                >
                  <button type="submit">save</button>
                  <button type="button" onClick={()=>
                    setshowPopup(false)
                  } style={{marginLeft:"10px"}}>cancel</button>
              </div>
            </form>
          </div>
          
        </div>
      )}

      {showAddPopup && (
        <div
        style={popupOverlay}
        >
          <div
          style={popupBox}
          >
            <form onSubmit={handleaddsubmit}>
              <div>
                <label>Name:</label>
                <input type="text" name="name" value={newProduct.name} onChange={handleAddchange} />
              </div>
              <div>
                <label>Description:</label>
                <input type="text" name="description" value={newProduct.description} onChange={handleAddchange}  />
              </div>
              <div>
                <label>Price:</label>
                <input type="number" name="price" value={newProduct.price} onChange={handleAddchange} />
              </div>
              <div>
                <label>Stock Quantity</label>
                <input type="number" name="stock_quantity" value={newProduct.stock_quantity} onChange={handleAddchange} />
              </div>

              <div style={{marginTop:"10px"}}>
                <button type="submit">ADD</button>
                <button type="button" onClick={()=>setAddPopup(false)} style={{marginLeft:"10px"}}>cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
  
  

}

const popupOverlay = {
  position:"fixed",
  top:0,
  bottom:0,
  right:0,
  left:0,
  background:"rgba(0,0,0,0.5)",
  display:"flex",
  justifyContent:"center",
  alignItems:"center"
}
const popupBox = {
  background:"white",
  minWidth:"300px",
  padding:"200px",
  borderRadius:"10px"
}

export default App;
