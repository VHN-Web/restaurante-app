export default async function handler(req, res) {
  // Permite requisições apenas do próprio domínio
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { destination } = req.query;

  if (!destination) {
    return res.status(400).json({ error: 'Endereço de destino não informado.' });
  }

  const RESTAURANT_ORIGIN = 'Rua do Orvalho, 310, João Pessoa, PB';
  const GOOGLE_MAPS_API_KEY = process.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyDrhTuu5nAFQfxAtfnWlfbVKveLTu2EDtk';

  try {
    const originParam = encodeURIComponent(RESTAURANT_ORIGIN);
    const destParam = encodeURIComponent(destination);
    
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originParam}&destinations=${destParam}&mode=driving&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    return res.status(200).json(data);
  } catch (error) {
    console.error('Erro ao consultar Google Distance Matrix no servidor:', error);
    return res.status(500).json({ error: 'Erro interno ao calcular a distância.' });
  }
}