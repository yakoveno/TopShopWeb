import axios from 'axios';

const apiUrl = 'https://aoxr7mniwc.execute-api.eu-central-1.amazonaws.com/Final/';

export async function fetchItems() {
  try {
    const response = await axios.get(`${apiUrl}/items`);
    return response.data;
  } catch (error) {
    console.error('Error fetching items:', error);
    return [];
  }
}

export async function sendOrderAndCustomer(orderItems, customerData) {
  const city = customerData.city;
  const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${city}`;

  try {
    const response = await axios.get(nominatimUrl);

    if (response.status !== 200) {
      throw new Error(`Response status is not OK (${response.status})`);
    }

    const data = response.data;

    if (data.length === 0) {
      throw new Error('Data is empty');
    }

    const CityLon = parseFloat(data[0].lon).toFixed(4);
    const CityLat = parseFloat(data[0].lat).toFixed(4);

    if (isNaN(CityLon) || isNaN(CityLat)) {
      throw new Error(`Invalid CityLon or CityLat. Data: ${JSON.stringify(data)}`);
    }

    customerData.lon = CityLon;
    customerData.lat = CityLat;

    const currentDate = new Date();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');
    const year = currentDate.getFullYear();
    const hours = currentDate.getHours().toString().padStart(2, '0');
    const minutes = currentDate.getMinutes().toString().padStart(2, '0');
    const orderNumber = `${month}${day}T${hours}${minutes}`;
    const entryDate = `${year}-${month}-${day}`;

    const deliveryDate = new Date(currentDate);
    deliveryDate.setDate(deliveryDate.getDate() + 7);

    const deliveryMonth = (deliveryDate.getMonth() + 1).toString().padStart(2, '0');
    const deliveryDay = deliveryDate.getDate().toString().padStart(2, '0');
    const deliveryYear = deliveryDate.getFullYear();
    const deliveryDateFormatted = `${deliveryYear}-${deliveryMonth}-${deliveryDay}`;

    const status = 'ממתין';

    const order = {
      number: orderNumber,
      entry_date: entryDate,
      delivery_date: deliveryDateFormatted,
      status: status,
      placement_date: null,
    };

    const orderAndCustomerData = { orderItems, customerData, order };
    console.log('API Order Data:', orderAndCustomerData);

    const apiResponse = await axios.post(`${apiUrl}/order`, orderAndCustomerData);

    return apiResponse.data;
  } catch (error) {
    console.error('Error sending order:', error);
    throw error;
  }
}
