import { useEffect, useState } from 'react';
import { api } from './api';
import ProductForm from './ProductForm';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  // null = form closed, 'new' = adding, or the product object being edited
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    api.listProducts()
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function handleSaved(saved) {
    setProducts((list) =>
      list.some((p) => p.id === saved.id)
        ? list.map((p) => (p.id === saved.id ? saved : p))
        : [saved, ...list]
    );
    setEditing(null);
  }

  async function handleDelete(product) {
    if (!window.confirm(`Delete "${product.product_name}"?`)) return;

    try {
      await api.deleteProduct(product.id);
      setProducts((list) => list.filter((p) => p.id !== product.id));
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p>Loading products...</p>;

  return (
    <section>
      <div className="section-header">
        <h2>Products</h2>
        {editing === null && <button onClick={() => setEditing('new')}>Add Product</button>}
      </div>

      {error && <p className="error">{error}</p>}

      {editing !== null && (
        <ProductForm
          key={editing === 'new' ? 'new' : editing.id}
          product={editing === 'new' ? null : editing}
          onSaved={handleSaved}
          onCancel={() => setEditing(null)}
        />
      )}

      {products.length === 0 ? (
        <p>No products yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.product_name}</td>
                <td>{p.description}</td>
                <td>{Number(p.price).toFixed(2)}</td>
                <td>{p.quantity}</td>
                <td>
                  <button onClick={() => setEditing(p)}>Edit</button>
                  <button onClick={() => handleDelete(p)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}