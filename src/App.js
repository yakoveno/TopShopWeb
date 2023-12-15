import React, { useState, useEffect } from 'react';
import './App.css';
import { fetchItems, sendOrderAndCustomer } from './utils/api';
import SearchBar from './components/SearchBar';

function App() {
  const [items, setItems] = useState([]);
  const [validItems, setValidItems] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showPurchasesContainer, setShowPurchasesContainer] = useState(false);
  const [purchaseDetails, setPurchaseDetails] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchItems();
        const fetchedItems = response.items;
        const validItems = fetchedItems.filter(
          (item) =>
            item.name !== null &&
            item.serial !== null &&
            item.img !== null &&
            item.active === 1 &&
            item.stock > 0
        );
        setItems(fetchedItems);
        setValidItems(validItems);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };
  
    fetchData();
  }, []);

  const handleSearch = (results) => {
    setSearchResults(results);
    setSelectedCategory('All');
  };

  const addToCart = (item) => {
    const existingCartItem = cart.find((cartItem) => cartItem.serial === item.serial);

    if (existingCartItem) {
      const updatedCart = cart.map((cartItem) =>
        cartItem.serial === item.serial
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      );
      setCart(updatedCart);
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (item) => {
    const updatedCart = cart.filter((cartItem) => cartItem.serial !== item.serial);
    setCart(updatedCart);
  };

  const increaseQuantity = (item) => {
    const updatedCart = cart.map((cartItem) =>
      cartItem.serial === item.serial ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
    );
    setCart(updatedCart);
  };

  const decreaseQuantity = (item) => {
    if (item.quantity === 1) {
      const updatedCart = cart.filter((cartItem) => cartItem.serial !== item.serial);
      setCart(updatedCart);
    } else {
      const updatedCart = cart.map((cartItem) =>
        cartItem.serial === item.serial
          ? { ...cartItem, quantity: cartItem.quantity - 1 }
          : cartItem
      );
      setCart(updatedCart);
    }
  };

  const getUniqueCategories = (items) => {
    const uniqueCategories = new Set();
    items.forEach((item) => {
      if (item.category) {
        uniqueCategories.add(item.category);
      }
    });
    return Array.from(uniqueCategories);
  };

  const categoryFilter = (category) => {
    setSelectedCategory(category);
    setSearchResults([]);
  };

  const handlePurchaseClick = () => {
    const purchaseDetails = {
      customer: {
        firstName: '',
        lastName: '',
        phone1: '',
        phone2: '',
        email: '',
        city: '',
        street: '',
        streetNumber: '',
        apartment: '',
      },
      cart: [...cart],
    };
    setPurchaseDetails(purchaseDetails);
    setShowPurchasesContainer(true);
  };

  const handleCancel = () => {
    setShowPurchasesContainer(false);
  };

  const handleSubmitOrderAndCustomer = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const customerData = {
      first_name: formData.get('firstName'),
      last_name: formData.get('lastName'),
      phone_1: formData.get('phone1'),
      phone_2: formData.get('phone2'),
      email: formData.get('email'),
      city: formData.get('city'),
      street: formData.get('street'),
      street_number: formData.get('streetNumber'),
      apartment: formData.get('apartment'),
    };

    const orderItems = cart.map((item) => ({
      item_ID: item.item_ID,
      quantity: item.quantity,
    }));
    sendOrderAndCustomer(orderItems, customerData);
    setCart([]);
    setShowPurchasesContainer(false);
  };

  const renderContent = () => {
    if (showPurchasesContainer) {
      return (
        <div id="purchasesContainer">
          <div className='orderDetails'>
            <h3>פרטי ההזמנה</h3>
            <table border="1">
              <thead>
                <tr>
                  <th>שם</th>
                  <th>מותך</th>
                  <th>סידורי</th>
                  <th>כמות</th>
                  <th>מחיר</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item.serial}>
                    <td>{item.name}</td>
                    <td>{item.brand}</td>
                    <td>{item.serial}</td>
                    <td>{item.quantity}</td>
                    <td>₪{item.price * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p>סה"כ מחיר: ₪{cart.reduce((total, item) => total + item.price * item.quantity, 0)}</p>
          </div>
          <div className='customerDetails'>
            <h3>פרטי הלקוח</h3>
            <form onSubmit={handleSubmitOrderAndCustomer}>
              <div>
                <label>
                  שם פרטי:
                  <input type="text" name="firstName" required />
                </label>
                <label>
                  שם משפחה:
                  <input type="text" name="lastName" required />
                </label>
              </div>
              <div>
                <label>
                  טלפון 1:
                  <input type="text" name="phone1" required />
                </label>
                <label>
                  טלפון 2:
                  <input type="text" name="phone2" />
                </label>
                <label>
                  אימייל:
                  <input type="email" name="email" required />
                </label>
              </div>
              <div>
                <label>
                  עיר:
                  <input type="text" name="city" required />
                </label>
                <label>
                  רחוב:
                  <input type="text" name="street" required />
                </label>
                <label>
                  מספר בית:
                  <input type="text" name="streetNumber" required />
                </label>
                <label>
                  דירה:
                  <input type="text" name="apartment" />
                </label>
              </div>
              <div className="formButtons">
                <input type="submit" value="שלח הזמנה" />
                <button type="button" onClick={handleCancel}>ביטול</button>
              </div>
            </form>
          </div>
        </div>
      );
    } else {
      return (
        <div id="contentContainer">
          <div id="cartContainer">
            <div id="cartPanel">
              <button onClick={handlePurchaseClick}>לרכישה</button>
              <h3>הסל שלך</h3>
            </div>
            <div id="cartItemContainer">
              {cart.map((item) => (
                <div key={item.serial} className="cartItem">
                  <div className="Twave"></div>
                  <div className="Bwave"></div>
                  <img src={item.img} alt={item.name} />
                  <h4>{item.name}</h4>
                  <p>מחיר: ₪{item.price}</p>
                  <div className="quantityControls">
                    <button onClick={() => decreaseQuantity(item)}>-</button>
                    {item.quantity}
                    <button onClick={() => increaseQuantity(item)}>+</button>
                  </div>
                  <button onClick={() => removeFromCart(item)}>הסר</button>
                </div>
              ))}
            </div>
          </div>
          <div id="storeContainer">
            <div id="categoryContainer">
              {getUniqueCategories(validItems).map((category) => (
                <div
                  key={category}
                  className={`categoryName ${category === selectedCategory ? 'selected' : ''}`}
                  onClick={() => categoryFilter(category)}
                >
                  {category}
                </div>
              ))}
            </div>
            <div id="itemsContainer">
              {(searchResults.length > 0
                ? searchResults
                : validItems.filter((item) =>
                    selectedCategory === '' || item.category === selectedCategory
                  )
              ).map((item) => (
                <div key={item.serial} className="itemCard">
                  <div className="Lwave"></div>
                  <div className="Rwave"></div>
                  <img src={item.img} alt={item.name} />
                  <div className="itemDetails">
                    <h2>{item.name}</h2>
                    <p>{item.description}</p>
                    <p>מחיר: ₪{item.price}</p>
                    <button onClick={() => addToCart(item)}>הוסף לסל</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="App">
      <div id="headerContainer">
        <div id="logoHolder">
          <div className="logo"></div>
        </div>
        <div className="attachmentHolder">
          <h3>טלפון: 08-987272772 </h3>
          <h3>כתובת: תל-אביב הרצל 144</h3>
        </div>
        <SearchBar validItems={validItems} onSearch={handleSearch} />
        <div id='employeeAutorization'></div>
      </div>
      {renderContent()}
    </div>
  );
}

export default App;
