// --- FUNÇÃO DE CÁLCULO VIA DISTANCE MATRIX API (COMPATÍVEL COM NAVEGADOR) ---
const fetchGoogleDistance = async (destinationAddress) => {
  if (!destinationAddress || !street.trim() || !houseNumber.trim()) return;

  setRealDeliveryInfo(prev => ({ ...prev, loading: true }));

  // Se a chave não estiver configurada, usa um cálculo simulado local
  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'SUA_CHAVE_AQUI') {
    const length = destinationAddress.trim().length;
    const distanceKm = parseFloat((0.3 + (length % 10) * 0.1).toFixed(1));
    const fee = parseFloat((4.00 + distanceKm * 1.50).toFixed(2));
    setRealDeliveryInfo({ distanceKm, fee, loading: false });
    return;
  }

  try {
    const originParam = encodeURIComponent(RESTAURANT_ORIGIN);
    const destParam = encodeURIComponent(destinationAddress);
    
    // URL da Distance Matrix API (suportada por navegadores via CORS)
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originParam}&destinations=${destParam}&mode=driving&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.rows[0]?.elements[0]?.status === 'OK') {
      const distanceInMeters = data.rows[0].elements[0].distance.value;
      const distanceKm = parseFloat((distanceInMeters / 1000).toFixed(1));
      const fee = parseFloat((4.00 + distanceKm * 1.50).toFixed(2));
      
      setRealDeliveryInfo({ distanceKm, fee, loading: false });
    } else {
      console.warn('Google Maps retornou um status inválido:', data);
      setRealDeliveryInfo(prev => ({ ...prev, loading: false }));
    }
  } catch (error) {
    console.error('Erro ao consultar Distance Matrix API:', error);
    setRealDeliveryInfo(prev => ({ ...prev, loading: false }));
  }
};