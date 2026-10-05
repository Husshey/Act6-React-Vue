import { useState } from 'react';
import { api } from './api';

export default function ProductForm({ product, onSaved, onCancel }) {
  const [form, setForm] = useState({
    product_name: product?.product_name ?? '',
    description: product?.description ?? '',
    price: product?.price ?? '',
    quantity: product?.quantity ?? '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);

    const payload = {
      product_name: form.product_name,
      description: form.description,
      price: Number(form.price),
      quantity: Number(form.quantity),
    };

    try {
      const saved = product
        ? await api.updateProduct(product.id, payload)
        : await api.createProduct(payload);
      onSaved(saved);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="product-form">
      <h3>{product ? 'Edit Product' : 'Add Product'}</h3>

      {error && <p className="error">{error}</p>}

      <label>
        Name
        <input name="product_name" value={form.product_name} onChange={handleChange} maxLength={100} required />
      </label>

      <label>
        Description
        <textarea name="description" value={form.description} onChange={handleChange} />
      </label>

      <label>
        Price
        <input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} required />
      </label>

      <label>
        Quantity
        <input name="quantity" type="number" step="1" min="0" value={form.quantity} onChange={handleChange} required />
      </label>

      <div className="form-actions">
        <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}