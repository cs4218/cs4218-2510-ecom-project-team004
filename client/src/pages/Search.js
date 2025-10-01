import React from "react";
import Layout from "./../components/Layout";
import { useSearch } from "../context/search";
import { useNavigate } from "react-router-dom"; // ADDED
import { useCart } from "../context/cart"; // ADDED

const Search = () => {
  const [values, setValues] = useSearch();
  const navigate = useNavigate(); // ADDED
  const [cart, setCart] = useCart(); // ADDED
  return (
    <Layout title={"Search results"}>
      <div className="container">
        <div className="text-center">
          {/* FIXED: Resuts --> Results (Typo) */}
          <h1>Search Results</h1>
          <h6>
            {values?.results.length < 1
              ? "No Products Found"
              : `Found ${values?.results.length}`}
          </h6>
          <div className="d-flex flex-wrap mt-4">
            {/* FIXED: Added "key={p._id}" */}
            {values?.results.map((p) => (
              <div key={p._id} className="card m-2" style={{ width: "18rem" }}>
                <img
                  src={`/api/v1/product/product-photo/${p._id}`}
                  className="card-img-top"
                  alt={p.name}
                />
                <div className="card-body">
                  <h5 className="card-title">{p.name}</h5>
                  <p className="card-text">
                    {/* FIXED: Added checks for description */}
                    {p.description
                      ? p.description.length > 30
                        ? `${p.description.substring(0, 30)}...`   // Show "..." only if cut text
                        : p.description                            // Show full text if it's short
                      : "No description."                          // Show message if missing
                    }
                  </p>
                  {/* FIXED: Added check for missing price and removed space in '...text"> $ {p,price...' that caused extra starting space */}
                  <p className="card-text">$ {p.price ?? 0}</p>
                  {/* FIXED: class --> className (x2)*/}
                  {/* FIXED: Add onClick for More Details button */}
                  <button 
                    className="btn btn-primary ms-1"
                    onClick={() => navigate(`/product/${p.slug}`)}
                  >
                    More Details
                  </button>
                  {/* FIXED: Add onClick for ADD TO CARD button */}
                  <button 
                    className="btn btn-secondary ms-1"
                    onClick={() => setCart([...cart, p])}
                  >
                    ADD TO CART
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Search;